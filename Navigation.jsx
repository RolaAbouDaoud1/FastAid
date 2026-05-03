import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";

import Home from "./screens/Home";
import HospitalDashboard from "./screens/HospitalDashboard";
import DoctorsScreen from "./screens/DoctorsScreen";
import AmbulanceStaffScreen from "./screens/AmbulanceStaffScreen";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>

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
          name="Hospital"
          component={HospitalDashboard}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="hospital" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Doctors"
          component={DoctorsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="user-md" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Ambulance"
          component={AmbulanceStaffScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="ambulance" size={size} color={color} />
            ),
  }}
/>

      </Tab.Navigator>
    </NavigationContainer>
  );
}