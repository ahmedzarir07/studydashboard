import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DriveFile {
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

interface DriveConnection {
  connected: boolean;
  email?: string;
  connectedAt?: string;
}

interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export function useDriveConnection() {
  const { user, session } = useAuth();
  const [connection, setConnection] = useState<DriveConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const checkConnection = useCallback(async () => {
    if (!user || !session) {
      setConnection(null);
      setLoading(false);
      return;
    }

    try {
      // Check directly from the database for connection status
      const { data: dbConnection } = await supabase
        .from('drive_connections' as 'profiles') // Type assertion for new table
        .select('email, connected_at')
        .eq('user_id', user.id)
        .maybeSingle();

      const conn = dbConnection as { email?: string; connected_at?: string } | null;

      setConnection({
        connected: !!conn,
        email: conn?.email ?? undefined,
        connectedAt: conn?.connected_at ?? undefined,
      });
    } catch (error) {
      console.error('Error checking drive connection:', error);
      setConnection({ connected: false });
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = useCallback(async () => {
    if (!session) return;

    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/drive/callback`;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-oauth?action=auth-url&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }

      const { url, state } = await response.json();
      
      // Store state for verification
      sessionStorage.setItem('drive_oauth_state', state);
      
      // Redirect to Google
      window.location.href = url;
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [session]);

  const disconnect = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-oauth?action=disconnect`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setConnection({ connected: false });
    } catch (error) {
      console.error('Error disconnecting from Drive:', error);
      throw error;
    }
  }, [session]);

  const handleCallback = useCallback(async (code: string, state: string) => {
    if (!session) return;

    const savedState = sessionStorage.getItem('drive_oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    sessionStorage.removeItem('drive_oauth_state');

    const redirectUri = `${window.location.origin}/drive/callback`;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-oauth?action=callback`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirect_uri: redirectUri }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to complete OAuth');
    }

    const { email } = await response.json();
    setConnection({ connected: true, email, connectedAt: new Date().toISOString() });
  }, [session]);

  return {
    connection,
    loading,
    connecting,
    connect,
    disconnect,
    handleCallback,
    refetch: checkConnection,
  };
}

export function useDriveFiles(folderId: string = 'root') {
  const { session } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const fetchFiles = useCallback(async (
    options?: {
      query?: string;
      mimeType?: string;
      pageToken?: string;
    }
  ) => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: 'list',
        folderId,
      });

      if (options?.query) params.set('q', options.query);
      if (options?.mimeType) params.set('mimeType', options.mimeType);
      if (options?.pageToken) params.set('pageToken', options.pageToken);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-api?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (data.code === 'NOT_CONNECTED') {
          setError('Google Drive not connected');
        } else {
          setError(data.error || 'Failed to fetch files');
        }
        return;
      }

      const data: DriveListResponse = await response.json();
      
      if (options?.pageToken) {
        setFiles(prev => [...prev, ...data.files]);
      } else {
        setFiles(data.files);
      }
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [session, folderId]);

  const search = useCallback(async (query: string, mimeType?: string) => {
    if (!session || !query) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: 'search',
        q: query,
      });

      if (mimeType) params.set('mimeType', mimeType);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-api?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Search failed');
        return;
      }

      const data: DriveListResponse = await response.json();
      setFiles(data.files);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      console.error('Error searching files:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const loadMore = useCallback(() => {
    if (nextPageToken) {
      fetchFiles({ pageToken: nextPageToken });
    }
  }, [nextPageToken, fetchFiles]);

  return {
    files,
    loading,
    error,
    hasMore: !!nextPageToken,
    fetchFiles,
    search,
    loadMore,
  };
}
