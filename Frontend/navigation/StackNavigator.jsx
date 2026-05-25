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

const Stack = createNativeStackNavigator();

const LogoutButton = ({ navigation }) => (
  <TouchableOpacity
    onPress={async () => {
      await AsyncStorage.removeItem("token");
      navigation.replace("Login");
    }}
    style={{ marginRight: 12 }}
  >
    <LogOut size={22} color="red" />
  </TouchableOpacity>
);

export default function StackNavigator() {
  const authScreens = ["Login", "SignUp"];

  return (
    <Stack.Navigator
      initialRouteName="FirstScreen"
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        headerRight: () => {
          if (authScreens.includes(route.name)) return null;
          return <LogoutButton navigation={navigation} />;
        },
      })}
    >
      <Stack.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />

      <Stack.Screen name="Main" component={TabNavigator} options={{ title: "FastAid",  headerTintColor: "#2e8b57",}} />

      <Stack.Screen name="DoctorsList" component={DoctorsScreen} />
      <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />

      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
      <Stack.Screen name="AmbulanceDashboard" component={AmbulanceStaffScreen} />
    </Stack.Navigator>
  );
}