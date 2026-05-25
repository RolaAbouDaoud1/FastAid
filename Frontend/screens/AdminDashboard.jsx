import React, { useState, useEffect, useRef, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogOut } from "lucide-react-native";

import {
  Star,
  MapPin,
  Trash2,
  Edit3,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react-native";

import API from "../services/api";

const Field = memo(({ label, value, onChange, half, ...rest }) => (
  <View style={[styles.fieldWrap, half && styles.halfFieldWrap]}>
    {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}

    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholderTextColor="#bbb"
      blurOnSubmit={false}
      autoCorrect={false}
      autoCapitalize="none"
      {...rest}
    />
  </View>
));

export default function AdminDashboard({ navigation }) {
  // ── Create form state ──────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    location_name: "",
    location_lat: "",
    location_lng: "",
    departments: "",
    total_beds: "",
    available_beds: "",
  });

  const [showCreateForm, setShowCreateForm] = useState(false);

  // ── Hospital list ──────────────────────────────────────
  const [hospitals, setHospitals] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);

  // ── Edit modal ─────────────────────────────────────────
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  // ── Fetch hospitals ────────────────────────────────────
  const fetchHospitals = async () => {
    setLoadingList(true);

    try {
      const res = await API.get("/hospitals?limit=100");
      setHospitals(res.data.hospitals || []);
    } catch (e) {
      console.log(
        "Failed to load hospitals:",
        e.response?.data || e.message
      );
    } finally {
      setLoadingList(false);
    }
  };

  // ── Create hospital ────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      return Alert.alert(
        "Error",
        "Name, email and password are required"
      );
    }

    setCreating(true);

    try {
      await API.post("/hospitals", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        location_name: form.location_name,
        location_lat: form.location_lat,
        location_lng: form.location_lng,
        departments:
          form.departments || "Emergency,ICU,General",
        total_beds: parseInt(form.total_beds) || 0,
        available_beds:
          parseInt(form.available_beds) || 0,
      });

      Alert.alert("Success", "Hospital created!");

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        location_name: "",
        location_lat: "",
        location_lng: "",
        departments: "",
        total_beds: "",
        available_beds: "",
      });

      setShowCreateForm(false);

      fetchHospitals();
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message ||
          "Failed to create hospital"
      );
    } finally {
      setCreating(false);
    }
  };

  // ── Open edit modal ────────────────────────────────────
  const openEdit = (h) => {
    setEditTarget(h);

    setEditForm({
      name: h.name || "",
      phone: h.phone || "",
      address: h.address || "",
      location_name: h.location_name || "",
      location_lat:
        h.location?.lat?.toString() || "",
      location_lng:
        h.location?.lng?.toString() || "",
      departments: (h.departments || []).join(", "),
      total_beds:
        h.total_beds?.toString() || "",
      available_beds:
        h.available_beds?.toString() || "",
    });
  };

  // ── Save edit ──────────────────────────────────────────
  const handleSaveEdit = async () => {
    setSaving(true);

    try {
      await API.put(`/hospitals/${editTarget._id}`, {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address,
        location_name: editForm.location_name,
        location_lat: editForm.location_lat,
        location_lng: editForm.location_lng,
        departments: editForm.departments
          .split(",")
          .map((d) => d.trim()),

        total_beds:
          parseInt(editForm.total_beds) || 0,

        available_beds:
          parseInt(editForm.available_beds) || 0,
      });

      Alert.alert(
        "Success",
        "Hospital updated successfully"
      );

      setEditTarget(null);

      fetchHospitals();
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message ||
          "Failed to update hospital"
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Delete hospital ────────────────────────────────────
  const handleDelete = (id, name) => {
    Alert.alert(
      "Deactivate Hospital",
      `Deactivate "${name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/hospitals/${id}`);
              fetchHospitals();
            } catch {
              Alert.alert(
                "Error",
                "Failed to deactivate hospital"
              );
            }
          },
        },
      ]
    );
  };

  return (

    
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >

          <View style={styles.headerWrapper}>
  
  {/* <TouchableOpacity
    style={styles.backBtn}
    onPress={() => navigation.goBack()}
  >
    <ArrowLeft size={22} color="#222" />
  </TouchableOpacity>

  <Text style={styles.pageTitle}>
    Admin Dashboard
  </Text> */}

  {/* <TouchableOpacity
    style={styles.logoutBtn}
    onPress={async () => {
      await AsyncStorage.removeItem("token");
      navigation.replace("Login");
    }}
  >
    <LogOut size={22} color="red" />
  </TouchableOpacity> */}

</View>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('FirstScreen')}
            >
              <ArrowLeft size={22} color="#222" />
            </TouchableOpacity>

            <Text style={styles.pageTitle}>
              Admin Dashboard
            </Text>

            <View style={{ width: 40 }} />
          </View>

          {/* CREATE HOSPITAL */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.sectionRow}
              onPress={() =>
                setShowCreateForm((v) => !v)
              }
            >
              <Text style={styles.sectionTitle}>
                ➕ Create Hospital
              </Text>

              {showCreateForm ? (
                <ChevronUp
                  size={20}
                  color="#555"
                />
              ) : (
                <ChevronDown
                  size={20}
                  color="#555"
                />
              )}
            </TouchableOpacity>

            {showCreateForm && (
              <View style={styles.formBody}>
                <Field
                  label="Hospital Name *"
                  value={form.name}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      name: v,
                    })
                  }
                  placeholder="AUBMC"
                />

                <Field
                  label="Email *"
                  value={form.email}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      email: v,
                    })
                  }
                  placeholder="hospital@example.com"
                  keyboardType="email-address"
                />

                <Field
                  label="Password *"
                  value={form.password}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      password: v,
                    })
                  }
                  secureTextEntry
                  placeholder="Password"
                />

                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      phone: v,
                    })
                  }
                  placeholder="+961..."
                />

                <Field
                  label="Address"
                  value={form.address}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      address: v,
                    })
                  }
                  placeholder="Street, City"
                />

                <Field
                  label="City / Area"
                  value={form.location_name}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      location_name: v,
                    })
                  }
                  placeholder="Beirut"
                />

                <View style={styles.rowWrap}>
                  <Field
                    half
                    label="Latitude"
                    value={form.location_lat}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        location_lat: v,
                      })
                    }
                    keyboardType="decimal-pad"
                    placeholder="33.89"
                  />

                  <View style={{ width: 10 }} />

                  <Field
                    half
                    label="Longitude"
                    value={form.location_lng}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        location_lng: v,
                      })
                    }
                    keyboardType="decimal-pad"
                    placeholder="35.47"
                  />
                </View>

                <Field
                  label="Departments"
                  value={form.departments}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      departments: v,
                    })
                  }
                  placeholder="Emergency, ICU..."
                />

                <View style={styles.rowWrap}>
                  <Field
                    half
                    label="Total Beds"
                    value={form.total_beds}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        total_beds: v,
                      })
                    }
                    keyboardType="number-pad"
                    placeholder="100"
                  />

                  <View style={{ width: 10 }} />

                  <Field
                    half
                    label="Available Beds"
                    value={form.available_beds}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        available_beds: v,
                      })
                    }
                    keyboardType="number-pad"
                    placeholder="80"
                  />
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCreate}
                  disabled={creating}
                >
                  <Text style={styles.buttonText}>
                    {creating
                      ? "Creating..."
                      : "Create Hospital"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* HOSPITAL LIST */}
          <View style={styles.card}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>
                🏥 Hospitals ({hospitals.length})
              </Text>

              <TouchableOpacity
                onPress={fetchHospitals}
              >
                <Text style={styles.refreshBtn}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>

            {loadingList ? (
              <ActivityIndicator
                color="#2e8b57"
                style={{ marginTop: 20 }}
              />
            ) : hospitals.length === 0 ? (
              <Text style={styles.emptyText}>
                No hospitals found.
              </Text>
            ) : (
              hospitals.map((h) => (
                <View
                  key={h._id}
                  style={styles.hospitalRow}
                >
                  <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName}>
                      {h.name}
                    </Text>

                    {!!h.location_name && (
                      <View style={styles.subRow}>
                        <MapPin
                          size={12}
                          color="#999"
                        />

                        <Text style={styles.subText}>
                          {h.location_name}
                        </Text>
                      </View>
                    )}

                    <View style={styles.subRow}>
                      <Star
                        size={12}
                        fill="#FFD700"
                        color="#FFD700"
                      />

                      <Text style={styles.subText}>
                        {h.average_rating > 0
                          ? `${h.average_rating} (${h.total_reviews} reviews)`
                          : "No reviews yet"}
                      </Text>
                    </View>

                    <Text style={styles.bedsText}>
                      {h.available_beds}/
                      {h.total_beds} beds available
                    </Text>
                  </View>

                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        openEdit(h)
                      }
                    >
                      <Edit3
                        size={18}
                        color="#4A90E2"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        handleDelete(
                          h._id,
                          h.name
                        )
                      }
                    >
                      <Trash2
                        size={18}
                        color="#E63946"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* EDIT MODAL */}
      <Modal
        visible={!!editTarget}
        transparent
        animationType="slide"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Edit Hospital
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setEditTarget(null)
                  }
                >
                  <X
                    size={24}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
              >
                <Field
                  label="Name"
                  value={editForm.name}
                  onChange={(v) =>
                    setEditForm({
                      ...editForm,
                      name: v,
                    })
                  }
                />

                <Field
                  label="Phone"
                  value={editForm.phone}
                  onChange={(v) =>
                    setEditForm({
                      ...editForm,
                      phone: v,
                    })
                  }
                />

                <Field
                  label="Address"
                  value={editForm.address}
                  onChange={(v) =>
                    setEditForm({
                      ...editForm,
                      address: v,
                    })
                  }
                />

                <View style={styles.rowWrap}>
                  <Field
                    half
                    label="Total Beds"
                    value={
                      editForm.total_beds
                    }
                    onChange={(v) =>
                      setEditForm({
                        ...editForm,
                        total_beds: v,
                      })
                    }
                    keyboardType="number-pad"
                  />

                  <View style={{ width: 10 }} />

                  <Field
                    half
                    label="Available Beds"
                    value={
                      editForm.available_beds
                    }
                    onChange={(v) =>
                      setEditForm({
                        ...editForm,
                        available_beds: v,
                      })
                    }
                    keyboardType="number-pad"
                  />
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSaveEdit}
                  disabled={saving}
                >
                  <Save
                    size={16}
                    color="#fff"
                  />

                  <Text
                    style={[
                      styles.buttonText,
                      { marginLeft: 8 },
                    ]}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </Text>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
headerWrapper: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    marginBottom: 20,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  refreshBtn: {
    color: "#2e8b57",
    fontWeight: "600",
  },

  formBody: {
    marginTop: 16,
  },

  fieldWrap: {
    marginBottom: 14,
  },

  halfFieldWrap: {
    flex: 1,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#FAFAFA",
  },

  rowWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  button: {
    backgroundColor: "#2e8b57",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    flexDirection: "row",
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  emptyText: {
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },

  hospitalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  hospitalInfo: {
    flex: 1,
  },

  hospitalName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  subRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  subText: {
    fontSize: 12,
    color: "#888",
    marginLeft: 4,
  },

  bedsText: {
    fontSize: 12,
    color: "#2e8b57",
    marginTop: 4,
    fontWeight: "600",
  },

  actionBtns: {
    flexDirection: "row",
  },

  iconBtn: {
    padding: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
});