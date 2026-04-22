import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OfflineBanner } from '../components/OfflineBanner';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
