import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomTabBar({ state, navigation }) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        let iconName = "home-outline";

        if (route.name === "Home") iconName = "home-outline";
        if (route.name === "Hospitals") iconName = "business-outline";
        if (route.name === "AI") iconName = "chatbubble-ellipses-outline";
        if (route.name === "Emergency") iconName = "alert-circle-outline";

        return (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
          >
            <Ionicons
              name={iconName}
              size={22}
              color={isFocused ? "#2e8b57" : "#999"}
            />

            <Text style={{ color: isFocused ? "#2e8b57" : "#999", fontSize: 11 }}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 65,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});