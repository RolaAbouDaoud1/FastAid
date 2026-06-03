import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./navigation/StackNavigator";
import { DoctorsProvider } from "./context/DoctorsContext";

export default function App() {
  return (
    <DoctorsProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </DoctorsProvider>
  );
}