
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { freeVideos, premiumVideos } from '@/data/videos';
import { useAuth } from '@/contexts/AuthContext';

export default function MoviesScreen() {
  const router = useRouter();
  const { isSubscribed, isGuest, setGuestMode, setPaymentPending, paymentPending, checkSubscriptionStatus } = useAuth();
  const [showOptions, setShowOptions] = useState(!isGuest && !isSubscribed && !paymentPending);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const handleGuestMode = () => {
    setGuestMode(true);
    setShowOptions(false);
    Alert.alert(
      'Guest Mode',
      'You can browse as a guest and watch free content. To access exclusive content, you must subscribe and complete payment verification.',
      [{ text: 'OK' }]
    );
  };

  const handleSubscribe = async () => {
    const subscriptionUrl = 'https://buy.stripe.com/7sYdRb1Nj5xCfSlfKd6Na07';
    
    Alert.alert(
      'Important: Complete Payment',
      'You will be redirected to Stripe to complete your payment. You MUST:\n\n• Complete the entire checkout process\n• Use a valid payment method\n• Finish all payment steps\n\nIf your card is declined or you don\'t finish checkout, you will NOT get access to exclusive content.\n\nAfter successful payment, you will receive a verification code to activate your subscription.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue to Payment',
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(subscriptionUrl);
              if (supported) {
                await setPaymentPending(true);
                setShowOptions(false);
                await Linking.openURL(subscriptionUrl);
              } else {
                Alert.alert('Error', 'Unable to open payment link. Please try again.');
              }
            } catch (error) {
              console.log('Error opening subscription link:', error);
              Alert.alert('Error', 'Unable to open payment link. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleVideoPress = (videoId: string, isFree: boolean) => {
    if (!isFree && !isSubscribed) {
      Alert.alert(
        'Subscription Required',
        'This is exclusive content. You must subscribe and complete payment verification to watch.\n\nSubscription: $19.99 one-time payment',
        [
          {
            text: 'Subscribe Now',
            onPress: handleSubscribe,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }
    router.push(`/video/${videoId}`);
  };

  const handleExclusiveContentPress = () => {
    if (!isSubscribed) {
      if (paymentPending) {
        Alert.alert(
          'Payment Pending',
          'You have started the payment process but haven\'t verified your payment yet.\n\nGo to the Subscription tab to enter your verification code, or try payment again if your card was declined or you didn\'t complete checkout.',
          [
            {
              text: 'Go to Subscription',
              onPress: () => router.push('/(tabs)/subscription'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          'Subscription Required',
          'Subscribe for $19.99 to access all exclusive content. You must complete the full payment process and verify your payment to get access.',
          [
            {
              text: 'Subscribe Now',
              onPress: handleSubscribe,
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    }
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
            source={require('@/assets/images/21d33427-3661-461b-8942-7bbf2cb57473.png')}
            style={commonStyles.logoSmall}
          />
          <Text style={commonStyles.title}>Movies & Videos</Text>
          {isSubscribed && (
            <View style={styles.subscribedBadge}>
              <Text style={styles.subscribedText}>✓ SUBSCRIBED</Text>
            </View>
          )}
          {paymentPending && !isSubscribed && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>⏳ PAYMENT PENDING</Text>
            </View>
          )}
        </View>

        {showOptions && (
          <View style={commonStyles.card}>
            <Text style={styles.optionsTitle}>Welcome!</Text>
            <Text style={commonStyles.textSecondary}>
              Choose how you&apos;d like to continue:
            </Text>
            
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Subscribe - $19.99</Text>
              <Text style={styles.buttonSubtext}>Access all exclusive content</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              activeOpacity={0.7}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
              <Text style={styles.guestButtonSubtext}>Browse free content only</Text>
            </TouchableOpacity>
          </View>
        )}

        {paymentPending && !isSubscribed && (
          <View style={[commonStyles.card, styles.pendingCard]}>
            <Text style={styles.pendingCardTitle}>⏳ Complete Your Subscription</Text>
            <Text style={commonStyles.textSecondary}>
              You started the payment process. To access exclusive content, you must:
            </Text>
            <Text style={styles.pendingStep}>1. Complete payment on Stripe</Text>
            <Text style={styles.pendingStep}>2. Get your verification code</Text>
            <Text style={styles.pendingStep}>3. Enter the code in the Subscription tab</Text>
            
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => router.push('/(tabs)/subscription')}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Enter Verification Code</Text>
            </TouchableOpacity>

            <Text style={styles.warningText}>
              ⚠️ If your card was declined or you didn&apos;t finish checkout, you need to try payment again.
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
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exclusive Content</Text>
          
          <TouchableOpacity
            style={[commonStyles.card, styles.exclusiveCard]}
            onPress={handleExclusiveContentPress}
            activeOpacity={0.7}
          >
            <View style={styles.exclusiveContent}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.exclusiveTitle}>
                {isSubscribed ? 'Coming Soon!' : paymentPending ? 'Verify Payment to Unlock' : 'Subscribe to Unlock'}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {isSubscribed 
                  ? 'Exclusive content will be added by the admin'
                  : paymentPending
                  ? 'Complete payment verification to access exclusive content'
                  : 'Get access to exclusive movies, behind-the-scenes content, and more for just $19.99'}
              </Text>
              {!isSubscribed && (
                <TouchableOpacity
                  style={styles.unlockButton}
                  onPress={paymentPending ? () => router.push('/(tabs)/subscription') : handleSubscribe}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>
                    {paymentPending ? 'Verify Payment' : 'Subscribe Now - $19.99'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>

          {premiumVideos.length > 0 && premiumVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={[commonStyles.card, !isSubscribed && styles.lockedCard]}
              onPress={() => handleVideoPress(video.id, video.isFree)}
              activeOpacity={0.7}
            >
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: video.thumbnailUrl }}
                  style={[styles.thumbnail, !isSubscribed && styles.lockedThumbnail]}
                />
                {!isSubscribed && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockText}>
                      {paymentPending ? 'Verify Payment' : 'Subscribe to Watch'}
                    </Text>
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
  subscribedBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  subscribedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pendingBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.accent,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  optionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  guestButton: {
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  guestButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  guestButtonSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  pendingCard: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  pendingCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  pendingStep: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    marginLeft: 8,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  warningText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
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
  exclusiveCard: {
    minHeight: 200,
    justifyContent: 'center',
  },
  exclusiveContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  exclusiveTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  unlockButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
});
