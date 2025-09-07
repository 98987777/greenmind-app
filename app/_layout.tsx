// File: app/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

// This is the main navigator for your entire app.
// It now only manages the welcome and login screens.
export default function RootLayout() {
  return (
    <Stack>
      {/* This screen is your starting point (WelcomeScreen) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* This is the welcome/onboarding screen */}
      <Stack.Screen name="welcome" options={{ headerShown: false }} />

      {/* This screen is for your Login page */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      
      <Stack.Screen name="register" options={{ headerShown: false }} />

      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />

      <Stack.Screen name="otp-verification" options={{ headerShown: false }} />
      
      <Stack.Screen name="create-new-password" options={{ headerShown: false }} />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />


   

    </Stack>
  );
}