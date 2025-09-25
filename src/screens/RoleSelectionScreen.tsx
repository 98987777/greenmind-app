// src/screens/RoleSelectionScreen.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const RoleSelectionScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handleSelectRole = (role: 'admin' | 'user') => {
    // Navigate to login screen and pass the selected role
    router.push({
      pathname: '/login',
      params: { role },
    });
  };

  const styles = createResponsiveStyles(width);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: '#00C851' }]}
          onPress={() => handleSelectRole('user')}
        >
          <Text style={styles.buttonText}>User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: '#208a2bff' }]}
          onPress={() => handleSelectRole('admin')}
        >
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createResponsiveStyles = (width: number) => {
  const fontScale = (size: number) => Math.min(width / 375, 1.2) * size;

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F7F8F9',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: fontScale(24),
      fontWeight: 'bold',
      marginBottom: 40,
      textAlign: 'center',
      color: '#1C1C1E',
    },
    buttonsContainer: {
      width: '100%',
    },
    roleButton: {
      paddingVertical: 16,
      borderRadius: 30,
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonText: {
      color: '#fff',
      fontSize: fontScale(18),
      fontWeight: 'bold',
    },
  });
};

export default RoleSelectionScreen;
