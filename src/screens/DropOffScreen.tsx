import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  FlatList,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

// --- 2. UPDATED: Mock Data now includes latitude and longitude for map links ---
const recyclingCenters = [
  { 
    id: '1', 
    name: 'Trans Thane Creek Waste Management', 
    address: 'MIDC Industrial Area, Mahape, Navi Mumbai', 
    distance: '1.2 km',
    status: 'Open now',
    latitude: 19.0987,
    longitude: 73.0174,
  },
  { 
    id: '2', 
    name: 'GreenCiti Recycling', 
    address: 'LBS Marg, Bhandup West, Mumbai', 
    distance: '3.5 km',
    status: 'Open now',
    latitude: 19.1480,
    longitude: 72.9370,
  },
  { 
    id: '3', 
    name: 'Eco Recycling Ltd', 
    address: 'Andheri-Kurla Road, Andheri East, Mumbai', 
    distance: '5.1 km',
    status: 'Closes at 6 PM',
    latitude: 19.1170,
    longitude: 72.8830,
  },
  { 
    id: '4', 
    name: 'Sampurn(E) Environment Solutions', 
    address: 'WT Patil Marg, Chembur East, Mumbai', 
    distance: '6.8 km',
    status: 'Open now',
    latitude: 19.0540,
    longitude: 72.8990,
  },
  { 
    id: '5', 
    name: 'Gemcorp Recycling & Technologies', 
    address: 'TTC Industrial Area, Sanpada, Navi Mumbai', 
    distance: '2.3 km',
    status: 'Closes at 7 PM',
    latitude: 19.0660,
    longitude: 73.0160,
  },
   { 
    id: '6', 
    name: 'Navi Mumbai Waste Processing', 
    address: 'Sector 20, Kopar Khairane, Navi Mumbai', 
    distance: '4.0 km',
    status: 'Open now',
    latitude: 19.0900,
    longitude: 73.0000,
  },
];

const DropOffScreen = () => {
  const router = useRouter();

  // --- 3. NEW: Function to handle opening the map link ---
  const handleOpenMap = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => {
        console.error("Failed to open URL:", err);
        Alert.alert("Error", "Could not open the map application.");
    });
  };

  const renderCenterItem = ({ item }: { item: typeof recyclingCenters[0] }) => (
    // --- 4. UPDATED: Added onPress to the TouchableOpacity ---
    <TouchableOpacity 
        style={styles.listItem}
        onPress={() => handleOpenMap(item.latitude, item.longitude)}
    >
        <View style={styles.listItemIcon}>
            <Feather name="map-pin" size={24} color="#00C851" />
        </View>
        <View style={styles.listItemTextContainer}>
            <Text style={styles.listItemTitle}>{item.name}</Text>
            <Text style={styles.listItemSubtitle}>{item.address}</Text>
            <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </View>
        <View style={styles.listItemDistanceContainer}>
            <Text style={styles.listItemDistance}>{item.distance}</Text>
            <Feather name="chevron-right" size={22} color="#C7C7CC" />
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drop-off Centers</Text>
      </View>

      <FlatList
        data={recyclingCenters}
        renderItem={renderCenterItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 20, 
        paddingBottom: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#1C1C1E' 
    },
    listContent: {
        padding: 20,
        paddingBottom: 100, // To ensure content doesn't hide behind the tab bar
    },
    listItem: {
        flexDirection: 'row',
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#F7F8F9',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        alignItems: 'center',
    },
    listItemIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    listItemTextContainer: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    listItemSubtitle: {
        fontSize: 14,
        color: '#8A8A8E',
        marginTop: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00C851',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#00C851',
        fontWeight: '500',
    },
    listItemDistanceContainer: {
        alignItems: 'center',
    },
    listItemDistance: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8A8A8E',
        marginBottom: 4,
    },
});

export default DropOffScreen;

