

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogOut } from "lucide-react-native";

import FirstScreen from "../screens/FirstScreen";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";

import TabNavigator from "./TabNavigator";

import DoctorsScreen from "../screens/DoctorsScreen";
import PharmacyScreen from "../screens/PharmacyScreen";


const Stack = createNativeStackNavigator();


const NO_LOGOUT_SCREENS = [
  "FirstScreen",
  "Login",
  "SignUp"
];


const LogoutButton = ({ navigation }) => {

  return (

    <TouchableOpacity

      onPress={async () => {

        await AsyncStorage.multiRemove([
          "accessToken",
          "refreshToken",
          "user",
          "hospitalId",
          "role",
          "token"
        ]);

        navigation.replace("Login");

      }}

      style={{ marginRight: 12 }}

    >

      <LogOut
        size={22}
        color="red"
      />

    </TouchableOpacity>

  );

};



export default function StackNavigator() {


  return (

    <Stack.Navigator

      initialRouteName="FirstScreen"

      screenOptions={({navigation, route}) => ({

        headerShown:true,

        headerRight:()=>{

          if(NO_LOGOUT_SCREENS.includes(route.name))
            return null;

          return (
            <LogoutButton navigation={navigation}/>
          );

        }

      })}

    >


      <Stack.Screen

        name="FirstScreen"

        component={FirstScreen}

        options={{
          headerShown:false
        }}

      />


      <Stack.Screen

        name="Login"

        component={Login}

        options={{
          headerShown:false
        }}

      />


      <Stack.Screen

        name="SignUp"

        component={SignUp}

        options={{
          headerShown:false
        }}

      />



      {/* ALL MAIN APP PAGES ARE INSIDE THIS */}

      <Stack.Screen

        name="Main"

        component={TabNavigator}

        options={{
          title:"FastAid",
          headerTintColor:"#2D6A4F"
        }}

      />



      {/* Pages opened above tabs if needed */}

      <Stack.Screen

        name="DoctorsList"

        component={DoctorsScreen}

        options={{
          headerShown:false
        }}

      />


      <Stack.Screen

        name="Pharmacy"

        component={PharmacyScreen}

      />


    </Stack.Navigator>

  );

}