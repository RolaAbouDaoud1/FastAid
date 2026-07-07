import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import Home from "../screens/Home";
import HospitalsScreen from "../screens/HospitalsScreen";
import AIHelpScreen from "../screens/AIHelpScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
import AmbulanceStaffScreen from "../screens/AmbulanceStaffScreen";
import AdminDashboard from "../screens/AdminDashboard";
import AppointmentsScreen from "../screens/AppointmentsScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        // Role is stored inside the "user" JSON object written at login/signup
        const userRaw = await AsyncStorage.getItem("user");
        if (userRaw) {
          const user = JSON.parse(userRaw);
          setRole((user.role || "visitor").trim().toLowerCase());
        } else {
          // Fallback: try the legacy standalone "role" key
          const r = await AsyncStorage.getItem("role");
          setRole((r || "visitor").trim().toLowerCase());
        }
      } catch {
        setRole("visitor");
      } finally {
        setLoading(false);
      }
    };
    loadRole();
  }, []);

  // Show a spinner while reading AsyncStorage instead of returning null
  // (returning null causes a blank / broken screen)
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  const isAdmin = role === "admin";
  const isAmbulance = role === "ambulance_staff";
  const isHospital = role === "hospital";
  const isVisitor = !isAdmin && !isAmbulance && !isHospital;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2D6A4F",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      {/* HOME — visible to all roles */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />

      {/* HOSPITALS — visible to all */}
      <Tab.Screen
        name="Hospitals"
        component={HospitalsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="hospital" size={size} color={color} />
          ),
        }}
      />

      {/* AI HELP — visible to all */}
      <Tab.Screen
        name="AI"
        component={AIHelpScreen}
        options={{
          tabBarLabel: "AI Help",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="comment-medical" size={size} color={color} />
          ),
        }}
      />

      {/* APPOINTMENTS — only for visitors */}
      {isVisitor && (
        <Tab.Screen
          name="Appointments"
          component={AppointmentsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="calendar-check" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* EMERGENCY — only for normal visitors */}
      {isVisitor && (
        <Tab.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="exclamation-triangle" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* AMBULANCE — only for ambulance_staff */}
      {isAmbulance && (
        <Tab.Screen
          name="Ambulance"
          component={AmbulanceStaffScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="ambulance" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* ADMIN — only for admin */}
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminDashboard}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="user-shield" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}
