import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import FirstScreen from "../screens/FirstScreen";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import TabNavigator from "./TabNavigator";

// Extra screens (no bottom bar)
import DoctorsScreen from "../screens/DoctorsScreen";
import PharmacyScreen from "../screens/PharmacyScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import StaffDashboard from "../screens/StaffDashboard";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="FirstScreen">

      {/* Splash + Auth Flow */}
      <Stack.Screen name="FirstScreen" component={FirstScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />

      {/* Main App (Bottom Tabs) */}
      <Stack.Screen name="Main" component={TabNavigator} />

      {/* Extra Pages */}
      <Stack.Screen name="DoctorsList" component={DoctorsScreen} />
      <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />

      {/* Staff */}
      <Stack.Screen name="StaffDashboard" component={StaffDashboard} />

    </Stack.Navigator>
  );
}