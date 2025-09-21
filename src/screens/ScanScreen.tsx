import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db, storage } from '../firebaseConfig';

const extToMime: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  webp: 'image/webp',
};

function guessExt(uri: string): { ext: string; mime: string } {
  const m = uri.split('?')[0].match(/\.([a-z0-9]+)$/i);
  const ext = (m?.[1] || 'jpg').toLowerCase();
  return { ext, mime: extToMime[ext] || 'image/jpeg' };
}

const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);
      return () => setIsCameraActive(false);
    }, [])
  );

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  // Upload to Storage + create Firestore doc + navigate
  const uploadImageAndNavigate = async (uri: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to scan items.');
      return;
    }

    setIsUploading(true);
    try {
      const { ext, mime } = guessExt(uri);

      // Convert local file URI to Blob
      const res = await fetch(uri);
      if (!res.ok) throw new Error(`Failed to read image: HTTP ${res.status}`);
      const blob = await res.blob();

      // Generate unique imageId
      const imageId = `${Date.now()}`;

      // Upload to Firebase Storage
      const fullPath = `uploads/${user.uid}/${imageId}.${ext}`;
      const storageRef = ref(storage, fullPath);
      await uploadBytes(storageRef, blob, { contentType: mime });

      // ✅ Create Firestore doc in labeledWaste (Vision will process this)
      const labeledWasteRef = doc(db, 'labeledWaste', `${user.uid}_${imageId}`);
      await setDoc(labeledWasteRef, {
        userId: user.uid,
        imageId,
        file: `gs://${storage.app.options.storageBucket}/${fullPath}`, // Vision requires GS path
        createdAt: serverTimestamp(),
        status: { state: 'PENDING' },
      });

      // Navigate to results screen
      router.push({ pathname: '/scan-result', params: { imageId } });
    } catch (e: any) {
      console.log('UPLOAD ERROR code:', e?.code);
      console.log('UPLOAD ERROR message:', e?.message);
      console.log('UPLOAD ERROR serverResponse:', e?.customData?.serverResponse);
      Alert.alert('Upload Failed', e?.message || 'Could not upload the image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (photo?.uri) await uploadImageAndNavigate(photo.uri);
    } catch (e) {
      console.log('Failed to take picture:', e);
      Alert.alert('Camera Error', 'Could not take picture.');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need media library permission.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadImageAndNavigate(result.assets[0].uri);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {isCameraActive && (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} enableTorch={isTorchOn} facing="back" />
      )}

      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.uploadingText}>Uploading for Analysis...</Text>
          </View>
        )}

        <SafeAreaView style={[styles.flexContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerContent}>
            <Text style={styles.title}>Waste Scan</Text>
            <Text style={styles.subtitle}>To get information on the type of waste</Text>
            <View style={styles.viewfinder} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterButton} onPress={handleTakePhoto}>
              <View style={styles.shutterButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => setIsTorchOn((c) => !c)}>
              <Ionicons name={isTorchOn ? 'flash' : 'flash-off-outline'} size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
  permissionText: { textAlign: 'center', fontSize: 16, marginBottom: 20 },
  permissionButton: { backgroundColor: '#00C851', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  permissionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  flexContainer: { flex: 1 },
  header: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10 },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 40 },
  viewfinder: { width: '80%', aspectRatio: 1, borderWidth: 3, borderColor: '#00C851', borderRadius: 30, backgroundColor: 'transparent' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  iconButton: { padding: 10 },
  shutterButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shutterButtonInner: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#000000' },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  uploadingText: { color: 'white', fontSize: 16, marginTop: 15, fontWeight: '500' },
});

export default ScanScreen;
