
import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAdminLoggedIn, isSubscribed, isGuest, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to verify your subscription again if you log out.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          },
        },
      ]
    );
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
          <Text style={commonStyles.title}>Profile</Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          
          {isAdminLoggedIn && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>👑 Admin Account</Text>
            </View>
          )}
          
          {isSubscribed && !isAdminLoggedIn && (
            <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.statusText}>✓ Premium Subscriber</Text>
            </View>
          )}
          
          {isGuest && !isSubscribed && (
            <View style={[styles.statusBadge, { backgroundColor: colors.textSecondary }]}>
              <Text style={styles.statusText}>👤 Guest User</Text>
            </View>
          )}

          {!isGuest && !isSubscribed && !isAdminLoggedIn && (
            <View style={[styles.statusBadge, { backgroundColor: colors.textSecondary }]}>
              <Text style={styles.statusText}>🔓 Free Account</Text>
            </View>
          )}
        </View>

        {isSubscribed && !isAdminLoggedIn && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Subscription Benefits</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Access to all exclusive content</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Behind-the-scenes videos</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Early access to new releases</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Ad-free viewing experience</Text>
            </View>
          </View>
        )}

        {!isSubscribed && !isAdminLoggedIn && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Upgrade to Premium</Text>
            <Text style={commonStyles.textSecondary}>
              Subscribe for $19.99 to unlock all exclusive content and premium features.
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/(tabs)/subscription')}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>View Subscription</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAdminLoggedIn && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Admin Access</Text>
            <Text style={commonStyles.textSecondary}>
              You have full admin privileges. You can upload and manage content through the Admin tab.
            </Text>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/(tabs)/admin')}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Go to Admin Panel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={commonStyles.textSecondary}>
            Official Afroman App
          </Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
            Version 1.0.0
          </Text>
        </View>

        {(isAdminLoggedIn || isSubscribed || isGuest) && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    color: colors.primary,
    marginRight: 12,
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  adminButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
});
