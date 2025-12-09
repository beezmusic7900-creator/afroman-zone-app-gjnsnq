
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, Image } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminScreen() {
  const { isAdminLoggedIn, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const handleLogin = () => {
    const success = login(username, password);
    if (success) {
      Alert.alert('Success', 'Logged in successfully!');
      setUsername('');
      setPassword('');
    } else {
      Alert.alert('Error', 'Invalid username or password');
    }
  };

  const handleUpload = () => {
    if (!videoTitle || !videoDescription || !videoUrl || !thumbnailUrl) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Success',
      'Video uploaded successfully! (This is a demo - in production, this would save to a backend)',
      [
        {
          text: 'OK',
          onPress: () => {
            setVideoTitle('');
            setVideoDescription('');
            setVideoUrl('');
            setThumbnailUrl('');
          },
        },
      ]
    );
  };

  if (!isAdminLoggedIn) {
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
            />
            <Text style={commonStyles.title}>Admin Login</Text>
            <Text style={commonStyles.textSecondary}>
              Login to manage content
            </Text>
          </View>

          <View style={commonStyles.card}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
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
          />
          <Text style={commonStyles.title}>Admin Dashboard</Text>
          <Text style={commonStyles.textSecondary}>
            Upload and manage content
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Upload New Video</Text>

          <Text style={styles.label}>Video Title</Text>
          <TextInput
            style={styles.input}
            value={videoTitle}
            onChangeText={setVideoTitle}
            placeholder="Enter video title"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={videoDescription}
            onChangeText={setVideoDescription}
            placeholder="Enter video description"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Video URL</Text>
          <TextInput
            style={styles.input}
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="Enter video URL"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Thumbnail URL</Text>
          <TextInput
            style={styles.input}
            value={thumbnailUrl}
            onChangeText={setThumbnailUrl}
            placeholder="Enter thumbnail URL"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} activeOpacity={0.7}>
            <Text style={styles.buttonText}>Upload Video</Text>
          </TouchableOpacity>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Content Management</Text>
          <Text style={commonStyles.textSecondary}>
            In a production environment, this section would display all uploaded content with options to edit or delete.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
});
