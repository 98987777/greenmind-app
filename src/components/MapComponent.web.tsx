import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is a placeholder component for the web version.
const MapComponent = () => {
  return (
    <View style={styles.mapPlaceholder}>
      <Text style={styles.mapPlaceholderText}>Maps are available on the mobile app.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
    },
    mapPlaceholderText: {
        fontSize: 16,
        color: '#8A8A8E',
    },
});

export default MapComponent;
