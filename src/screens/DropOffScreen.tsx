import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

type Center = {
  place_id: string;
  name: string;
  vicinity: string;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
};

// Fallback recycling centers in case API fails
const fallbackCenters: Center[] = [
  { place_id: 'f1', name: 'Trans Thane Creek Waste Management', vicinity: 'MIDC Industrial Area, Mahape, Navi Mumbai', distanceKm: 0 },
  { place_id: 'f2', name: 'GreenCiti Recycling', vicinity: 'LBS Marg, Bhandup West, Mumbai', distanceKm: 0 },
  { place_id: 'f3', name: 'Eco Recycling Ltd', vicinity: 'Andheri-Kurla Road, Andheri East, Mumbai', distanceKm: 0 },
  { place_id: 'f4', name: 'Sampurn(E) Environment Solutions', vicinity: 'WT Patil Marg, Chembur East, Mumbai', distanceKm: 0 },
  { place_id: 'f5', name: 'Gemcorp Recycling & Technologies', vicinity: 'TTC Industrial Area, Sanpada, Navi Mumbai', distanceKm: 0 },
];

// --- Helper: calculate distance in KM ---
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const DropOffScreen = () => {
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyCenters = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is needed to show nearby recycling centers.');
          setCenters(fallbackCenters);
          setLoading(false);
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Call Google Places API
        const apiKey = 'AIzaSyDkmrjp6MjyKqv8dZVG_IlQURzcZX8W5Dc'; // <-- Replace with your key
        const radius = 5000; // in meters
        const type = 'recycling';
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=recyclingoldpapermart&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const mapped: Center[] = data.results.map((item: any) => ({
            place_id: item.place_id,
            name: item.name,
            vicinity: item.vicinity || 'Address not available',
            distanceKm: item.geometry?.location
              ? getDistanceFromLatLonInKm(
                  latitude,
                  longitude,
                  item.geometry.location.lat,
                  item.geometry.location.lng
                )
              : 0,
            latitude: item.geometry?.location?.lat,
            longitude: item.geometry?.location?.lng,
          }));

          // Sort by nearest first
          mapped.sort((a, b) => a.distanceKm - b.distanceKm);

          setCenters(mapped);
        } else {
          setCenters(fallbackCenters);
        }
      } catch (err) {
        console.error('Error fetching centers:', err);
        setCenters(fallbackCenters);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyCenters();
  }, []);

  const openInGoogleMaps = (center: Center) => {
    if (center.place_id) {
      // Open the place in Google Maps
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name)}&query_place_id=${center.place_id}`;
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
    } else {
      Alert.alert('Error', 'Location not available.');
    }
  };

  const renderItem = ({ item }: { item: Center }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => openInGoogleMaps(item)}>
      <View style={styles.listItemIcon}>
        <Feather name="map-pin" size={24} color="#00C851" />
      </View>
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSubtitle}>{item.vicinity}</Text>
        <Text style={styles.distanceText}>{item.distanceKm.toFixed(2)} km away</Text>
      </View>
      <Feather name="chevron-right" size={22} color="#C7C7CC" />
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
        <Text style={styles.headerTitle}>Drop-off Centers</Text>
      </View>
      <FlatList
        data={centers}
        keyExtractor={(item) => item.place_id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  listContent: { padding: 20, paddingBottom: 100 },
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
  listItemTextContainer: { flex: 1 },
  listItemTitle: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  listItemSubtitle: { fontSize: 14, color: '#8A8A8E', marginTop: 4 },
  distanceText: { fontSize: 12, color: '#00C851', marginTop: 6 },
});

export default DropOffScreen;
