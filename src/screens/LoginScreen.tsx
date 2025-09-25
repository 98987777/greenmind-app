import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
    forgotPasswordText: { fontSize: fontScale(14), color: '#00C851', textAlign: 'right', marginBottom: 30, fontWeight: '500' },
    loginButton: { backgroundColor: '#00C851', paddingVertical: 16, borderRadius: 30, alignItems: 'center', shadowColor: "#00C851", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: 40 },
    loginButtonText: { color: '#FFFFFF', fontSize: fontScale(18), fontWeight: 'bold' },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 10 },
    registerText: { fontSize: fontScale(16), color: '#1C1C1E' },
    registerLink: { color: '#00C851', fontWeight: 'bold' },
  });
};

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password.");
      return;
    }

    try {
      // Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Get Firestore user
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        Alert.alert("Error", "User data not found in database.");
        return;
      }

      const userData = docSnap.data();
      const userRole = userData.role?.toLowerCase();

      console.log("Firebase role:", userRole);

      // Navigate based on role in Firestore
      if (userRole === "admin") {
        router.push("/admin-home"); // Admin home
      } else if (userRole === "user") {
        router.push("/(tabs)/dashboard"); // User dashboard
      } else {
        Alert.alert("Access Denied", "Unknown role in database.");
      }

    } catch (error: any) {
      console.error("Login Error:", error.message);
      Alert.alert("Login Failed", "Invalid email or password. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert("Enter Email", "Please enter your email to reset password.");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => Alert.alert("Email Sent", "Check your inbox for password reset."))
      .catch((error) => {
        console.error("Password reset error:", error);
        Alert.alert("Error", error.message);
      });
  };

  const handleRegister = () => router.push("/register");
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
        <Text style={styles.title}>Explore GreenMind</Text>
        <Text style={styles.subtitle}>Enter your email and password</Text>

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

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={[styles.registerText, styles.registerLink]}>Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
