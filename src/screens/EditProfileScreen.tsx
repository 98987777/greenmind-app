import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
import Feather from 'react-native-vector-icons/Feather';
import { auth, db } from '../firebaseConfig';

const createResponsiveStyles = (width: number) => {
    const fontScale = (size: number) => Math.min(width / 375, 1.2) * size;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
        // --- THIS IS THE NEW STYLE ---
        backButton: {
            padding: 5,
            backgroundColor: '#00000016',
            borderRadius: 20,
        },
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
        textArea: {
            height: 120,
            textAlignVertical: 'top',
            paddingTop: 15,
        },
    });
}

const EditProfileScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

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
        }
        setLoading(false);
      } else {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, []);

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
        {/* --- THE STYLE IS APPLIED HERE --- */}
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
            <Image 
                source={{ uri: 'https://i.pravatar.cc/150' }}
                style={styles.avatar}
            />
            <TouchableOpacity style={styles.changePictureButton}>
                <Text style={styles.changePictureText}>Change Picture</Text>
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

