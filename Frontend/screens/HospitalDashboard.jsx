import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DoctorsContext } from "../context/DoctorsContext";
import API from "../services/api";

const HospitalDashboard = () => {
const { addDoctor: addDoctorToContext } = useContext(DoctorsContext);

  const [totalBeds, setTotalBeds] = useState(100);
  const [availableBeds, setAvailableBeds] = useState(40);

  const [docName, setDocName] = useState("");
  const [docSpec, setDocSpec] = useState("");
  const [image, setImage] = useState(null);

  // ── Incoming emergency (session-only, not stored in DB) ──
  const [hospitalId, setHospitalId] = useState(null);
  const [incomingTrip, setIncomingTrip] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("hospitalId");
      setHospitalId(id);
    })();
  }, []);

  useEffect(() => {
    if (!hospitalId) return;

    const pollTrip = async () => {
      try {
        const res = await API.get(`/trips/${hospitalId}`);
        setIncomingTrip(res.data.trip);
      } catch (e) {
        // No active trip right now, or a transient network issue — ignore
      }
    };

    pollTrip();
    pollRef.current = setInterval(pollTrip, 5000);

    return () => clearInterval(pollRef.current);
  }, [hospitalId]);

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

      {/* INCOMING EMERGENCY — live, session-only, cleared when the trip ends */}
      {incomingTrip && (
        <View style={[styles.card, styles.emergencyCard]}>
          <Text style={styles.section}>🚑 Incoming Emergency</Text>

          {incomingTrip.nationalIdImage && (
            <Image
              source={{ uri: incomingTrip.nationalIdImage }}
              style={styles.idImage}
            />
          )}

          {incomingTrip.predictedDisease && (
            <View style={styles.predictionBox}>
              <Text style={styles.predictionLabel}>AI Predicted Condition</Text>
              <Text style={styles.predictionValue}>
                {incomingTrip.predictedDisease}
              </Text>
            </View>
          )}

          {!!incomingTrip.symptoms && (
            <Text style={styles.symptomsText}>
              Symptoms: {incomingTrip.symptoms}
            </Text>
          )}

          <View style={styles.vitalsRow}>
            <Text style={styles.vitalPill}>
              HR: {incomingTrip.vitals?.heartRate || "—"}
            </Text>
            <Text style={styles.vitalPill}>
              BP: {incomingTrip.vitals?.bp || "—"}
            </Text>
            <Text style={styles.vitalPill}>
              O2: {incomingTrip.vitals?.oxygen || "—"}%
            </Text>
          </View>

          {incomingTrip.ambulanceLocation && (
            <Text style={styles.subText}>
              Ambulance location: {incomingTrip.ambulanceLocation.latitude?.toFixed(4)},{" "}
              {incomingTrip.ambulanceLocation.longitude?.toFixed(4)}
            </Text>
          )}

          <Text style={styles.subText}>
            Last updated:{" "}
            {new Date(incomingTrip.updatedAt).toLocaleTimeString()}
          </Text>
        </View>
      )}

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

/* ---------------- ORIGINAL STYLE + additions ---------------- */
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

  // Incoming emergency
  emergencyCard: {
    borderWidth: 2,
    borderColor: "#ff6b6b",
    backgroundColor: "#fff8f8",
  },
  idImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  predictionBox: {
    backgroundColor: "#f0faf9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  predictionLabel: { fontSize: 11, color: "#777" },
  predictionValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d857c",
    marginTop: 2,
  },
  symptomsText: { fontSize: 13, color: "#444", marginBottom: 10 },
  vitalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  vitalPill: {
    backgroundColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  subText: { fontSize: 11, color: "#999", marginTop: 2 },
});




// import React, { useState, useContext } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { DoctorsContext } from "../context/DoctorsContext";

// const HospitalDashboard = () => {
// const { addDoctor: addDoctorToContext } = useContext(DoctorsContext);

//   const [totalBeds, setTotalBeds] = useState(100);
//   const [availableBeds, setAvailableBeds] = useState(40);

//   const [docName, setDocName] = useState("");
//   const [docSpec, setDocSpec] = useState("");
//   const [image, setImage] = useState(null);

//   const occupancy =
//     totalBeds > 0
//       ? ((totalBeds - availableBeds) / totalBeds) * 100
//       : 0;

//   const emergencyStatus =
//     availableBeds === 0 ? "FULL 🚨" : "OPEN ✅";

//   // ✅ FIXED IMAGE PICKER (NO UI CHANGE)
//   const pickImage = async () => {
//     const permission =
//       await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (!permission.granted) {
//       Alert.alert("Permission needed", "Allow access to photos");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const saveChanges = () => {
//     Alert.alert("Saved", "Hospital updated successfully");
//   };

//   const addDoctor = () => {
//     if (!docName || !docSpec) {
//       Alert.alert("Error", "Fill all fields");
//       return;
//     }

//    addDoctorToContext({
//       id: Date.now().toString(),
//       name: docName,
//       spec: docSpec,
//       image,
//       rating: 5,
//     });

//     setDocName("");
//     setDocSpec("");
//     setImage(null);

//     Alert.alert("Success", "Doctor added");
//   };

//   return (
//     <ScrollView style={styles.container}>

//       <Text style={styles.title}>🏥 Hospital Dashboard</Text>

//       {/* BED SECTION */}
//       <View style={styles.card}>
//         <Text style={styles.section}>Beds Management</Text>

//         <Text>Total Beds</Text>
//         <TextInput
//           value={String(totalBeds)}
//           onChangeText={(v) => setTotalBeds(Number(v))}
//           style={styles.input}
//         />

//         <Text>Available Beds</Text>
//         <TextInput
//           value={String(availableBeds)}
//           onChangeText={(v) => setAvailableBeds(Number(v))}
//           style={styles.input}
//         />

//         <Text>Occupancy: {occupancy.toFixed(1)}%</Text>
//         <Text>Status: {emergencyStatus}</Text>

//         <TouchableOpacity style={styles.btn} onPress={saveChanges}>
//           <Text style={styles.btnText}>Save Changes</Text>
//         </TouchableOpacity>
//       </View>

//       {/* DEPARTMENTS */}
//       <View style={styles.card}>
//         <Text style={styles.section}>Departments</Text>
//         <Text>• Emergency</Text>
//         <Text>• ICU</Text>
//         <Text>• General</Text>
//       </View>

//       {/* ADD DOCTOR */}
//       <View style={styles.card}>
//         <Text style={styles.section}>Add Doctor</Text>

//         <TextInput
//           placeholder="Doctor Name"
//           value={docName}
//           onChangeText={setDocName}
//           style={styles.input}
//         />

//         <TextInput
//           placeholder="Specialization"
//           value={docSpec}
//           onChangeText={setDocSpec}
//           style={styles.input}
//         />

//         <TouchableOpacity style={styles.btn} onPress={pickImage}>
//           <Text style={styles.btnText}>Select Image</Text>
//         </TouchableOpacity>

//         {image && <Text>Image selected ✔</Text>}

//         <TouchableOpacity style={styles.btn} onPress={addDoctor}>
//           <Text style={styles.btnText}>Add Doctor</Text>
//         </TouchableOpacity>
//       </View>

//     </ScrollView>
//   );
// };

// export default HospitalDashboard;

// /* ---------------- ORIGINAL STYLE ---------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f4f6fb",
//     padding: 15,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 15,
//   },
//   section: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 5,
//     marginBottom: 10,
//   },
//   btn: {
//     backgroundColor: "#2e8b57",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });