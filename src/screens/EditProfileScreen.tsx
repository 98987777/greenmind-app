import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
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
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { auth, db, storage } from '../firebaseConfig';

// ✅ Helper to generate initials
const getInitials = (name?: string) => {
  if (!name) return 'GM';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const createResponsiveStyles = (width: number) => {
    const fontScale = (size: number) => Math.min(width / 375, 1.2) * size;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
        backButton: { padding: 5, backgroundColor: '#00000016', borderRadius: 20 },
        headerTitle: { fontSize: fontScale(18), fontWeight: '600', color: '#1C1C1E' },
        saveButton: { fontSize: fontScale(16), color: '#00C851', fontWeight: '600' },
        scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
        avatarContainer: { alignItems: 'center', marginBottom: 30 },
        avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
        avatarFallback: {
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 15,
            backgroundColor: '#E0F2F1',
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarInitials: { fontSize: fontScale(32), fontWeight: '600', color: '#00695C' },
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
    });
};

const EditProfileScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.mobile || '');
          setAddress(data.address || '');
          setAvatarUrl(data.avatarUrl || null);
        }
        setLoading(false);
      } else {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  // 📌 Pick image and upload to Firebase Storage
  const handleChangePicture = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Permission required", "You need to allow gallery access.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    try {
      setUploading(true);
      const user = auth.currentUser;
      if (!user) return;

      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      // ✅ Store in a folder per user
      const storageRef = ref(storage, `avatars/${user.uid}/avatar.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setAvatarUrl(downloadURL);

      await updateDoc(doc(db, "users", user.uid), { avatarUrl: downloadURL });

      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }
};


  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (!user) {
        Alert.alert("Error", "You are not logged in.");
        return;
    }
    try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            name: name,
            email: email,
            mobile: phone,
            address: address,
            avatarUrl: avatarUrl || null,
        });
        Alert.alert("Success", "Your profile has been updated.", [
            { text: "OK", onPress: () => router.back() }
        ]);
    } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Could not update your profile.");
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#00C851" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSaveChanges}>
            <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.changePictureButton} onPress={handleChangePicture} disabled={uploading}>
                <Text style={styles.changePictureText}>
                  {uploading ? "Uploading..." : "Change Picture"}
                </Text>
            </TouchableOpacity>
        </View>

        <View style={styles.form}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
      </ScrollView> 
    </SafeAreaView>
  );
};

export default EditProfileScreen;
