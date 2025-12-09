
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.primary}
      iconColor={colors.textSecondary}
    >
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="movies" name="movies">
        <Icon sf="film.fill" />
        <Label>Movies</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="merch" name="merch">
        <Icon sf="bag.fill" />
        <Label>Merch</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="cart" name="cart">
        <Icon sf="cart.fill" />
        <Label>Cart</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="admin" name="admin">
        <Icon sf="lock.fill" />
        <Label>Admin</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
