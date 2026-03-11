
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking, Modal, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { usePurchase } from '@/contexts/PurchaseContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { getPublishedVideos, type ExclusiveVideo } from '@/utils/api';
import { freeVideos } from '@/data/videos';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  videoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  videoImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.cardDark,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
  },
  exclusiveBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exclusiveText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  freeBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  freeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockedButton: {
    backgroundColor: colors.cardDark,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  lockedButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  subscribeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default function MoviesScreen() {
  const router = useRouter();
  const { isSubscribed, isGuest, setGuestMode } = useAuth();
  const { isPurchased } = usePurchase();
  const [exclusiveVideos, setExclusiveVideos] = useState<ExclusiveVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<ExclusiveVideo | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('MoviesScreen: Screen focused - loading videos from database');
      console.log('MoviesScreen: This will fetch ALL published videos, including newly uploaded ones');
      console.log('MoviesScreen: Videos are loaded from permanent database storage');
      loadVideos();
    }, [])
  );

  const loadVideos = async () => {
    setIsLoading(true);
    console.log('MoviesScreen: Fetching published videos from backend database');
    console.log('MoviesScreen: Only videos with status=published AND isActive=true will be returned');
    
    try {
      const videos = await getPublishedVideos();
      
      console.log('MoviesScreen: ✅ Loaded exclusive videos:', videos.length);
      console.log('MoviesScreen: Videos are ordered newest first (recently uploaded appear at top)');
      console.log('MoviesScreen: These videos are stored PERMANENTLY and will remain until admin deletes them');
      setExclusiveVideos(videos);
      
    } catch (error) {
      console.error('MoviesScreen: Error loading exclusive videos:', error);
      setExclusiveVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    console.log('MoviesScreen: User selected guest mode');
    setGuestMode(true);
  };

  const handleSubscribe = async () => {
    console.log('MoviesScreen: User clicked subscribe button');
    const subscriptionUrl = 'https://buy.stripe.com/7sYdRb1Nj5xCfSlfKd6Na07';
    console.log('MoviesScreen: Opening subscription payment link:', subscriptionUrl);
    
    try {
      const supported = await Linking.canOpenURL(subscriptionUrl);
      if (supported) {
        await Linking.openURL(subscriptionUrl);
      } else {
        console.error('MoviesScreen: Cannot open subscription URL');
      }
    } catch (error) {
      console.error('MoviesScreen: Error opening subscription link:', error);
    }
  };

  const handleVideoPress = (video: ExclusiveVideo) => {
    console.log('MoviesScreen: User tapped video:', video.title);
    
    if (!video.isExclusive) {
      console.log('MoviesScreen: Video is free, navigating to player');
      router.push(`/video/${video.id}`);
      return;
    }
    
    const hasAccess = isSubscribed || isPurchased(video.id);
    
    if (hasAccess) {
      console.log('MoviesScreen: User has access, navigating to player');
      router.push(`/video/${video.id}`);
    } else {
      console.log('MoviesScreen: User does not have access, showing purchase modal');
      setSelectedVideo(video);
      setShowPurchaseModal(true);
    }
  };

  const handlePurchaseVideo = async () => {
    console.log('MoviesScreen: User clicked purchase button for video:', selectedVideo?.title);
    setShowPurchaseModal(false);
    
    const paymentUrl = 'https://buy.stripe.com/6oU3cx77D1hmcG92Xr6Na02';
    console.log('MoviesScreen: Opening Stripe payment link:', paymentUrl);
    
    try {
      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);
      } else {
        console.error('MoviesScreen: Cannot open payment URL');
      }
    } catch (error) {
      console.error('MoviesScreen: Error opening payment link:', error);
    }
  };

  const handleConfirmPurchase = () => {
    setShowPurchaseModal(false);
    handlePurchaseVideo();
  };

  const renderVideoCard = (video: ExclusiveVideo) => {
    const hasAccess = isSubscribed || isPurchased(video.id) || !video.isExclusive;
    const priceDisplay = `$${video.price.toFixed(2)}`;
    
    return (
      <View key={video.id} style={styles.videoCard}>
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={styles.videoImage}
          resizeMode="cover"
        />
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.videoDescription}>{video.description}</Text>
          
          {!hasAccess && video.isExclusive && (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{priceDisplay}</Text>
              <View style={styles.exclusiveBadge}>
                <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
              </View>
            </View>
          )}
          
          {!video.isExclusive && (
            <View style={styles.priceTag}>
              <View style={styles.freeBadge}>
                <Text style={styles.freeText}>FREE</Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={hasAccess ? styles.playButton : styles.lockedButton}
            onPress={() => handleVideoPress(video)}
            activeOpacity={0.7}
          >
            <Text style={hasAccess ? styles.playButtonText : styles.lockedButtonText}>
              {hasAccess ? '▶ Watch Now' : '🔒 Purchase to Watch'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Movies & Videos</Text>
          <Text style={styles.headerSubtitle}>
            Exclusive content and free videos
          </Text>
        </View>

        {!isSubscribed && !isGuest && (
          <View style={styles.section}>
            <View style={commonStyles.card}>
              <Text style={styles.sectionTitle}>Subscribe for Full Access</Text>
              <Text style={styles.videoDescription}>
                Get unlimited access to all exclusive content with a subscription
              </Text>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                activeOpacity={0.7}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.playButton, { marginTop: 12 }]}
                onPress={handleGuestMode}
                activeOpacity={0.7}
              >
                <Text style={styles.playButtonText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Free Videos</Text>
          {freeVideos.map((video) => (
            <View key={video.id} style={styles.videoCard}>
              <Image
                source={{ uri: video.thumbnailUrl }}
                style={styles.videoImage}
                resizeMode="cover"
              />
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoDescription}>{video.description}</Text>
                <View style={styles.priceTag}>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeText}>FREE</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => router.push(`/video/${video.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.playButtonText}>▶ Watch Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyStateSubtext}>Loading videos from database...</Text>
            </View>
          ) : exclusiveVideos.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Exclusive Videos</Text>
              {exclusiveVideos.map(renderVideoCard)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No exclusive videos yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Check back soon for new releases
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showPurchaseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Purchase Exclusive Video</Text>
            <Text style={styles.modalMessage}>
              {selectedVideo?.title}
              {'\n\n'}
              Get instant access to this exclusive video. After purchase, you can watch it anytime through the app.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowPurchaseModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleConfirmPurchase}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Purchase</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
