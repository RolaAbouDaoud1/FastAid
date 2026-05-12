import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";

import API from "../services/api";

export default function AdminDashboard() {

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [location_lat, setLocationLat] = useState("");
  const [location_long, setLocationLong] = useState("");

  const handleCreateHospital = async () => {
    try {

      const response = await API.post(
        "/auth/create-hospital",
        {
          full_name,
          email,
          password,
          location_lat,
          location_long,
        }
      );

      Alert.alert(
        "Success",
        response.data.message
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setLocationLat("");
      setLocationLong("");

    } catch (error) {

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create hospital"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.title}>
          Admin Dashboard
        </Text>

        <TextInput
          placeholder="Hospital Name"
          style={styles.input}
          value={full_name}
          onChangeText={setFullName}
        />

        <TextInput
          placeholder="Hospital Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Latitude"
          style={styles.input}
          value={location_lat}
          onChangeText={setLocationLat}
        />

        <TextInput
          placeholder="Longitude"
          style={styles.input}
          value={location_long}
          onChangeText={setLocationLong}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateHospital}
        >
          <Text style={styles.buttonText}>
            Create Hospital
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#2e8b57",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});