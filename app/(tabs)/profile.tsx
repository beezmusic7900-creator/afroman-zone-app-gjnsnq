
import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAdminLoggedIn, isMusicDistributorLoggedIn, isSubscribed, isGuest, userEmail, logout, changePassword } = useAuth();
  
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    console.log('User tapped logout button');
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    console.log('User confirmed logout');
    setShowLogoutModal(false);
    logout();
    Alert.alert('Logged Out', 'You have been logged out successfully.');
  };

  const handleChangePassword = async () => {
    console.log('User attempting to change password');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }
    
    const success = await changePassword(currentPassword, newPassword);
    
    if (success) {
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your password has been changed successfully.');
    } else {
      Alert.alert('Error', 'Current password is incorrect. Please try again.');
    }
  };

  const isLoggedIn = isAdminLoggedIn || isMusicDistributorLoggedIn;

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
          <Text style={commonStyles.title}>Profile</Text>
        </View>

        {/* Account Status */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          
          {isAdminLoggedIn && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>👑 Admin Account</Text>
            </View>
          )}
          
          {isMusicDistributorLoggedIn && (
            <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
              <Text style={styles.statusText}>🎵 Music Distributor</Text>
            </View>
          )}
          
          {isSubscribed && !isAdminLoggedIn && !isMusicDistributorLoggedIn && (
            <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.statusText}>✓ Premium Subscriber</Text>
            </View>
          )}
          
          {isGuest && !isSubscribed && (
            <View style={[styles.statusBadge, { backgroundColor: colors.textSecondary }]}>
              <Text style={styles.statusText}>👤 Guest User</Text>
            </View>
          )}

          {!isGuest && !isSubscribed && !isAdminLoggedIn && !isMusicDistributorLoggedIn && (
            <View style={[styles.statusBadge, { backgroundColor: colors.textSecondary }]}>
              <Text style={styles.statusText}>🔓 Free Account</Text>
            </View>
          )}
          
          {userEmail && (
            <Text style={styles.emailText}>{userEmail}</Text>
          )}
        </View>

        {/* Change Password - Only for logged in users */}
        {isLoggedIn && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Security</Text>
            <Text style={commonStyles.textSecondary}>
              Keep your account secure by changing your password regularly.
            </Text>
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={() => setShowChangePasswordModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Subscription Benefits */}
        {isSubscribed && !isAdminLoggedIn && !isMusicDistributorLoggedIn && (
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

        {/* Upgrade to Premium */}
        {!isSubscribed && !isAdminLoggedIn && !isMusicDistributorLoggedIn && (
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

        {/* Admin Access */}
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

        {/* Music Distributor Access */}
        {isMusicDistributorLoggedIn && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Music Distributor Access</Text>
            <Text style={commonStyles.textSecondary}>
              You can upload and manage music content through the Admin tab.
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

        {/* About */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={commonStyles.textSecondary}>
            Official Afroman App
          </Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
            Version 1.0.0
          </Text>
        </View>

        {/* Logout Button */}
        {(isAdminLoggedIn || isMusicDistributorLoggedIn || isSubscribed || isGuest) && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleChangePassword}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowChangePasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to logout? You will need to verify your subscription again if you log out.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FF3B30' }]}
                onPress={confirmLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
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
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emailText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
  changePasswordButton: {
    backgroundColor: colors.secondary,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
