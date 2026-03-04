
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Modal, Image } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  isExclusive?: boolean;
  type: 'video' | 'audio' | 'merch';
  price?: number;
  imageUrl?: string;
  sizes?: string[];
  merchType?: string;
  color?: string;
  fileName?: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'distributor' | 'user';
  canUpload: boolean;
  createdAt: string;
}

const CONTENT_STORAGE_KEY = '@afroman_admin_content';
const USERS_STORAGE_KEY = '@afroman_users';

export default function AdminScreen() {
  const { isAdminLoggedIn, isMusicDistributorLoggedIn, login, logout, userEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Video/Audio upload state
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentType, setContentType] = useState<'video' | 'audio'>('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioFile, setAudioFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isExclusive, setIsExclusive] = useState(true);
  const [contentPrice, setContentPrice] = useState('');
  
  // Merchandise upload state
  const [merchName, setMerchName] = useState('');
  const [merchDescription, setMerchDescription] = useState('');
  const [merchPrice, setMerchPrice] = useState('');
  const [merchImageUrl, setMerchImageUrl] = useState('');
  const [merchType, setMerchType] = useState('tshirt');
  const [merchColor, setMerchColor] = useState('');
  
  // User management state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'distributor' | 'user'>('user');
  const [newUserCanUpload, setNewUserCanUpload] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'videos' | 'merch' | 'users'>('videos');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [isUploading, setIsUploading] = useState(false);
  
  // Content list
  const [contentList, setContentList] = useState<ContentItem[]>([]);

  useEffect(() => {
    if (isAdminLoggedIn || isMusicDistributorLoggedIn) {
      loadContent();
      if (isAdminLoggedIn) {
        loadUsers();
      }
    }
  }, [isAdminLoggedIn, isMusicDistributorLoggedIn]);

  const loadContent = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTENT_STORAGE_KEY);
      if (stored) {
        const content = JSON.parse(stored);
        setContentList(content);
        console.log('Admin: Loaded content items:', content.length);
      } else {
        // Initialize with free videos
        const initialContent: ContentItem[] = [
          {
            id: '1',
            title: 'Because I Got High',
            description: 'Official Music Video',
            videoUrl: 'https://www.youtube.com/embed/WeYsTmIzjkw',
            thumbnailUrl: 'https://img.youtube.com/vi/WeYsTmIzjkw/maxresdefault.jpg',
            isExclusive: false,
            type: 'video',
            price: 0,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'system',
          },
          {
            id: '2',
            title: 'Crazy Rap',
            description: 'Official Music Video',
            videoUrl: 'https://www.youtube.com/embed/SIMcktul77c',
            thumbnailUrl: 'https://img.youtube.com/vi/SIMcktul77c/maxresdefault.jpg',
            isExclusive: false,
            type: 'video',
            price: 0,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'system',
          },
        ];
        await AsyncStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(initialContent));
        setContentList(initialContent);
      }
    } catch (error) {
      console.error('Admin: Error loading content:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const userList = JSON.parse(stored);
        setUsers(userList);
        console.log('Admin: Loaded users:', userList.length);
      }
    } catch (error) {
      console.error('Admin: Error loading users:', error);
    }
  };

  const saveContent = async (updatedContent: ContentItem[]) => {
    try {
      await AsyncStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(updatedContent));
      setContentList(updatedContent);
      console.log('Admin: Content saved successfully');
    } catch (error) {
      console.error('Admin: Error saving content:', error);
    }
  };

  const saveUsers = async (updatedUsers: UserAccount[]) => {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      console.log('Admin: Users saved successfully');
    } catch (error) {
      console.error('Admin: Error saving users:', error);
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
      console.log('Opening document picker for audio file');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Audio file selected:', file.name);
        setAudioFile(file);
        showConfirm(`Audio file selected: ${file.name}`, () => {});
      } else {
        console.log('Audio file selection cancelled');
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      showConfirm('Error selecting audio file. Please try again.', () => {});
    }
  };

  const handleUploadContent = async () => {
    if (!contentTitle || !contentDescription || !thumbnailUrl) {
      showConfirm('Please fill in title, description, and thumbnail URL', () => {});
      return;
    }

    if (contentType === 'video' && !videoUrl) {
      showConfirm('Please provide a video URL', () => {});
      return;
    }

    if (contentType === 'audio' && !audioFile) {
      showConfirm('Please select an MP3 file', () => {});
      return;
    }

    if (isExclusive && (!contentPrice || parseFloat(contentPrice) <= 0)) {
      showConfirm('Please set a valid price for exclusive content', () => {});
      return;
    }

    setIsUploading(true);
    console.log('Uploading content:', contentTitle, 'Type:', contentType);

    try {
      let uploadedAudioUrl = '';

      // If audio file is selected, simulate upload
      if (contentType === 'audio' && audioFile) {
        console.log('Uploading MP3 file:', audioFile.name);
        uploadedAudioUrl = audioFile.uri;
        console.log('Audio uploaded to:', uploadedAudioUrl);
      }

      const newContent: ContentItem = {
        id: Date.now().toString(),
        title: contentTitle,
        description: contentDescription,
        videoUrl: contentType === 'video' ? videoUrl : undefined,
        audioUrl: contentType === 'audio' ? uploadedAudioUrl : undefined,
        thumbnailUrl,
        isExclusive,
        type: contentType,
        price: isExclusive ? parseFloat(contentPrice) : 0,
        fileName: contentType === 'audio' ? audioFile?.name : undefined,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userEmail || 'admin',
      };

      const updatedContent = [...contentList, newContent];
      await saveContent(updatedContent);

      // TODO: Backend Integration - POST /api/admin/content
      // Body: { title, description, videoUrl?, audioUrl?, thumbnailUrl, isExclusive, price, type, uploadedBy }
      // Returns: created content object

      const typeText = contentType === 'video' ? 'Video' : 'Song';
      const priceText = isExclusive ? ` for $${contentPrice}` : ' as free content';
      const targetTab = contentType === 'video' ? 'Movies' : 'Music';
      
      showConfirm(`${typeText} uploaded successfully${priceText}! It will now appear in the ${targetTab} tab.`, () => {
        setContentTitle('');
        setContentDescription('');
        setVideoUrl('');
        setAudioFile(null);
        setThumbnailUrl('');
        setIsExclusive(true);
        setContentPrice('');
        setContentType('video');
      });
    } catch (error) {
      console.error('Error uploading content:', error);
      showConfirm('Error uploading content. Please try again.', () => {});
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadMerch = async () => {
    if (!merchName || !merchDescription || !merchPrice || !merchImageUrl || !merchColor) {
      showConfirm('Please fill in all merchandise fields', () => {});
      return;
    }

    console.log('Uploading merchandise:', merchName);
    
    const newMerch: ContentItem = {
      id: Date.now().toString(),
      title: merchName,
      description: merchDescription,
      price: parseFloat(merchPrice),
      imageUrl: merchImageUrl,
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      merchType,
      color: merchColor,
      type: 'merch',
      uploadedAt: new Date().toISOString(),
      uploadedBy: userEmail || 'admin',
    };
    
    const updatedContent = [...contentList, newMerch];
    await saveContent(updatedContent);
    
    // TODO: Backend Integration - POST /api/admin/merchandise with { name, description, price, imageUrl, sizes, type, color } → created merchandise
    
    showConfirm('Merchandise uploaded successfully!', () => {
      setMerchName('');
      setMerchDescription('');
      setMerchPrice('');
      setMerchImageUrl('');
      setMerchColor('');
    });
  };

  const handleDeleteContent = (id: string, type: 'video' | 'audio' | 'merch') => {
    const contentType = type === 'merch' ? 'merchandise item' : type;
    showConfirm(`Are you sure you want to delete this ${contentType}?`, async () => {
      console.log('Deleting content:', id);
      const updatedContent = contentList.filter(item => item.id !== id);
      await saveContent(updatedContent);
      // TODO: Backend Integration - DELETE /api/admin/content/:id → { success: true }
      setShowConfirmModal(false);
    });
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      showConfirm('Please enter email and password for the new user', () => {});
      return;
    }

    // Check if user already exists
    if (users.some(u => u.email === newUserEmail)) {
      showConfirm('A user with this email already exists', () => {});
      return;
    }

    console.log('Creating new user:', newUserEmail, 'Role:', newUserRole);

    const newUser: UserAccount = {
      id: Date.now().toString(),
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      canUpload: newUserCanUpload,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);

    // TODO: Backend Integration - POST /api/admin/users
    // Body: { email, password, role, canUpload }
    // Returns: { userId, success }

    const roleText = newUserRole === 'distributor' ? 'Music Distributor' : 'User';
    const uploadText = newUserCanUpload ? ' with upload capabilities' : '';
    
    showConfirm(`${roleText} account created successfully${uploadText}!`, () => {
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setNewUserCanUpload(false);
    });
  };

  const handleDeleteUser = (userId: string, userEmailToDelete: string) => {
    showConfirm(`Are you sure you want to delete user: ${userEmailToDelete}?`, async () => {
      console.log('Deleting user:', userId);
      const updatedUsers = users.filter(u => u.id !== userId);
      await saveUsers(updatedUsers);
      // TODO: Backend Integration - DELETE /api/admin/users/:id → { success: true }
      setShowConfirmModal(false);
    });
  };

  const handleLogout = () => {
    showConfirm('Are you sure you want to logout?', () => {
      console.log('User logging out');
      logout();
      setShowConfirmModal(false);
    });
  };

  const isLoggedIn = isAdminLoggedIn || isMusicDistributorLoggedIn;
  const userRole = isAdminLoggedIn ? 'Admin' : isMusicDistributorLoggedIn ? 'Music Distributor' : '';
  const canManageMerch = isAdminLoggedIn;
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

  const videoContent = contentList.filter(item => item.type === 'video' || item.type === 'audio');
  const merchContent = contentList.filter(item => item.type === 'merch');

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
          <Text style={commonStyles.title}>
            {userRole}
          </Text>
          <Text style={commonStyles.title}>
            Dashboard
          </Text>
          <Text style={commonStyles.textSecondary}>
            Manage content and users
          </Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
              Content
            </Text>
          </TouchableOpacity>
          {canManageMerch && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'merch' && styles.activeTab]}
              onPress={() => setActiveTab('merch')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'merch' && styles.activeTabText]}>
                Merch
              </Text>
            </TouchableOpacity>
          )}
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

        {/* Video/Audio Upload Section */}
        {activeTab === 'videos' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Release New Content</Text>
              <Text style={styles.sectionSubtitle}>
                Upload videos or MP3 files - they will appear instantly in the app
              </Text>

              {/* Content Type Selector */}
              <Text style={styles.label}>Content Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, contentType === 'video' && styles.typeButtonActive]}
                  onPress={() => {
                    setContentType('video');
                    setAudioFile(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, contentType === 'video' && styles.typeButtonTextActive]}>
                    Video
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, contentType === 'audio' && styles.typeButtonActive]}
                  onPress={() => {
                    setContentType('audio');
                    setVideoUrl('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, contentType === 'audio' && styles.typeButtonTextActive]}>
                    Audio (MP3)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={contentTitle}
                onChangeText={setContentTitle}
                placeholder="Enter title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={contentDescription}
                onChangeText={setContentDescription}
                placeholder="Enter description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />

              {contentType === 'video' && (
                <>
                  <Text style={styles.label}>Video URL (YouTube embed or direct link)</Text>
                  <TextInput
                    style={styles.input}
                    value={videoUrl}
                    onChangeText={setVideoUrl}
                    placeholder="https://www.youtube.com/embed/..."
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                  />
                </>
              )}

              {contentType === 'audio' && (
                <>
                  <Text style={styles.label}>Audio File (MP3)</Text>
                  <TouchableOpacity
                    style={styles.filePickerButton}
                    onPress={handlePickAudioFile}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.filePickerButtonText}>
                      {audioFile ? audioFile.name : 'Select MP3 File'}
                    </Text>
                  </TouchableOpacity>
                  {audioFile && (
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileInfoText}>
                        File:
                      </Text>
                      <Text style={styles.fileInfoText}>
                        {audioFile.name}
                      </Text>
                      <Text style={styles.fileInfoText}>
                        Size:
                      </Text>
                      <Text style={styles.fileInfoText}>
                        {(audioFile.size! / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </View>
                  )}
                </>
              )}

              <Text style={styles.label}>Thumbnail URL</Text>
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
                  onPress={() => {
                    setIsExclusive(!isExclusive);
                    if (isExclusive) {
                      setContentPrice('');
                    }
                  }}
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
                  <Text style={styles.label}>Price ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={contentPrice}
                    onChangeText={setContentPrice}
                    placeholder="9.99"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.helperText}>
                    Users will need to purchase this content to access it
                  </Text>
                </>
              )}

              {!isExclusive && (
                <Text style={styles.helperText}>
                  This content will be free for all users
                </Text>
              )}

              <TouchableOpacity
                style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                onPress={handleUploadContent}
                activeOpacity={0.7}
                disabled={isUploading}
              >
                <Text style={styles.buttonText}>
                  {isUploading ? 'Uploading...' : isExclusive ? 'Release for Purchase' : 'Release for Free'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content List */}
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>
                Released Content
              </Text>
              <Text style={styles.countText}>
                {videoContent.length}
              </Text>
              <Text style={styles.countText}>
                items
              </Text>
              {videoContent.map((item) => {
                const priceDisplay = item.isExclusive && item.price ? `$${item.price.toFixed(2)}` : 'Free';
                const statusDisplay = item.isExclusive ? 'Exclusive' : 'Free';
                const typeDisplay = item.type === 'audio' ? '🎵 Audio' : '🎬 Video';
                
                return (
                  <View key={item.id} style={styles.contentItem}>
                    <View style={styles.contentInfo}>
                      <Text style={styles.contentTitle}>{item.title}</Text>
                      <Text style={styles.contentDescription}>{item.description}</Text>
                      <View style={styles.contentMetaRow}>
                        <Text style={styles.contentMeta}>
                          {typeDisplay}
                        </Text>
                        <Text style={styles.contentMeta}>
                          •
                        </Text>
                        <Text style={styles.contentMeta}>
                          {statusDisplay}
                        </Text>
                        <Text style={styles.contentPrice}>
                          {priceDisplay}
                        </Text>
                      </View>
                      {item.fileName && (
                        <Text style={styles.fileNameText}>
                          {item.fileName}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteContent(item.id, item.type as 'video' | 'audio' | 'merch')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Merchandise Upload Section - Admin Only */}
        {activeTab === 'merch' && canManageMerch && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Upload New Merchandise</Text>

              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={merchName}
                onChangeText={setMerchName}
                placeholder="Enter product name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={merchDescription}
                onChangeText={setMerchDescription}
                placeholder="Enter product description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={styles.input}
                value={merchPrice}
                onChangeText={setMerchPrice}
                placeholder="39.99"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={merchImageUrl}
                onChangeText={setMerchImageUrl}
                placeholder="https://..."
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, merchType === 'tshirt' && styles.typeButtonActive]}
                  onPress={() => setMerchType('tshirt')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, merchType === 'tshirt' && styles.typeButtonTextActive]}>
                    T-Shirt
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, merchType === 'hoodie' && styles.typeButtonActive]}
                  onPress={() => setMerchType('hoodie')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeButtonText, merchType === 'hoodie' && styles.typeButtonTextActive]}>
                    Hoodie
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={merchColor}
                onChangeText={setMerchColor}
                placeholder="Black, White, etc."
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadMerch} activeOpacity={0.7}>
                <Text style={styles.buttonText}>Upload Merchandise</Text>
              </TouchableOpacity>
            </View>

            {/* Merchandise List */}
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>
                Uploaded Merchandise
              </Text>
              <Text style={styles.countText}>
                {merchContent.length}
              </Text>
              <Text style={styles.countText}>
                items
              </Text>
              {merchContent.map((item) => {
                const priceDisplay = `$${item.price?.toFixed(2)}`;
                const typeDisplay = item.merchType === 'tshirt' ? 'T-Shirt' : 'Hoodie';
                
                return (
                  <View key={item.id} style={styles.contentItem}>
                    <View style={styles.contentInfo}>
                      <Text style={styles.contentTitle}>{item.title}</Text>
                      <Text style={styles.contentDescription}>{item.description}</Text>
                      <View style={styles.contentMetaRow}>
                        <Text style={styles.contentMeta}>
                          {typeDisplay}
                        </Text>
                        <Text style={styles.contentMeta}>
                          •
                        </Text>
                        <Text style={styles.contentMeta}>
                          {item.color}
                        </Text>
                        <Text style={styles.contentPrice}>
                          {priceDisplay}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteContent(item.id, 'merch')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* User Management Section - Admin Only */}
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

            {/* Users List */}
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>
                User Accounts
              </Text>
              <Text style={styles.countText}>
                {users.length}
              </Text>
              <Text style={styles.countText}>
                users
              </Text>
              {users.map((user) => {
                const roleDisplay = user.role === 'admin' ? 'Admin' : user.role === 'distributor' ? 'Distributor' : 'User';
                const uploadDisplay = user.canUpload ? 'Can Upload' : 'View Only';
                
                return (
                  <View key={user.id} style={styles.contentItem}>
                    <View style={styles.contentInfo}>
                      <Text style={styles.contentTitle}>{user.email}</Text>
                      <View style={styles.contentMetaRow}>
                        <Text style={styles.contentMeta}>
                          {roleDisplay}
                        </Text>
                        <Text style={styles.contentMeta}>
                          •
                        </Text>
                        <Text style={styles.contentMeta}>
                          {uploadDisplay}
                        </Text>
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
              })}
              {users.length === 0 && (
                <Text style={styles.emptyText}>No users created yet</Text>
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
              {confirmMessage.includes('delete') || confirmMessage.includes('logout') ? (
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
  helperText: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 12,
    fontStyle: 'italic',
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
  fileNameText: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 4,
    fontStyle: 'italic',
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
