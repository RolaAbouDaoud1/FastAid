import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FirstScreen from '../screens/FirstScreen';
import AuthNavigator from '../navigation/AuthNavigator'; 
import Home from '../screens/Home';
import SignUp from '../screens/SignUp';
import Login from '../screens/Login';
import AmbulanceStaffScreen from '../screens/AmbulanceStaffScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="FirstScreen">
      <Stack.Screen name="FirstScreen" component={FirstScreen} />
      <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="AmbulanceStaffScreen" component={AmbulanceStaffScreen} />
    </Stack.Navigator>
  );
}