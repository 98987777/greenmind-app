import { useRouter } from 'expo-router';
import React from 'react';
import {
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
import Feather from 'react-native-vector-icons/Feather';

const ProfileScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const handleNavigation = (path: string) => {
    // A simple check to avoid navigating on empty paths
    if (path) {
      router.push(path as never);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{('Settings')}</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
            <Image 
                source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
                style={styles.avatar}
            />
            <Text style={styles.name}>Sophia Green</Text>
            <Text style={styles.subtitle}>Eco-Warrior</Text>
        </View>

       
        <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{('Account')}</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/edit-profile')}>
                <View style={styles.menuIconContainer}>
                   <Feather name="user" size={22} color="#00C851" />
                </View>
                <Text style={styles.menuText}>{('Edit Profile')}</Text>
                <Feather name="chevron-right" size={22} color="#00C851" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/notifications')}>
                 <View style={styles.menuIconContainer}>
                   <Feather name="bell" size={22} color="#00C851" />
                </View>
                <Text style={styles.menuText}>{('Notifications')}</Text>
                <Feather name="chevron-right" size={22} color="#00C851" />
            </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{('App Settings')}</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/help-and-support')}>
                <View style={styles.menuIconContainer}>
                    <Feather name="help-circle" size={22} color="#00C851" />
                </View>
                <Text style={styles.menuText}>{('Help And Support')}</Text>
                <Feather name="chevron-right" size={22} color="#00C851" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/about')}>
                 <View style={styles.menuIconContainer}>
                    <Feather name="info" size={22} color="#00C851" />
                </View>
                <Text style={styles.menuText}>{('About')}</Text>
                <Feather name="chevron-right" size={22} color="#00C851" />
            </TouchableOpacity>
        </View>
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
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
        headerTitle: { fontSize: fontScale(18), fontWeight: '600', color: '#1C1C1E' },
        scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
        profileHeader: { alignItems: 'center', marginVertical: 20 },
        avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
        name: { fontSize: fontScale(22), fontWeight: 'bold', color: '#1C1C1E' },
        subtitle: { fontSize: fontScale(14), color: '#00C851', marginTop: 4 },
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
        menuValue: { fontSize: fontScale(15), color: '#8A8A8E' },
    });
}

export default ProfileScreen;

