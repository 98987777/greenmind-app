import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

// Mock Data for Notifications
const initialNotifications = [
    { id: '1', type: 'points', title: 'Points successfully redeemed', time: '09:20 AM', read: false, dateGroup: 'Today' },
    { id: '2', type: 'news', title: 'Latest News', time: '06:12 AM', read: true, dateGroup: 'Today' },
    { id: '3', type: 'points', title: 'Points successfully redeemed', time: '10:30 AM', read: false, dateGroup: 'Last week' },
    { id: '4', type: 'news', title: 'Latest News', time: '10:20 AM', read: false, dateGroup: 'Last week' },
    { id: '5', type: 'points', title: 'Points successfully redeemed', time: '09:20 AM', read: true, dateGroup: 'Last week' },
    { id: '6', type: 'points', title: 'Points successfully redeemed', time: '04:19 AM', read: true, dateGroup: 'Last week' },
    { id: '7', type: 'news', title: 'Latest News', time: '03:18 AM', read: true, dateGroup: 'Last week' },
];

// Helper to group notifications
const groupNotifications = (data: typeof initialNotifications) => {
    return data.reduce((acc, notification) => {
        const group = notification.dateGroup;
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(notification);
        return acc;
    }, {} as Record<string, typeof initialNotifications>);
};

const NotificationsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAllRead = () => {
    const allRead = notifications.map(n => ({ ...n, read: true }));
    setNotifications(allRead);
  };

  const handlePressNotification = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
  };
  
  const groupedData = groupNotifications(notifications);
  const sections = Object.keys(groupedData).map(key => ({
    title: key,
    data: groupedData[key],
  }));

  const renderNotificationItem = ({ item }: { item: typeof initialNotifications[0] }) => {
    const iconName = item.type === 'points' ? 'award' : 'message-square';
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => handlePressNotification(item.id)}>
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={22} color="#3C3C43" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{('Notifications')}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleMarkAllRead}>
          <Feather name="check-circle" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item }) => (
            <View>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <FlatList
                    data={item.data}
                    keyExtractor={(subItem) => subItem.id}
                    renderItem={renderNotificationItem}
                    scrollEnabled={false} // Disable nested scrolling
                />
            </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9', // Light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    padding: 5,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8A8A8E',
    marginVertical: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  itemTime: {
    fontSize: 14,
    color: '#8A8A8E',
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00C851',
    marginLeft: 10,
  },
});

export default NotificationsScreen;

