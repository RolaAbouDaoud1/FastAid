import AppNavigator from '../AppNavigation/AppNavigator';

export default function Index() {
  return <AppNavigator />;
}



// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import FirstScreen from '../screens/FirstScreen';
// import AuthNavigator from '../navigation/AuthNavigator';
// import Home from '../screens/Home';
// import * as SplashScreen from 'expo-splash-screen';
// import SignUp from '../screens/SignUp';
// import Login from '../screens/Login';
// import AmbulanceStaffScreen from '../screens/AmbulanceStaffScreen';
// // import React, { useEffect } from 'react';




// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
  
    
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="FirstScreen" component={FirstScreen} />
//         <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
//         <Stack.Screen name="Home" component={Home} />
//         <Stack.Screen name="SignUp" component={SignUp}/>
//         <Stack.Screen name="Login" component={Login}/>
//         <Stack.Screen name="AmbulanceStaffScreen" component={AmbulanceStaffScreen}/>
        
//       </Stack.Navigator>
    
//   );
// }


