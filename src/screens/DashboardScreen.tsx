import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const historyItems = [
    { type: 'Plastic Bottle', time: 'Today, 10:30 AM' },
    { type: 'Cardboard Box', time: 'Yesterday, 2:15 PM' },
    { type: 'Aluminum Can', time: '2 days ago, 9:45 AM' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="menu" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.overviewContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Items</Text>
                <Text style={styles.statValue}>1,234</Text>
                <Text style={[styles.statChange, styles.positiveChange]}>+12%</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>CO₂ Saved</Text>
                <Text style={styles.statValue}>567 kg</Text>
                <Text style={[styles.statChange, styles.positiveChange]}>+5%</Text>
            </View>
        </View>
        <View style={styles.ecoPointsCard}>
            <Text style={styles.statLabel}>Eco-Points</Text>
            <Text style={styles.statValue}>890</Text>
            <Text style={[styles.statChange, styles.positiveChange]}>+8%</Text>
        </View>

        <Text style={styles.sectionTitle}>Trends</Text>
        <View style={styles.trendsCard}>
            <Text style={styles.trendsHeader}>Items Scanned</Text>
            <View style={styles.trendsValueContainer}>
                <Text style={styles.trendsValue}>1,234</Text>
                <Text style={[styles.statChange, styles.positiveChange]}>+12%</Text>
            </View>
            <Text style={styles.trendsSubtext}>Last 30 Days</Text>
            <View style={styles.graphPlaceholder}>
                <Text style={styles.graphText}>Graph Placeholder</Text>
            </View>
            <View style={styles.graphAxis}>
                <Text style={styles.axisLabel}>Week 1</Text>
                <Text style={styles.axisLabel}>Week 2</Text>
                <Text style={styles.axisLabel}>Week 3</Text>
                <Text style={styles.axisLabel}>Week 4</Text>
            </View>
        </View>

        <Text style={styles.sectionTitle}>History</Text>
        {historyItems.map((item, index) => (
            <View key={index} style={styles.historyItem}>
                <View style={styles.historyIconContainer}>
                    <Ionicons name="scan" size={24} color="#00C851" />
                </View>
                <View style={styles.historyTextContainer}>
                    <Text style={styles.historyType}>Scanned Item</Text>
                    <Text style={styles.historyDetail}>{item.type}</Text>
                </View>
                <Text style={styles.historyTime}>{item.time}</Text>
            </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createResponsiveStyles = (width: number) => {
    const fontScale = (size: number) => {
        const scaleFactor = Math.min(width / 375, 1.2);
        return size * scaleFactor;
    }

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
        headerTitle: { fontSize: fontScale(18), fontWeight: '600', color: '#1C1C1E' },
        scrollContent: { padding: 20 },
        sectionTitle: { fontSize: fontScale(22), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 15 },
        overviewContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
        statCard: { backgroundColor: '#F7F8F9', borderRadius: 16, padding: 20, width: '48%', borderWidth: 1, borderColor: '#E8E8E8' },
        ecoPointsCard: { backgroundColor: '#F7F8F9', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 25 },
        statLabel: { fontSize: fontScale(14), color: '#8A8A8E', marginBottom: 5 },
        statValue: { fontSize: fontScale(24), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 5 },
        statChange: { fontSize: fontScale(12), fontWeight: '500' },
        positiveChange: { color: '#00C851' },
        trendsCard: { backgroundColor: '#F7F8F9', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 25 },
        trendsHeader: { fontSize: fontScale(16), fontWeight: '600', color: '#1C1C1E' },
        trendsValueContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 5 },
        trendsValue: { fontSize: fontScale(28), fontWeight: 'bold', color: '#1C1C1E', marginRight: 8 },
        trendsSubtext: { fontSize: fontScale(12), color: '#8A8A8E', marginBottom: 15 },
        graphPlaceholder: { height: 120, backgroundColor: '#E8E8E8', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
        graphText: { color: '#8A8A8E' },
        graphAxis: { flexDirection: 'row', justifyContent: 'space-between' },
        axisLabel: { fontSize: fontScale(12), color: '#8A8A8E' },
        historyItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
        historyIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0, 200, 81, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
        historyTextContainer: { flex: 1 },
        historyType: { fontSize: fontScale(15), fontWeight: '600', color: '#1C1C1E' },
        historyDetail: { fontSize: fontScale(13), color: '#8A8A8E', marginTop: 2 },
        historyTime: { fontSize: fontScale(12), color: '#8A8A8E' },
    });
}

export default DashboardScreen;
