import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

const AboutScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
            <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
            />
        </View>
        <Text style={styles.appName}>GreenMind</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionText}>
                Our mission is to create a cleaner and greener environment by making waste management simple, efficient, and rewarding. We believe that by empowering individuals with the right tools and information, we can collectively make a significant positive impact on our planet.
            </Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <Text style={styles.sectionText}>
                Use the GreenMind app to scan items and get instant information on their recyclability and carbon footprint. Find nearby drop-off centers, track your eco-points, and join a community of eco-warriors dedicated to sustainability.
            </Text>
        </View>

        <Text style={styles.footerText}>© 2025 GreenMind. All Rights Reserved.</Text>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  content: {
    padding: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
    color: '#8A8A8E',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
  },
  footerText: {
    textAlign: 'center',
    color: '#8A8A8E',
    marginTop: 40,
    fontSize: 12,
  },
});

export default AboutScreen;

