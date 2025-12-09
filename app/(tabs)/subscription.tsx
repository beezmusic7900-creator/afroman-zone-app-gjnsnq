
import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking, Alert, TextInput } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionScreen() {
  const { isSubscribed, verifyPayment, setPaymentPending, paymentPending } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubscribe = async () => {
    const subscriptionUrl = 'https://buy.stripe.com/7sYdRb1Nj5xCfSlfKd6Na07';
    
    Alert.alert(
      'Important: Complete Payment',
      'You will be redirected to Stripe to complete your payment. You MUST complete the entire checkout process to access exclusive content.\n\nAfter successful payment, you will receive a verification code. Return to this screen and enter the code to activate your subscription.',
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

  const handleVerifyPayment = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter your verification code');
      return;
    }

    setIsVerifying(true);
    
    const isValid = await verifyPayment(verificationCode);
    
    setIsVerifying(false);
    
    if (isValid) {
      setVerificationCode('');
      Alert.alert(
        'Success! 🎉',
        'Your payment has been verified! You now have full access to all exclusive content.',
        [{ text: 'Start Watching', onPress: () => console.log('Payment verified') }]
      );
    } else {
      Alert.alert(
        'Verification Failed',
        'The verification code you entered is invalid. Please check your email for the correct code or contact support.\n\nIf your payment was declined or you did not complete checkout, you will need to try again.',
        [{ text: 'OK' }]
      );
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
          <Text style={commonStyles.title}>Premium Subscription</Text>
          {isSubscribed && (
            <View style={styles.subscribedBadge}>
              <Text style={styles.subscribedText}>✓ ACTIVE SUBSCRIPTION</Text>
            </View>
          )}
          {paymentPending && !isSubscribed && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>⏳ PAYMENT PENDING</Text>
            </View>
          )}
        </View>

        {!isSubscribed ? (
          <React.Fragment>
            <View style={commonStyles.card}>
              <Text style={styles.priceTitle}>$19.99</Text>
              <Text style={styles.priceSubtitle}>One-time payment</Text>
              <Text style={commonStyles.textSecondary}>
                Get unlimited access to all exclusive content
              </Text>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.featuresTitle}>What&apos;s Included:</Text>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Access to all exclusive movies and videos</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Behind-the-scenes content</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Early access to new releases</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Exclusive interviews and documentaries</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Ad-free viewing experience</Text>
              </View>
            </View>

            {paymentPending && (
              <View style={[commonStyles.card, styles.verificationCard]}>
                <Text style={styles.verificationTitle}>Complete Your Subscription</Text>
                <Text style={commonStyles.textSecondary}>
                  After completing payment on Stripe, enter your verification code below to activate your subscription.
                </Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Enter verification code"
                  placeholderTextColor={colors.textSecondary}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={handleVerifyPayment}
                  disabled={isVerifying}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>
                    {isVerifying ? 'Verifying...' : 'Verify Payment'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.helpText}>
                  Don&apos;t have a code? Check your email or try subscribing again.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {paymentPending ? 'Try Payment Again' : 'Subscribe Now - $19.99'}
              </Text>
            </TouchableOpacity>

            <View style={styles.securePayment}>
              <Text style={commonStyles.textSecondary}>
                🔒 Secure payment processed through Stripe
              </Text>
              <Text style={[commonStyles.textSecondary, { marginTop: 8, fontSize: 12 }]}>
                You must complete the entire checkout process. Declined cards or incomplete checkouts will not grant access.
              </Text>
            </View>

            <View style={[commonStyles.card, styles.infoCard]}>
              <Text style={styles.infoTitle}>⚠️ Important Information</Text>
              <Text style={commonStyles.textSecondary}>
                • You MUST complete the full payment process on Stripe
              </Text>
              <Text style={commonStyles.textSecondary}>
                • If your card is declined, you will NOT get access
              </Text>
              <Text style={commonStyles.textSecondary}>
                • If you don&apos;t finish checkout, you will NOT get access
              </Text>
              <Text style={commonStyles.textSecondary}>
                • After successful payment, you&apos;ll receive a verification code
              </Text>
              <Text style={commonStyles.textSecondary}>
                • Enter the code on this screen to activate your subscription
              </Text>
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View style={commonStyles.card}>
              <Text style={styles.thankYouTitle}>Thank You!</Text>
              <Text style={commonStyles.text}>
                Your payment has been verified and processed successfully. You now have full access to all exclusive content. Enjoy watching!
              </Text>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.featuresTitle}>Your Benefits:</Text>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Unlimited access to exclusive content</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>New content added regularly</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Premium viewing experience</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Priority support</Text>
              </View>
            </View>
          </React.Fragment>
        )}
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
    paddingVertical: 8,
    paddingHorizontal: 20,
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
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.accent,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  priceTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  priceSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    color: colors.primary,
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  verificationCard: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  securePayment: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  thankYouTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
