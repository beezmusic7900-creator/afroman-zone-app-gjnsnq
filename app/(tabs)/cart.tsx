
import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Platform, Linking, Alert } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out');
      return;
    }

    const url = 'https://buy.stripe.com/6oU3cx77D1hmcG92Xr6Na02';
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log('Cannot open URL:', url);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/assets/images/21d33427-3661-461b-8942-7bbf2cb57473.png')}
            style={commonStyles.logoSmall}
          />
          <Text style={commonStyles.title}>Your Cart is Empty</Text>
          <Text style={commonStyles.textSecondary}>
            Add some merchandise to get started!
          </Text>
        </View>
      </View>
    );
  }

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
          <Text style={commonStyles.title}>Shopping Cart</Text>
        </View>

        {cartItems.map((item, index) => (
          <View key={`${item.merchItem.id}-${item.size}-${index}`} style={commonStyles.card}>
            <View style={styles.cartItem}>
              <Image
                source={item.merchItem.imageUrl}
                style={styles.cartItemImage}
              />
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.merchItem.name}</Text>
                <Text style={commonStyles.textSecondary}>Size: {item.size}</Text>
                <Text style={styles.cartItemPrice}>
                  ${item.merchItem.price.toFixed(2)}
                </Text>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() =>
                      updateQuantity(item.merchItem.id, item.size, item.quantity - 1)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() =>
                      updateQuantity(item.merchItem.id, item.size, item.quantity + 1)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.merchItem.id, item.size)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Proceed to Checkout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={clearCart} activeOpacity={0.7}>
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Secure payment processed through Stripe
        </Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cartItem: {
    flexDirection: 'row',
    gap: 12,
  },
  cartItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    gap: 4,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    marginTop: 8,
  },
  removeButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.textSecondary,
    marginBottom: 12,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});
