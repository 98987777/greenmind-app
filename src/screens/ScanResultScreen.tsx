import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'; // Corrected React imports
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
    View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { auth, db } from '../firebaseConfig';

// --- Your API Keys ---
const IMAGGA_API_KEY = 'acc_ea53d869e941f86';
const IMAGGA_API_SECRET = '1749c4c14ec4665e3d9da161fd5fc2eb';
const GEMINI_API_KEY = 'AIzaSyD-XuhLL7LynEefNKBjWlUvKFcziI3LtEk';

// --- Type Definitions ---
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
  const { imageUri } = params;

  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing image...');
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  
  useEffect(() => {
    if (imageUri) {
      analyzeImage(imageUri as string);
    }
  }, [imageUri]);

  const analyzeImage = async (uri: string) => {
    try {
      const base64ImageData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      setLoadingMessage('Tagging image with Imagga...');
      const imaggaResponse = await fetch(`https://api.imagga.com/v2/tags`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(IMAGGA_API_KEY + ':' + IMAGGA_API_SECRET).toString('base64'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_base64: base64ImageData }),
      });
      const imaggaData = await imaggaResponse.json();
      if (!imaggaData.result || !imaggaData.result.tags) {
        throw new Error('Imagga API did not return valid tags.');
      }
      const labels = imaggaData.result.tags.map((tag: any) => tag.tag.en).join(', ');

      if (!labels) throw new Error('Could not identify objects.');

      setLoadingMessage('Generating recycling advice with Gemini...');
      const geminiPrompt = `Based on these labels: "${labels}", identify the main item. Provide a JSON response with keys: "name", "type", "biodegradability", "carbonFootprint", "recyclingSteps" (array of strings), "co2Saved" (number in kg), and "points" (number).`;
      
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: geminiPrompt }] }] })
      });
      const geminiData = await geminiResponse.json();
      const resultText = geminiData.candidates[0].content.parts[0].text;
      const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      setAiResult(JSON.parse(jsonString));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      Alert.alert("Analysis Failed", "Please try another image.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleRecycle = async () => {
    const user = auth.currentUser;
    if (!user || !aiResult) return;

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const currentPoints = userDoc.data().ecoPoints || 0;
            const newPoints = currentPoints + aiResult.points;
            await updateDoc(userDocRef, { ecoPoints: newPoints });

            const historyCollectionRef = collection(db, "users", user.uid, "scanHistory");
            await addDoc(historyCollectionRef, {
                itemName: aiResult.name,
                itemType: aiResult.type,
                pointsEarned: aiResult.points,
                co2Saved: aiResult.co2Saved,
                recycledAt: serverTimestamp(),
            });

            Alert.alert("Success!", `You earned ${aiResult.points} Eco-Points!`, [{ text: "Awesome!", onPress: () => router.back() }]);
        }
    } catch (error) {
        Alert.alert("Error", "There was a problem saving your scan.");
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
            <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={28} color="#1C1C1E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: imageUri as string }} style={styles.scannedImage}/>
        {aiResult && (
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
                        <View style={styles.badgeContainer}><Text style={styles.badgeText}>{aiResult.carbonFootprint}</Text></View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>How to Recycle</Text>
                    {aiResult.recyclingSteps.map((step: string, index: number) => (
                        <View key={index} style={styles.stepRow}>
                            <Text style={styles.stepNumber}>{index + 1}.</Text>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}
                </View>
            </>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
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
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    sliderContainer: { height: 60, backgroundColor: '#E8E8E8', borderRadius: 30, justifyContent: 'center', padding: 5 },
    sliderButton: { height: 50, width: 50, borderRadius: 25, backgroundColor: '#00C851', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 5 },
    sliderText: { textAlign: 'center', fontSize: 16, color: '#8A8A8E', fontWeight: '600' },
});

export default ScanResultScreen;

