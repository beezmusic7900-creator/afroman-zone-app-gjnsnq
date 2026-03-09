
# Upload System Architecture - Permanent Content Storage

## Overview
This document describes the production-ready, permanent upload system for the Afroman app. All uploaded content (songs, videos, merch) is stored permanently in the backend and stays live until explicitly removed by an admin.

## Core Principles

### 1. **Backend-Driven Content Display**
- All content displayed in user-facing tabs (Music, Movies, Merch) is fetched directly from the backend database
- Frontend does NOT use AsyncStorage or local state for content persistence
- Content is refetched every time a screen comes into focus using `useFocusEffect`
- Source of truth: Backend database, NOT frontend state

### 2. **Transactional Upload Workflow**
Upload is a multi-step, atomic process:
1. Upload file to permanent object storage → get permanent URL
2. Save metadata + file URL to database → get database record
3. Both steps must succeed for upload to be marked complete
4. If either step fails, show error and prevent partial records

### 3. **Permanent File Storage**
- All files uploaded to object storage (S3-compatible)
- URLs are permanent and non-expiring
- Files are never deleted automatically
- Soft deletes in database (archive) don't delete files from storage

### 4. **Status-Based Visibility**
- Content has `status` field: 'published', 'unpublished', 'archived'
- Content has `isActive` boolean field
- Public endpoints filter: `status='published' AND isActive=true`
- Admin endpoints return ALL content regardless of status
- Admins can publish/unpublish without deleting files

## Database Schema

### exclusive_tracks
```sql
CREATE TABLE exclusive_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL NOT NULL DEFAULT 0,
  cover_art_url TEXT NOT NULL,  -- permanent storage URL
  audio_file_url TEXT NOT NULL,  -- permanent storage URL
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration INTEGER,  -- seconds
  status TEXT NOT NULL DEFAULT 'published',  -- 'published', 'unpublished', 'archived'
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### exclusive_videos
```sql
CREATE TABLE exclusive_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL NOT NULL DEFAULT 0,
  thumbnail_url TEXT NOT NULL,  -- permanent storage URL
  video_url TEXT NOT NULL,  -- permanent storage URL or YouTube embed
  file_name TEXT,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_exclusive BOOLEAN NOT NULL DEFAULT true,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### merchandise
```sql
CREATE TABLE merchandise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL NOT NULL,
  image_url TEXT NOT NULL,  -- permanent storage URL
  type TEXT NOT NULL,  -- 'T-Shirt', 'Hoodie'
  color TEXT NOT NULL,
  sizes TEXT[] NOT NULL,  -- ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']
  status TEXT NOT NULL DEFAULT 'published',
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### user_purchases
```sql
CREATE TABLE user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,  -- 'track', 'video', 'merch'
  title TEXT NOT NULL,
  price DECIMAL NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_status TEXT NOT NULL DEFAULT 'completed',  -- 'pending', 'completed', 'failed'
  stripe_payment_id TEXT
);
```

## API Endpoints

### Admin Endpoints (Protected)

#### File Upload
- `POST /api/admin/upload/audio` - Upload audio file (max 100MB)
  - Accepts: multipart/form-data with 'audioFile' field
  - Returns: `{ audioFileUrl, fileName, fileType, fileSizeBytes, duration }`
  
- `POST /api/admin/upload/cover-art` - Upload cover art (max 10MB)
  - Accepts: multipart/form-data with 'coverArt' field
  - Returns: `{ coverArtUrl, fileName }`

#### Track Management
- `POST /api/admin/tracks` - Create track record
  - Body: `{ title, artistName, description, price, coverArtUrl, audioFileUrl, fileName, fileType, fileSizeBytes, duration, status, isActive }`
  - Returns: Created track object with id, timestamps
  
- `GET /api/admin/tracks/all` - Get ALL tracks (for admin management)
  - Returns: All tracks regardless of status
  - Ordered by: createdAt DESC
  
- `PATCH /api/admin/tracks/:id/publish` - Publish track
  - Sets: `status='published', isActive=true`
  
- `PATCH /api/admin/tracks/:id/unpublish` - Unpublish track
  - Sets: `status='unpublished', isActive=false`
  
- `DELETE /api/admin/tracks/:id` - Archive track (soft delete)
  - Sets: `status='archived', isActive=false`
  - Does NOT delete files from storage

#### Video Management
- `POST /api/admin/videos` - Create video record
- `GET /api/admin/videos/all` - Get ALL videos
- `DELETE /api/admin/videos/:id` - Archive video (soft delete)

#### User Management
- `POST /api/admin/users` - Create user account
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user account

### Public Endpoints (No Auth Required)

#### Content Display
- `GET /api/tracks` - Get published tracks
  - Filter: `status='published' AND isActive=true`
  - Ordered by: createdAt DESC
  - **This is the source of truth for the Music tab**
  
- `GET /api/videos` - Get published videos
  - Filter: `status='published' AND isActive=true`
  - Ordered by: createdAt DESC
  - **This is the source of truth for the Movies tab**
  
- `GET /api/merchandise` - Get published merch
  - Filter: `status='published' AND isActive=true`
  - Ordered by: createdAt DESC

#### Purchase Tracking
- `POST /api/purchases` - Record purchase (requires auth)
- `GET /api/purchases/my` - Get user's purchases (requires auth)

## Frontend Implementation

### Content Loading Pattern
```typescript
// Load content when screen comes into focus
useFocusEffect(
  useCallback(() => {
    console.log('Screen focused, loading content from database');
    loadContent();
  }, [])
);

