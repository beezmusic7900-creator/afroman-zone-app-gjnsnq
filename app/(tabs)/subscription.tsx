
import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function SubscriptionScreen() {
  const handleSubscribe = async () => {
    const url = 'https://buy.stripe.com/7sYdRb1Nj5xCfSlfKd6Na07';
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log('Cannot open URL:', url);
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
            source={{ uri: 'https://prod-finalquest-user-projects-storage-bucket-aws.s3.amazonaws.com/user-projects/92c958b2-61a2-43c5-97d3-cb274fd3249a/assets/images/01425c73-5574-4e49-90ea-0ea6fcacd8b0.jpeg?AWSAccessKeyId=AKIAVRUVRKQJC5DISQ4Q&Signature=e9zghH%2BSbbZfxnYqq%2FqwMO1ohf0%3D&Expires=1765327380' }}
            style={commonStyles.logoSmall}
          />
          <Text style={commonStyles.title}>Premium Subscription</Text>
          <Text style={commonStyles.textSecondary}>
            Get exclusive access to all premium content
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.benefitTitle}>What You Get:</Text>
          
          <View style={styles.benefit}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={commonStyles.text}>Exclusive music videos and content</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={commonStyles.text}>Behind-the-scenes footage</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={commonStyles.text}>Early access to new releases</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={commonStyles.text}>Offline downloads for all content</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={commonStyles.text}>Playback speed control</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={commonStyles.text}>Ad-free experience</Text>
          </View>

          <View style={styles.benefit}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={commonStyles.text}>Access to exclusive live streams</Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.priceTitle}>Premium Access</Text>
          <Text style={styles.priceDescription}>
            Unlock all exclusive content and features
          </Text>
          
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
          >
            <Text style={styles.buttonText}>Subscribe Now</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Secure payment processed through Stripe. Cancel anytime.
          </Text>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={commonStyles.textSecondary}>
              Yes, you can cancel your subscription at any time with no penalties.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods are accepted?</Text>
            <Text style={commonStyles.textSecondary}>
              We accept all major credit cards through our secure Stripe payment processor.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I download content for offline viewing?</Text>
            <Text style={commonStyles.textSecondary}>
              Yes! Premium subscribers can download any content for offline viewing.
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
  benefitTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  priceTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  priceDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  faqSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  faqTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
});
