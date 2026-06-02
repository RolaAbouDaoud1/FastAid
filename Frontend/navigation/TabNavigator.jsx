import React, { useEffect, useState } from "react";
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

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      const r = await AsyncStorage.getItem("role");
      setRole(r?.trim().toLowerCase());
    };
    loadRole();
  }, []);

  if (!role) return null;

  const isAdmin = role === "admin";
  const isAmbulance = role === "ambulance_staff";

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>

      {/* COMMON USERS */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Hospitals"
        component={HospitalsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="hospital" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AI"
        component={AIHelpScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="comment" size={size} color={color} />
          ),
        }}
      />

      {/* EMERGENCY ONLY FOR NORMAL USERS */}
      {!isAmbulance && !isAdmin && (
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

      {/* AMBULANCE */}
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

      {/* ADMIN DASHBOARD */}
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