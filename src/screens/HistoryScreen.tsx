import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../firebaseConfig';

type ScanHistoryItem = {
    id: string;              // Firestore doc ID in user scanHistory
    scanResultId: string;    // Reference to scanResults/{docId}
    itemName: string;
    itemType: string;
    recycledAt: {
        toDate: () => Date;
    };
};

// --- Helper: format timestamp nicely ---
const formatHistoryTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (isToday) return `Today, ${timeString}`;
    if (isYesterday) return `Yesterday, ${timeString}`;
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeString}`;
};

const HistoryScreen = () => {
  const router = useRouter();
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const historyCollectionRef = collection(db, "users", user.uid, "scanHistory");
        const historyQuery = query(historyCollectionRef, orderBy("recycledAt", "desc"));

        const historyUnsubscribe = onSnapshot(historyQuery, (snapshot) => {
            const history: ScanHistoryItem[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ScanHistoryItem));
            setScanHistory(history);
            setLoading(false);
        });

        return () => historyUnsubscribe();
      } else {
        setLoading(false);
        router.replace('/login');
      }
    });
    return () => authUnsubscribe();
  }, []);

  const handleDeleteItem = (item: ScanHistoryItem) => {
      const user = auth.currentUser;
      if (!user) return;

      Alert.alert(
        "Delete Scan",
        "Are you sure you want to permanently delete this item from your history?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                // Delete from user scanHistory
                const itemRef = doc(db, "users", user.uid, "scanHistory", item.id);
                await deleteDoc(itemRef);

                // Also delete from main scanResults collection if linked
                if (item.scanResultId) {
                  const scanRef = doc(db, "scanResults", item.scanResultId);
                  const snap = await getDoc(scanRef);
                  if (snap.exists()) {
                    await deleteDoc(scanRef);
                  }
                }

                console.log("History item + scanResult deleted successfully");
              } catch (error) {
                console.error("Error deleting history item:", error);
                Alert.alert("Error", "Could not delete the item.");
              }
            },
          },
        ]
      );
  };

  const handleOpenResult = (item: ScanHistoryItem) => {
      // Navigate to ScanResultScreen and pass scanResultId
      if (!item.scanResultId) {
        Alert.alert("Error", "No scan result found for this item.");
        return;
      }
      router.push({
        pathname: "/scan-result",
        params: { docId: item.scanResultId },   // ScanResultScreen should accept docId
      });
  };

  const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleOpenResult(item)}>
        <View style={styles.historyIconContainer}>
            <Ionicons name="scan" size={24} color="#00C851" />
        </View>
        <View style={styles.historyTextContainer}>
            <Text style={styles.historyType}>Scanned Item</Text>
            <Text style={styles.historyDetail}>{item.itemName}</Text>
        </View>
        <View style={styles.rightContainer}>
            <Text style={styles.historyTime}>
                {item.recycledAt ? formatHistoryTime(item.recycledAt.toDate()) : 'Just now'}
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteItem(item)}>
                <Feather name="trash-2" size={20} color="#D32F2F" />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C851" />
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanned Items History</Text>
        <View style={{width: 44}} />
      </View>

      <FlatList
        data={scanHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
            <Text style={styles.emptyHistoryText}>Your scan history is empty.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5, backgroundColor:'#00000016', borderRadius: 20 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
    listContent: { padding: 20 },
    historyItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#F7F8F9', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8' },
    historyIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0, 200, 81, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    historyTextContainer: { flex: 1 },
    historyType: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
    historyDetail: { fontSize: 13, color: '#8A8A8E', marginTop: 2 },
    rightContainer: { alignItems: 'flex-end' },
    historyTime: { fontSize: 12, color: '#8A8A8E', marginBottom: 8 },
    deleteButton: { padding: 5, },
    emptyHistoryText: { textAlign: 'center', color: '#8A8A8E', marginTop: 40, fontStyle: 'italic', fontSize: 16 },
});

export default HistoryScreen;
