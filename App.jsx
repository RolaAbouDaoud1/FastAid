import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Icons
import { Home as HomeIcon, Hospital, MessageCircle, AlertCircle } from 'lucide-react-native';

// Screens
import Home from './screens/Home';
import HospitalsScreen from './screens/HospitalsScreen';
import AIHelpScreen from './screens/AIHelpScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import DoctorsScreen from './screens/DoctorsScreen';
import PharmacyScreen from './screens/PharmacyScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import StaffDashboard from './screens/StaffDashboard';
import AmbulanceStaffScreen from './screens/AmbulanceStaffScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// This handles the main app flow with the bottom bar
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon;

          if (route.name === 'Home')
            icon = <HomeIcon color={color} size={size} />;

          else if (route.name === 'Hospitals')
            icon = <Hospital color={color} size={size} />;

          else if (route.name === 'AI')
            icon = <MessageCircle color={color} size={size} />;

          else if (route.name === 'Emergency')
            icon = <AlertCircle color={color} size={size} />;

          else if (route.name === 'Ambulance')
            icon = <AlertCircle color="#E63946" size={size} />;

          return icon;
        },

        tabBarActiveTintColor: '#2D6A4F',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 75,
          paddingBottom: 12,
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#EEE',
          elevation: 5,
        },
      })}
    >

      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Hospitals" component={HospitalsScreen} />
      <Tab.Screen name="AI" component={AIHelpScreen} />
      <Tab.Screen name="Emergency" component={EmergencyScreen} />
      <Tab.Screen name="Ambulance" component={AmbulanceStaffScreen} />

    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        {/* Auth Flow */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        
        {/* Main App Flow (with Bottom Bar) */}
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* Sub-Pages (no bottom bar) */}
        <Stack.Screen name="DoctorsList" component={DoctorsScreen} />
        <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} />
        <Stack.Screen name="AIHelpScreen" component={AIHelpScreen} />
        <Stack.Screen name="AmbulanceStaffScreen" component={AmbulanceStaffScreen} />
        
        {/* Staff Management Page */}
        <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}