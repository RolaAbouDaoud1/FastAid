import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";

// Screens
import Home from "../screens/Home";
import HospitalsScreen from "../screens/HospitalsScreen";
import AIHelpScreen from "../screens/AIHelpScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
import AmbulanceStaffScreen from "../screens/AmbulanceStaffScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Hospitals") iconName = "hospital";
          else if (route.name === "AI") iconName = "comment";
          else if (route.name === "Emergency") iconName = "exclamation-triangle";
          else if (route.name === "Ambulance") iconName = "ambulance";

          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Hospitals" component={HospitalsScreen} />
      <Tab.Screen name="AI" component={AIHelpScreen} />
      <Tab.Screen name="Emergency" component={EmergencyScreen} />
    </Tab.Navigator>
  );
}