const loadContent = async () => {
  setIsLoading(true);
  try {
    // Fetch from backend - source of truth
    const response = await fetch('/api/tracks');
    const data = await response.json();
    setContent(data);
  } catch (error) {
    console.error('Error loading content:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Upload Pattern
```typescript
const handleUpload = async () => {
  setIsUploading(true);
  
  try {
    // Step 1: Upload file to storage
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    
    const uploadResponse = await fetch('/api/admin/upload/audio', {
      method: 'POST',
      body: formData,
    });
    const { audioFileUrl, fileName, fileType, fileSizeBytes, duration } = await uploadResponse.json();
    
    // Step 2: Create database record
    const createResponse = await fetch('/api/admin/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        artistName,
        description,
        price,
        coverArtUrl,
        audioFileUrl,
        fileName,
        fileType,
        fileSizeBytes,
        duration,
        status: 'published',
        isActive: true,
      }),
    });
    
    const newTrack = await createResponse.json();
    
    // Success - refetch content to show new upload
    await loadContent();
    
  } catch (error) {
    console.error('Upload failed:', error);
    // Show error to user
  } finally {
    setIsUploading(false);
  }
};
```

## Why Content Stays Permanent

### 1. **Permanent Storage URLs**
- Files uploaded to object storage get permanent, non-expiring URLs
- URLs don't expire after 24 hours or on app restart
- Files remain accessible as long as they exist in storage

### 2. **Database Persistence**
- All content metadata stored in database tables
- Database records persist across app restarts, redeployments, sessions
- No reliance on AsyncStorage or frontend-only state

### 3. **Backend-Driven Display**
- Frontend fetches content from backend on every screen focus
- No local caching that can become stale or lost
- Always shows latest data from database

### 4. **Soft Deletes**
- Delete operations set `isActive=false` and `status='archived'`
- Files remain in storage for potential recovery
- Can be restored by admin if needed

### 5. **Status-Based Filtering**
- Public endpoints filter by `status='published' AND isActive=true`
- Unpublished content is hidden but not deleted
- Admin can publish/unpublish without data loss

## Common Issues Fixed

### ❌ Problem: Content disappears after upload
**Cause:** Frontend-only state, no database persistence
**Fix:** All uploads save to database, frontend fetches from database

### ❌ Problem: Content disappears after app restart
**Cause:** AsyncStorage used for content (not designed for this)
**Fix:** Database persistence, fetch on app load

### ❌ Problem: Expired file URLs
**Cause:** Temporary storage URLs that expire
**Fix:** Permanent object storage with non-expiring URLs

### ❌ Problem: Content not visible to users
**Cause:** Hidden by filters, wrong status, or isActive=false
**Fix:** Ensure `status='published' AND isActive=true` on upload

### ❌ Problem: Partial uploads (file uploaded but no DB record)
**Cause:** Non-transactional upload process
**Fix:** Transactional workflow - both steps must succeed

## Testing Checklist

- [ ] Upload track → appears in Music tab immediately
- [ ] Refresh Music tab → track still visible
- [ ] Restart app → track still visible
- [ ] Log out and back in → track still visible
- [ ] Unpublish track → disappears from Music tab
- [ ] Publish track → reappears in Music tab
- [ ] Delete track → disappears from Music tab
- [ ] Admin panel shows all tracks (published, unpublished, archived)
- [ ] Public Music tab only shows published tracks
- [ ] File URLs work after 24+ hours
- [ ] Multiple uploads don't overwrite each other

## Maintenance

### Monitoring
- Log all upload operations (success and failure)
- Monitor storage usage
- Track failed uploads for manual cleanup
- Alert on database write failures

### Cleanup
- Periodically review archived content
- Delete archived files from storage if confirmed not needed
- Clean up orphaned files (in storage but no DB record)

### Backups
- Regular database backups
- Storage bucket versioning enabled
- Disaster recovery plan for data restoration

## Summary

This architecture ensures:
✅ All uploaded content is stored permanently
✅ Content stays live until admin explicitly removes it
✅ No content disappears due to cache, state, or URL expiration
✅ Full audit trail with timestamps
✅ Ability to publish/unpublish without data loss
✅ Soft deletes allow recovery
✅ Backend is source of truth, not frontend
