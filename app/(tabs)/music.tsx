
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking, Modal, ActivityIndicator } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/contexts/PurchaseContext';
import { useFocusEffect } from '@react-navigation/native';
import { listPublishedTracks, type Track } from '@/utils/api';

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
  trackCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  trackImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.cardDark,
  },
  trackInfo: {
    padding: 16,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 16,
    color: colors.accent,
    marginBottom: 4,
  },
  trackDescription: {
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
});

export default function MusicScreen() {
  const router = useRouter();
  const { isSubscribed } = useAuth();
  const { isPurchased } = usePurchase();
  const [exclusiveTracks, setExclusiveTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('MusicScreen: Screen focused - loading tracks from database');
      console.log('MusicScreen: This will fetch ALL published tracks, including newly uploaded ones');
      console.log('MusicScreen: Tracks are loaded from permanent database storage');
      loadExclusiveTracks();
    }, [])
  );

  const loadExclusiveTracks = async () => {
    setIsLoading(true);
    console.log('MusicScreen: Fetching published tracks from backend database');
    console.log('MusicScreen: Only tracks with status=published will be returned');
    
    try {
      const tracks = await listPublishedTracks();
      
      console.log('MusicScreen: ✅ Loaded exclusive tracks:', tracks.length);
      console.log('MusicScreen: Tracks are ordered newest first (recently uploaded appear at top)');
      console.log('MusicScreen: These tracks are stored PERMANENTLY and will remain until admin deletes them');
      setExclusiveTracks(tracks);
      
    } catch (error) {
      console.error('MusicScreen: Error loading exclusive tracks:', error);
      setExclusiveTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackPress = (track: Track) => {
    console.log('MusicScreen: User tapped track:', track.title);
    
    const hasAccess = isSubscribed || isPurchased(track.id);
    
    if (hasAccess) {
      console.log('MusicScreen: User has access, navigating to player');
      router.push(`/video/${track.id}`);
    } else {
      console.log('MusicScreen: User does not have access, showing purchase modal');
      setSelectedTrack(track);
      setShowPurchaseModal(true);
    }
  };

  const handlePurchase = async () => {
    console.log('MusicScreen: User clicked purchase button for track:', selectedTrack?.title);
    setShowPurchaseModal(false);
    
    const paymentUrl = 'https://buy.stripe.com/6oU3cx77D1hmcG92Xr6Na02';
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

  const renderTrackCard = (track: Track) => {
    const hasAccess = isSubscribed || isPurchased(track.id);
    const priceDisplay = track.price !== undefined ? `$${Number(track.price).toFixed(2)}` : 'Free';
    const durationSecs = track.duration ?? 0;
    const durationDisplay = durationSecs > 0 ? `${Math.floor(durationSecs / 60)}:${(durationSecs % 60).toString().padStart(2, '0')}` : '';
    
    return (
      <View key={track.id} style={styles.trackCard}>
        <Image
          source={{ uri: track.cover_url }}
          style={styles.trackImage}
          resizeMode="cover"
        />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackArtist}>{track.artist}</Text>
          <Text style={styles.trackDescription}>{track.description}</Text>
          
          {!hasAccess && (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{priceDisplay}</Text>
              <View style={styles.exclusiveBadge}>
                <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
              </View>
            </View>
          )}
          
          {durationDisplay && (
            <Text style={styles.trackDescription}>Duration: {durationDisplay}</Text>
          )}
          
          <TouchableOpacity
            style={hasAccess ? styles.playButton : styles.lockedButton}
            onPress={() => handleTrackPress(track)}
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
          <Text style={styles.headerTitle}>Exclusive Tracks</Text>
          <Text style={styles.headerSubtitle}>
            Premium music and unreleased content
          </Text>
        </View>

        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyStateSubtext}>Loading tracks from database...</Text>
            </View>
          ) : exclusiveTracks.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Available Tracks</Text>
              {exclusiveTracks.map(renderTrackCard)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No exclusive tracks yet</Text>
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
            <Text style={styles.modalTitle}>Purchase Exclusive Track</Text>
            <Text style={styles.modalMessage}>
              {selectedTrack?.title}
              {'\n'}
              by {selectedTrack?.artist}
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
