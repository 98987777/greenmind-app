import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import SplashScreen from '../src/screens/SplashScreen';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Wait for 2 seconds and then navigate to the welcome screen
    const timer = setTimeout(() => {
      router.replace('/welcome'); // Use replace to prevent going back to splash
    }, 2000); // 2000 milliseconds = 2 seconds

    // Clear the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}

