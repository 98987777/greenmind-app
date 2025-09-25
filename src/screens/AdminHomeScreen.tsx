// src/screens/AdminHomeScreen.tsx
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseConfig";

const AdminHomeScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to logout");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F9" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage vouchers and users easily</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={[styles.card, { backgroundColor: "#00C851" }]} onPress={() => router.push("/admin-upload")}>
            <Text style={styles.cardTitle}>Upload Voucher</Text>
            <Text style={styles.cardSubtitle}>Create a new voucher</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: "#FFA500" }]} onPress={() => router.push("/admin-view-vouchers")}>
            <Text style={styles.cardTitle}>View Vouchers</Text>
            <Text style={styles.cardSubtitle}>Edit or delete existing vouchers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: "#b50000ff" }]} onPress={handleLogout}>
            <Text style={styles.cardTitle}>Logout</Text>
            <Text style={styles.cardSubtitle}>Sign out from admin account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#8A8A8E",
    marginBottom: 30,
    textAlign: "center",
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
});

export default AdminHomeScreen;
