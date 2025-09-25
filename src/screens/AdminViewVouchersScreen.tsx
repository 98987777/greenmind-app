// src/screens/AdminViewVouchersScreen.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebaseConfig";

const AdminViewVouchersScreen = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [url, setUrl] = useState("");
  const [expiry, setExpiry] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch vouchers
  const fetchVouchers = async () => {
    try {
      const q = query(collection(db, "vouchers"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setVouchers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch vouchers");
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const resetForm = () => {
    setCode(""); setDescription(""); setDiscount(""); setUrl(""); setExpiry(new Date()); setEditingVoucherId(null);
  };

  const handleEdit = (voucher: any) => {
    setEditingVoucherId(voucher.id);
    setCode(voucher.code);
    setDescription(voucher.description);
    setDiscount(voucher.discount);
    setUrl(voucher.url);
    setExpiry(voucher.expiry?.toDate ? voucher.expiry.toDate() : new Date(voucher.expiry.seconds * 1000));
  };

  const handleUpdate = async () => {
    if (!editingVoucherId) return;
    if (!code || !description || !discount || !url) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await updateDoc(doc(db, "vouchers", editingVoucherId), {
        code, description, discount, url, expiry
      });
      Alert.alert("Updated", "Voucher updated successfully");
      resetForm();
      fetchVouchers();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update voucher");
    }
  };

  const handleDelete = (id: string) => {
    // Double confirmation
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this voucher?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Delete", onPress: () => {
          Alert.alert(
            "Confirm Again",
            "This action cannot be undone. Delete anyway?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", onPress: async () => {
                try {
                  await deleteDoc(doc(db, "vouchers", id));
                  Alert.alert("Deleted", "Voucher deleted successfully");
                  fetchVouchers();
                } catch (err) {
                  console.error(err);
                  Alert.alert("Error", "Failed to delete voucher");
                }
              }, style: "destructive" }
            ]
          )
        }, style: "destructive" }
      ]
    );
  };

  const renderVoucher = ({ item }: { item: any }) => (
    <View style={styles.voucherCard}>
      <Text style={styles.voucherText}><Text style={{ fontWeight: "bold" }}>Code:</Text> {item.code}</Text>
      <Text style={styles.voucherText}><Text style={{ fontWeight: "bold" }}>Description:</Text> {item.description}</Text>
      <Text style={styles.voucherText}><Text style={{ fontWeight: "bold" }}>Discount:</Text> {item.discount}%</Text>
      <Text style={styles.voucherText}><Text style={{ fontWeight: "bold" }}>Expiry:</Text> {item.expiry?.toDate ? item.expiry.toDate().toDateString() : new Date(item.expiry.seconds * 1000).toDateString()}</Text>
      <Text style={[styles.voucherText, { color: "#00C851" }]} onPress={() => item.url && window.open(item.url)}>Visit URL</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{editingVoucherId ? "Edit Voucher" : "All Vouchers"}</Text>

      {editingVoucherId && (
        <>
          <TextInput style={styles.input} placeholder="Voucher Code" value={code} onChangeText={setCode} />
          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
          <TextInput style={styles.input} placeholder="Discount" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="URL" value={url} onChangeText={setUrl} />
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text>{expiry.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={expiry} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setExpiry(d); }} />
          )}
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpdate}>
            <Text style={styles.uploadButtonText}>Update Voucher</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.uploadButton, { backgroundColor: "#888" }]} onPress={resetForm}>
            <Text style={styles.uploadButtonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      <FlatList data={vouchers} keyExtractor={item => item.id} renderItem={renderVoucher} scrollEnabled={false} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#00C851" },
  voucherCard: { padding: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginTop: 10 },
  voucherText: { fontSize: 14, marginBottom: 5 },
  editButton: { flex: 1, backgroundColor: "#FFA500", padding: 10, borderRadius: 50, alignItems: "center", marginRight: 5 },
  deleteButton: { flex: 1, backgroundColor: "#FF0000", padding: 10, borderRadius: 50, alignItems: "center", marginLeft: 5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginTop: 10 },
  dateButton: { padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginTop: 10 },
  uploadButton: { marginTop: 20, backgroundColor: "#00C851", padding: 15, borderRadius: 10, alignItems: "center" },
  uploadButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

export default AdminViewVouchersScreen;
