
import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { freeVideos } from '@/data/videos';

export default function HomeScreen() {
  const router = useRouter();

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
            style={commonStyles.logo}
          />
          <Text style={commonStyles.title}>AFROMAN</Text>
          <Text style={commonStyles.textSecondary}>Official App</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Free Music Videos</Text>
          {freeVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={commonStyles.card}
              onPress={() => router.push(`/video/${video.id}`)}
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
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Releases</Text>
          <View style={commonStyles.card}>
            <Text style={commonStyles.text}>
              Check back soon for new music and exclusive content!
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exclusive Content</Text>
          <View style={commonStyles.card}>
            <Text style={commonStyles.text}>
              Subscribe to access exclusive videos, behind-the-scenes content, and more!
            </Text>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <Text style={styles.buttonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
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
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
