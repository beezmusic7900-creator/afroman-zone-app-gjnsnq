
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'movies',
      route: '/(tabs)/movies',
      icon: 'film',
      label: 'Movies',
    },
    {
      name: 'merch',
      route: '/(tabs)/merch',
      icon: 'shopping-bag',
      label: 'Merch',
    },
    {
      name: 'cart',
      route: '/(tabs)/cart',
      icon: 'shopping-cart',
      label: 'Cart',
    },
    {
      name: 'admin',
      route: '/(tabs)/admin',
      icon: 'lock',
      label: 'Admin',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="movies" name="movies" />
        <Stack.Screen key="merch" name="merch" />
        <Stack.Screen key="subscription" name="subscription" />
        <Stack.Screen key="cart" name="cart" />
        <Stack.Screen key="admin" name="admin" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
