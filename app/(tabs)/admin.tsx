
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Modal, Image, ActivityIndicator } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import {
  uploadAudio,
  uploadCover,
  createTrackV2,
  listAllTracksAdmin,
  publishTrack,
  unpublishTrack,
  deleteTrack,
  createVideo,
  getAllVideosAdmin,
  deleteVideo,
  type Track,
  type ExclusiveVideo,
} from '@/utils/api';

interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'distributor' | 'user';
  canUpload: boolean;
  createdAt: string;
}

export default function AdminScreen() {
  const { isAdminLoggedIn, isMusicDistributorLoggedIn, login, logout, userEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Track upload state
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('Afroman');
  const [trackDescription, setTrackDescription] = useState('');
  const [trackPrice, setTrackPrice] = useState('');
  const [audioFile, setAudioFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [trackStatus, setTrackStatus] = useState<'published' | 'unpublished'>('published');
  
  // Video upload state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoPrice, setVideoPrice] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isExclusive, setIsExclusive] = useState(true);
  
  // User management state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'distributor' | 'user'>('user');
  const [newUserCanUpload, setNewUserCanUpload] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'tracks' | 'videos' | 'users'>('tracks');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Content lists
  const [tracks, setTracks] = useState<Track[]>([]);
  const [videos, setVideos] = useState<ExclusiveVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAllContent = useCallback(async () => {
    setIsLoading(true);
    console.log('Admin: Loading all content for management from database');
    
    try {
      const [tracksData, videosData] = await Promise.all([
        listAllTracksAdmin(),
        getAllVideosAdmin(),
      ]);
      
      setTracks(tracksData);
      setVideos(videosData);
      
      console.log('Admin: Content loaded successfully');
      console.log('Admin: Tracks:', tracksData.length, 'Videos:', videosData.length);
    } catch (error) {
      console.error('Admin: Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn || isMusicDistributorLoggedIn) {
      loadAllContent();
      if (isAdminLoggedIn) {
        loadUsers();
      }
    }
  }, [isAdminLoggedIn, isMusicDistributorLoggedIn, loadAllContent]);

  const loadUsers = async () => {
    console.log('Admin: Loading users');
    
    try {
      // TODO: Backend Integration - GET /api/admin/users
      // Returns: [{ id, email, role, canUpload, createdAt }]
      
      setUsers([]);
    } catch (error) {
      console.error('Admin: Error loading users:', error);
    }
  };

  const handleLogin = async () => {
    console.log('Admin/Distributor login attempt');
    const success = await login(email, password);
    if (success) {
      showConfirm('Success! You are now logged in.', () => {
        setEmail('');
        setPassword('');
      });
    } else {
      showConfirm('Login failed. Please check your credentials and try again.', () => {});
    }
  };

  const showConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handlePickAudioFile = async () => {
    try {
      console.log('Admin: Opening document picker for audio file');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        const maxSize = 100 * 1024 * 1024;
        if (file.size && file.size > maxSize) {
          showConfirm('Audio file is too large. Maximum size is 100MB.', () => {});
          return;
        }
        
        const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];
        if (file.mimeType && !validTypes.includes(file.mimeType) && !file.mimeType.startsWith('audio/')) {
          showConfirm('Invalid file type. Please select an MP3, WAV, or M4A file.', () => {});
          return;
        }
        
        console.log('Admin: Audio file selected:', file.name, 'Size:', (file.size! / 1024 / 1024).toFixed(2), 'MB');
        setAudioFile(file);
        showConfirm(`Audio file selected: ${file.name}`, () => {});
      } else {
        console.log('Admin: Audio file selection cancelled');
      }
    } catch (error) {
      console.error('Admin: Error picking audio file:', error);
      showConfirm('Error selecting audio file. Please try again.', () => {});
    }
  };

  const handlePickCoverArt = async () => {
    try {
      console.log('Admin: Opening image picker for cover art');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        const maxSize = 10 * 1024 * 1024;
        if (file.size && file.size > maxSize) {
          showConfirm('Image file is too large. Maximum size is 10MB.', () => {});
          return;
        }
        
        console.log('Admin: Cover art selected:', file.name);
        setCoverArtFile(file);
        setCoverArtUrl('');
        showConfirm(`Cover art selected: ${file.name}`, () => {});
      }
    } catch (error) {
      console.error('Admin: Error picking cover art:', error);
      showConfirm('Error selecting cover art. Please try again.', () => {});
    }
  };

  const handleUploadTrack = async () => {
    console.log('Admin: Starting PERMANENT track upload process');
    console.log('Admin: This will upload to cloud storage and save to database');
    console.log('Admin: Track will remain visible until manually deleted');
    
    if (!trackTitle.trim()) {
      showConfirm('Please enter a track title', () => {});
      return;
    }
    
    if (!trackArtist.trim()) {
      showConfirm('Please enter an artist name', () => {});
      return;
    }
    
    if (!trackDescription.trim()) {
      showConfirm('Please enter a description', () => {});
      return;
    }
    
    if (!audioFile) {
      showConfirm('Please select an audio file', () => {});
      return;
    }
    
    if (!coverArtFile && !coverArtUrl.trim()) {
      showConfirm('Please select a cover art image or provide a URL', () => {});
      return;
    }
    
    const price = parseFloat(trackPrice);
    if (isNaN(price) || price < 0) {
      showConfirm('Please enter a valid price (0 or greater)', () => {});
      return;
    }

    setIsUploading(true);
    setUploadProgress('Preparing upload...');
    
    try {
      setUploadProgress('Uploading audio file to permanent cloud storage...');
      console.log('Admin: Step 1/3 - Uploading audio file to PERMANENT cloud storage');
      
      const audioUploadResult = await uploadAudio({
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.mimeType || 'audio/mpeg',
      });
      
      console.log('Admin: Audio file uploaded successfully to permanent storage');
      console.log('Admin: Permanent URL:', audioUploadResult.url);
      
      setUploadProgress('Uploading cover art to permanent cloud storage...');
      console.log('Admin: Step 2/3 - Uploading cover art to PERMANENT cloud storage');
      
      let finalCoverArtUrl = coverArtUrl;
      
      if (coverArtFile) {
        const coverUploadResult = await uploadCover({
          uri: coverArtFile.uri,
          name: coverArtFile.name,
          type: coverArtFile.mimeType || 'image/jpeg',
        });
        
        finalCoverArtUrl = coverUploadResult.url;
        console.log('Admin: Cover art uploaded successfully to permanent storage');
        console.log('Admin: Permanent URL:', finalCoverArtUrl);
      }
      
      setUploadProgress('Saving track to database...');
      console.log('Admin: Step 3/3 - Creating PERMANENT database record');
      
      const newTrack = await createTrackV2({
        title: trackTitle,
        artist: trackArtist,
        description: trackDescription,
        price,
        cover_art_url: finalCoverArtUrl || undefined,
        audio_url: audioUploadResult.url,
        duration_seconds: undefined,
        status: trackStatus === 'unpublished' ? 'draft' : 'published',
      });
      
      setTracks(prev => [newTrack, ...prev]);
      
      setUploadProgress('Upload complete!');
      
      const statusText = trackStatus === 'published' ? 'published and is now LIVE in the Music tab' : 'saved as unpublished';
      console.log(`Admin: ✅ Track "${trackTitle}" ${statusText}`);
      console.log('Admin: ✅ Track is stored PERMANENTLY in cloud storage and database');
      console.log('Admin: ✅ Track will remain visible until you manually delete or unpublish it');
      console.log('Admin: ✅ Track will appear immediately in Music tab for all users');
      
      showConfirm(`✅ Success! Track "${trackTitle}" has been ${statusText}!\n\n${trackStatus === 'published' ? 'The track is now PERMANENTLY stored and available for purchase in the Music tab. It will remain visible until you manually remove it.' : 'The track is saved as unpublished. You can publish it later to make it visible.'}`, () => {
        setTrackTitle('');
        setTrackArtist('Afroman');
        setTrackDescription('');
        setTrackPrice('');
        setAudioFile(null);
        setCoverArtFile(null);
        setCoverArtUrl('');
        setTrackStatus('published');
        setUploadProgress('');
      });
      
      console.log('Admin: Track upload completed successfully - PERMANENT storage confirmed');
      
    } catch (error: any) {
      const message = error?.message ?? String(error);
      console.error('Admin: Error uploading track:', message, error);
      showConfirm(`Upload failed: ${message}`, () => {
        setUploadProgress('');
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadVideo = async () => {
    console.log('Admin: Starting PERMANENT video upload process');
    
    if (!videoTitle.trim()) {
      showConfirm('Please enter a video title', () => {});
      return;
    }
    
    if (!videoDescription.trim()) {
      showConfirm('Please enter a description', () => {});
      return;
    }
    
    if (!videoUrl.trim()) {
      showConfirm('Please enter a video URL', () => {});
      return;
    }
    
    if (!thumbnailUrl.trim()) {
      showConfirm('Please enter a thumbnail URL', () => {});
      return;
    }
    
    const price = parseFloat(videoPrice);
    if (isNaN(price) || price < 0) {
      showConfirm('Please enter a valid price (0 or greater)', () => {});
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('Admin: Creating PERMANENT video database record');
      
      const newVideo = await createVideo({
        title: videoTitle,
        description: videoDescription,
        price,
        thumbnailUrl,
        videoUrl,
        status: 'published',
        isActive: true,
        isExclusive,
        uploadedBy: userEmail || 'admin',
      });
      
      setVideos(prev => [newVideo, ...prev]);
      
      const exclusiveText = isExclusive ? 'exclusive (for purchase)' : 'free';
      console.log(`Admin: ✅ Video "${videoTitle}" published as ${exclusiveText} content`);
      console.log('Admin: ✅ Video is stored PERMANENTLY in database');
      console.log('Admin: ✅ Video will remain visible until you manually delete it');
      
      showConfirm(`✅ Success! Video "${videoTitle}" has been published as ${exclusiveText} content!\n\n${isExclusive ? 'The video is now PERMANENTLY stored and available for purchase in the Movies tab.' : 'The video is now available to watch for free in the Movies tab.'}\n\nIt will remain visible until you manually remove it.`, () => {
        setVideoTitle('');
        setVideoDescription('');
        setVideoPrice('');
        setVideoUrl('');
        setThumbnailUrl('');
        setIsExclusive(true);
      });
      
      console.log('Admin: Video upload completed successfully - PERMANENT storage confirmed');
      
    } catch (error) {
      console.error('Admin: Error uploading video:', error);
      showConfirm('Upload failed. Please try again.', () => {});
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishTrack = async (trackId: string) => {
    console.log('Admin: Publishing track:', trackId);
    
    try {
      const updatedTrack = await publishTrack(trackId);
      
      setTracks(prev => prev.map(t => 
        t.id === trackId ? updatedTrack : t
      ));
      
      console.log('Admin: ✅ Track published - now LIVE in Music tab');
      showConfirm('✅ Track published successfully! It is now available in the Music tab and will remain visible until you unpublish or delete it.', () => {});
    } catch (error) {
      console.error('Admin: Error publishing track:', error);
      showConfirm('Error publishing track. Please try again.', () => {});
    }
  };

  const handleUnpublishTrack = async (trackId: string) => {
    console.log('Admin: Unpublishing track:', trackId);
    
    try {
      const updatedTrack = await unpublishTrack(trackId);
      
      setTracks(prev => prev.map(t => 
        t.id === trackId ? updatedTrack : t
      ));
      
      console.log('Admin: Track unpublished - removed from Music tab');
      showConfirm('Track unpublished successfully! It has been removed from the Music tab but is still stored in the database. You can republish it anytime.', () => {});
    } catch (error) {
      console.error('Admin: Error unpublishing track:', error);
      showConfirm('Error unpublishing track. Please try again.', () => {});
    }
  };

  const handleDeleteTrack = (trackId: string, trackTitle: string) => {
    showConfirm(`Are you sure you want to delete "${trackTitle}"? This will archive the track and remove it from the Music tab.`, async () => {
      console.log('Admin: Deleting track:', trackId);
      
      try {
        await deleteTrack(trackId);
        
        setTracks(prev => prev.filter(t => t.id !== trackId));
        setShowConfirmModal(false);
        console.log('Admin: ✅ Track deleted - removed from Music tab');
        showConfirm('Track deleted successfully! It has been archived and removed from the Music tab.', () => {});
      } catch (error) {
        console.error('Admin: Error deleting track:', error);
        showConfirm('Error deleting track. Please try again.', () => {});
      }
    });
  };

  const handleDeleteVideo = (videoId: string, videoTitle: string) => {
    showConfirm(`Are you sure you want to delete "${videoTitle}"? This will remove it from the Movies tab.`, async () => {
      console.log('Admin: Deleting video:', videoId);
      
      try {
        await deleteVideo(videoId);
        
        setVideos(prev => prev.filter(v => v.id !== videoId));
        setShowConfirmModal(false);
        console.log('Admin: ✅ Video deleted - removed from Movies tab');
        showConfirm('Video deleted successfully! It has been removed from the Movies tab.', () => {});
      } catch (error) {
        console.error('Admin: Error deleting video:', error);
        showConfirm('Error deleting video. Please try again.', () => {});
      }
    });
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      showConfirm('Please enter email and password for the new user', () => {});
      return;
    }

    if (users.some(u => u.email === newUserEmail)) {
      showConfirm('A user with this email already exists', () => {});
      return;
    }

    console.log('Admin: Creating new user:', newUserEmail, 'Role:', newUserRole);

    try {
      // TODO: Backend Integration - POST /api/admin/users
      // Body: { email, password, role, canUpload }
      // Returns: { userId, success }
      
      const newUser: UserAccount = {
        id: Date.now().toString(),
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        canUpload: newUserCanUpload,
        createdAt: new Date().toISOString(),
      };

      setUsers(prev => [...prev, newUser]);

      const roleText = newUserRole === 'distributor' ? 'Music Distributor' : 'User';
      const uploadText = newUserCanUpload ? ' with upload capabilities' : '';
      
      showConfirm(`${roleText} account created successfully${uploadText}!`, () => {
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        setNewUserCanUpload(false);
      });
    } catch (error) {
      console.error('Admin: Error creating user:', error);
      showConfirm('Error creating user. Please try again.', () => {});
    }
  };

  const handleDeleteUser = (userId: string, userEmailToDelete: string) => {
    showConfirm(`Are you sure you want to delete user: ${userEmailToDelete}?`, async () => {
      console.log('Admin: Deleting user:', userId);
      
      try {
        // TODO: Backend Integration - DELETE /api/admin/users/:id
        // Returns: { success: true }
        
        setUsers(prev => prev.filter(u => u.id !== userId));
        setShowConfirmModal(false);
        showConfirm('User deleted successfully!', () => {});
      } catch (error) {
        console.error('Admin: Error deleting user:', error);
        showConfirm('Error deleting user. Please try again.', () => {});
      }
    });
  };

  const handleLogout = () => {
    showConfirm('Are you sure you want to logout?', () => {
      console.log('Admin: User logging out');
      logout();
      setShowConfirmModal(false);
    });
  };

  const isLoggedIn = isAdminLoggedIn || isMusicDistributorLoggedIn;
  const userRole = isAdminLoggedIn ? 'Admin' : isMusicDistributorLoggedIn ? 'Music Distributor' : '';
  const canManageUsers = isAdminLoggedIn;

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/21d33427-3661-461b-8942-7bbf2cb57473.png')}
              style={commonStyles.logoSmall}
              resizeMode="contain"
            />
            <Text style={commonStyles.title}>Content Management Login</Text>
            <Text style={commonStyles.textSecondary}>
              Login to manage content
            </Text>
          </View>

          <View style={commonStyles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.7}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{confirmMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  confirmAction();
                  setShowConfirmModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/21d33427-3661-461b-8942-7bbf2cb57473.png')}
            style={commonStyles.logoSmall}
            resizeMode="contain"
          />
          <Text style={commonStyles.title}>{userRole}</Text>
          <Text style={commonStyles.title}>Dashboard</Text>
          <Text style={commonStyles.textSecondary}>
            Upload content - stored permanently until you delete it
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
            onPress={() => setActiveTab('tracks')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'tracks' && styles.activeTabText]}>
              Tracks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
              Videos
            </Text>
          </TouchableOpacity>
          {canManageUsers && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'users' && styles.activeTab]}
              onPress={() => setActiveTab('users')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
                Users
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab === 'tracks' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Upload Exclusive Track</Text>
              <Text style={styles.sectionSubtitle}>
                Upload MP3, WAV, or M4A files - stored permanently in cloud storage
              </Text>

              <Text style={styles.label}>Track Title *</Text>
              <TextInput
                style={styles.input}
                value={trackTitle}
                onChangeText={setTrackTitle}
                placeholder="Enter track title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Artist Name *</Text>
              <TextInput
                style={styles.input}
                value={trackArtist}
                onChangeText={setTrackArtist}
                placeholder="Enter artist name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={trackDescription}
                onChangeText={setTrackDescription}
                placeholder="Enter track description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Price ($) *</Text>
              <TextInput
                style={styles.input}
                value={trackPrice}
                onChangeText={setTrackPrice}
                placeholder="9.99"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Audio File (MP3, WAV, M4A) * - Max 100MB</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handlePickAudioFile}
                activeOpacity={0.7}
              >
                <Text style={styles.filePickerButtonText}>
                  {audioFile ? `✓ ${audioFile.name}` : 'Select Audio File'}
                </Text>
              </TouchableOpacity>
              {audioFile && (
                <View style={styles.fileInfo}>
                  <Text style={styles.fileInfoText}>File: {audioFile.name}</Text>
                  <Text style={styles.fileInfoText}>
                    Size: {(audioFile.size! / 1024 / 1024).toFixed(2)} MB
                  </Text>
                  <Text style={styles.fileInfoText}>Type: {audioFile.mimeType}</Text>
                </View>
              )}

              <Text style={styles.label}>Cover Art * - Max 10MB</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handlePickCoverArt}
                activeOpacity={0.7}
              >
                <Text style={styles.filePickerButtonText}>
                  {coverArtFile ? `✓ ${coverArtFile.name}` : 'Select Cover Art Image'}
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.orText}>OR</Text>
              
              <Text style={styles.label}>Cover Art URL</Text>
              <TextInput
                style={styles.input}
                value={coverArtUrl}
                onChangeText={(text) => {
                  setCoverArtUrl(text);
                  if (text.trim()) {
                    setCoverArtFile(null);
                  }
                }}
                placeholder="https://..."
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                editable={!coverArtFile}
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, trackStatus === 'published' && styles.typeButtonActive]}
                  onPress={() => setTrackStatus('published')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, trackStatus === 'published' && styles.typeButtonTextActive]}>
                    Published (Live)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, trackStatus === 'unpublished' && styles.typeButtonActive]}
                  onPress={() => setTrackStatus('unpublished')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, trackStatus === 'unpublished' && styles.typeButtonTextActive]}>
                    Unpublished (Draft)
                  </Text>
                </TouchableOpacity>
              </View>

              {uploadProgress ? (
                <View style={styles.uploadProgressContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.uploadProgressText}>{uploadProgress}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                onPress={handleUploadTrack}
                activeOpacity={0.7}
                disabled={isUploading}
              >
                <Text style={styles.buttonText}>
                  {isUploading ? 'Uploading...' : 'Upload Track'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Uploaded Tracks</Text>
              <Text style={styles.countText}>{tracks.length} tracks</Text>
              
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : tracks.length === 0 ? (
                <Text style={styles.emptyText}>No tracks uploaded yet</Text>
              ) : (
                tracks.map((track) => {
                  const priceDisplay = `$${Number(track.price).toFixed(2)}`;
                  const statusDisplay = track.status.charAt(0).toUpperCase() + track.status.slice(1);
                  const statusColor = track.status === 'published' ? colors.accent : colors.textSecondary;
                  const artistDisplay = track.artist;
                  
                  return (
                    <View key={track.id} style={styles.contentItem}>
                      <View style={styles.contentInfo}>
                        <Text style={styles.contentTitle}>{track.title}</Text>
                        <Text style={styles.contentDescription}>{artistDisplay}</Text>
                        <View style={styles.contentMetaRow}>
                          <Text style={[styles.contentMeta, { color: statusColor }]}>
                            {statusDisplay}
                          </Text>
                          <Text style={styles.contentMeta}>{priceDisplay}</Text>
                        </View>
                      </View>
                      <View style={styles.actionButtons}>
                        {track.status === 'unpublished' && (
                          <TouchableOpacity
                            style={styles.publishButton}
                            onPress={() => handlePublishTrack(track.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.publishButtonText}>Publish</Text>
                          </TouchableOpacity>
                        )}
                        {track.status === 'published' && (
                          <TouchableOpacity
                            style={styles.unpublishButton}
                            onPress={() => handleUnpublishTrack(track.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.unpublishButtonText}>Unpublish</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteTrack(track.id, track.title)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}

        {activeTab === 'videos' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Upload Video</Text>
              <Text style={styles.sectionSubtitle}>
                Add videos - stored permanently in database
              </Text>

              <Text style={styles.label}>Video Title *</Text>
              <TextInput
                style={styles.input}
                value={videoTitle}
                onChangeText={setVideoTitle}
                placeholder="Enter video title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={videoDescription}
                onChangeText={setVideoDescription}
                placeholder="Enter description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Video URL (YouTube embed or direct) *</Text>
              <TextInput
                style={styles.input}
                value={videoUrl}
                onChangeText={setVideoUrl}
                placeholder="https://www.youtube.com/embed/..."
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Thumbnail URL *</Text>
              <TextInput
                style={styles.input}
                value={thumbnailUrl}
                onChangeText={setThumbnailUrl}
                placeholder="https://..."
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setIsExclusive(!isExclusive)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkboxBox, isExclusive && styles.checkboxBoxChecked]}>
                    {isExclusive && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Exclusive (for purchase only)</Text>
                </TouchableOpacity>
              </View>

              {isExclusive && (
                <>
                  <Text style={styles.label}>Price ($) *</Text>
                  <TextInput
                    style={styles.input}
                    value={videoPrice}
                    onChangeText={setVideoPrice}
                    placeholder="9.99"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                onPress={handleUploadVideo}
                activeOpacity={0.7}
                disabled={isUploading}
              >
                <Text style={styles.buttonText}>
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Uploaded Videos</Text>
              <Text style={styles.countText}>{videos.length} videos</Text>
              
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : videos.length === 0 ? (
                <Text style={styles.emptyText}>No videos uploaded yet</Text>
              ) : (
                videos.map((video) => {
                  const priceDisplay = video.isExclusive ? `$${video.price.toFixed(2)}` : 'Free';
                  const statusDisplay = video.status.charAt(0).toUpperCase() + video.status.slice(1);
                  const exclusiveText = video.isExclusive ? 'Exclusive' : 'Free';
                  
                  return (
                    <View key={video.id} style={styles.contentItem}>
                      <View style={styles.contentInfo}>
                        <Text style={styles.contentTitle}>{video.title}</Text>
                        <Text style={styles.contentDescription}>{video.description}</Text>
                        <View style={styles.contentMetaRow}>
                          <Text style={styles.contentMeta}>{statusDisplay}</Text>
                          <Text style={styles.contentMeta}>•</Text>
                          <Text style={styles.contentMeta}>{exclusiveText}</Text>
                          <Text style={styles.contentPrice}>{priceDisplay}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteVideo(video.id, video.title)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}

        {activeTab === 'users' && canManageUsers && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Create New User</Text>
              <Text style={styles.sectionSubtitle}>
                Add users with custom permissions
              </Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                placeholder="user@example.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={newUserPassword}
                onChangeText={setNewUserPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.label}>Role</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, newUserRole === 'user' && styles.typeButtonActive]}
                  onPress={() => setNewUserRole('user')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, newUserRole === 'user' && styles.typeButtonTextActive]}>
                    User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, newUserRole === 'distributor' && styles.typeButtonActive]}
                  onPress={() => setNewUserRole('distributor')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, newUserRole === 'distributor' && styles.typeButtonTextActive]}>
                    Distributor
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setNewUserCanUpload(!newUserCanUpload)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkboxBox, newUserCanUpload && styles.checkboxBoxChecked]}>
                    {newUserCanUpload && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Can upload content</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.uploadButton} onPress={handleCreateUser} activeOpacity={0.7}>
                <Text style={styles.buttonText}>Create User</Text>
              </TouchableOpacity>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>User Accounts</Text>
              <Text style={styles.countText}>{users.length} users</Text>
              
              {users.length === 0 ? (
                <Text style={styles.emptyText}>No users created yet</Text>
              ) : (
                users.map((user) => {
                  const roleDisplay = user.role === 'admin' ? 'Admin' : user.role === 'distributor' ? 'Distributor' : 'User';
                  const uploadDisplay = user.canUpload ? 'Can Upload' : 'View Only';
                  
                  return (
                    <View key={user.id} style={styles.contentItem}>
                      <View style={styles.contentInfo}>
                        <Text style={styles.contentTitle}>{user.email}</Text>
                        <View style={styles.contentMetaRow}>
                          <Text style={styles.contentMeta}>{roleDisplay}</Text>
                          <Text style={styles.contentMeta}>•</Text>
                          <Text style={styles.contentMeta}>{uploadDisplay}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteUser(user.id, user.email)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{confirmMessage}</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  confirmAction();
                  setShowConfirmModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
              {confirmMessage.includes('delete') || confirmMessage.includes('logout') || confirmMessage.includes('sure') ? (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowConfirmModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  countText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  orText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 8,
  },
  checkboxContainer: {
    marginVertical: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  filePickerButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  filePickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  fileInfo: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  fileInfoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  uploadProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  uploadProgressText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  contentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  contentInfo: {
    flex: 1,
    marginRight: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  contentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentMeta: {
    fontSize: 12,
    color: colors.accent,
  },
  contentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 'auto',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  publishButton: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  unpublishButton: {
    backgroundColor: colors.textSecondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unpublishButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
    marginTop: 12,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.textSecondary,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
