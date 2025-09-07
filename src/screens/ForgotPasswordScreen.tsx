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
import { useRouter } from 'expo-router';



const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const handleNext = () => {
    console.log('OTP request for email:', email);
    // Future: Add OTP sending logic and navigate to the OTP screen
    router.push('/otp-verification');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
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
        <View style={styles.imageContainer}>
            <Image 
                source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_Wffhh5HVBrNvJs06laD4W-Ua3jaD2HEpsUgdP0cAPZ3tptG7Vnt2cRXHV5yFzVqjYBQ&usqp=CAU' }} 
                style={styles.illustration}
            />
        </View>

        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>Please enter your email to get an OTP code to reset your password</Text>

        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#8A8A8E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="ex: user@gmail.com"
            placeholderTextColor="#8A8A8E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
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
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
        backButton: { backgroundColor: '#FFFFFF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8E8' },
        logoContainer: { flexDirection: 'row', width: 36, height: 36, transform: [{ rotate: '45deg' }] },
        logoPart: { width: '50%', height: '50%', backgroundColor: '#00B879' },
        logoPart1: { borderTopLeftRadius: 10 },
        logoPart2: { alignSelf: 'flex-end', borderBottomRightRadius: 10 },
        content: { flex: 1, paddingHorizontal: 25, paddingTop: 20 },
        imageContainer: {
            alignItems: 'center',
            marginVertical: 20,
        },
        illustration: {
            width: width * 0.6,
            height: width * 0.5,
            resizeMode: 'contain',
        },
        title: { fontSize: fontScale(26), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
        subtitle: { fontSize: fontScale(15), color: '#8A8A8E', marginBottom: 35, lineHeight: fontScale(22), textAlign: 'center' },
        inputLabel: { fontSize: fontScale(14), color: '#1C1C1E', marginBottom: 10, fontWeight: '500' },
        inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E8E8E8', paddingHorizontal: 15, marginBottom: 18, height: 56 },
        inputIcon: { marginRight: 10 },
        input: { flex: 1, fontSize: fontScale(16), color: '#1C1C1E' },
        nextButton: { backgroundColor: '#00C851', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginTop: 20, shadowColor: "#00B879", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
        nextButtonText: { color: '#FFFFFF', fontSize: fontScale(18), fontWeight: 'bold' },
    });
}

export default ForgotPasswordScreen;
