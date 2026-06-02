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

const PRIMARY_COLOR = "#2d857c";

export default function AmbulanceStaffScreen() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [vitals, setVitals] = useState({ heartRate: "", bp: "", oxygen: "" });
  const [logs, setLogs] = useState([]);

  // Backend-linked emergency state
  const [emergencyId, setEmergencyId] = useState(null);  // ID of accepted emergency
  const [pendingEmergencies, setPendingEmergencies] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);

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
      console.log("Failed to fetch emergencies:", e.response?.data || e.message);
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
      Alert.alert("Error", e.response?.data?.message || "Could not accept emergency");
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

    setIsEmergency(false);
    setEmergencyId(null);
    setLogs([]);

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
                <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 10 }} />
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
              style={[
                styles.primaryButton,
                savingVitals && { opacity: 0.7 },
              ]}
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
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 6 },
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
});
