// screens/PharmacyScreen.js

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Plus } from "lucide-react-native";
import API from "../services/api";
// ─── Change this to your machine's local IP when testing on a physical device ───
// e.g. 'http://192.168.1.10:5000'  (find it with `ipconfig` / `ifconfig`)
// For Android emulator use 'http://10.0.2.2:5000'
// For iOS simulator  use 'http://localhost:5000'
// const API_BASE = 'http://localhost:5000';

const PharmacyScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/products");
      console.log("Products:", JSON.stringify(res.data, null, 2));
      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      setProducts(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError("Could not load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.loadingText}>Loading products…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Quick Pharmacy</Text>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.img_url }} style={styles.prodImg} />
            <Text style={styles.prodName}>{item.name}</Text>
            <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Plus color="#FFF" size={16} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  centered: { justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  loadingText: { marginTop: 12, color: "#666" },
  errorText: { color: "#C0392B", textAlign: "center", marginBottom: 16 },
  retryBtn: {
    backgroundColor: "#2D6A4F",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#FFF", fontWeight: "bold" },
  productCard: {
    backgroundColor: "#FFF",
    flex: 0.5,
    margin: 8,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  prodImg: { width: 100, height: 100, borderRadius: 10 },
  prodName: { fontWeight: "bold", marginTop: 10, textAlign: "center" },
  price: { color: "#2D6A4F", marginTop: 5 },
  addBtn: {
    backgroundColor: "#2D6A4F",
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default PharmacyScreen;
