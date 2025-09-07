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
  Modal,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

// This function now lives outside the component, so it can be used safely.
const createResponsiveStyles = (width: number) => {
    const fontScale = (size: number) => {
        const scaleFactor = Math.min(width / 375, 1.2);
        return size * scaleFactor;
    }

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: '#FFFFFF' },
        header: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
        backButton: { backgroundColor: '#F7F8F9', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8E8' },
        content: { flex: 1, paddingHorizontal: 25, paddingTop: 10 },
        imageContainer: { alignItems: 'center', marginVertical: 15, height: width * 0.5 },
        illustration: { width: width * 0.5, height: '100%', resizeMode: 'contain' },
        title: { fontSize: fontScale(26), fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
        subtitle: { fontSize: fontScale(15), color: '#8A8A8E', marginBottom: 30, textAlign: 'center' },
        inputLabel: { fontSize: fontScale(14), color: '#1C1C1E', marginBottom: 10, fontWeight: '500' },
        inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8F9', borderRadius: 14, borderWidth: 1, borderColor: '#E8E8E8', paddingHorizontal: 15, marginBottom: 20, height: 56 },
        inputIcon: { marginRight: 10 },
        input: { flex: 1, fontSize: fontScale(16), color: '#1C1C1E' },
        confirmButton: { backgroundColor: '#00C851', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginTop: 20, shadowColor: "#00B879", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
        confirmButtonText: { color: '#FFFFFF', fontSize: fontScale(18), fontWeight: 'bold' },
        modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
        modalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
        modalIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#00C851', justifyContent: 'center', alignItems: 'center', marginBottom: 20, },
        modalTitle: { fontSize: fontScale(20), fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center', marginBottom: 25, },
        modalButton: { backgroundColor: '#00C851', paddingVertical: 14, borderRadius: 30, alignItems: 'center', width: '100%', },
        modalButtonText: { color: '#FFFFFF', fontSize: fontScale(16), fontWeight: 'bold', },
    });
}

const CreateNewPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  const handleConfirm = () => {
    console.log('New Password:', newPassword);
    setIsModalVisible(true);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleContinue = () => {
    setIsModalVisible(false);
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <View style={styles.modalIconContainer}>
                    <Feather name="check" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Password Reset Successfully</Text>
                <TouchableOpacity style={styles.modalButton} onPress={handleContinue}>
                    <Text style={styles.modalButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
            <Image 
                source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg0Qnz_ZTa0VyvJsiKq99E_HOvldTzQr6ZHw&s' }} 
                style={styles.illustration}
            />
        </View>

        <Text style={styles.title}>Create a New Password</Text>
        <Text style={styles.subtitle}>Create your new password.</Text>

        <Text style={styles.inputLabel}>New Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#8A8A8E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#8A8A8E"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!isNewPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}>
            <Feather name={isNewPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#8A8A8E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#8A8A8E" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#8A8A8E"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
            <Feather name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={20} color="# " />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateNewPasswordScreen;
