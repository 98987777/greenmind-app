import React, { useState, useEffect, useRef } from 'react';
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


const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(48);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    console.log('OTP confirmed:', otp.join(''));
    // Navigate to the next screen
    router.push('/create-new-password');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
            <Image 
                source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPYiuOOQIsugDI5FiVZC9JxScqhAPuWuZwng&s' }} 
                style={styles.illustration}
            />
        </View>

        <Text style={styles.title}>OTP code verification</Text>
        <Text style={styles.subtitle}>We have sent the OTP code to your email fajar***@gmail.com.</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {inputs.current[index] = ref}}
              style={[styles.otpInput, {borderColor: digit ? '#00B879' : '#E8E8E8'}]}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit}
            />
          ))}
        </View>
        
        <Text style={styles.resendInfo}>Not receiving emails?</Text>
        <Text style={styles.resendTimer}>
            You can resend the code in <Text style={{color: '#00C851', fontWeight: 'bold'}}>{timer} seconds</Text>
        </Text>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
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
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
        backButton: { backgroundColor: '#F7F8F9', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8E8' },
        content: { flex: 1, paddingHorizontal: 25, paddingTop: 10 },
        imageContainer: { alignItems: 'center', marginVertical: 15 },
        illustration: { width: width * 0.6, height: width * 0.45, resizeMode: 'contain' },
        title: { fontSize: fontScale(26), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
        subtitle: { fontSize: fontScale(15), color: '#8A8A8E', marginBottom: 25, lineHeight: fontScale(22), textAlign: 'center' },
        otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
        otpInput: { width: 48, height: 56, borderWidth: 1, borderRadius: 14, textAlign: 'center', fontSize: fontScale(20), fontWeight: 'bold', color: '#1C1C1E' },
        resendInfo: { textAlign: 'center', color: '#8A8A8E', fontSize: fontScale(14) },
        resendTimer: { textAlign: 'center', color: '#8A8A8E', fontSize: fontScale(14), marginTop: 5, marginBottom: 25 },
        confirmButton: { backgroundColor: '#00C851', paddingVertical: 16, borderRadius: 30, alignItems: 'center', shadowColor: "#00B879", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
        confirmButtonText: { color: '#FFFFFF', fontSize: fontScale(18), fontWeight: 'bold' },
    });
}

export default OtpVerificationScreen;
