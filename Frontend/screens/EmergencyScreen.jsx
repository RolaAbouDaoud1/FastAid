import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Linking
} from 'react-native';

import { Phone, ShieldAlert, MessageCircle } from 'lucide-react-native';
import * as Location from 'expo-location';

const EmergencyScreen = ({ navigation }) => {

  const [location, setLocation] = useState(null);

  const callAmbulance = () => {
    Linking.openURL('tel:140'); // Lebanon Red Cross
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        console.log("Permission status:", status);

        if (status !== 'granted') {
          console.log('Location permission denied');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        console.log("LOCATION:", loc);

        setLocation(loc.coords);

      } catch (error) {
        console.log("LOCATION ERROR:", error);
      }
    };

    getLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.iconBox}>
        <ShieldAlert color="#E63946" size={80} />
      </View>

      <Text style={styles.warn}>Emergency Services</Text>

      <Text style={styles.subText}>
        Press a button below for immediate assistance.
      </Text>

      {/* 🚑 Ambulance Button */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: '#E63946' }]}
        onPress={callAmbulance}
      >
        <Phone color="#FFF" />
        <Text style={styles.btnText}>Call Ambulance (140)</Text>
      </TouchableOpacity>

      {/* 🤖 AI Button */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: '#22C55E' }]}
        onPress={() => navigation.navigate('AI')}
      >
        <MessageCircle color="#FFF" />
        <Text style={styles.btnText}>AI Medical Assistant</Text>
      </TouchableOpacity>

      {/* 📍 Location */}
      <View style={styles.locationBox}>
        <Text style={styles.locLabel}>Your Current Location:</Text>

        <Text style={styles.locVal}>
          {location
            ? `Lat: ${location.latitude.toFixed(4)} | Lng: ${location.longitude.toFixed(4)}`
            : 'Getting location...'}
        </Text>

      </View>

    </SafeAreaView>
  );
};

export default EmergencyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },

  iconBox: {
    marginBottom: 20
  },

  warn: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333'
  },

  subText: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20
  },

  actionBtn: {
    flexDirection: 'row',
    width: '100%',
    height: 65,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15
  },

  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10
  },

  locationBox: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    width: '100%'
  },

  locLabel: {
    color: '#999',
    fontSize: 12
  },

  locVal: {
    fontWeight: 'bold',
    marginTop: 5
  }
});