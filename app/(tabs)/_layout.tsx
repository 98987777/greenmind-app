import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00C851',
        tabBarInactiveTintColor: '#8A8A8E',
        tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: 70 + insets.bottom,
            paddingTop: 8,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
        },
        headerShown: false, // We use custom headers in each screen
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} />,
        }}
      />
      {/* You can add your other tabs here in the future */}
      
      <Tabs.Screen
        name="drop-off"
        options={{
          title: 'Drop-off',
          tabBarIcon: ({ color }) => <Feather name="map-pin" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <Ionicons name="scan" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
      }}
    />

    <Tabs.Screen
      name="redeem"
      options={{
        title: 'Redeem',
        tabBarIcon: ({ color }) => <Feather name="gift" size={24} color={color} />,
      }}
    />
    </Tabs>
  );
}
