// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
// } from "react-native";
// import API from "../services/api";
// import { Alert } from "react-native";
// import { Ionicons, FontAwesome } from "@expo/vector-icons";


// export default function LoginScreen({navigation}) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);

//   const handleLogin = async () => {
//     try {
//       const response = await API.post("/auth/login", {
//         email,
//         password,
//       });

//       const role = response.data.role;

//       Alert.alert("Success", "Login successful");
// await AsyncStorage.setItem('accessToken', response.data.accessToken);
// await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
// await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

//       // ROLE NAVIGATION (FIXED)
//       if (role === "visitor") {
//         navigation.replace("Main");
//       }

//       else if (role === "ambulance_staff") {
//         navigation.replace("AmbulanceDashboard");
//       }
//       else if (role === "hospital") {
//       navigation.replace("StaffDashboard");
//       }

//       else {
//         Alert.alert("Error", "Unknown role");
//       }

//     } catch (error) {
//   console.log("LOGIN ERROR:", error.response?.data || error.message);
//   Alert.alert("Error", JSON.stringify(error.response?.data || error.message));
// }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.card}>
        
//         <Text style={styles.title}>Login</Text>

//         <View style={styles.inputContainer}>
//           <Ionicons name="mail-outline" size={20} color="#999" />
//           <TextInput
//             placeholder="Enter your email"
//             style={styles.input}
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Ionicons name="lock-closed-outline" size={20} color="#999" />
//           <TextInput
//             placeholder="Enter your password"
//             style={styles.input}
//             secureTextEntry={!passwordVisible}
//             value={password}
//             onChangeText={setPassword}
//           />
//           <TouchableOpacity
//             onPress={() => setPasswordVisible(!passwordVisible)}
//           >
//             <Ionicons
//               name={passwordVisible ? "eye-outline" : "eye-off-outline"}
//               size={20}
//               color="#999"
//             />
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.forgotContainer}>
//           <Text style={styles.forgotText}>Forgot Password?</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.loginButton}
//           onPress={handleLogin}
//         >
//           <Text style={styles.loginText}>Login</Text>
//         </TouchableOpacity>

        

//         <Text style={styles.signupText}>
//           Don’t have an account? <Text
//             style={styles.signupLink}
//             onPress={() => navigation.navigate("SignUp")}
//           >
//             Sign up
//           </Text>
//         </Text>

//         <View style={styles.socialContainer}>
//           <TouchableOpacity style={styles.socialButton}>
//             <FontAwesome name="google" size={18} color="#DB4437" />
//             <Text style={styles.socialText}> Sign in with Google</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.socialButton}>
//             <FontAwesome name="apple" size={18} color="#000" />
//             <Text style={styles.socialText}> Sign in with Apple</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.socialButton}>
//             <FontAwesome name="facebook" size={18} color="#1877F2" />
//             <Text style={styles.socialText}> Sign in with Facebook</Text>
//           </TouchableOpacity>
//         </View>
// {/* testing ------------------------------------------------- */}
// <TouchableOpacity
//   style={styles.loginButton}
//   onPress={() => navigation.navigate("AdminDashboard")}
// >
//   <Text style={styles.loginText}>
//     Open Admin Dashboard
//   </Text>
// </TouchableOpacity>
// {/* ______________________________-- */}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f6fa",
//     justifyContent: "center",
//     padding: 20,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 25,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "600",
//     textAlign: "center",
//     marginBottom: 25,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#eee",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     marginBottom: 15,
//   },
//   input: {
//     flex: 1,
//     padding: 12,
//   },
//   forgotContainer: {
//     alignItems: "flex-end",
//     marginBottom: 20,
//   },
//   forgotText: {
//     color: "#2e8b57",
//     fontSize: 13,
//   },
//   loginButton: {
//     backgroundColor: "#2e8b57",
//     padding: 15,
//     borderRadius: 30,
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   loginText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   signupText: {
//     textAlign: "center",
//     marginBottom: 20,
//     fontSize: 13,
//   },
//   signupLink: {
//     color: "#2e8b57",
//     fontWeight: "600",
//   },
//   socialContainer: {
//     marginTop: 10,
//   },
//   socialButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#eee",
//     borderRadius: 12,
//     marginBottom: 10,
//   },
//   socialText: {
//     fontSize: 14,
//   },
//   staffLink: {
//     marginTop: 40,
//     padding: 10,
//     alignSelf: 'center',
//     borderWidth: 1,
//     borderColor: '#DDD',
//     borderRadius: 10,
//     borderStyle: 'dashed',
//   },
//   staffText: {
//     color: '#666',
//     fontSize: 13,
//   },
//   bold: {
//     fontWeight: 'bold',
//     color: '#4A90E2',
//   }
// });

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
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter your email and password");
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/login", { email, password });

      const { accessToken, refreshToken, user } = response.data;

      // ✅ Save tokens and user info so every screen can use them
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // If the logged-in user is a hospital account, also save the hospital id
      if (user.hospital) {
        await AsyncStorage.setItem("hospitalId", user.hospital);
      }

      // Navigate based on role
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
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };
  // Quick-fill admin credentials for testing
  const fillAdmin = () => {
    setEmail("admin@fastaid.lb");
    setPassword("Admin@123");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#999" />
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" />
          <TextInput
            placeholder="Enter your password"
            style={styles.input}
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => navigation.navigate("SignUp")}
          >
            Sign up
          </Text>
        </Text>
                  <TouchableOpacity style={styles.adminHint} onPress={fillAdmin}>
                            <Text style={styles.adminHintText}>
                              👤 Admin? Tap here to fill credentials
                            </Text>
                          </TouchableOpacity>
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
