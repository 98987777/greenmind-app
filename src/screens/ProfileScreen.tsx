import { useRouter } from 'expo-router';
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
// --- THIS IS THE FIX: Corrected the typo in the import path ---
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Import onSnapshot for real-time updates
import Feather from 'react-native-vector-icons/Feather';
import { auth, db } from '../firebaseConfig';

// UserData type remains the same
type UserData = {
    name: string;
    email: string;
    ecoPoints: number;
};

const createResponsiveStyles = (width: number) => {
    // ... styles remain the same
    const fontScale = (size: number) => {
        const scaleFactor = Math.min(width / 375, 1.2);
        return size * scaleFactor;
    }

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
        headerTitle: { fontSize: fontScale(18), fontWeight: '600', color: '#1C1C1E' },
        scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
        profileHeader: { alignItems: 'center', marginVertical: 20 },
        avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
        name: { fontSize: fontScale(22), fontWeight: 'bold', color: '#1C1C1E' },
        subtitle: { fontSize: fontScale(14), color: '#00C851', marginTop: 4 },
        statsContainer: { 
            justifyContent: 'center', 
            backgroundColor: '#F7F8F9', 
            borderRadius: 16, 
            padding: 20, 
            borderWidth: 1, 
            borderColor: '#E8E8E8', 
            marginBottom: 25 
        },
        statBox: { 
            alignItems: 'center',
        },
        statValue: { fontSize: fontScale(18), fontWeight: 'bold', color: '#1C1C1E' },
        statLabel: { fontSize: fontScale(13), color: '#8A8A8E', marginTop: 4 },
        menuSection: { marginBottom: 15 },
        sectionTitle: { fontSize: fontScale(18), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 },
        menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8F9', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#E8E8E8' },
        menuIconContainer: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#E8F5E9',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
        },
        menuText: { flex: 1, fontSize: fontScale(15), color: '#1C1C1E', fontWeight: '500' },
    });
}

const ProfileScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This outer listener checks if the user is logged in or out
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set up a real-time listener for their data
        const userDocRef = doc(db, "users", user.uid);
        
        const docUnsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            console.log("No such user document!");
          }
          setLoading(false);
        });

        // Return the cleanup function for the document listener
        return () => docUnsubscribe();

      } else {
        // User is signed out
        setUserData(null);
        setLoading(false);
        router.replace('/login');
      }
    });

    // Return the cleanup function for the auth listener
    return () => authUnsubscribe();
  }, []);

  const handleNavigation = (path: string) => {
    if (path) {
      router.push(path as never);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: () => {
            auth.signOut().then(() => {
              router.replace('/login');
            });
          },
          style: "destructive"
        }
      ]
    );
  };

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
        <View style={{width: 28}} />
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Feather name="log-out" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
            <Image 
                source={{ uri: 'https://i.pravatar.cc/150' }}
                style={styles.avatar}
            />
            <Text style={styles.name}>{userData?.name || 'GreenMind User'}</Text>
            <Text style={styles.subtitle}>Eco-Warrior</Text>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.statBox}>
                <Text style={styles.statValue}>{userData?.ecoPoints || 0}</Text>
                <Text style={styles.statLabel}>Eco-Points</Text>
            </View>
        </View>

        {/* ... Menu sections remain the same ... */}
        <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/edit-profile')}>
                <View style={styles.menuIconContainer}>
                   <Feather name="user" size={22} color="#00C851" />
                </View>
                <Text style={styles.menuText}>Edit Profile</Text>
                <Feather name="chevron-right" size={22} color="#8A8A8E" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/notifications')}>
                 <View style={styles.menuIconContainer}>
                   <Feather name="bell" size={22} color="#00C851" />
                </View>
                <Text style={styles.menuText}>Notifications</Text>
                <Feather name="chevron-right" size={22} color="#8A8A8E" />
            </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/help-and-support')}>
                <View style={styles.menuIconContainer}>
                    <Feather name="help-circle" size={22} color="#00C851" />
                </View>
                <Text style={styles.menuText}>Help & Support</Text>
                <Feather name="chevron-right" size={22} color="#8A8A8E" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/about')}>
                 <View style={styles.menuIconContainer}>
                    <Feather name="info" size={22} color="#00C851" />
                </View>
                <Text style={styles.menuText}>About</Text>
                <Feather name="chevron-right" size={22} color="#8A8A8E" />
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

