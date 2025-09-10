import { Feather, Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { auth } from "../firebaseConfig"; // your firebase config

// This is required to close the browser window after auth
WebBrowser.maybeCompleteAuthSession();

const createResponsiveStyles = (width: number) => {
  const fontScale = (size: number) => {
    const scaleFactor = Math.min(width / 375, 1.2);
    return size * scaleFactor;
  };
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F7F8F9" },
    header: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    backButton: {
      backgroundColor: "#FFFFFF",
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E8E8E8",
    },
    content: { flex: 1, paddingHorizontal: 25, paddingTop: 20 },
    title: {
      fontSize: fontScale(28),
      fontWeight: "bold",
      color: "#1C1C1E",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: fontScale(16),
      color: "#8A8A8E",
      marginBottom: 30,
    },
    inputLabel: {
      fontSize: fontScale(14),
      color: "#1C1C1E",
      marginBottom: 10,
      fontWeight: "500",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#E8E8E8",
      paddingHorizontal: 15,
      marginBottom: 20,
      height: 56,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: fontScale(16), color: "#1C1C1E" },
    forgotPasswordText: {
      fontSize: fontScale(14),
      color: "#8A8A8E",
      textAlign: "right",
      marginBottom: 30,
      fontWeight: "500",
    },
    loginButton: {
      backgroundColor: "#00C851",
      paddingVertical: 16,
      borderRadius: 30,
      alignItems: "center",
      shadowColor: "#00C851",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: fontScale(18),
      fontWeight: "bold",
    },
    separatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 25,
    },
    separatorLine: { flex: 1, height: 1, backgroundColor: "#E8E8E8" },
    separatorText: {
      marginHorizontal: 10,
      fontSize: fontScale(14),
      color: "#8A8A8E",
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E8E8E8",
      borderRadius: 30,
      paddingVertical: 16,
      marginBottom: 30,
    },
    googleIcon: { width: 24, height: 24, marginRight: 15 },
    googleButtonText: {
      color: "#1C1C1E",
      fontSize: fontScale(16),
      fontWeight: "600",
    },
    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 10,
    },
    registerText: { fontSize: fontScale(16), color: "#1C1C1E" },
    registerLink: { color: "#00C851", fontWeight: "bold" },
  });
};

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = createResponsiveStyles(width);

  // --- Google Auth ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "730432168258-a469kku57b6o8ei62po1hjunrpoef2og.apps.googleusercontent.com",
    androidClientId:
      "7730432168258-896m0r4hefstrv0l7ro6ututu99c9dft.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success" && response.authentication?.idToken) {
      const { idToken } = response.authentication;
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential)
        .then(() => {
          router.replace("/(tabs)/dashboard");
        })
        .catch((error) => {
          console.error("Firebase sign-in error", error);
          Alert.alert("Login Failed", "Could not sign in with Google.");
        });
    } else if (response?.type === "error") {
      Alert.alert("Login Failed", "An error occurred during authentication.");
    }
  }, [response]);

  // --- Email/Password Login ---
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both email and password."
      );
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Logged in user:", userCredential.user.uid);
        router.replace("/(tabs)/dashboard");
      })
      .catch(() => {
        Alert.alert(
          "Login Failed",
          "Invalid email or password. Please try again."
        );
      });
  };

  // --- Forgot Password ---
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Enter Email", "Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset link sent to your email.");
    } catch (error) {
      console.error("Reset error:", error);
      Alert.alert("Error", "Could not send reset email.");
    }
  };

  const handleGoogleLogin = () => promptAsync();
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
          <Feather
            name="mail"
            size={20}
            color="#8A8A8E"
            style={styles.inputIcon}
          />
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
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#8A8A8E"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#8A8A8E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Feather
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color="#8A8A8E"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>or continue with</Text>
          <View style={styles.separatorLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={!request}
        >
          <Image
            source={{
              uri: "https://i.ibb.co/j82DCcR/google-logo-png-29546.png",
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={[styles.registerText, styles.registerLink]}>
              Register here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

