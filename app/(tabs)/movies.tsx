
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking, Modal } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/contexts/PurchaseContext';
import { useRouter } from 'expo-router';
import { freeVideos, premiumVideos } from '@/data/videos';

export default function MoviesScreen() {
  const router = useRouter();
  const { isSubscribed, isGuest, setGuestMode, setPaymentPending } = useAuth();
  const { isPurchased, addPurchase } = usePurchase();
  
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

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

  const handleVideoPress = (videoId: string, isFree: boolean, isExclusiveContent: boolean) => {
    console.log('User tapped video:', videoId);
    if (isFree) {
      router.push(`/video/${videoId}`);
    } else if (isExclusiveContent && (isSubscribed || isPurchased(videoId))) {
      router.push(`/video/${videoId}`);
    } else {
      handleExclusiveContentPress();
    }
  };

  const handleExclusiveContentPress = () => {
    console.log('User tapped exclusive content');
    if (!isSubscribed) {
      router.push('/subscription');
    }
  };

  const handlePurchaseVideo = (video: any) => {
    console.log('User wants to purchase video:', video.title);
    setSelectedVideo(video);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedVideo) {
      return;
    }

    console.log('Processing purchase for:', selectedVideo.title);
    
    // TODO: Backend Integration - POST /api/purchases with { contentId, contentType: 'video', price } → { purchaseId, paymentUrl }
    // For now, redirect to Stripe payment link
    const paymentUrl = 'https://buy.stripe.com/6oU3cx77D1hmcG92Xr6Na02';
    
    setShowPurchaseModal(false);
    await Linking.openURL(paymentUrl);
    
    // After successful payment, add to purchased content
    // In production, this would be confirmed by the backend after payment
    await addPurchase({
      id: Date.now().toString(),
      contentId: selectedVideo.id,
      contentType: 'video',
      title: selectedVideo.title,
      purchaseDate: new Date().toISOString(),
      price: selectedVideo.price,
    });
  };

  // Mock exclusive videos with prices (in production, this comes from backend)
  // TODO: Backend Integration - GET /api/videos/exclusive → [{ id, title, description, thumbnailUrl, videoUrl, price, isExclusive }]
  const exclusiveVideos = [
    {
      id: '3',
      title: 'Exclusive Track 1',
      description: 'Brand new exclusive song',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
      videoUrl: 'https://www.youtube.com/embed/example1',
      isFree: false,
      price: 9.99,
      isExclusive: true,
    },
    {
      id: '4',
      title: 'Behind The Scenes',
      description: 'Exclusive behind the scenes footage',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
      videoUrl: 'https://www.youtube.com/embed/example2',
      isFree: false,
      price: 14.99,
      isExclusive: true,
    },
  ];

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
          <Text style={commonStyles.title}>Videos & Music</Text>
          <Text style={commonStyles.textSecondary}>
            Watch free content and purchase exclusive releases
          </Text>
        </View>

        {/* Free Videos Section */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Free Content</Text>
          <Text style={styles.sectionSubtitle}>
            Watch these videos for free
          </Text>
          {freeVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoCard}
              onPress={() => handleVideoPress(video.id, video.isFree, false)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: video.thumbnailUrl }}
                style={styles.thumbnail}
              />
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoDescription}>{video.description}</Text>
                <View style={styles.videoMeta}>
                  <Text style={styles.freeTag}>FREE</Text>
                  {video.duration && (
                    <Text style={styles.duration}>{video.duration}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exclusive Purchasable Content */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Exclusive Releases</Text>
          <Text style={styles.sectionSubtitle}>
            Purchase to unlock exclusive content
          </Text>
          {exclusiveVideos.map((video) => {
            const isContentPurchased = isPurchased(video.id);
            const hasAccess = isSubscribed || isContentPurchased;
            const priceDisplay = `$${video.price?.toFixed(2)}`;
            
            return (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => {
                  if (hasAccess) {
                    handleVideoPress(video.id, false, true);
                  } else {
                    handlePurchaseVideo(video);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.thumbnailContainer}>
                  <Image
                    source={{ uri: video.thumbnailUrl }}
                    style={styles.thumbnail}
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

        {/* Subscription Section */}
        {!isSubscribed && (
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
                  ${selectedVideo.price?.toFixed(2)}
                </Text>
                <Text style={styles.modalDescription}>
                  Get lifetime access to this exclusive content
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
  duration: {
    fontSize: 12,
    color: colors.textSecondary,
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
