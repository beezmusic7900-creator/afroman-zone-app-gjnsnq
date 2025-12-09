
import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
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
          <Text style={commonStyles.title}>Official Merchandise</Text>
        </View>

        {merchandise.map((item) => (
          <View key={item.id} style={commonStyles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
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

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
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
  addToCartButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
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
