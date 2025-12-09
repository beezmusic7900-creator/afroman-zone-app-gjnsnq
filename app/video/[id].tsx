
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { colors, commonStyles } from '@/styles/commonStyles';
import { freeVideos } from '@/data/videos';

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const video = freeVideos.find((v) => v.id === id);

  if (!video) {
    return (
      <View style={styles.container}>
        <Text style={commonStyles.text}>Video not found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
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
        <View style={styles.videoContainer}>
          <WebView
            style={styles.video}
            source={{ uri: video.videoUrl }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={commonStyles.text}>{video.description}</Text>
          {video.duration && (
            <Text style={styles.duration}>Duration: {video.duration}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Back to Videos</Text>
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
    paddingBottom: 100,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
  },
  video: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
