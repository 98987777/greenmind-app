import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { auth, db } from '../firebaseConfig';

const createResponsiveStyles = (width: number) => {
  const fontScale = (size: number) => Math.min(width / 375, 1.2) * size;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F9' },
    header: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    backButton: { backgroundColor: '#FFFFFF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8E8' },
    content: { flex: 1, paddingHorizontal: 25, paddingTop: 20 },
    title: { fontSize: fontScale(28), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
    subtitle: { fontSize: fontScale(16), color: '#8A8A8E', marginBottom: 30 },
    inputLabel: { fontSize: fontScale(14), color: '#1C1C1E', marginBottom: 10, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E8E8E8', paddingHorizontal: 15, marginBottom: 20, height: 56 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: fontScale(16), color: '#1C1C1E' },
    roleContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
    roleButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, borderWidth: 1 },
    roleText: { fontSize: fontScale(16), fontWeight: '500' },
    registerButton: { backgroundColor: '#00C851', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginTop: 20 },
    registerButtonText: { color: '#fff', fontSize: fontScale(18), fontWeight: 'bold' },
  });
};

const RegistrationScreen = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [role, setRole] = useState<'user' | 'admin'>('user');

  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const handleRegister = async () => {
    if (!email || !password || !name || !mobile) {
      Alert.alert("Missing Information", "Please fill all the fields.");
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Save user data in Firestore
      const userData: any = {
        name,
        mobile,
        email,
        ecoPoints: 0,
        createdAt: new Date(),
      };

      if (role === 'admin') {
        userData.role = 'admin'; // Only admins have role
      }

      await setDoc(doc(db, 'users', uid), userData);

      Alert.alert("Success", "Account created successfully!");
      router.push(`/login?role=${role}`);
    } catch (error: any) {
      console.error("Registration Error:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  const handleBack = () => router.canGoBack() && router.back();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8F9" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to continue</Text>

        <Text style={styles.inputLabel}>Name</Text>
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#8A8A8E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#8A8A8E"
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.inputLabel}>Mobile</Text>
        <View style={styles.inputContainer}>
          <Feather name="phone" size={20} color="#8A8A8E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#8A8A8E"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#8A8A8E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="user@gmail.com"
            placeholderTextColor="#8A8A8E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#8A8A8E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#8A8A8E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#8A8A8E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Select Role (Optional)</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, { borderColor: role === 'user' ? '#00C851' : '#E8E8E8' }]}
            onPress={() => setRole('user')}
          >
            <Text style={[styles.roleText, { color: role === 'user' ? '#00C851' : '#000' }]}>User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, { borderColor: role === 'admin' ? '#00C851' : '#E8E8E8' }]}
            onPress={() => setRole('admin')}
          >
            <Text style={[styles.roleText, { color: role === 'admin' ? '#00C851' : '#000' }]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationScreen;
