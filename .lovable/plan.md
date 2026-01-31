
# Fix Community Page to Show Email Addresses

## Problem Identified
The Community/Leaderboard page currently displays user display names or anonymized identifiers (e.g., "Student • ab12"). The user wants email addresses to be visible to everyone on this page.

## Current Behavior
- `usePublicProgress.ts` hook fetches email from profiles table but doesn't expose it
- Community page displays `displayName` which falls back to "Student • {user_id_prefix}" 
- The RLS policy on `profiles` table already allows public SELECT (`Anyone can view profiles for public progress`)

## Solution Overview

### 1. Update the `usePublicProgress` Hook
**File: `src/hooks/usePublicProgress.ts`**

Add `email` field to the `CommunityUserProgress` interface and include it in the aggregated data:

| Change | Description |
|--------|-------------|
| Add `email` to interface | `email?: string \| null` field in `CommunityUserProgress` |
| Include email in results | Pass email from profile lookup to result objects |

### 2. Update the Community Page UI  
**File: `src/pages/Community.tsx`**

Display email address alongside or below the display name in:
- Top 3 students section
- All students list
- Expanded user details

| Section | Change |
|---------|--------|
| Top 3 Cards | Show email below name in muted text |
| All Students List | Show email as secondary text line |
| Merged Progress | Include email from usePublicProgress |

## Technical Implementation

### usePublicProgress.ts Changes

```typescript
// Update interface
export interface CommunityUserProgress {
  profileId: string;
  displayName: string;
  email: string | null;  // ADD THIS
  overallProgress: number;
  subjects: Record<string, number>;
  lastUpdated: string | null;
}

// In aggregatedProgress calculation
results.push({
  profileId: userId,
  displayName,
  email: profile?.email || null,  // ADD THIS
  overallProgress,
  subjects,
  lastUpdated,
});
```

### Community.tsx UI Changes

```tsx
// In Top 3 section
<div className="flex-1 min-w-0">
  <p className="font-medium truncate">
    {isMe ? `${entry.displayName} (You)` : entry.displayName}
  </p>
  {entry.email && (
    <p className="text-xs text-muted-foreground truncate">
      {entry.email}
    </p>
  )}
</div>

// In All Students list
<div className="flex-1 min-w-0 text-left">
  <p className="font-medium truncate">
    {isMe ? `${u.displayName} (You)` : u.displayName}
  </p>
  {u.email && (
    <p className="text-xs text-muted-foreground truncate">
      {u.email}
    </p>
  )}
</div>
```

### 3. Update Merged Progress Logic
**File: `src/pages/Community.tsx`**

The `mergedProgress` useMemo needs to include email for the current user:

```typescript
const myEntry = {
  profileId: user.id,
  displayName: existingProfile?.displayName || "You",
  email: user.email || null,  // ADD THIS
  overallProgress: mySnapshot.overallProgress,
  subjects: mySubjects,
  lastUpdated: new Date().toISOString(),
};
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/usePublicProgress.ts` | Add email to interface and include in results |
| `src/pages/Community.tsx` | Display email in UI, update mergedProgress |

## Privacy Consideration
**Note**: Showing email addresses publicly may raise privacy concerns. The user has confirmed they want emails visible to everyone. If privacy becomes a concern later, this can be changed to admin-only visibility.

## Expected Result
- All users on the Community/Leaderboard page will show their email address
- Email appears as secondary text below the display name
- Emails are truncated if too long to prevent layout issues
- Current user's email is included when they appear on the leaderboard
