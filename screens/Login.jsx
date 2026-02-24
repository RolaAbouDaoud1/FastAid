import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function LoginScreen({navigation}) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        
        {/* Title */}
        <Text style={styles.title}>Login</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#999" />
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" />
          <TextInput
            placeholder="Enter your password"
            style={styles.input}
            secureTextEntry={!passwordVisible}
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

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* Sign up */}
        <Text style={styles.signupText}>
          Don’t have an account? <Text
  style={styles.signupLink}
  onPress={() => navigation.navigate("Signup")}
>
  Sign up
</Text>
        </Text>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="google" size={18} color="#DB4437" />
            <Text style={styles.socialText}> Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="apple" size={18} color="#000" />
            <Text style={styles.socialText}> Sign in with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={18} color="#1877F2" />
            <Text style={styles.socialText}> Sign in with Facebook</Text>
          </TouchableOpacity>
        </View>
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
  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#2e8b57",
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: "#2e8b57",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 13,
  },
  signupLink: {
    color: "#2e8b57",
    fontWeight: "600",
  },
  socialContainer: {
    marginTop: 10,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    marginBottom: 10,
  },
  socialText: {
    fontSize: 14,
  },
});