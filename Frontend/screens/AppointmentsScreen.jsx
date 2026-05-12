import React from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView } from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';

const AppointmentsScreen = () => {
  const appointments = [
    { id: '1', doctor: 'Dr. Sarah Johnson', date: 'Oct 24, 2026', time: '10:30 AM', status: 'Confirmed' },
    { id: '2', doctor: 'Dr. Michael Chen', date: 'Nov 02, 2026', time: '02:00 PM', status: 'Pending' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      <FlatList
        data={appointments}
        renderItem={({ item }) => (
          <View style={styles.aptCard}>
            <Text style={styles.docName}>{item.doctor}</Text>
            <View style={styles.detailsRow}>
              <View style={styles.detail}><Calendar size={14} color="#666" /><Text style={styles.detailText}>{item.date}</Text></View>
              <View style={styles.detail}><Clock size={14} color="#666" /><Text style={styles.detailText}>{item.time}</Text></View>
            </View>
            <View style={[styles.badge, { backgroundColor: item.status === 'Confirmed' ? '#E8F5E9' : '#FFF3E0' }]}>
              <Text style={{ color: item.status === 'Confirmed' ? '#2D6A4F' : '#FB8500', fontWeight: 'bold' }}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  aptCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 2 },
  docName: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  detailsRow: { flexDirection: 'row', marginBottom: 15 },
  detail: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  detailText: { marginLeft: 5, color: '#666', fontSize: 13 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }
});

export default AppointmentsScreen;