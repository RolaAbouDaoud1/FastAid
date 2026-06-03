import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogOut } from "lucide-react-native";

import FirstScreen from "../screens/FirstScreen";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import TabNavigator from "./TabNavigator";

import AdminDashboard from "../screens/AdminDashboard";
import DoctorsScreen from "../screens/DoctorsScreen";
import PharmacyScreen from "../screens/PharmacyScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import StaffDashboard from "../screens/StaffDashboard";
import AmbulanceStaffScreen from "../screens/AmbulanceStaffScreen";
import HospitalDashboard from "../screens/HospitalDashboard";

const Stack = createNativeStackNavigator();

// Screens where the logout button should NOT appear
const NO_LOGOUT_SCREENS = ["Login", "SignUp", "FirstScreen"];

const LogoutButton = ({ navigation }) => (
  <TouchableOpacity
    onPress={async () => {
      // Clear all auth keys saved during login / signup
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
        "hospitalId",
        "role",
        "token", // legacy key — remove just in case
      ]);
      navigation.replace("Login");
    }}
    style={{ marginRight: 12 }}
  >
    <LogOut size={22} color="red" />
  </TouchableOpacity>
);

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="FirstScreen"
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        headerRight: () => {
          if (NO_LOGOUT_SCREENS.includes(route.name)) return null;
          return <LogoutButton navigation={navigation} />;
        },
      })}
    >
      <Stack.Screen
        name="FirstScreen"
        component={FirstScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />

      {/* Main tab navigator for visitors */}
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ title: "FastAid", headerTintColor: "#2e8b57" }}
      />

      {/* Stack-only screens (navigated to from inside tabs) */}
      <Stack.Screen
        name="DoctorsList"
        component={DoctorsScreen}
        options={{ title: "Doctors", headerShown: false }}
      />
      <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
      <Stack.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ title: "My Appointments" }}
      />

      {/* Role-based dashboards */}
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: "Admin Dashboard" }}
      />
      <Stack.Screen
        name="StaffDashboard"
        component={StaffDashboard}
        options={{ title: "Staff Dashboard" }}
      />
      <Stack.Screen
        name="AmbulanceDashboard"
        component={AmbulanceStaffScreen}
        options={{ title: "Ambulance Dashboard" }}
      />
      {/* Both spellings registered so either casing works */}
      <Stack.Screen
        name="hospitalDashboard"
        component={HospitalDashboard}
        options={{ title: "Hospital Dashboard" }}
      />
      <Stack.Screen
        name="HospitalDashboard"
        component={HospitalDashboard}
        options={{ title: "Hospital Dashboard" }}
      />
    </Stack.Navigator>
  );
}
