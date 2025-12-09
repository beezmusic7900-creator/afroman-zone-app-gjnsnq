
import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking, Alert } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionScreen() {
  const { isSubscribed, subscribe } = useAuth();

  const handleSubscribe = async () => {
    const subscriptionUrl = 'https://buy.stripe.com/7sYdRb1Nj5xCfSlfKd6Na07';
    
    try {
      const supported = await Linking.canOpenURL(subscriptionUrl);
      if (supported) {
        await Linking.openURL(subscriptionUrl);
        Alert.alert(
          'Complete Payment',
          'After completing payment, return to the app to access exclusive content.',
          [
            {
              text: 'I Completed Payment',
              onPress: () => {
                subscribe();
                Alert.alert('Success', 'Welcome! You now have access to all exclusive content.');
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Unable to open subscription link');
      }
    } catch (error) {
      console.log('Error opening subscription link:', error);
      Alert.alert('Error', 'Unable to open subscription link');
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
            source={require('@/assets/images/final_quest_240x240.png')}
            style={commonStyles.logoSmall}
          />
          <Text style={commonStyles.title}>Premium Subscription</Text>
          {isSubscribed && (
            <View style={styles.subscribedBadge}>
              <Text style={styles.subscribedText}>✓ ACTIVE SUBSCRIPTION</Text>
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

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Subscribe Now - $19.99</Text>
            </TouchableOpacity>

            <View style={styles.securePayment}>
              <Text style={commonStyles.textSecondary}>
                🔒 Secure payment processed through Stripe
              </Text>
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View style={commonStyles.card}>
              <Text style={styles.thankYouTitle}>Thank You!</Text>
              <Text style={commonStyles.text}>
                You now have full access to all exclusive content. Enjoy watching!
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
  thankYouTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
