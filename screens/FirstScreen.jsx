//screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../assets/FastAid-Logo (2).png';

export default function firstScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');

      setTimeout(() => {
        if (token) {
          navigation.replace('AuthNavigator');
        } else {
          navigation.replace('AuthNavigator');
        }
        
      }, 1500); // 1.5 seconds
    };

    checkAuth();
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
    // backgroundColor: "#126c63"
    backgroundColor: "#2d857c",
  }
});
