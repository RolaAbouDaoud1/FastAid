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
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";
import { analyzeCase, fetchHospitals } from "../services/medicalAI";
import { useNavigation } from "@react-navigation/native";

const PRIMARY_COLOR = "#2d857c";

// Same identifier logic used everywhere a hospital object is referenced —
// centralizing it here means if your API ever changes _id -> id you fix it once.
const hospitalKey = (hospital) => hospital?._id || hospital?.id;

export default function AmbulanceStaffScreen() {
  const navigation = useNavigation();

  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [vitals, setVitals] = useState({ heartRate: "", bp: "", oxygen: "" });
  const [logs, setLogs] = useState([]);

  // Backend-linked emergency state
  const [emergencyId, setEmergencyId] = useState(null); // ID of accepted emergency
  const [pendingEmergencies, setPendingEmergencies] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);

  // ── Symptoms → AI analysis (same service AIHelpScreen uses) ──
  const [symptoms, setSymptoms] = useState("");
  const [predictedDisease, setPredictedDisease] = useState(null);
  const [specialty, setSpecialty] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // ── Hospital selection ─────────────────────────────────────
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [sendingToHospital, setSendingToHospital] = useState(false);

  //to choose the hospital
  const [targetHospital, setTargetHospital] = useState("");

  // ── Get location on mount ─────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // ── Load pending emergencies ──────────────────────────────
  useEffect(() => {
    fetchPendingEmergencies();
  }, []);

  const fetchPendingEmergencies = async () => {
    setLoadingPending(true);
    try {
      const res = await API.get("/emergencies/pending");
      setPendingEmergencies(res.data.emergencies || []);
    } catch (e) {
      console.log(
        "Failed to fetch emergencies:",
        e.response?.data || e.message,
      );
    } finally {
      setLoadingPending(false);
    }
  };

  // ── Accept an emergency dispatch ──────────────────────────
  const acceptEmergency = async (id) => {
    try {
      await API.patch(`/emergencies/${id}/accept`);
      setEmergencyId(id);
      setIsEmergency(true);
      setPendingEmergencies([]);
      addLocalLog("Dispatched");
      Alert.alert("Accepted", "You are now assigned to this emergency");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not accept emergency",
      );
    }
  };

  // ── Log a timeline event locally + push to backend ───────
  const addLocalLog = async (action) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLogs((prev) => [{ action, timestamp }, ...prev]);

    // If we have an accepted emergency, push the event to backend
    if (emergencyId) {
      try {
        await API.patch(`/emergencies/${emergencyId}`, {
          timeline_event: action,
        });
      } catch (e) {
        console.log("Timeline push error:", e.message);
      }
    }
  };

  // ── Save vitals to backend ────────────────────────────────
  const saveVitals = async () => {
    if (!emergencyId) {
      Alert.alert("No emergency", "Accept an emergency first to save vitals");
      return;
    }
    if (!vitals.heartRate && !vitals.bp && !vitals.oxygen) {
      Alert.alert("Empty", "Enter at least one vital before saving");
      return;
    }
    setSavingVitals(true);
    try {
      await API.patch(`/emergencies/${emergencyId}`, {
        vitals: {
          heart_rate: vitals.heartRate,
          blood_pressure: vitals.bp,
          oxygen: vitals.oxygen,
        },
      });
      Alert.alert("Saved", "Vitals sent to hospital");
    } catch (e) {
      Alert.alert("Error", "Could not save vitals");
    } finally {
      setSavingVitals(false);
    }
  };

  // ── Run the same AI analysis AIHelpScreen uses, then load hospitals ──
  const runAIAnalysis = async () => {
    if (!symptoms.trim()) {
      Alert.alert("Missing info", "Enter the patient's symptoms first");
      return;
    }
    setAnalyzing(true);
    try {
      const analysis = await analyzeCase(symptoms, location);
      setPredictedDisease(analysis.disease);
      setSpecialty(analysis.specialty);

      let hospitals = analysis.hospitals;
      if (!hospitals.length) {
        hospitals = await fetchHospitals(analysis.specialty, location);
      }

      setNearbyHospitals(hospitals);
      // Pre-select the top match, staff can still tap another one
      setSelectedHospital(hospitals[0] || null);
    } catch (e) {
      Alert.alert("Error", "Could not analyze symptoms right now");
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Fallback: search nearest hospitals without waiting on symptoms ──
  const searchNearestHospitals = async () => {
    if (!location) {
      Alert.alert("Location needed", "Still getting your GPS location...");
      return;
    }
    setLoadingHospitals(true);
    try {
      const hospitals = await fetchHospitals(specialty, location);
      setNearbyHospitals(hospitals);
      setSelectedHospital(hospitals[0] || null);
    } catch (e) {
      Alert.alert("Error", "Could not load nearby hospitals");
    } finally {
      setLoadingHospitals(false);
    }
  };

  // ── Send the current patient data package to the chosen hospital ──
  // This does NOT get saved to the database — it just populates that
  // hospital's live "incoming emergency" session for this trip.
  const sendPatientDataToHospital = async () => {
    if (!selectedHospital) {
      Alert.alert("No hospital selected", "Choose a hospital first");
      return;
    }
    const id = hospitalKey(selectedHospital);
    if (!id) {
      Alert.alert("Error", "This hospital record is missing an ID");
      return;
    }
    setSendingToHospital(true);
    try {
      await API.post(`/trips/${id}`, {
        emergencyId,
        nationalIdImage: image,
        vitals,
        predictedDisease,
        specialty,
        symptoms,
        ambulanceLocation: location,
      });
      addLocalLog(`Patient data sent to ${selectedHospital.name}`);
      Alert.alert("Sent", `Patient data sent to ${selectedHospital.name}`);
    } catch (e) {
      // Alert.alert("Error", "Could not send data to the hospital");
       console.log("SEND TO HOSPITAL ERROR:", e.response?.status, e.response?.data || e.message);
       Alert.alert("Error", e.response?.data?.message || e.message || "Could not send data to the hospital");
    } finally {
      setSendingToHospital(false);
    }
  };

  const startEmergency = async () => {
    try {
      setIsEmergency(true);
      addLocalLog("Emergency Started");

      Alert.alert("Emergency Mode", "Emergency mode activated");
    } catch (e) {
      Alert.alert("Error", "Could not activate emergency mode");
    }
  };

  // ── Mark emergency as complete ────────────────────────────
  const completeEmergency = async () => {
    try {
      if (emergencyId) {
        await API.patch(`/emergencies/${emergencyId}`, {
          status: "completed",
          timeline_event: "Patient handed over to hospital",
        });
      }

      // Clear the hospital's live session data — the trip is over,
      // nothing about it needs to persist beyond this point.
      const id = hospitalKey(selectedHospital);
      if (id) {
        await API.delete(`/trips/${id}`).catch(() => {});
      }

      setIsEmergency(false);
      setEmergencyId(null);
      setLogs([]);
      setSymptoms("");
      setPredictedDisease(null);
      setSpecialty(null);
      setNearbyHospitals([]);
      setSelectedHospital(null);

      Alert.alert("Done", "Emergency marked as complete");
      fetchPendingEmergencies();
    } catch (e) {
      Alert.alert("Error", "Could not complete emergency");
    }
  };

  // ── Scan National ID ──────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Ambulance Dashboard</Text>

          <View style={styles.container}>
            <View style={styles.card1}>
              <Text style={styles.icon}>🤖</Text>

              <Text style={styles.title}>
                Use AI for Better Disease Selection
              </Text>

              <Text style={styles.description}>
                Let our AI analyze symptoms and suggest the most likely disease,
                helping you find the right healthcare guidance faster.
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("AIHelpScreen")}
              >
                <Text style={styles.aibuttonText}>Try AI Prediction</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Emergency toggle / status ──────────────────── */}
          <View style={[styles.card, isEmergency && styles.emergencyCard]}>
            <View style={styles.row}>
              <View>
                <Text style={styles.cardTitle}>Emergency Mode</Text>
                <Text style={styles.subText}>
                  {isEmergency
                    ? `Active — ID: ${emergencyId?.slice(-6)}`
                    : "No active emergency"}
                </Text>
              </View>
              <Switch
                value={isEmergency}
                onValueChange={(value) => {
                  if (value) {
                    startEmergency();
                  } else {
                    completeEmergency();
                  }
                }}
                trackColor={{ false: "#ccc", true: "#ff6b6b" }}
                thumbColor={isEmergency ? "#fff" : "#f4f3f4"}
              />
            </View>

            {isEmergency && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={completeEmergency}
              >
                <Text style={styles.completeBtnText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Pending emergencies (only shown when not active) ── */}
          {!isEmergency && (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>Pending Dispatches</Text>
                <TouchableOpacity onPress={fetchPendingEmergencies}>
                  <Text style={{ color: PRIMARY_COLOR, fontWeight: "600" }}>
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>

              {loadingPending ? (
                <ActivityIndicator
                  color={PRIMARY_COLOR}
                  style={{ marginTop: 10 }}
                />
              ) : pendingEmergencies.length === 0 ? (
                <Text style={[styles.subText, { marginTop: 10 }]}>
                  No pending emergencies.
                </Text>
              ) : (
                pendingEmergencies.map((em) => (
                  <View key={em._id} style={styles.emergencyItem}>
                    <Text style={styles.emergencyLoc}>
                      📍 Lat: {em.location.lat.toFixed(4)} | Lng:{" "}
                      {em.location.lng.toFixed(4)}
                    </Text>
                    <Text style={styles.emergencyTime}>
                      {new Date(em.createdAt).toLocaleTimeString()}
                    </Text>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => acceptEmergency(em._id)}
                    >
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {/* ── National ID Scanner ───────────────────────── */}
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

          {/* ── Symptoms + AI analysis (same service as AIHelpScreen) ── */}
          {isEmergency && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Patient Symptoms</Text>
              <TextInput
                placeholder="e.g. chest pain, shortness of breath, dizziness..."
                value={symptoms}
                onChangeText={setSymptoms}
                multiline
                style={styles.symptomsInput}
              />
              <TouchableOpacity
                style={[styles.primaryButton, analyzing && { opacity: 0.7 }]}
                onPress={runAIAnalysis}
                disabled={analyzing}
              >
                <Text style={styles.buttonText}>
                  {analyzing ? "Analyzing..." : "Analyze & Find Hospitals"}
                </Text>
              </TouchableOpacity>

              {predictedDisease && (
                <View style={styles.predictionBox}>
                  <Text style={styles.predictionLabel}>
                    AI Predicted Condition
                    {specialty ? ` · ${specialty}` : ""}
                  </Text>
                  <Text style={styles.predictionValue}>
                    {predictedDisease}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Hospital selection ────────────────────────── */}
          {isEmergency && (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>Choose Hospital</Text>
                <TouchableOpacity onPress={searchNearestHospitals}>
                  <Text style={{ color: PRIMARY_COLOR, fontWeight: "600" }}>
                    {loadingHospitals ? "Searching..." : "Search Nearest"}
                  </Text>
                </TouchableOpacity>
              </View>

              {(loadingHospitals || analyzing) && (
                <ActivityIndicator
                  color={PRIMARY_COLOR}
                  style={{ marginTop: 10 }}
                />
              )}

              {!loadingHospitals && !analyzing && nearbyHospitals.length === 0 && (
                <Text style={[styles.subText, { marginTop: 10 }]}>
                  Analyze symptoms above, or tap "Search Nearest" to see
                  hospitals without waiting on symptoms.
                </Text>
              )}

              {nearbyHospitals.map((hospital, index) => {
                const id = hospitalKey(hospital);
                const isSelected = hospitalKey(selectedHospital) === id;
                return (
                  <TouchableOpacity
                    key={id || index}
                    style={[
                      styles.hospitalItem,
                      isSelected && styles.hospitalItemSelected,
                    ]}
                    onPress={() => setSelectedHospital(hospital)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hospitalName}>
                        {index === 0 ? "⭐ " : ""}
                        {hospital.name}
                      </Text>
                      <Text style={styles.subText}>
                        📍 {hospital.location_name || hospital.address || "Lebanon"}
                      </Text>
                      <Text style={styles.subText}>
                        {hospital.average_rating > 0
                          ? `★ ${hospital.average_rating} · `
                          : ""}
                        {hospital.available_beds ?? "?"} beds free
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={PRIMARY_COLOR}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              {selectedHospital && (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { marginTop: 14 },
                    sendingToHospital && { opacity: 0.7 },
                  ]}
                  onPress={sendPatientDataToHospital}
                  disabled={sendingToHospital}
                >
                  <Text style={styles.buttonText}>
                    {sendingToHospital
                      ? "Sending..."
                      : `Send Patient Data to ${selectedHospital.name}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Incident Timeline ─────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Incident Timeline</Text>
            <View style={styles.logButtonsRow}>
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => addLocalLog("Arrived at Scene")}
              >
                <Text style={styles.logButtonText}>Scene</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => addLocalLog("Patient Contact")}
              >
                <Text style={styles.logButtonText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => addLocalLog("Handover")}
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

          {/* ── Quick Vitals ──────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Vitals</Text>
            <View style={styles.vitalsGrid}>
              <TextInput
                style={styles.vitalInput}
                placeholder="HR"
                keyboardType="numeric"
                value={vitals.heartRate}
                onChangeText={(t) => setVitals({ ...vitals, heartRate: t })}
              />
              <TextInput
                style={styles.vitalInput}
                placeholder="BP"
                value={vitals.bp}
                onChangeText={(t) => setVitals({ ...vitals, bp: t })}
              />
              <TextInput
                style={styles.vitalInput}
                placeholder="O2%"
                keyboardType="numeric"
                value={vitals.oxygen}
                onChangeText={(t) => setVitals({ ...vitals, oxygen: t })}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, savingVitals && { opacity: 0.7 }]}
              onPress={saveVitals}
              disabled={savingVitals}
            >
              <Text style={styles.buttonText}>
                {savingVitals ? "Saving..." : "Save Vitals to Record"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Live Location Map ─────────────────────────── */}
          <View style={[styles.card, { marginBottom: 30 }]}>
            <Text style={styles.cardTitle}>Live Location</Text>
            {location ? (
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
            ) : (
              <Text style={styles.subText}>Getting location...</Text>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  subText: { fontSize: 12, color: "#777", marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completeBtn: {
    backgroundColor: "#ff6b6b",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  completeBtnText: { color: "#fff", fontWeight: "700" },

  // Pending emergencies
  emergencyItem: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#ffd0d0",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  emergencyLoc: { fontSize: 13, fontWeight: "600", color: "#333" },
  emergencyTime: { fontSize: 11, color: "#999", marginTop: 4 },
  acceptBtn: {
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  acceptBtnText: { color: "#fff", fontWeight: "700" },

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

  // Symptoms / AI prediction
  symptomsInput: {
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 12,
    minHeight: 70,
    textAlignVertical: "top",
  },
  predictionBox: {
    backgroundColor: "#f0faf9",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  predictionLabel: { fontSize: 11, color: "#777" },
  predictionValue: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginTop: 2,
  },

  // Hospital selection
  hospitalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  hospitalItemSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#f0faf9",
  },
  hospitalName: { fontSize: 14, fontWeight: "700", color: "#222" },

  // Vitals
  vitalsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 12,
  },
  vitalInput: {
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Timeline
  logButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  logButton: {
    backgroundColor: "#e0f2f1",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  logButtonText: { color: "#2d857c", fontWeight: "600", fontSize: 12 },
  logList: { marginTop: 15 },
  logItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  logTime: { fontWeight: "bold", color: "#2d857c", marginRight: 10 },
  logAction: { color: "#333" },

  map: { width: "100%", height: 180, borderRadius: 12, marginTop: 10 },

  card1: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    fontSize: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  aibuttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});



// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   ScrollView,
//   Switch,
//   TouchableOpacity,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as Location from "expo-location";
// import MapView, { Marker } from "react-native-maps";
// import { Ionicons } from "@expo/vector-icons";
// import API from "../services/api";
// import { useNavigation } from "@react-navigation/native";

// const PRIMARY_COLOR = "#2d857c";

// export default function AmbulanceStaffScreen() {
//   const navigation = useNavigation();

//   const [image, setImage] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [isEmergency, setIsEmergency] = useState(false);
//   const [vitals, setVitals] = useState({ heartRate: "", bp: "", oxygen: "" });
//   const [logs, setLogs] = useState([]);

//   // Backend-linked emergency state
//   const [emergencyId, setEmergencyId] = useState(null); // ID of accepted emergency
//   const [pendingEmergencies, setPendingEmergencies] = useState([]);
//   const [loadingPending, setLoadingPending] = useState(false);
//   const [savingVitals, setSavingVitals] = useState(false);

//   //to choose the hospital
//   const [targetHospital, setTargetHospital] = useState("");

//   // ── Get location on mount ─────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") return;
//       const loc = await Location.getCurrentPositionAsync({});
//       setLocation(loc.coords);
//     })();
//   }, []);

//   // ── Load pending emergencies ──────────────────────────────
//   useEffect(() => {
//     fetchPendingEmergencies();
//   }, []);

//   const fetchPendingEmergencies = async () => {
//     setLoadingPending(true);
//     try {
//       const res = await API.get("/emergencies/pending");
//       setPendingEmergencies(res.data.emergencies || []);
//     } catch (e) {
//       console.log(
//         "Failed to fetch emergencies:",
//         e.response?.data || e.message,
//       );
//     } finally {
//       setLoadingPending(false);
//     }
//   };

//   // ── Accept an emergency dispatch ──────────────────────────
//   const acceptEmergency = async (id) => {
//     try {
//       await API.patch(`/emergencies/${id}/accept`);
//       setEmergencyId(id);
//       setIsEmergency(true);
//       setPendingEmergencies([]);
//       addLocalLog("Dispatched");
//       Alert.alert("Accepted", "You are now assigned to this emergency");
//     } catch (e) {
//       Alert.alert(
//         "Error",
//         e.response?.data?.message || "Could not accept emergency",
//       );
//     }
//   };

//   // ── Log a timeline event locally + push to backend ───────
//   const addLocalLog = async (action) => {
//     const timestamp = new Date().toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//     setLogs((prev) => [{ action, timestamp }, ...prev]);

//     // If we have an accepted emergency, push the event to backend
//     if (emergencyId) {
//       try {
//         await API.patch(`/emergencies/${emergencyId}`, {
//           timeline_event: action,
//         });
//       } catch (e) {
//         console.log("Timeline push error:", e.message);
//       }
//     }
//   };

//   // ── Save vitals to backend ────────────────────────────────
//   const saveVitals = async () => {
//     if (!emergencyId) {
//       Alert.alert("No emergency", "Accept an emergency first to save vitals");
//       return;
//     }
//     if (!vitals.heartRate && !vitals.bp && !vitals.oxygen) {
//       Alert.alert("Empty", "Enter at least one vital before saving");
//       return;
//     }
//     setSavingVitals(true);
//     try {
//       await API.patch(`/emergencies/${emergencyId}`, {
//         vitals: {
//           heart_rate: vitals.heartRate,
//           blood_pressure: vitals.bp,
//           oxygen: vitals.oxygen,
//         },
//       });
//       Alert.alert("Saved", "Vitals sent to hospital");
//     } catch (e) {
//       Alert.alert("Error", "Could not save vitals");
//     } finally {
//       setSavingVitals(false);
//     }
//   };
//   const startEmergency = async () => {
//     try {
//       setIsEmergency(true);
//       addLocalLog("Emergency Started");

//       Alert.alert("Emergency Mode", "Emergency mode activated");
//     } catch (e) {
//       Alert.alert("Error", "Could not activate emergency mode");
//     }
//   };
//   // ── Mark emergency as complete ────────────────────────────
//   const completeEmergency = async () => {
//     try {
//       if (emergencyId) {
//         await API.patch(`/emergencies/${emergencyId}`, {
//           status: "completed",
//           timeline_event: "Patient handed over to hospital",
//         });
//       }

//       setIsEmergency(false);
//       setEmergencyId(null);
//       setLogs([]);

//       Alert.alert("Done", "Emergency marked as complete");
//       fetchPendingEmergencies();
//     } catch (e) {
//       Alert.alert("Error", "Could not complete emergency");
//     }
//   };

//   // ── Scan National ID ──────────────────────────────────────
//   const pickImage = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.8,
//     });
//     if (!result.canceled) setImage(result.assets[0].uri);
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.container}
//       >
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <Text style={styles.header}>Ambulance Dashboard</Text>

//           <View style={styles.container}>
//             <View style={styles.card1}>
//               <Text style={styles.icon}>🤖</Text>

//               <Text style={styles.title}>
//                 Use AI for Better Disease Selection
//               </Text>

//               <Text style={styles.description}>
//                 Let our AI analyze symptoms and suggest the most likely disease,
//                 helping you find the right healthcare guidance faster.
//               </Text>

//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={() => navigation.navigate("AIHelpScreen")}
//               >
//                 <Text style={styles.aibuttonText}>Try AI Prediction</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* ── Emergency toggle / status ──────────────────── */}
//           <View style={[styles.card, isEmergency && styles.emergencyCard]}>
//             <View style={styles.row}>
//               <View>
//                 <Text style={styles.cardTitle}>Emergency Mode</Text>
//                 <Text style={styles.subText}>
//                   {isEmergency
//                     ? `Active — ID: ${emergencyId?.slice(-6)}`
//                     : "No active emergency"}
//                 </Text>
//               </View>
//               <Switch
//                 value={isEmergency}
//                 onValueChange={(value) => {
//                   if (value) {
//                     startEmergency();
//                   } else {
//                     completeEmergency();
//                   }
//                 }}
//                 trackColor={{ false: "#ccc", true: "#ff6b6b" }}
//                 thumbColor={isEmergency ? "#fff" : "#f4f3f4"}
//               />
//             </View>

//             {isEmergency && (
//               <TouchableOpacity
//                 style={styles.completeBtn}
//                 onPress={completeEmergency}
//               >
//                 <Text style={styles.completeBtnText}>Mark Complete</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* ── Pending emergencies (only shown when not active) ── */}
//           {!isEmergency && (
//             <View style={styles.card}>
//               <View style={styles.row}>
//                 <Text style={styles.cardTitle}>Pending Dispatches</Text>
//                 <TouchableOpacity onPress={fetchPendingEmergencies}>
//                   <Text style={{ color: PRIMARY_COLOR, fontWeight: "600" }}>
//                     Refresh
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {loadingPending ? (
//                 <ActivityIndicator
//                   color={PRIMARY_COLOR}
//                   style={{ marginTop: 10 }}
//                 />
//               ) : pendingEmergencies.length === 0 ? (
//                 <Text style={[styles.subText, { marginTop: 10 }]}>
//                   No pending emergencies.
//                 </Text>
//               ) : (
//                 pendingEmergencies.map((em) => (
//                   <View key={em._id} style={styles.emergencyItem}>
//                     <Text style={styles.emergencyLoc}>
//                       📍 Lat: {em.location.lat.toFixed(4)} | Lng:{" "}
//                       {em.location.lng.toFixed(4)}
//                     </Text>
//                     <Text style={styles.emergencyTime}>
//                       {new Date(em.createdAt).toLocaleTimeString()}
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.acceptBtn}
//                       onPress={() => acceptEmergency(em._id)}
//                     >
//                       <Text style={styles.acceptBtnText}>Accept</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))
//               )}
//             </View>
//           )}

//           {/* ── National ID Scanner ───────────────────────── */}
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>Patient National ID</Text>
//             <TouchableOpacity onPress={pickImage} style={styles.scannerBox}>
//               {image ? (
//                 <Image source={{ uri: image }} style={styles.fullImage} />
//               ) : (
//                 <>
//                   <Ionicons
//                     name="camera-outline"
//                     size={32}
//                     color={PRIMARY_COLOR}
//                   />
//                   <Text style={styles.scanText}>Tap to Scan ID</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>

//           {/* ── Incident Timeline ─────────────────────────── */}
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>Incident Timeline</Text>
//             <View style={styles.logButtonsRow}>
//               <TouchableOpacity
//                 style={styles.logButton}
//                 onPress={() => addLocalLog("Arrived at Scene")}
//               >
//                 <Text style={styles.logButtonText}>Scene</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.logButton}
//                 onPress={() => addLocalLog("Patient Contact")}
//               >
//                 <Text style={styles.logButtonText}>Contact</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.logButton}
//                 onPress={() => addLocalLog("Handover")}
//               >
//                 <Text style={styles.logButtonText}>Handover</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.logList}>
//               {logs.length === 0 && (
//                 <Text style={styles.subText}>No events logged yet.</Text>
//               )}
//               {logs.map((log, index) => (
//                 <View key={index} style={styles.logItem}>
//                   <Text style={styles.logTime}>{log.timestamp}</Text>
//                   <Text style={styles.logAction}>{log.action}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* ── Quick Vitals ──────────────────────────────── */}
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>Quick Vitals</Text>
//             <View style={styles.vitalsGrid}>
//               <TextInput
//                 style={styles.vitalInput}
//                 placeholder="HR"
//                 keyboardType="numeric"
//                 value={vitals.heartRate}
//                 onChangeText={(t) => setVitals({ ...vitals, heartRate: t })}
//               />
//               <TextInput
//                 style={styles.vitalInput}
//                 placeholder="BP"
//                 value={vitals.bp}
//                 onChangeText={(t) => setVitals({ ...vitals, bp: t })}
//               />
//               <TextInput
//                 style={styles.vitalInput}
//                 placeholder="O2%"
//                 keyboardType="numeric"
//                 value={vitals.oxygen}
//                 onChangeText={(t) => setVitals({ ...vitals, oxygen: t })}
//               />
//             </View>

//             <TouchableOpacity
//               style={[styles.primaryButton, savingVitals && { opacity: 0.7 }]}
//               onPress={saveVitals}
//               disabled={savingVitals}
//             >
//               <Text style={styles.buttonText}>
//                 {savingVitals ? "Saving..." : "Save Vitals to Record"}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* ── Live Location Map ─────────────────────────── */}
//           <View style={[styles.card, { marginBottom: 30 }]}>
//             <Text style={styles.cardTitle}>Live Location</Text>
//             {location ? (
//               <MapView
//                 style={styles.map}
//                 initialRegion={{
//                   latitude: location.latitude,
//                   longitude: location.longitude,
//                   latitudeDelta: 0.005,
//                   longitudeDelta: 0.005,
//                 }}
//               >
//                 <Marker coordinate={location} pinColor={PRIMARY_COLOR} />
//               </MapView>
//             ) : (
//               <Text style={styles.subText}>Getting location...</Text>
//             )}
//           </View>

//           <TextInput
//             placeholder="Enter hospital name"
//             value={targetHospital}
//             onChangeText={setTargetHospital}
//             style={styles.input}
//           />
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
//   container: { flex: 1, padding: 15 },
//   header: { fontSize: 28, fontWeight: "800", color: "#333", marginBottom: 20 },
//   card: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   emergencyCard: { borderColor: "#ff6b6b", borderWidth: 2 },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#222",
//     marginBottom: 6,
//   },
//   subText: { fontSize: 12, color: "#777", marginTop: 2 },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   completeBtn: {
//     backgroundColor: "#ff6b6b",
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   completeBtnText: { color: "#fff", fontWeight: "700" },

//   // Pending emergencies
//   emergencyItem: {
//     backgroundColor: "#fff5f5",
//     borderWidth: 1,
//     borderColor: "#ffd0d0",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 10,
//   },
//   emergencyLoc: { fontSize: 13, fontWeight: "600", color: "#333" },
//   emergencyTime: { fontSize: 11, color: "#999", marginTop: 4 },
//   acceptBtn: {
//     backgroundColor: PRIMARY_COLOR,
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   acceptBtnText: { color: "#fff", fontWeight: "700" },

//   // Scanner
//   scannerBox: {
//     height: 150,
//     borderWidth: 2,
//     borderColor: PRIMARY_COLOR,
//     borderStyle: "dashed",
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 12,
//     backgroundColor: "#f0faf9",
//   },
//   fullImage: { width: "100%", height: "100%", borderRadius: 10 },
//   scanText: { marginTop: 8, color: PRIMARY_COLOR, fontWeight: "600" },

//   // Vitals
//   vitalsGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   vitalInput: {
//     backgroundColor: "#f7f7f7",
//     padding: 10,
//     borderRadius: 8,
//     width: "30%",
//     textAlign: "center",
//   },
//   primaryButton: {
//     backgroundColor: PRIMARY_COLOR,
//     padding: 14,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

//   // Timeline
//   logButtonsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   logButton: {
//     backgroundColor: "#e0f2f1",
//     padding: 10,
//     borderRadius: 8,
//     width: "30%",
//     alignItems: "center",
//   },
//   logButtonText: { color: "#2d857c", fontWeight: "600", fontSize: 12 },
//   logList: { marginTop: 15 },
//   logItem: {
//     flexDirection: "row",
//     paddingVertical: 8,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#eee",
//   },
//   logTime: { fontWeight: "bold", color: "#2d857c", marginRight: 10 },
//   logAction: { color: "#333" },

//   map: { width: "100%", height: 180, borderRadius: 12, marginTop: 10 },

//   card1: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     padding: 25,
//     alignItems: "center",
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   icon: {
//     fontSize: 50,
//     marginBottom: 15,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1E293B",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   description: {
//     fontSize: 14,
//     color: "#64748B",
//     textAlign: "center",
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: PRIMARY_COLOR,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 12,
//   },
//   aibuttonText: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
