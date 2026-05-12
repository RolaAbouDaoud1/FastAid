import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import logo from '../assets/FastAid-Logo (2).png';

export default function FirstScreen({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={logo}
        style={{ width: 270, height: 270 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2d857c",
  }
});