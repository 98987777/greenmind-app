// src/screens/AdminUploadScreen.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { db } from "../firebaseConfig";

const AdminUploadScreen = () => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [url, setUrl] = useState("");
  const [expiry, setExpiry] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);

  const resetForm = () => {
    setCode(""); setDescription(""); setDiscount(""); setUrl(""); setExpiry(new Date()); setEditingVoucherId(null);
  };

  const handleUpload = async () => {
    if (!code || !description || !discount || !url) {
      Alert.alert("Error", "Please fill all fields including URL");
      return;
    }

    try {
      if (editingVoucherId) {
        await updateDoc(doc(db, "vouchers", editingVoucherId), { code, description, discount, url, expiry });
        Alert.alert("Updated", "Voucher updated successfully");
      } else {
        await addDoc(collection(db, "vouchers"), {
          code, description, discount, url,
          assignedTo: null,
          redeemed: false,
          expiry,
          createdAt: serverTimestamp()
        });
        Alert.alert("Success", "Voucher uploaded successfully!");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to upload/update voucher");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{editingVoucherId ? "Edit Voucher" : "Upload New Voucher"}</Text>

      <Text style={styles.label}>Voucher Code</Text>
      <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="Enter voucher code" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Enter description" />

      <Text style={styles.label}>Discount (%)</Text>
      <TextInput style={styles.input} value={discount} onChangeText={setDiscount} placeholder="Enter discount" keyboardType="numeric" />

      <Text style={styles.label}>URL</Text>
      <TextInput style={styles.input} value={url} onChangeText={setUrl} placeholder="Enter URL" keyboardType="url" autoCapitalize="none" />

      <Text style={styles.label}>Expiry Date</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text>{expiry.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker value={expiry} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setExpiry(d); }} />
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadButtonText}>{editingVoucherId ? "Update Voucher" : "Upload Voucher"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#00C851" },
  label: { fontSize: 16, fontWeight: "600", marginTop: 20, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginTop: 5 },
  dateButton: { padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginTop: 5 },
  uploadButton: { marginTop: 30, backgroundColor: "#00C851", padding: 15, borderRadius: 50, alignItems: "center" },
  uploadButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

export default AdminUploadScreen;
