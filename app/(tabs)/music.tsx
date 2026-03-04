
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking, Modal } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/contexts/PurchaseContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from '@/types';
import { useFocusEffect } from '@react-navigation/native';

const CONTENT_STORAGE_KEY = '@afroman_admin_content';

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
  musicCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  musicImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.cardDark,
  },
  musicInfo: {
    padding: 16,
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  musicDescription: {
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
});

export default function MusicScreen() {
  const router = useRouter();
  const { isSubscribed } = useAuth();
  const { isPurchased } = usePurchase();
  const [exclusiveMusic, setExclusiveMusic] = useState<Video[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<Video | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Load content when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('MusicScreen: Screen focused, loading music content');
      loadExclusiveMusic();
    }, [])
  );

  const loadExclusiveMusic = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTENT_STORAGE_KEY);
      if (stored) {
        const allContent = JSON.parse(stored);
        // Filter for audio/music content that is exclusive
        const musicContent = allContent.filter(
          (item: Video) => item.type === 'audio' && item.isExclusive
        );
        console.log('MusicScreen: Loaded exclusive music items:', musicContent.length);
        setExclusiveMusic(musicContent);
      } else {
        console.log('MusicScreen: No content found in storage');
        setExclusiveMusic([]);
      }
    } catch (error) {
      console.error('MusicScreen: Error loading exclusive music:', error);
    }
  };

  const handleMusicPress = (music: Video) => {
    console.log('MusicScreen: User tapped music:', music.title);
    
    // Check if user has access (subscribed or purchased individually)
    const hasAccess = isSubscribed || isPurchased(music.id);
    
    if (hasAccess) {
      console.log('MusicScreen: User has access, navigating to player');
      // Navigate to audio player (reusing video player for now)
      router.push(`/video/${music.id}`);
    } else {
      console.log('MusicScreen: User does not have access, showing purchase modal');
      setSelectedMusic(music);
      setShowPurchaseModal(true);
    }
  };

  const handlePurchase = async () => {
    console.log('MusicScreen: User clicked purchase button');
    setShowPurchaseModal(false);
    
    // Open Stripe payment link for exclusive content
    const paymentUrl = 'https://buy.stripe.com/00w9AV0Jf8JO9tX41v6Na0d';
    console.log('MusicScreen: Opening Stripe payment link:', paymentUrl);
    
    try {
      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);
      } else {
        console.error('MusicScreen: Cannot open payment URL');
      }
    } catch (error) {
      console.error('MusicScreen: Error opening payment link:', error);
    }
  };

  const renderMusicCard = (music: Video) => {
    const hasAccess = isSubscribed || isPurchased(music.id);
    const priceDisplay = music.price ? `$${music.price.toFixed(2)}` : '$9.99';
    
    return (
      <View key={music.id} style={styles.musicCard}>
        <Image
          source={{ uri: music.thumbnailUrl }}
          style={styles.musicImage}
          resizeMode="cover"
        />
        <View style={styles.musicInfo}>
          <Text style={styles.musicTitle}>{music.title}</Text>
          <Text style={styles.musicDescription}>{music.description}</Text>
          
          {!hasAccess && (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{priceDisplay}</Text>
              <View style={styles.exclusiveBadge}>
                <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={hasAccess ? styles.playButton : styles.lockedButton}
            onPress={() => handleMusicPress(music)}
            activeOpacity={0.7}
          >
            <Text style={hasAccess ? styles.playButtonText : styles.lockedButtonText}>
              {hasAccess ? '▶ Play Now' : '🔒 Purchase to Listen'}
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
          <Text style={styles.headerTitle}>Exclusive Music</Text>
          <Text style={styles.headerSubtitle}>
            Premium tracks and unreleased content
          </Text>
        </View>

        <View style={styles.section}>
          {exclusiveMusic.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Available Tracks</Text>
              {exclusiveMusic.map(renderMusicCard)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No exclusive music yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Check back soon for new releases
              </Text>
            </View>
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Purchase Modal */}
      <Modal
        visible={showPurchaseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Purchase Exclusive Track</Text>
            <Text style={styles.modalMessage}>
              {selectedMusic?.title}
              {'\n\n'}
              Get instant access to this exclusive track. After purchase, you can stream it anytime through the app.
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
                onPress={handlePurchase}
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
