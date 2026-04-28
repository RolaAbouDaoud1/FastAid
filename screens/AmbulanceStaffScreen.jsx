import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY_COLOR = "#2d857c";

export default function AmbulanceStaffScreen() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [vitals, setVitals] = useState({ heartRate: "", bp: "", oxygen: "" });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const addLog = (action) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLogs([{ action, timestamp }, ...logs]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Dashboard</Text>

          {/* Emergency Toggle (High Priority) */}
          <View style={[styles.card, isEmergency && styles.emergencyCard]}>
            <View style={styles.row}>
              <View>
                <Text style={styles.cardTitle}>Emergency Mode</Text>
                <Text style={styles.subText}>Active ambulance alerts</Text>
              </View>
              <Switch
                value={isEmergency}
                onValueChange={setIsEmergency}
                trackColor={{ false: "#ccc", true: "#ff6b6b" }}
                thumbColor={isEmergency ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* ID Scanner */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Patient National ID</Text>
            <TouchableOpacity onPress={pickImage} style={styles.scannerBox}>
              {image ? (
                <Image source={{ uri: image }} style={styles.fullImage} />
              ) : (
                <>
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={PRIMARY_COLOR}
                  />
                  <Text style={styles.scanText}>Tap to Scan ID</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Chat */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Incident Timeline</Text>

            <View style={styles.logButtonsRow}>
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => addLog("Arrived at Scene")}
              >
                <Text style={styles.logButtonText}>Scene</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => addLog("Patient Contact")}
              >
                <Text style={styles.logButtonText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => addLog("Handover")}
              >
                <Text style={styles.logButtonText}>Handover</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.logList}>
              {logs.length === 0 && (
                <Text style={styles.subText}>No events logged yet.</Text>
              )}
              {logs.map((log, index) => (
                <View key={index} style={styles.logItem}>
                  <Text style={styles.logTime}>{log.timestamp}</Text>
                  <Text style={styles.logAction}>{log.action}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Vitals Grid */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Vitals</Text>
            <View style={styles.vitalsGrid}>
              <TextInput
                style={styles.vitalInput}
                placeholder="HR"
                keyboardType="numeric"
                onChangeText={(t) => setVitals({ ...vitals, heartRate: t })}
              />
              <TextInput
                style={styles.vitalInput}
                placeholder="BP"
                keyboardType="numeric"
                onChangeText={(t) => setVitals({ ...vitals, bp: t })}
              />
              <TextInput
                style={styles.vitalInput}
                placeholder="O2%"
                keyboardType="numeric"
                onChangeText={(t) => setVitals({ ...vitals, oxygen: t })}
              />
            </View>
          </View>

          {/* Map Section */}
          <View style={[styles.card, { marginBottom: 30 }]}>
            <Text style={styles.cardTitle}>Live Location</Text>
            {location && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker coordinate={location} pinColor={PRIMARY_COLOR} />
              </MapView>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1, padding: 15 },
  header: { fontSize: 28, fontWeight: "800", color: "#333", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emergencyCard: { borderColor: "#ff6b6b", borderWidth: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  subText: { fontSize: 12, color: "#777", marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Scanner
  scannerBox: {
    height: 150,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#f0faf9",
  },
  fullImage: { width: "100%", height: "100%", borderRadius: 10 },
  scanText: { marginTop: 8, color: PRIMARY_COLOR, fontWeight: "600" },

  // Inputs
  input: {
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  vitalsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  vitalInput: {
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    textAlign: "center",
  },

  // Buttons
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  map: { width: "100%", height: 180, borderRadius: 12, marginTop: 10 },
  logButtonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  logButton: { 
    backgroundColor: "#e0f2f1", 
    padding: 10, 
    borderRadius: 8, 
    width: "30%", 
    alignItems: "center" 
  },
  logButtonText: { color: "#2d857c", fontWeight: "600", fontSize: 12 },
  logList: { marginTop: 15 },
  logItem: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  logTime: { fontWeight: "bold", color: "#2d857c", marginRight: 10 },
  logAction: { color: "#333" },
});

// // AmbulanceStaffScreen.js
// // A complete React Native screen for ambulance staff
// // Features:
// // - Scan/upload National ID image
// // - AI Chat input (mock UI for now)
// // - Live location using GPS
// // - Map preview
// // - Extra: Vital signs quick input + emergency toggle

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Button,
//   Image,
//   TextInput,
//   ScrollView,
//   Switch,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as Location from "expo-location";
// import MapView, { Marker } from "react-native-maps";
// import { TouchableOpacity } from "react-native";

// export default function AmbulanceStaffScreen() {
//   const [image, setImage] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [chatInput, setChatInput] = useState("");
//   const [isEmergency, setIsEmergency] = useState(false);
//   const [vitals, setVitals] = useState({ heartRate: "", bp: "", oxygen: "" });

//   // Pick image (simulate ID scan)
//   const pickImage = async () => {
//     let result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   // Get location
//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") return;

//       let loc = await Location.getCurrentPositionAsync({});
//       setLocation(loc.coords);
//     })();
//   }, []);

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>Ambulance Staff Dashboard</Text>

//       {/* ID Scanner */}
//       <View style={styles.card}>
//         <Text style={styles.title}>Patient National ID</Text>

//         <TouchableOpacity onPress={pickImage} style={styles.scannerContainer}>
//           <View style={styles.scannerBox}>
//             <Text style={styles.cameraIcon}>📷</Text>
//             <Text style={styles.scanText}>Tap to Scan</Text>
//           </View>
//         </TouchableOpacity>

//         {image && <Image source={{ uri: image }} style={styles.image} />}
//       </View>

//       {/* AI Chat Section */}
//       <View style={styles.card}>
//         <Text style={styles.title}>AI Medical Assistant</Text>
//         <TextInput
//           placeholder="Describe patient's condition..."
//           style={styles.input}
//           multiline
//           value={chatInput}
//           onChangeText={setChatInput}
//         />
//         <TouchableOpacity style={styles.customButton} onPress={() => {}}>
//           <Text style={styles.buttonText}>Send to AI</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Map Section */}
//       <View style={styles.card}>
//         <Text style={styles.title}>Current Location</Text>
//         {location && (
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: location.latitude,
//               longitude: location.longitude,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }}
//           >
//             <Marker coordinate={location} title="Ambulance" />
//           </MapView>
//         )}
//       </View>

//       {/* Extra Features */}
//       <View style={styles.card}>
//         <Text style={styles.title}>Emergency Mode</Text>
//         <Switch value={isEmergency} onValueChange={setIsEmergency} />
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.title}>Quick Vitals Input</Text>
//         <TextInput
//           placeholder="Heart Rate"
//           style={styles.input}
//           value={vitals.heartRate}
//           onChangeText={(text) => setVitals({ ...vitals, heartRate: text })}
//         />
//         <TextInput
//           placeholder="Blood Pressure"
//           style={styles.input}
//           value={vitals.bp}
//           onChangeText={(text) => setVitals({ ...vitals, bp: text })}
//         />
//         <TextInput
//           placeholder="Oxygen %"
//           style={styles.input}
//           value={vitals.oxygen}
//           onChangeText={(text) => setVitals({ ...vitals, oxygen: text })}
//         />
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: "#f5f6fa",
//     marginTop: 30,
//   },
//   header: { fontSize: 24, fontWeight: "bold", marginBottom: 17 },
//   card: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//   },
//   title: { fontSize: 17, fontWeight: "600", marginBottom: 10 },
//   image: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 10,
//   },
//   map: { width: "100%", height: 200, borderRadius: 10 },

//   buttons: { backgroundColor: "#2d857c" },

//   customButton: {
//     backgroundColor: "#2d857c",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 5,
//   },

//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },

//   scannerContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 15,
//   },

//   scannerBox: {
//     width: 260,
//     height: 200,
//     borderWidth: 2,
//     borderColor: "#2d857c",
//     borderStyle: "dashed",
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#f9fbff",
//   },

//   cameraIcon: {
//     fontSize: 25,
//     marginBottom: 10,
//   },

//   scanText: {
//     fontSize: 14,
//     color: "#555",
//   },
// });
