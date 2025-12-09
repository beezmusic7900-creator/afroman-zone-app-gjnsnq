
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
            source={require('@/assets/images/final_quest_240x240.png')}
            style={commonStyles.logo}
          />
          <Text style={commonStyles.title}>AFROMAN</Text>
          <Text style={commonStyles.textSecondary}>Official App</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Music Videos</Text>
          {freeVideos.slice(0, 2).map((video) => (
            <TouchableOpacity
              key={video.id}
              style={commonStyles.card}
              onPress={() => router.push(`/video/${video.id}`)}
              activeOpacity={0.7}
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
          <Text style={styles.sectionTitle}>Explore</Text>
          
          <TouchableOpacity
            style={[commonStyles.card, styles.exploreCard]}
            onPress={() => router.push('/(tabs)/movies')}
            activeOpacity={0.7}
          >
            <Text style={styles.exploreIcon}>🎬</Text>
            <Text style={styles.exploreTitle}>Movies & Videos</Text>
            <Text style={commonStyles.textSecondary}>
              Watch exclusive content and music videos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.exploreCard]}
            onPress={() => router.push('/(tabs)/merch')}
            activeOpacity={0.7}
          >
            <Text style={styles.exploreIcon}>👕</Text>
            <Text style={styles.exploreTitle}>Official Merchandise</Text>
            <Text style={commonStyles.textSecondary}>
              Shop t-shirts, hoodies, and more
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, styles.exploreCard]}
            onPress={() => router.push('/(tabs)/subscription')}
            activeOpacity={0.7}
          >
            <Text style={styles.exploreIcon}>⭐</Text>
            <Text style={styles.exploreTitle}>Premium Subscription</Text>
            <Text style={commonStyles.textSecondary}>
              Get access to all exclusive content for $19.99
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={commonStyles.card}>
            <Text style={commonStyles.text}>
              Welcome to the official Afroman app! Enjoy free music videos, exclusive content, and shop for official merchandise.
            </Text>
            <Text style={[commonStyles.text, { marginTop: 12 }]}>
              Subscribe for $19.99 to unlock all exclusive content, or continue as a guest to browse free videos and merchandise.
            </Text>
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
  exploreCard: {
    alignItems: 'center',
  },
  exploreIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  exploreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
});
