
import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { freeVideos, premiumVideos } from '@/data/videos';
import { useAuth } from '@/contexts/AuthContext';

export default function MoviesScreen() {
  const router = useRouter();
  const { isUserLoggedIn, userLogin, userLogout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => {
    const success = userLogin(username, password);
    if (success) {
      Alert.alert('Success', 'Logged in successfully!');
      setUsername('');
      setPassword('');
      setShowLogin(false);
    } else {
      Alert.alert('Error', 'Invalid username or password');
    }
  };

  const handleLogout = () => {
    userLogout();
    Alert.alert('Logged Out', 'You have been logged out successfully');
  };

  const handleVideoPress = (videoId: string, isFree: boolean) => {
    if (!isFree && !isUserLoggedIn) {
      Alert.alert('Login Required', 'Please login to view exclusive content');
      setShowLogin(true);
      return;
    }
    router.push(`/video/${videoId}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://prod-finalquest-user-projects-storage-bucket-aws.s3.amazonaws.com/user-projects/92c958b2-61a2-43c5-97d3-cb274fd3249a/assets/images/01425c73-5574-4e49-90ea-0ea6fcacd8b0.jpeg?AWSAccessKeyId=AKIAVRUVRKQJC5DISQ4Q&Signature=e9zghH%2BSbbZfxnYqq%2FqwMO1ohf0%3D&Expires=1765327380' }}
            style={commonStyles.logoSmall}
          />
          <Text style={commonStyles.title}>Movies & Videos</Text>
          {isUserLoggedIn ? (
            <View style={styles.loginStatus}>
              <Text style={styles.loginStatusText}>✓ Logged In</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setShowLogin(!showLogin)} style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>
                {showLogin ? 'Hide Login' : 'Login for Exclusive Content'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!isUserLoggedIn && showLogin && (
          <View style={commonStyles.card}>
            <Text style={styles.loginTitle}>User Login</Text>
            <Text style={commonStyles.textSecondary}>
              Login to access exclusive movies and content
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.credentialsHint}>
              Demo credentials: username: user, password: afroman123
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Free Music Videos</Text>
          {freeVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={commonStyles.card}
              onPress={() => handleVideoPress(video.id, video.isFree)}
            >
              <Image
                source={{ uri: video.thumbnailUrl }}
                style={styles.thumbnail}
              />
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={commonStyles.textSecondary}>{video.description}</Text>
                {video.duration && (
                  <Text style={styles.duration}>{video.duration}</Text>
                )}
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exclusive Content</Text>
          {!isUserLoggedIn && (
            <View style={commonStyles.card}>
              <Text style={commonStyles.text}>
                🔒 Login to unlock exclusive movies and behind-the-scenes content!
              </Text>
            </View>
          )}
          {premiumVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={[commonStyles.card, !isUserLoggedIn && styles.lockedCard]}
              onPress={() => handleVideoPress(video.id, video.isFree)}
            >
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: video.thumbnailUrl }}
                  style={[styles.thumbnail, !isUserLoggedIn && styles.lockedThumbnail]}
                />
                {!isUserLoggedIn && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockText}>Login Required</Text>
                  </View>
                )}
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={commonStyles.textSecondary}>{video.description}</Text>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>EXCLUSIVE</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  loginStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  loginStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  loginPrompt: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  loginPromptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginTop: 12,
  },
  loginButton: {
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
  credentialsHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  lockedThumbnail: {
    opacity: 0.4,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  lockText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockedCard: {
    opacity: 0.9,
  },
  videoInfo: {
    gap: 4,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  freeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
});
