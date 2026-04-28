// screens/AuthScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import logo_green from '../assets/FastAid-Logo-green.png';
import AmbulanceStaffScreen from '../screens/AmbulanceStaffScreen';

export default function AuthScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={logo_green} style={{ width: 270, height: 270}} resizeMode="contain"/>
      <Text style={styles.title}>Welcome to FastAid</Text>
      <Text style={styles.title1}>Let's get started!</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/*bde shila b3den!!!!!!!!!!!!!!!!!!! */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AmbulanceStaffScreen')}
      >
        <Text style={styles.buttonText}>AmbulanceStaffScreen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold', color: '#e2e2e'},
  title1: {fontSize: 15, marginBottom: 30, fontWeight: 'bold', color: 'black'},
  button: {
    width: 200,
    padding: 15,
    marginVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#2d857c'
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});



// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import SignUp from '../screens/SignUp';
// // import LoginScreen from '../screens/LoginScreen';

// const Stack = createNativeStackNavigator();

// export default function AuthNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="SignUp" component={SignUp} />
//       {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
//     </Stack.Navigator>
//   );
// }
