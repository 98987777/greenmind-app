import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { auth, db, storage } from '../firebaseConfig';

type AIResult = {
  name: string;
  type: string;
  biodegradability: string;
  carbonFootprint: string;
  recyclingSteps: string[];
  co2Saved: number;
  points: number;
};

const ScanResultScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { imageId } = params;

  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);

  useEffect(() => {
    if (!imageId || typeof imageId !== 'string') {
      Alert.alert('Error', 'No image ID was provided.');
      router.back();
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      router.replace('/login');
      return;
    }

    // ---- 1) Try to fetch the image from Storage (jpg, png, no-ext) ----
    (async () => {
      try {
        const base = `uploads/${user.uid}/${imageId}`;
        const candidates = [`${base}.jpg`, `${base}.png`, base];
        let found: string | null = null;

        for (const p of candidates) {
          try {
            const url = await getDownloadURL(ref(storage, p));
            found = url;
            break;
          } catch (e: any) {
            // console.log('getDownloadURL failed for', p, e?.code, e?.message);
          }
        }

        if (!found) {
          Alert.alert('Image not found', 'We couldn’t locate the uploaded image in Storage. Please re-scan.');
        }
        setImageUrl(found);
      } catch (err: any) {
        console.log('Storage error:', err?.code, err?.message);
        Alert.alert('Storage Error', err?.message || 'Failed to retrieve image from Storage.');
      }
    })();

    // ---- 2) Listen for the AI result in Firestore at scanResults/{uid}_{imageId} ----
    const resultDocId = `${user.uid}_${imageId}`;
    const resultDocRef = doc(db, 'scanResults', resultDocId);

    const unsub = onSnapshot(
      resultDocRef,
      (snap) => {
        if (snap.exists()) {
          let raw: any = (snap.data() as any)?.aiResult;
          if (raw) {
            try {
              // Accept object or string; strip accidental ```json fences
              if (typeof raw === 'string') {
                raw = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
                const parsed = JSON.parse(raw);
                normalizeAndSet(parsed);
              } else {
                normalizeAndSet(raw);
              }
            } catch (e) {
              console.error('Failed to parse AI result:', e);
              Alert.alert('Analysis Error', 'The AI returned an invalid format.');
            }
          }
          setLoading(false);
        } else {
          // No result yet — keep spinner a moment, then allow UI to show fallback
          setLoading(false);
        }
      },
      (err) => {
        console.log('onSnapshot error:', err?.code, err?.message);
        setLoading(false);
        Alert.alert('Firestore Error', err?.message || 'Failed to read analysis result.');
      }
    );

    return () => {
      try { unsub(); } catch {}
    };
  }, [imageId]);

  const normalizeAndSet = (data: any) => {
    // Ensure recyclingSteps is an array of strings
    const steps = Array.isArray(data?.recyclingSteps) ? data.recyclingSteps.map(String) : [];
    const result: AIResult = {
      name: String(data?.name ?? 'Unknown Item'),
      type: String(data?.type ?? 'Unknown'),
      biodegradability: String(data?.biodegradability ?? '—'),
      carbonFootprint: String(data?.carbonFootprint ?? '—'),
      recyclingSteps: steps,
      co2Saved: Number(data?.co2Saved ?? 0),
      points: Number(data?.points ?? 0),
    };
    setAiResult(result);
  };

  const handleRecycle = async () => {
    const user = auth.currentUser;
    if (!user || !aiResult) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        Alert.alert('Error', 'User profile not found.');
        return;
      }

      const currentPoints = (snap.data() as any).ecoPoints || 0;
      const newPoints = currentPoints + aiResult.points;
      await updateDoc(userRef, { ecoPoints: newPoints });

      const historyRef = collection(db, 'users', user.uid, 'scanHistory');
      await addDoc(historyRef, {
        itemName: aiResult.name,
        itemType: aiResult.type,
        pointsEarned: aiResult.points,
        co2Saved: aiResult.co2Saved,
        recycledAt: serverTimestamp(),
      });

      Alert.alert('Success!', `You earned ${aiResult.points} Eco-Points!`, [
        { text: 'Awesome!', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.log('Recycle save error:', error?.code, error?.message);
      Alert.alert('Error', error?.message || 'There was a problem saving your scan.');
    }
  };

  const translateX = useSharedValue(0);
  const sliderWidth = useWindowDimensions().width - 100;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(0, Math.min(event.translationX, sliderWidth));
    })
    .onEnd(() => {
      if (translateX.value > sliderWidth * 0.7) {
        translateX.value = withSpring(sliderWidth, {}, () => runOnJS(handleRecycle)());
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C851" />
        <Text style={styles.loadingText}>Analyzing in the cloud...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.scannedImage} />}
        {aiResult ? (
          <>
            <Text style={styles.itemName}>{aiResult.name}</Text>
            <Text style={styles.itemType}>Type: {aiResult.type}</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Environmental Impact</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Biodegradability</Text>
                <Text style={styles.infoValue}>{aiResult.biodegradability}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Carbon Footprint</Text>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{aiResult.carbonFootprint}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>How to Recycle</Text>
              {aiResult.recyclingSteps.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{idx + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.itemType}>Could not analyze image.</Text>
          </View>
        )}
      </ScrollView>

      {aiResult && (
        <View style={styles.footer}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.sliderContainer}>
              <Animated.View style={[styles.sliderButton, animatedStyle]}>
                <Feather name="refresh-cw" size={24} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.sliderText}>Slide to Recycle (+{aiResult.points} Points)</Text>
            </Animated.View>
          </GestureDetector>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#8A8A8E' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  scrollContent: { paddingBottom: 120 },
  scannedImage: { width: '100%', height: 300, borderRadius: 20, marginBottom: 20 },
  itemName: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center' },
  itemType: { fontSize: 14, color: '#8A8A8E', textAlign: 'center', marginBottom: 25 },
  card: { backgroundColor: '#F7F8F9', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 15, color: '#3C3C43' },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
  badgeContainer: { backgroundColor: '#FFEBEE', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { color: '#D32F2F', fontWeight: '600', fontSize: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepNumber: { fontSize: 15, color: '#1C1C1E', marginRight: 8, fontWeight: '600' },
  stepText: { fontSize: 15, color: '#3C3C43', flex: 1, lineHeight: 22 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sliderContainer: { height: 60, backgroundColor: '#E8E8E8', borderRadius: 30, justifyContent: 'center', padding: 5 },
  sliderButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#00C851',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 5,
  },
  sliderText: { textAlign: 'center', fontSize: 16, color: '#8A8A8E', fontWeight: '600' },
});

export default ScanResultScreen;
