
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking, Modal, ActivityIndicator } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/contexts/PurchaseContext';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

interface ExclusiveVideo {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  videoUrl: string;
  isExclusive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MoviesScreen() {
  const router = useRouter();
  const { isSubscribed, isGuest, setGuestMode, setPaymentPending } = useAuth();
  const { isPurchased, addPurchase } = usePurchase();
  
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExclusiveVideo | null>(null);
  const [videos, setVideos] = useState<ExclusiveVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load content when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('MoviesScreen: Screen focused, loading videos from database');
      loadVideos();
    }, [])
  );

  const loadVideos = async () => {
    setIsLoading(true);
    console.log('MoviesScreen: Fetching videos from backend');
    
    try {
      // TODO: Backend Integration - GET /api/videos
      // Returns: [{ id, title, description, price, thumbnailUrl, videoUrl, isExclusive, createdAt, updatedAt }]
      // Filter: Only returns videos where status='published' AND isActive=true
      // Ordered by: createdAt DESC (newest first)
      
      // Temporary: Empty array (will be replaced by backend data)
      const fetchedVideos: ExclusiveVideo[] = [];
      
      console.log('MoviesScreen: Loaded videos:', fetchedVideos.length);
      setVideos(fetchedVideos);
      
    } catch (error) {
      console.error('MoviesScreen: Error loading videos:', error);
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    console.log('User entering guest mode');
    setGuestMode(true);
  };

  const handleSubscribe = async () => {
    console.log('User initiating subscription');
    await setPaymentPending(true);
    const subscriptionUrl = 'https://buy.stripe.com/7sYdRb1Nj5xCfSlfKd6Na07';
    await Linking.openURL(subscriptionUrl);
  };

  const handleVideoPress = (video: ExclusiveVideo) => {
    console.log('User tapped video:', video.title);
    
    const isFree = !video.isExclusive;
    const hasAccess = isFree || isSubscribed || isPurchased(video.id);
    
    if (hasAccess) {
      router.push(`/video/${video.id}`);
    } else {
      handlePurchaseVideo(video);
    }
  };

  const handlePurchaseVideo = (video: ExclusiveVideo) => {
    console.log('User wants to purchase video:', video.title);
    setSelectedVideo(video);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedVideo) {
      return;
    }

    console.log('Processing purchase for:', selectedVideo.title);
    
    const exclusiveContentPaymentUrl = 'https://buy.stripe.com/00w9AV0Jf8JO9tX41v6Na0d';
    
    setShowPurchaseModal(false);
    
    console.log('Redirecting to Stripe payment:', exclusiveContentPaymentUrl);
    await Linking.openURL(exclusiveContentPaymentUrl);
    
    // TODO: Backend Integration - POST /api/purchases with { contentId, contentType: 'video', price } → { purchaseId, success }
    // TODO: Backend Integration - Webhook from Stripe to verify payment and unlock content
    
    await addPurchase({
      id: Date.now().toString(),
      contentId: selectedVideo.id,
      contentType: 'video',
      title: selectedVideo.title,
      purchaseDate: new Date().toISOString(),
      price: selectedVideo.price || 0,
    });
  };

  const freeVideos = videos.filter(v => !v.isExclusive);
  const exclusiveVideos = videos.filter(v => v.isExclusive);

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
          <Text style={commonStyles.title}>Videos & Music</Text>
          <Text style={commonStyles.textSecondary}>
            Watch free content and purchase exclusive releases
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.emptyStateText}>Loading videos...</Text>
          </View>
        ) : (
          <>
            {/* Free Videos Section */}
            {freeVideos.length > 0 && (
              <View style={commonStyles.card}>
                <Text style={styles.sectionTitle}>Free Content</Text>
                <Text style={styles.sectionSubtitle}>
                  Watch these videos for free
                </Text>
                {freeVideos.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.videoCard}
                    onPress={() => handleVideoPress(video)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: video.thumbnailUrl }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoTitle}>{video.title}</Text>
                      <Text style={styles.videoDescription}>{video.description}</Text>
                      <View style={styles.videoMeta}>
                        <Text style={styles.freeTag}>FREE</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Exclusive Purchasable Content */}
            {exclusiveVideos.length > 0 && (
              <View style={commonStyles.card}>
                <Text style={styles.sectionTitle}>Exclusive Releases</Text>
                <Text style={styles.sectionSubtitle}>
                  Purchase to unlock exclusive content
                </Text>
                {exclusiveVideos.map((video) => {
                  const isContentPurchased = isPurchased(video.id);
                  const hasAccess = isSubscribed || isContentPurchased;
                  const priceDisplay = `$${video.price?.toFixed(2) || '0.00'}`;
                  
                  return (
                    <TouchableOpacity
                      key={video.id}
                      style={styles.videoCard}
                      onPress={() => handleVideoPress(video)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.thumbnailContainer}>
                        <Image
                          source={{ uri: video.thumbnailUrl }}
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                        {!hasAccess && (
                          <View style={styles.lockOverlay}>
                            <Text style={styles.lockIcon}>🔒</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.videoInfo}>
                        <Text style={styles.videoTitle}>{video.title}</Text>
                        <Text style={styles.videoDescription}>{video.description}</Text>
                        <View style={styles.videoMeta}>
                          {hasAccess ? (
                            <Text style={styles.purchasedTag}>
                              {isContentPurchased ? 'PURCHASED' : 'SUBSCRIBED'}
                            </Text>
                          ) : (
                            <Text style={styles.priceTag}>{priceDisplay}</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Empty state when no content */}
            {videos.length === 0 && (
              <View style={commonStyles.card}>
                <Text style={styles.sectionTitle}>Videos</Text>
                <Text style={styles.emptyStateText}>
                  No videos available yet. Check back soon for new releases!
                </Text>
              </View>
            )}

            {/* Subscription Section */}
            {!isSubscribed && exclusiveVideos.length > 0 && (
              <View style={commonStyles.card}>
                <Text style={styles.sectionTitle}>Get All Access</Text>
                <Text style={styles.sectionSubtitle}>
                  Subscribe for unlimited access to all exclusive content
                </Text>
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={handleSubscribe}
                  activeOpacity={0.7}
                >
                  <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {isSubscribed && (
              <View style={commonStyles.card}>
                <Text style={styles.subscribedText}>✓ You have full access to all content</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Purchase Modal */}
      <Modal
        visible={showPurchaseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Purchase Content</Text>
            {selectedVideo && (
              <>
                <Text style={styles.modalText}>
                  {selectedVideo.title}
                </Text>
                <Text style={styles.modalPrice}>
                  ${selectedVideo.price?.toFixed(2) || '0.00'}
                </Text>
                <Text style={styles.modalDescription}>
                  Get lifetime access to this exclusive content. After completing payment, the content will be instantly available for streaming.
                </Text>
              </>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirmPurchase}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Purchase Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowPurchaseModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
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
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  videoCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  lockIcon: {
    fontSize: 32,
  },
  videoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freeTag: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: 'rgba(0, 128, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  purchasedTag: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: 'rgba(0, 128, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subscribedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
