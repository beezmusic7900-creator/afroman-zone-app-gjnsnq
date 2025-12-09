
import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert, Linking } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { merchandise } from '@/data/merchandise';
import { useCart } from '@/contexts/CartContext';
import { MerchItem } from '@/types';

export default function MerchScreen() {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});

  const handleAddToCart = (item: MerchItem) => {
    const selectedSize = selectedSizes[item.id];
    if (!selectedSize) {
      Alert.alert('Select Size', 'Please select a size before adding to cart');
      return;
    }
    addToCart(item, selectedSize);
    Alert.alert('Added to Cart', `${item.name} (${selectedSize}) added to cart!`);
  };

  const handleSelectSize = (itemId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: size }));
  };

  const handleBuyNow = async (item: MerchItem) => {
    const selectedSize = selectedSizes[item.id];
    if (!selectedSize) {
      Alert.alert('Select Size', 'Please select a size before purchasing');
      return;
    }

    const paymentUrl = 'https://buy.stripe.com/6oU3cx77D1hmcG92Xr6Na02';
    
    try {
      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);
      } else {
        Alert.alert('Error', 'Unable to open payment link');
      }
    } catch (error) {
      console.log('Error opening payment link:', error);
      Alert.alert('Error', 'Unable to open payment link');
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
          <Text style={commonStyles.title}>Official Merchandise</Text>
        </View>

        {merchandise.map((item) => (
          <View key={item.id} style={commonStyles.card}>
            <Image source={item.imageUrl} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={commonStyles.textSecondary}>{item.description}</Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>

            <View style={styles.sizesContainer}>
              <Text style={styles.sizeLabel}>Select Size:</Text>
              <View style={styles.sizeButtons}>
                {item.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      selectedSizes[item.id] === size && styles.sizeButtonSelected,
                    ]}
                    onPress={() => handleSelectSize(item.id, size)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.sizeButtonText,
                        selectedSizes[item.id] === size && styles.sizeButtonTextSelected,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Add to Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buyNowButton}
                onPress={() => handleBuyNow(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.paymentInfo}>
          <Text style={commonStyles.textSecondary}>
            All merchandise purchases are processed securely through Stripe.
          </Text>
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
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 8,
  },
  sizesContainer: {
    marginVertical: 12,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    backgroundColor: colors.background,
  },
  sizeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sizeButtonTextSelected: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  paymentInfo: {
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
  },
});
