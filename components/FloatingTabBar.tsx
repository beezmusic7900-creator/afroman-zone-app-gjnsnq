
import React from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { IconSymbol } from '@/components/IconSymbol';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
}

export default function FloatingTabBar({ tabs }: FloatingTabBarProps) {
  const { getTotalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/(tabs)/(home)/') {
      return pathname === '/' || pathname === '/(tabs)/(home)/' || pathname.startsWith('/(tabs)/(home)');
    }
    return pathname.includes(route);
  };

  const getIconName = (icon: string, active: boolean) => {
    const iconMap: { [key: string]: { default: string; active: string } } = {
      'home': { default: 'home', active: 'home' },
      'movie': { default: 'movie', active: 'movie' },
      'shopping-bag': { default: 'shopping-bag', active: 'shopping-bag' },
      'shopping-cart': { default: 'shopping-cart', active: 'shopping-cart' },
      'lock': { default: 'lock', active: 'lock' },
    };

    return iconMap[icon]?.[active ? 'active' : 'default'] || icon;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          const cartItemCount = getTotalItems();

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => router.push(tab.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconSymbol
                  ios_icon_name={tab.icon}
                  android_material_icon_name={getIconName(tab.icon, active)}
                  size={24}
                  color={active ? colors.primary : colors.textSecondary}
                />
                {tab.name === 'cart' && cartItemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItemCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, active && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 8,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    color: colors.textSecondary,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
