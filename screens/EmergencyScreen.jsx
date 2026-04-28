import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Phone, AlertTriangle, ShieldAlert } from 'lucide-react-native';

const EmergencyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconBox}><ShieldAlert color="#E63946" size={80} /></View>
      <Text style={styles.warn}>Emergency Services</Text>
      <Text style={styles.subText}>Press a button below for immediate assistance.</Text>
      
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E63946' }]}>
        <Phone color="#FFF" /><Text style={styles.btnText}>Call 999 (Police)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FB8500' }]}>
        <AlertTriangle color="#FFF" /><Text style={styles.btnText}>Ambulance Dispatch</Text>
      </TouchableOpacity>

      <View style={styles.locationBox}>
        <Text style={styles.locLabel}>Your Current Location:</Text>
        <Text style={styles.locVal}>Hamra St, Beirut, Lebanon</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', padding: 20 },
  iconBox: { marginBottom: 20 },
  warn: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subText: { color: '#666', textAlign: 'center', marginVertical: 10, paddingHorizontal: 20 },
  actionBtn: { flexDirection: 'row', width: '100%', height: 65, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },
  locationBox: { marginTop: 40, alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 15, width: '100%' },
  locLabel: { color: '#999', fontSize: 12 },
  locVal: { fontWeight: 'bold', marginTop: 5 }
});

export default EmergencyScreen;