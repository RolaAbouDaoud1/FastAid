import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { DoctorsContext } from "../context/DoctorsContext";

const HospitalDashboard = () => {
const { addDoctor: addDoctorToContext } = useContext(DoctorsContext);

  const [totalBeds, setTotalBeds] = useState(100);
  const [availableBeds, setAvailableBeds] = useState(40);

  const [docName, setDocName] = useState("");
  const [docSpec, setDocSpec] = useState("");
  const [image, setImage] = useState(null);

  const occupancy =
    totalBeds > 0
      ? ((totalBeds - availableBeds) / totalBeds) * 100
      : 0;

  const emergencyStatus =
    availableBeds === 0 ? "FULL 🚨" : "OPEN ✅";

  // ✅ FIXED IMAGE PICKER (NO UI CHANGE)
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveChanges = () => {
    Alert.alert("Saved", "Hospital updated successfully");
  };

  const addDoctor = () => {
    if (!docName || !docSpec) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

   addDoctorToContext({
      id: Date.now().toString(),
      name: docName,
      spec: docSpec,
      image,
      rating: 5,
    });

    setDocName("");
    setDocSpec("");
    setImage(null);

    Alert.alert("Success", "Doctor added");
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>🏥 Hospital Dashboard</Text>

      {/* BED SECTION */}
      <View style={styles.card}>
        <Text style={styles.section}>Beds Management</Text>

        <Text>Total Beds</Text>
        <TextInput
          value={String(totalBeds)}
          onChangeText={(v) => setTotalBeds(Number(v))}
          style={styles.input}
        />

        <Text>Available Beds</Text>
        <TextInput
          value={String(availableBeds)}
          onChangeText={(v) => setAvailableBeds(Number(v))}
          style={styles.input}
        />

        <Text>Occupancy: {occupancy.toFixed(1)}%</Text>
        <Text>Status: {emergencyStatus}</Text>

        <TouchableOpacity style={styles.btn} onPress={saveChanges}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      {/* DEPARTMENTS */}
      <View style={styles.card}>
        <Text style={styles.section}>Departments</Text>
        <Text>• Emergency</Text>
        <Text>• ICU</Text>
        <Text>• General</Text>
      </View>

      {/* ADD DOCTOR */}
      <View style={styles.card}>
        <Text style={styles.section}>Add Doctor</Text>

        <TextInput
          placeholder="Doctor Name"
          value={docName}
          onChangeText={setDocName}
          style={styles.input}
        />

        <TextInput
          placeholder="Specialization"
          value={docSpec}
          onChangeText={setDocSpec}
          style={styles.input}
        />

        <TouchableOpacity style={styles.btn} onPress={pickImage}>
          <Text style={styles.btnText}>Select Image</Text>
        </TouchableOpacity>

        {image && <Text>Image selected ✔</Text>}

        <TouchableOpacity style={styles.btn} onPress={addDoctor}>
          <Text style={styles.btnText}>Add Doctor</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

export default HospitalDashboard;

/* ---------------- ORIGINAL STYLE ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  section: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#2e8b57",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});