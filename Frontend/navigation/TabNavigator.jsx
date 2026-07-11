
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator
} from "react-native";

import {
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs";

import {
  FontAwesome5
} from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";


// Screens
import Home from "../screens/Home";
import HospitalsScreen from "../screens/HospitalsScreen";
import AIHelpScreen from "../screens/AIHelpScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";

import AmbulanceStaffScreen from "../screens/AmbulanceStaffScreen";
import HospitalDashboard from "../screens/HospitalDashboard";
import AdminDashboard from "../screens/AdminDashboard";


const Tab = createBottomTabNavigator();
export default function TabNavigator() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadRole = async () => {
      try {
        const userRaw = await AsyncStorage.getItem("user");
        if (userRaw) {

          const user = JSON.parse(userRaw);

          const userRole =
            (user.role || "visitor")
            .trim()
            .toLowerCase();


          console.log("ROLE:", userRole);

          setRole(userRole);

        } 
        else {

          const savedRole =
            await AsyncStorage.getItem("role");


          setRole(
            (savedRole || "visitor")
            .trim()
            .toLowerCase()
          );

        }
      } catch(error) {

        console.log(error);

        setRole("visitor");

      }
      finally {
        setLoading(false);
      }
    };
    loadRole();
  }, []);
  if(loading){
    return (
      <View
        style={{
          flex:1,
          justifyContent:"center",
          alignItems:"center"
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
        />

      </View>

    );

  }
  const isVisitor =
    role !== "hospital" &&
    role !== "ambulance_staff" &&
    role !== "admin";
  const isAmbulance =
    role === "ambulance_staff";
  const isHospital =
    role === "hospital";
  const isAdmin =
    role === "admin";
  // First screen depending on role

  const initialRoute =
    isAmbulance
      ? "AmbulanceDashboard"
      : isHospital
      ? "HospitalDashboard"
      : isAdmin
      ? "AdminDashboard"
      : "Home";

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown:false,
        tabBarActiveTintColor:"#2D6A4F",
        tabBarInactiveTintColor:"#999",
        tabBarStyle:{
          height:80,
          paddingBottom:5,
          backgroundColor:"#fff"
        }
      }}
    >
      {/* EVERYONE */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon:({color,size})=>(
            <FontAwesome5
              name="home"
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tab.Screen
        name="Hospitals"
        component={HospitalsScreen}
        options={{
          tabBarIcon:({color,size})=>(
            <FontAwesome5
              name="hospital"
              size={size}
              color={color}
            />
          )
        }}
      />
      <Tab.Screen
        name="AIHelp"
        component={AIHelpScreen}
        options={{
          tabBarLabel:"AI Help",
          tabBarIcon:({color,size})=>(
            <FontAwesome5
              name="comment-medical"
              size={size}
              color={color}
            />
          )
        }}
      />
      {/* VISITOR ONLY */}
      {isVisitor && (
        <Tab.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{
            tabBarIcon:({color,size})=>(
              <FontAwesome5
                name="ambulance"
                size={size}
                color={color}
              />
            )
          }}
        />
      )}
      {isVisitor && (
        <Tab.Screen
          name="Appointments"
          component={AppointmentsScreen}
          options={{
            tabBarIcon:({color,size})=>(
              <FontAwesome5
                name="calendar-check"
                size={size}
                color={color}
              />
            )
          }}
        />
      )}
      {/*AMBULANCE ONLY */}
      {isAmbulance && (
        <Tab.Screen
          name="AmbulanceDashboard"
          component={AmbulanceStaffScreen}
          options={{
            tabBarLabel:"Ambulance",
            tabBarIcon:({color,size})=>(
              <FontAwesome5
                name="ambulance"
                size={size}
                color={color}
              />
            )
          }}
        />
      )}
      {/* HOSPITAL ONLY */}
      {isHospital && (
        <Tab.Screen
          name="HospitalDashboard"
          component={HospitalDashboard}
          options={{
            tabBarLabel:"Hospital",
            tabBarIcon:({color,size})=>(
              <FontAwesome5
                name="hospital-user"
                size={size}
                color={color}
              />
            )
          }}
        />
      )}
      {/* ADMIN ONLY */}
      {isAdmin && (
        <Tab.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            tabBarLabel:"Admin",
            tabBarIcon:({color,size})=>(
              <FontAwesome5
                name="user-shield"
                size={size}
                color={color}
              />
            )
          }}
        />
      )}
    </Tab.Navigator>
  );
}