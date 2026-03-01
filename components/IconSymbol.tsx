
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

const MATERIAL_ICON_MAP: { [key: string]: string } = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'film.fill': 'movie',
  'bag.fill': 'shopping-bag',
  'cart.fill': 'shopping-cart',
  'lock.fill': 'lock',
  'person.fill': 'person',
  'settings': 'settings',
  'home': 'home',
  'movie': 'movie',
  'shopping-bag': 'shopping-bag',
  'shopping-cart': 'shopping-cart',
  'lock': 'lock',
  'person': 'person',
};

export function IconSymbol({
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  ios_icon_name: string;
  android_material_icon_name?: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const materialIconName = android_material_icon_name || MATERIAL_ICON_MAP[ios_icon_name] || ios_icon_name;

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={materialIconName as any}
      style={style}
    />
  );
}
