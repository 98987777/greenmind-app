import React from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* This component displays your full-screen splash image */}
      <Image
        // IMPORTANT: Make sure this is a high-resolution, full-screen image
        source={require('../assets/images/splash_screen.png')}
        style={styles.backgroundImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    // 'cover' ensures the image fills the screen without distortion,
    // though some parts might be cropped. Use 'stretch' if you want to fit the exact screen dimensions.
    resizeMode: 'cover', 
  },
});

export default SplashScreen;

