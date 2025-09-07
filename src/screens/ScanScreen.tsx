import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Request permission when the component mounts
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleTakePhoto = () => {
    console.log('Photo taken!');
    // Future: Add logic to take a picture and process it
  };

  const handlePickImage = () => {
    console.log('Opening image gallery...');
    // Future: Add logic to open the device's image library
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 20 }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={StyleSheet.absoluteFill}
        flash={flash}
        facing="back"
      />
      
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <SafeAreaView style={[styles.flexContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerContent}>
            <Text style={styles.title}>Waste Scan</Text>
            <Text style={styles.subtitle}>To get information on the type of waste</Text>

            {/* Viewfinder */}
            <View style={styles.viewfinder} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={30} color="#FFFFFF"  />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shutterButton} onPress={handleTakePhoto}>
              <View style={styles.shutterButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setFlash(current => (current === 'off' ? 'on' : 'off'))}
            >
              <Ionicons name={flash === 'on' ? 'flash' : 'flash-off-outline'} size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  permissionButton: {
    backgroundColor: '#00C851',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flexContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80, // Offset for the footer
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
  },
  viewfinder: {
    width: '80%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: '#00C851',
    borderRadius: 30,
    backgroundColor: 'transparent', // This makes the viewfinder area clear
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconButton: {
    padding: 10,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000000',
  },
});

export default ScanScreen;

