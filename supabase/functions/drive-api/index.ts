// deno-lint-ignore-file no-explicit-any
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DriveConnection {
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  email?: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  parents?: string[];
}

interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; expires_in: number } | null> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function getValidAccessToken(
  userId: string,
  supabase: SupabaseClient,
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('drive_connections')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  const connection = data as DriveConnection;

  const tokenExpiry = new Date(connection.token_expires_at);
  const now = new Date();

  // If token is still valid (with 5 minute buffer), return it
  if (tokenExpiry.getTime() - now.getTime() > 5 * 60 * 1000) {
    return connection.access_token;
  }

  // Token expired or about to expire, refresh it
  const newTokens = await refreshAccessToken(
    connection.refresh_token,
    clientId,
    clientSecret
  );

  if (!newTokens) {
    // Refresh failed, delete the connection
    await supabase.from('drive_connections').delete().eq('user_id', userId);
    return null;
  }

  // Update the stored token
  const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
  
  await supabase
    .from('drive_connections')
    .update({
      access_token: newTokens.access_token,
      token_expires_at: expiresAt,
    })
    .eq('user_id', userId);

  return newTokens.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Google OAuth credentials not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Supabase credentials not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Verify the user
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid user token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get valid access token
  const accessToken = await getValidAccessToken(
    user.id,
    supabase,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: 'Google Drive not connected or token expired', code: 'NOT_CONNECTED' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    // List files in a folder
    if (action === 'list') {
      const folderId = url.searchParams.get('folderId') || 'root';
      const pageToken = url.searchParams.get('pageToken') || '';
      const query = url.searchParams.get('q') || '';
      const mimeType = url.searchParams.get('mimeType') || '';
      const pageSize = url.searchParams.get('pageSize') || '50';

      let q = `'${folderId}' in parents and trashed = false`;
      
      if (query) {
        q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
      }
      
      if (mimeType) {
        if (mimeType === 'folder') {
          q += ` and mimeType = 'application/vnd.google-apps.folder'`;
        } else if (mimeType === 'pdf') {
          q += ` and mimeType = 'application/pdf'`;
        } else if (mimeType === 'document') {
          q += ` and (mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/msword' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')`;
        } else if (mimeType === 'presentation') {
          q += ` and (mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.ms-powerpoint' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`;
        } else if (mimeType === 'image') {
          q += ` and mimeType contains 'image/'`;
        } else if (mimeType === 'video') {
          q += ` and mimeType contains 'video/'`;
        }
      }

      const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
      driveUrl.searchParams.set('q', q);
      driveUrl.searchParams.set('pageSize', pageSize);
      driveUrl.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, size, thumbnailLink, webViewLink, webContentLink, iconLink, modifiedTime, parents)');
      driveUrl.searchParams.set('orderBy', 'folder, name');
      
      if (pageToken) {
        driveUrl.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(driveUrl.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Drive API error:', errorText);
        
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ error: 'Token expired', code: 'TOKEN_EXPIRED' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to list files' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data: DriveListResponse = await response.json();
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get file details
    if (action === 'get') {
      const fileId = url.searchParams.get('fileId');
      
      if (!fileId) {
        return new Response(
          JSON.stringify({ error: 'fileId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,thumbnailLink,webViewLink,webContentLink,iconLink,modifiedTime,parents`;
      
      const response = await fetch(driveUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to get file' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data: DriveFile = await response.json();
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search files globally
    if (action === 'search') {
      const query = url.searchParams.get('q') || '';
      const pageToken = url.searchParams.get('pageToken') || '';
      const mimeType = url.searchParams.get('mimeType') || '';

      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Search query is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let q = `name contains '${query.replace(/'/g, "\\'")}' and trashed = false`;
      
      if (mimeType && mimeType !== 'all') {
        if (mimeType === 'pdf') {
          q += ` and mimeType = 'application/pdf'`;
        } else if (mimeType === 'document') {
          q += ` and (mimeType = 'application/vnd.google-apps.document' or mimeType contains 'word')`;
        } else if (mimeType === 'presentation') {
          q += ` and (mimeType = 'application/vnd.google-apps.presentation' or mimeType contains 'presentation' or mimeType contains 'powerpoint')`;
        } else if (mimeType === 'image') {
          q += ` and mimeType contains 'image/'`;
        } else if (mimeType === 'video') {
          q += ` and mimeType contains 'video/'`;
        }
      }

      const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
      driveUrl.searchParams.set('q', q);
      driveUrl.searchParams.set('pageSize', '50');
      driveUrl.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, size, thumbnailLink, webViewLink, webContentLink, iconLink, modifiedTime, parents)');
      
      if (pageToken) {
        driveUrl.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(driveUrl.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Search failed' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data: DriveListResponse = await response.json();
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get connection status
    if (action === 'status') {
      const { data } = await supabase
        .from('drive_connections')
        .select('email, connected_at')
        .eq('user_id', user.id)
        .single();

      const conn = data as { email?: string; connected_at?: string } | null;

      return new Response(
        JSON.stringify({ 
          connected: !!conn,
          email: conn?.email,
          connectedAt: conn?.connected_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Drive API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
