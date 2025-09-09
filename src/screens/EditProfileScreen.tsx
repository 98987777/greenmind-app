import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const EditProfileScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  // Pre-fill state with existing user data
  const [name, setName] = useState('Sophia Green');
  const [email, setEmail] = useState('sophia.green@example.com');
  const [phone, setPhone] = useState('+1 123 456 7890');
  const [dateOfBirth, setDateOfBirth] = useState('January 1, 1995'); // New state
  const [address, setAddress] = useState('Sai Mansion, A1209, Mumbai-400989');


  const handleSaveChanges = () => {
    console.log('Saving changes:', { name, email, phone, dateOfBirth, address });
    // Add logic to save data, then navigate back
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSaveChanges}>
            <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
            <Image 
                source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
                style={styles.avatar}
            />
            <TouchableOpacity style={styles.changePictureButton}>
                <Text style={styles.changePictureText}>Change Picture</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.form}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="Enter your date of birth"
            />

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
                style={[styles.input, styles.textArea]} // Use the new text area style
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline={true} // Allow multiple lines
                numberOfLines={4} // Suggests a height of 4 lines for Android
            />
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
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
        headerTitle: { fontSize: fontScale(18), fontWeight: '600', color: '#1C1C1E' },
        saveButton: { fontSize: fontScale(16), color: '#00C851', fontWeight: '600' },
        scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
        avatarContainer: { alignItems: 'center', marginBottom: 30 },
        avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
        changePictureButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#F0F8F5' },
        changePictureText: { color: '#00C851', fontSize: fontScale(14), fontWeight: '500' },
        form: { width: '100%' },
        inputLabel: { fontSize: fontScale(14), color: '#8A8A8E', marginBottom: 8, marginLeft: 5 },
        input: {
            backgroundColor: '#F7F8F9',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E8E8E8',
            padding: 15,
            fontSize: fontScale(16),
            color: '#1C1C1E',
            marginBottom: 20,
        },
        // New style for the text area
        textArea: {
            height: 120, // Give it a larger height
            textAlignVertical: 'top', // Align text to the top
            paddingTop: 15, // Ensure padding is consistent
        },
    });
}

export default EditProfileScreen;

