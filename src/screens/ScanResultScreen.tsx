import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { auth, db } from '../firebaseConfig';

const ScanResultScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { imageUri } = params;

  // Mock data for the scanned item
  const scanData = {
    name: 'Plastic Bottle',
    type: 'PET (Polyethylene Terephthalate)',
    biodegradability: 'Non-biodegradable',
    carbonFootprint: 'High',
    co2Saved: 1.5,
    recyclingRate: 0.3,
    recyclingSteps: [
      'Empty and rinse the bottle.',
      'Remove the cap and label.',
      'Crush the bottle to save space.',
      'Place in the designated recycling bin.',
    ],
    points: 10,
  };

  const handleRecycle = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to recycle items.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const currentPoints = userDoc.data().ecoPoints || 0;
        const newPoints = currentPoints + scanData.points;

        // Update user points
        await updateDoc(userDocRef, { ecoPoints: newPoints });

        // Add to scan history using local timestamp
        const historyCollectionRef = collection(db, "users", user.uid, "scanHistory");
        await addDoc(historyCollectionRef, {
          itemName: scanData.name,
          itemType: scanData.type,
          pointsEarned: scanData.points,
          co2Saved: scanData.co2Saved,
          recycledAt: new Date(), // Use client timestamp for immediate rendering
          serverTimestamp: serverTimestamp() // Keep server timestamp for backend
        });

        Alert.alert(
          "Success!",
          `You have earned ${scanData.points} Eco-Points! Your new total is ${newPoints}.`,
          [{ text: "Awesome!", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Error", "Could not find your user data.");
      }
    } catch (error) {
      console.error("Error updating points:", error);
      Alert.alert("Error", "There was a problem saving your scan.");
    }
  };

  const translateX = useSharedValue(0);
  const sliderWidth = 280;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const translationX = event.translationX;
      if (translationX >= 0 && translationX <= sliderWidth) {
        translateX.value = translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value > sliderWidth * 0.7) {
        translateX.value = withSpring(sliderWidth, {}, () => {
          runOnJS(handleRecycle)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
        <Image source={{ uri: imageUri as string }} style={styles.scannedImage} />

        <Text style={styles.itemName}>{scanData.name}</Text>
        <Text style={styles.itemType}>Type: {scanData.type}</Text>

        <View style={styles.pointsPreview}>
          <Feather name="award" size={20} color="#FF9800" />
          <Text style={styles.pointsPreviewText}>+{scanData.points} Eco-Points for recycling</Text>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#8A8A8E" style={styles.searchIcon} />
          <TextInput placeholder="Not a plastic bottle? Search here" style={styles.searchInput} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Environmental Impact</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Biodegradability</Text>
            <Text style={styles.infoValue}>{scanData.biodegradability}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Carbon Footprint</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{scanData.carbonFootprint}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CO2 Saved</Text>
            <View style={[styles.badgeContainer, styles.greenBadge]}>
              <Text style={[styles.badgeText, styles.greenBadgeText]}>{scanData.co2Saved} kg</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Recycling Rate</Text>
            <View style={styles.progressContainer}>
              <Progress.Bar
                progress={scanData.recyclingRate}
                width={100}
                color={'#00C851'}
                unfilledColor={'#E0E0E0'}
                borderWidth={0}
                height={8}
              />
              <Text style={styles.progressText}>{(scanData.recyclingRate * 100).toFixed(0)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Recycle</Text>
          {scanData.recyclingSteps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.sliderContainer}>
            <Animated.View style={[styles.sliderButton, animatedStyle]}>
              <Feather name="refresh-cw" size={24} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.sliderText}>Slide to Recycle</Text>
          </Animated.View>
        </GestureDetector>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  scrollContent: { paddingBottom: 40 },
  scannedImage: { width: '100%', height: 300, borderRadius: 20, marginBottom: 20 },
  itemName: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center' },
  itemType: { fontSize: 14, color: '#8A8A8E', textAlign: 'center', marginBottom: 15 },
  pointsPreview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3E0', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, alignSelf: 'center', marginBottom: 20 },
  pointsPreviewText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#FF9800' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8F9', borderRadius: 14, marginHorizontal: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 25 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 15, color: '#1C1C1E' },
  card: { backgroundColor: '#F7F8F9', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 15, color: '#3C3C43' },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
  badgeContainer: { backgroundColor: '#FFEBEE', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { color: '#D32F2F', fontWeight: '600', fontSize: 12 },
  greenBadge: { backgroundColor: '#E8F5E9' },
  greenBadgeText: { color: '#00C851' },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressText: { marginLeft: 8, fontSize: 14, color: '#8A8A8E' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepNumber: { fontSize: 15, color: '#1C1C1E', marginRight: 8, fontWeight: '600' },
  stepText: { fontSize: 15, color: '#3C3C43', flex: 1, lineHeight: 22 },
  sliderContainer: { height: 60, backgroundColor: '#E8E8E8', borderRadius: 30, justifyContent: 'center', padding: 5, marginHorizontal: 20, marginTop: 10 },
  sliderButton: { height: 50, width: 50, borderRadius: 25, backgroundColor: '#00C851', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 5 },
  sliderText: { textAlign: 'center', fontSize: 16, color: '#8A8A8E', fontWeight: '600' },
});

export default ScanResultScreen;
