import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { db } from '../firebaseConfig';

type ScanResult = {
  id: string;
  itemName: string;
  itemType: string;
  description?: string;
  co2Saved?: number;
  pointsEarned?: number;
  recycledAt?: { toDate: () => Date };
};

const ScanResultScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ docId: string }>();
  const { docId } = params;

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) {
      Alert.alert('Error', 'No scan result specified.');
      router.back();
      return;
    }

    const fetchScanResult = async () => {
      try {
        const scanDocRef = doc(db, 'scanResults', docId);
        const snap = await getDoc(scanDocRef);
        if (snap.exists()) {
          setScanResult({ id: snap.id, ...snap.data() } as ScanResult);
        } else {
          Alert.alert('Not Found', 'Scan result not found.');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching scan result:', error);
        Alert.alert('Error', 'Failed to fetch scan result.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchScanResult();
  }, [docId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C851" />
      </View>
    );
  }

  if (!scanResult) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{scanResult.itemName}</Text>
        <Text style={styles.type}>{scanResult.itemType}</Text>
        {scanResult.description && (
          <Text style={styles.description}>{scanResult.description}</Text>
        )}
        <View style={styles.badges}>
          {scanResult.co2Saved !== undefined && (
            <Text style={styles.co2Badge}>💨 +{scanResult.co2Saved.toFixed(2)} kg CO₂ Saved</Text>
          )}
          {scanResult.pointsEarned !== undefined && scanResult.pointsEarned > 0 && (
            <Text style={styles.pointsBadge}>🪙 +{scanResult.pointsEarned} Points</Text>
          )}
        </View>
        {scanResult.recycledAt && (
          <Text style={styles.date}>
            Recycled At: {scanResult.recycledAt.toDate().toLocaleString()}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  type: { fontSize: 16, fontWeight: '600', color: '#8A8A8E', marginBottom: 12 },
  description: { fontSize: 14, color: '#1C1C1E', marginBottom: 16 },
  badges: { flexDirection: 'row', marginBottom: 16 },
  co2Badge: { fontSize: 12, fontWeight: '600', color: '#00C851', marginRight: 12 },
  pointsBadge: { fontSize: 12, fontWeight: '600', color: '#FF9800' },
  date: { fontSize: 12, color: '#8A8A8E' },
});

export default ScanResultScreen;
