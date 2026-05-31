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

import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignupScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("visitor");

  // 🚑 NEW FIELD
  const [car_nb, setCarNb] = useState("");

  const handleSignup = async () => {
    try {
      if (!full_name || !email || !password) {
        return Alert.alert("Error", "Please fill all fields");
      }

      if (role === "ambulance_staff" && !car_nb) {
        return Alert.alert("Error", "Please enter car number");
      }

      const response = await API.post("/auth/register", {
        full_name,
        email,
        password,
        role,
        car_nb: role === "ambulance_staff" ? car_nb : null,
      });

      const { accessToken, refreshToken, user } = response.data;

      // Save tokens
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      Alert.alert("Success", "Account created successfully");

      // Navigate by role
      if (user.role === "visitor") {
        navigation.replace("Main");
      } else if (user.role === "ambulance_staff") {
        navigation.replace("AmbulanceDashboard");
      } else if (user.role === "hospital") {
        navigation.replace("StaffDashboard");
      } else if (user.role === "admin") {
        navigation.replace("AdminDashboard");
      } else {
        Alert.alert("Error", "Unknown role");
      }

      // Alert.alert("Success", response.data.message || "User created");

      // navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        {/* ROLE SELECTOR */}
        <Text style={styles.roleTitle}>Select Role</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === "visitor" && styles.activeRole]}
            onPress={() => setRole("visitor")}
          >
            <Text>Visitor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "ambulance_staff" && styles.activeRole,
            ]}
            onPress={() => setRole("ambulance_staff")}
          >
            <Text>Ambulance</Text>
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#999" />
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={full_name}
            onChangeText={setFullName}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#999" />
          <TextInput
            placeholder="Email Address"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        {/* 🚑 CONDITIONAL FIELD */}
        {role === "ambulance_staff" && (
          <View style={styles.inputContainer}>
            <Ionicons name="car-outline" size={20} color="#999" />
            <TextInput
              placeholder="Car Number"
              style={styles.input}
              value={car_nb}
              onChangeText={setCarNb}
            />
          </View>
        )}

        {/* Signup */}
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Login */}
        <Text style={styles.loginTextSmall}>
          Already have an account?{" "}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
        </Text>
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

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    padding: 12,
  },

  roleTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  roleButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },

  activeRole: {
    backgroundColor: "#d4f5e9",
    borderColor: "#2e8b57",
  },

  signupButton: {
    backgroundColor: "#2e8b57",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },

  signupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  loginTextSmall: {
    textAlign: "center",
    fontSize: 13,
  },

  loginLink: {
    color: "#2e8b57",
    fontWeight: "600",
  },
});
