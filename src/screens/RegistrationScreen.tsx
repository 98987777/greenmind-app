import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, db } from '../firebaseConfig';

// --- THIS FUNCTION HAS BEEN MOVED TO THE TOP ---
const createResponsiveStyles = (width: number) => {
    const fontScale = (size: number) => {
        const scaleFactor = Math.min(width / 375, 1.2);
        return size * scaleFactor;
    }

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
        scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
        profileHeader: { alignItems: 'center', marginBottom: 20 },
        title: { fontSize: fontScale(28), fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center' },
        subtitle: { fontSize: fontScale(15), color: '#8A8A8E', marginTop: 8, textAlign: 'center', maxWidth: '80%' },
        menuSection: { marginBottom: 15 },
        sectionTitle: { fontSize: fontScale(18), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 },
        inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8F9', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E8E8E8' },
        menuIcon: { marginRight: 15 },
        input: { flex: 1, height: 50, fontSize: fontScale(15), color: '#1C1C1E' },
        registerButton: { backgroundColor: '#00C851', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
        registerButtonText: { color: '#FFFFFF', fontSize: fontScale(16), fontWeight: 'bold' },
        separatorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
        separatorLine: { flex: 1, height: 1, backgroundColor: '#E8E8E8' },
        separatorText: { marginHorizontal: 10, color: '#8A8A8E' },
        googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 30, paddingVertical: 16 },
        googleIcon: { width: 22, height: 22, marginRight: 12 },
        googleButtonText: { color: '#1C1C1E', fontSize: fontScale(16), fontWeight: '600' },
        loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 25 },
        loginText: { fontSize: fontScale(16), color: '#1C1C1E' },
        loginLink: { color: '#00C851', fontWeight: 'bold' },
    });
}

const RegistrationScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width); // Now this works correctly
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleRegistration = async () => {
    if (!name || !email || !password || !mobile) {
        Alert.alert("Missing Information", "Please fill in all required fields.");
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Registered new user:', user.uid);

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        mobile: mobile,
        ecoPoints: 0,
        createdAt: new Date(),
      });

      router.replace('/(tabs)/dashboard');

    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
      console.error("Firebase Registration Error:", error.message);
    }
  };
  
  const handleLogin = () => router.push('/login');
  const handleGoogleLogin = () => console.log('Google Login pressed');
  const handleBack = () => router.canGoBack() && router.back();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Feather name="arrow-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
            <Text style={styles.title}>Join with GreenMind</Text>
            <Text style={styles.subtitle}>Sign up now and start your journey to make the world greener.</Text>
        </View>

        <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.inputContainer}>
                <Feather name="user" size={22} color="#8A8A8E" style={styles.menuIcon} />
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" autoCapitalize="words" />
            </View>
             <View style={styles.inputContainer}>
                <Feather name="mail" size={22} color="#8A8A8E" style={styles.menuIcon} />
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none"/>
            </View>
             <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#8A8A8E" style={styles.menuIcon} />
                <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={!isPasswordVisible} />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={22} color="#8A8A8E" />
                </TouchableOpacity>
            </View>
             <View style={styles.inputContainer}>
                <Feather name="phone" size={22} color="#8A8A8E" style={styles.menuIcon} />
                <TextInput style={styles.input} value={mobile} onChangeText={setMobile} placeholder="Mobile Number" keyboardType="phone-pad"/>
            </View>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
            <Text style={styles.registerButtonText}>Registration</Text>
        </TouchableOpacity>
        
        <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or continue with</Text>
            <View style={styles.separatorLine} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Image 
                source={{ uri: 'https://i.ibb.co/j82DCcR/google-logo-png-29546.png' }} 
                style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
                <Text style={[styles.loginText, styles.loginLink]}>Login here</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegistrationScreen;

