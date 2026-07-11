import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

// Deterministic color based on the name, so the same hospital always gets the same color
const COLORS = [
  "#2e8b57", "#4A90E2", "#E63946", "#9B59B6",
  "#F39C12", "#16A085", "#D35400", "#2C3E50",
];

function getColorForName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) {
    // Single word name -> first two letters
    return words[0].slice(0, 2).toUpperCase();
  }
  // Multi-word name -> first letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function HospitalAvatar({ name, image_url, size = 48 }) {
  const [imageFailed, setImageFailed] = useState(false);

  const showImage = !!image_url && !imageFailed;

  const dimensionStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (showImage) {
    return (
      <Image
        source={{ uri: image_url }}
        style={[styles.image, dimensionStyle]}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        dimensionStyle,
        { backgroundColor: getColorForName(name) },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}




const styles = StyleSheet.create({
  image: {
    backgroundColor: "#eee",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#fff",
    fontWeight: "700",
  },
});