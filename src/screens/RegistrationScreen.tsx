import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const RegistrationScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const handleRegistration = () => {
    console.log('Registration attempt with:', { name, email, password, mobile });
    // Add your registration logic here
    // After successful registration, replace the auth stack with the main app stack
     router.replace('/(tabs)/dashboard');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  // NEW: Handler for the Google login button
  const handleGoogleLogin = () => {
    console.log('Google Login pressed');
    // Future: Add your Google Sign-In logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8F9" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Join with GreenMind</Text>
        <Text style={styles.subtitle}>Sign up now and start your journey to make the world greener.</Text>

        {/* Name Input */}
        <Text style={styles.inputLabel}>Name</Text>
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#8A8A8E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#8A8A8E"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Email Input */}
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

        {/* Password Input */}
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

        {/* Mobile Number Input */}
        <Text style={styles.inputLabel}>Mobile Number</Text>
        <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={[styles.input, {marginLeft: 10}]}
            placeholder="8982564378"
            placeholderTextColor="#8A8A8E"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
          <Text style={styles.registerButtonText}>Registration</Text>
        </TouchableOpacity>

        {/* --- NEW: Google Login Section --- */}
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
        {/* --- End of Google Login Section --- */}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={[styles.loginText, styles.loginLink]}>Login here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createResponsiveStyles = (width: number) => {
    const fontScale = (size: number) => {
        const scaleFactor = Math.min(width / 375, 1.2);
        return size * scaleFactor;
    }

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: '#F7F8F9' },
        header: { 
            flexDirection: 'row', 
            justifyContent: 'flex-start',
            alignItems: 'center', 
            paddingHorizontal: 20, 
            paddingTop: 20, 
            paddingBottom: 10 
        },
        backButton: { 
            backgroundColor: '#FFFFFF', 
            width: 44, 
            height: 44, borderRadius: 22, 
            justifyContent: 'center', 
            alignItems: 'center', 
            borderWidth: 1, 
            borderColor: '#E8E8E8' 
        },
        content: { 
            flex: 1, 
            paddingHorizontal: 25, 
            paddingTop: 20 
        },
        title: { 
            fontSize: fontScale(26), 
            fontWeight: 'bold', 
            color: '#1C1C1E', 
            marginBottom: 8 
        },
        subtitle: { 
            fontSize: fontScale(15), 
            color: '#8A8A8E', 
            marginBottom: 25, 
            lineHeight: fontScale(22) 
        },
        inputLabel: { 
            fontSize: fontScale(14), 
            color: '#1C1C1E', 
            marginBottom: 10, 
            fontWeight: '500' 
        },
        inputContainer: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#FFFFFF', 
            borderRadius: 14, 
            borderWidth: 1, 
            borderColor: '#E8E8E8', 
            paddingHorizontal: 15, 
            marginBottom: 18, 
            height: 56 
        },
        inputIcon: { 
            marginRight: 10 
        },
        input: { 
            flex: 1, 
            fontSize: fontScale(16), 
            color: '#1C1C1E' 
        },
        countryCode: { 
            fontSize: fontScale(16), 
            color: '#1C1C1E' 
        },
        registerButton: { 
            backgroundColor: '#00C851',
            paddingVertical: 16,
            borderRadius: 30,
            alignItems: 'center',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.35,
            shadowRadius: 3.84,
            elevation: 5, 
        },
        registerButtonText: { 
            color: '#FFFFFF', 
            fontSize: fontScale(18), 
            fontWeight: 'bold' 
        },
        separatorContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 20,
        },
        separatorLine: {
            flex: 1,
            height: 1,
            backgroundColor: '#E8E8E8',
        },
        separatorText: {
            marginHorizontal: 10,
            fontSize: fontScale(14),
            color: '#8A8A8E',
        },
        googleButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E8E8E8',
            borderRadius: 30,
            paddingVertical: 16,
        },
        googleIcon: {
            width: 24,
            height: 24,
            marginRight: 15,
        },
        googleButtonText: {
            color: '#1C1C1E',
            fontSize: fontScale(16),
            fontWeight: '600',
        },
        loginContainer: { 
            flexDirection: 'row', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginTop: 25,
            paddingBottom: 10,
        },
        loginText: { 
            fontSize: fontScale(16), 
            color: '#1C1C1E' 
        },
        loginLink: { 
            color: '#00C851', 
            fontWeight: 'bold' 
        },
    });
}

export default RegistrationScreen;
