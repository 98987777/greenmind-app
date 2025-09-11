import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, db } from '../firebaseConfig';

// Define types
type UserData = {
    name: string;
    ecoPoints: number;
};

type ScanHistoryItem = {
    id: string;
    itemName: string;
    itemType: string;
    co2Saved: number;
    recycledAt: { toDate: () => Date };
};

// Format timestamp
const formatHistoryTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (isToday) return `Today, ${timeString}`;
    if (isYesterday) return `Yesterday, ${timeString}`;
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeString}`;
};

// Responsive styles
const createResponsiveStyles = (width: number) => {
    const fontScale = (size: number) => Math.min(width / 375, 1.2) * size;

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
        headerTitle: { fontSize: fontScale(25), fontWeight: '600', color: '#1C1C1E' },
        scrollContent: { padding: 20, paddingBottom: 100 },
        sectionTitleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
        sectionTitle: { fontSize: fontScale(22), fontWeight: 'bold', color: '#1C1C1E' },
        overviewContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
        statCard: { backgroundColor: '#F7F8F9', borderRadius: 16, padding: 20, width: '48%', borderWidth: 1, borderColor: '#E8E8E8' },
        ecoPointsCard: { backgroundColor: '#F7F8F9', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 25 },
        statLabel: { fontSize: fontScale(14), color: '#8A8A8E', marginBottom: 5 },
        statValue: { fontSize: fontScale(24), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 5 },
        statChange: { fontSize: fontScale(12), fontWeight: '500' },
        positiveChange: { color: '#00C851' },
        trendsCard: { backgroundColor: '#F7F8F9', borderRadius: 16, paddingVertical: 20, borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 25, alignItems: 'center' },
        trendsHeader: { fontSize: fontScale(16), fontWeight: '600', color: '#1C1C1E', paddingHorizontal: 20, alignSelf: 'flex-start' },
        trendsValueContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 5, paddingHorizontal: 20, alignSelf: 'flex-start' },
        trendsValue: { fontSize: fontScale(28), fontWeight: 'bold', color: '#1C1C1E', marginRight: 8 },
        trendsSubtext: { fontSize: fontScale(12), color: '#8A8A8E', marginBottom: 15, paddingHorizontal: 20, alignSelf: 'flex-start' },
        historyItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
        historyIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0, 200, 81, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
        historyTextContainer: { flex: 1 },
        historyType: { fontSize: fontScale(15), fontWeight: '600', color: '#1C1C1E' },
        historyDetail: { fontSize: fontScale(13), color: '#8A8A8E', marginTop: 2 },
        historyTime: { fontSize: fontScale(12), color: '#8A8A8E' },
        emptyHistoryText: { textAlign: 'center', color: '#8A8A8E', marginTop: 20, fontStyle: 'italic' },
        seeAllButtonText: { color: '#00C851', fontWeight: '600', fontSize: 15 },
        deleteButton: { marginLeft: 60, padding: 5 },
        timeRangeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: '#E8E8E8',
            borderRadius: 20,
            marginHorizontal: 20,
            marginVertical: 15,
            padding: 4,
        },
        timeRangeButton: {
            flex: 1,
            paddingVertical: 8,
            borderRadius: 16,
        },
        activeTimeRangeButton: {
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 3,
        },
        timeRangeText: {
            textAlign: 'center',
            fontWeight: '600',
            color: '#8A8A8E',
        },
        activeTimeRangeText: {
            color: '#00C851',
        },
    });
};

const DashboardScreen = () => {
    const { width } = useWindowDimensions();
    const styles = createResponsiveStyles(width);
    const router = useRouter();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [fullScanHistory, setFullScanHistory] = useState<ScanHistoryItem[]>([]);
    const [stats, setStats] = useState({ totalItems: 0, co2Saved: 0 });
    const [activeTimeRange, setActiveTimeRange] = useState('1M');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userUnsubscribe = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) setUserData(doc.data() as UserData);
                });

                const historyPreviewQuery = query(collection(db, "users", user.uid, "scanHistory"), orderBy("recycledAt", "desc"), limit(3));
                const historyPreviewUnsubscribe = onSnapshot(historyPreviewQuery, (snapshot) => {
                    setScanHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScanHistoryItem)));
                });

                const fullHistoryQuery = query(collection(db, "users", user.uid, "scanHistory"), orderBy("recycledAt", "asc"));
                const statsUnsubscribe = onSnapshot(fullHistoryQuery, (snapshot) => {
                    let totalCo2 = 0;
                    const fullHistory: ScanHistoryItem[] = [];
                    snapshot.forEach(doc => {
                        totalCo2 += doc.data().co2Saved || 0;
                        fullHistory.push({ id: doc.id, ...doc.data()} as ScanHistoryItem);
                    });
                    setStats({ totalItems: snapshot.size, co2Saved: totalCo2 });
                    setFullScanHistory(fullHistory);
                    setLoading(false);
                });

                return () => { userUnsubscribe(); historyPreviewUnsubscribe(); statsUnsubscribe(); };
            } else {
                setUserData(null);
                setScanHistory([]);
                setLoading(false);
                router.replace('/login');
            }
        });

        return () => authUnsubscribe();
    }, []);
    
    const chartData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        let labels: string[] = [];
        let dataPoints: number[] = [];

        switch (activeTimeRange) {
            case '1D':
                startDate.setDate(now.getDate() - 1);
                labels = ['12AM', '6AM', '12PM', '6PM'];
                dataPoints = Array(24).fill(0); // 24 hours
                break;
            case '1W':
                startDate.setDate(now.getDate() - 7);
                labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                dataPoints = Array(7).fill(0); // 7 days
                break;
            case '1M':
                startDate.setMonth(now.getMonth() - 1);
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                dataPoints = Array(4).fill(0); // 4 weeks
                break;
            default: // All
                labels = ['History'];
                dataPoints = [fullScanHistory.length];
        }

        const filteredHistory = fullScanHistory.filter(item => item.recycledAt.toDate() >= startDate);

        filteredHistory.forEach(item => {
            const scanDate = item.recycledAt.toDate();
            if (activeTimeRange === '1D') {
                dataPoints[scanDate.getHours()]++;
            } else if (activeTimeRange === '1W') {
                dataPoints[scanDate.getDay()]++;
            } else if (activeTimeRange === '1M') {
                const diffDays = (now.getTime() - scanDate.getTime()) / (1000 * 3600 * 24);
                const weekIndex = 3 - Math.floor(diffDays / 7);
                if (weekIndex >= 0 && weekIndex < 4) dataPoints[weekIndex]++;
            }
        });

        // For '1D', we can aggregate the 24 hours into 4 points for the labels
        if (activeTimeRange === '1D') {
            const aggregatedPoints = [0, 0, 0, 0];
            for (let i = 0; i < 24; i++) {
                if (i < 6) aggregatedPoints[0] += dataPoints[i];
                else if (i < 12) aggregatedPoints[1] += dataPoints[i];
                else if (i < 18) aggregatedPoints[2] += dataPoints[i];
                else aggregatedPoints[3] += dataPoints[i];
            }
            dataPoints = aggregatedPoints;
        }

        return {
            labels: labels.length > 0 ? labels : [''],
            datasets: [{ data: dataPoints.length > 0 ? dataPoints : [0] }]
        };

    }, [activeTimeRange, fullScanHistory]);


    const handleDeleteHistoryItem = (itemId: string) => {
        const user = auth.currentUser;
        if (!user) return;
        Alert.alert("Delete Item", "Are you sure...?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const itemRef = doc(db, "users", user.uid, "scanHistory", itemId);
                        await deleteDoc(itemRef);
                    } catch {
                        Alert.alert("Error", "Could not delete the item.");
                    }
                },
            },
        ]);
    };

    if (loading) {
        return ( <View style={styles.loadingContainer}> <ActivityIndicator size="large" color="#00C851" /> </View> );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <View style={{ width: 28, height:30 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.overviewContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Items</Text>
                        <Text style={styles.statValue}>{stats.totalItems}</Text>
                        <Text style={[styles.statChange, styles.positiveChange]}>+12%</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>CO₂ Saved</Text>
                        <Text style={styles.statValue}>{stats.co2Saved.toFixed(1)} kg</Text>
                        <Text style={[styles.statChange, styles.positiveChange]}>+5%</Text>
                    </View>
                </View>
                <View style={styles.ecoPointsCard}>
                    <Text style={styles.statLabel}>Eco-Points</Text>
                    <Text style={styles.statValue}>{userData?.ecoPoints || 0}</Text>
                    <Text style={[styles.statChange, styles.positiveChange]}>+8%</Text>
                </View>

                <Text style={styles.sectionTitle}>Trends</Text>
                <View style={styles.trendsCard}>
                    <Text style={styles.trendsHeader}>Items Scanned</Text>
                    
                    <View style={styles.timeRangeContainer}>
                        {['1D','1W', '1M', '6M', '1Y', 'All'].map(range => (
                            <TouchableOpacity
                                key={range}
                                style={[styles.timeRangeButton, activeTimeRange === range && styles.activeTimeRangeButton]}
                                onPress={() => setActiveTimeRange(range)}
                            >
                                <Text style={[styles.timeRangeText, activeTimeRange === range && styles.activeTimeRangeText]}>{range}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <LineChart
                        data={chartData}
                        width={Dimensions.get('window').width - 80}
                        height={160}
                        chartConfig={{
                            backgroundColor: '#F7F8F9',
                            backgroundGradientFrom: '#F7F8F9',
                            backgroundGradientTo: '#F7F8F9',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 200, 81, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(138, 138, 142, ${opacity})`,
                            propsForDots: { r: '4', strokeWidth: '1', stroke: '#00C851' },
                        }}
                        style={{ borderRadius: 16, marginVertical: 10 }}
                        bezier
                    />

                </View>

                 <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>History</Text>
                    {stats.totalItems > 3 && (
                        <TouchableOpacity onPress={() => router.push('/history')}>
                            <Text style={styles.seeAllButtonText}>See All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {scanHistory.length > 0 ? (
                    scanHistory.map((item) => (
                        <View key={item.id} style={styles.historyItem}>
                            <View style={styles.historyIconContainer}>
                                <Ionicons name="scan" size={24} color="#00C851" />
                            </View>
                            <View style={styles.historyTextContainer}>
                                <Text style={styles.historyType}>Scanned Item</Text>
                                <Text style={styles.historyDetail}>{item.itemName}</Text>
                            </View>
                            <View>
                                <Text style={styles.historyTime}>
                                    {item.recycledAt ? formatHistoryTime(item.recycledAt.toDate()) : 'Just now'}
                                </Text>
                                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteHistoryItem(item.id)}>
                                    <Feather name="trash-2" size={20} color="#D32F2F" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyHistoryText}>Your scan history will appear here after you recycle your first item.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default DashboardScreen;

