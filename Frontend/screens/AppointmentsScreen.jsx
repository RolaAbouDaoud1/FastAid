// import React from 'react';
// import { StyleSheet, View, Text, FlatList, SafeAreaView } from 'react-native';
// import { Clock, Calendar } from 'lucide-react-native';

// const AppointmentsScreen = () => {
//   // const appointments = [
//   //   { id: '1', doctor: 'Dr. Sarah Johnson', date: 'Oct 24, 2026', time: '10:30 AM', status: 'Confirmed' },
//   //   { id: '2', doctor: 'Dr. Michael Chen', date: 'Nov 02, 2026', time: '02:00 PM', status: 'Pending' },
//   // ];

//   API.get("/appointments/my");
//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>My Appointments</Text>
//       <FlatList
//         data={appointments}
//         renderItem={({ item }) => (
//           <View style={styles.aptCard}>
//             <Text style={styles.docName}>{item.doctor}</Text>
//             <View style={styles.detailsRow}>
//               <View style={styles.detail}><Calendar size={14} color="#666" /><Text style={styles.detailText}>{item.date}</Text></View>
//               <View style={styles.detail}><Clock size={14} color="#666" /><Text style={styles.detailText}>{item.time}</Text></View>
//             </View>
//             <View style={[styles.badge, { backgroundColor: item.status === 'Confirmed' ? '#E8F5E9' : '#FFF3E0' }]}>
//               <Text style={{ color: item.status === 'Confirmed' ? '#2D6A4F' : '#FB8500', fontWeight: 'bold' }}>{item.status}</Text>
//             </View>
//           </View>
//         )}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   aptCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 2 },
//   docName: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
//   detailsRow: { flexDirection: 'row', marginBottom: 15 },
//   detail: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
//   detailText: { marginLeft: 5, color: '#666', fontSize: 13 },
//   badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }
// });

// export default AppointmentsScreen;

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, FlatList, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert, Modal,
  TextInput, ScrollView
} from 'react-native';
import { Clock, Calendar, Plus, X } from 'lucide-react-native';
import API from '../services/api';

const STATUS_COLORS = {
  Confirmed: { bg: '#E8F5E9', text: '#2D6A4F' },
  Pending:   { bg: '#FFF3E0', text: '#FB8500' },
  Cancelled: { bg: '#FFE5E5', text: '#E63946' },
  Completed: { bg: '#E3F2FD', text: '#1565C0' },
};

const AppointmentsScreen = ({ route }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Book modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState('');   // e.g. 2026-11-02
  const [time, setTime] = useState('');   // e.g. 10:30 AM
  const [notes, setNotes] = useState('');

  // If coming from DoctorsScreen with a selected doctor, pre-fill it
  const preselectedDoctor = route?.params?.selectedDoctor || null;
  const [doctorId, setDoctorId] = useState(preselectedDoctor?._id || '');
  const [hospitalId, setHospitalId] = useState(
    preselectedDoctor?.hospital?._id || preselectedDoctor?.hospital || ''
  );

  useEffect(() => {
    fetchAppointments();
    // Open book modal automatically if a doctor was passed in
    if (preselectedDoctor) {
      setModalVisible(true);
    }
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/appointments/my');
      setAppointments(res.data.appointments || []);
    } catch (e) {
      console.log('Failed to load appointments:', e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!doctorId || !hospitalId || !date || !time) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    setBooking(true);
    try {
      await API.post('/appointments', {
        doctor_id: doctorId,
        hospital_id: hospitalId,
        date,
        time,
        notes,
      });
      Alert.alert('Success', 'Appointment booked!');
      setModalVisible(false);
      setDate(''); setTime(''); setNotes('');
      fetchAppointments();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = (id) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await API.patch(`/appointments/${id}/cancel`);
            fetchAppointments();
          } catch (e) {
            Alert.alert('Error', 'Could not cancel appointment');
          }
        },
      },
    ]);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const renderItem = ({ item }) => {
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.Pending;
    return (
      <View style={styles.aptCard}>
        <Text style={styles.docName}>{item.doctor?.name || 'Doctor'}</Text>
        <Text style={styles.specialty}>{item.doctor?.specialization}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Calendar size={14} color="#666" />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.detail}>
            <Clock size={14} color="#666" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>
              {item.status}
            </Text>
          </View>

          {/* Show cancel button only if still cancellable */}
          {['Pending', 'Confirmed'].includes(item.status) && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item._id)}
            >
              <X size={14} color="#E63946" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>My Appointments</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2D6A4F" style={{ marginTop: 60 }} />
      ) : appointments.length === 0 ? (
        <Text style={styles.emptyText}>No appointments yet. Tap + to book one.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── BOOK APPOINTMENT MODAL ──────────────────── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Book Appointment</Text>

              {preselectedDoctor && (
                <View style={styles.prefilledBox}>
                  <Text style={styles.prefilledLabel}>Doctor</Text>
                  <Text style={styles.prefilledValue}>{preselectedDoctor.name}</Text>
                  <Text style={styles.prefilledSub}>{preselectedDoctor.specialization}</Text>
                </View>
              )}

              {!preselectedDoctor && (
                <>
                  <Text style={styles.inputLabel}>Doctor ID *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Paste doctor ID"
                    value={doctorId}
                    onChangeText={setDoctorId}
                    autoCapitalize="none"
                  />
                  <Text style={styles.inputLabel}>Hospital ID *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Paste hospital ID"
                    value={hospitalId}
                    onChangeText={setHospitalId}
                    autoCapitalize="none"
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Date * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2026-11-02"
                value={date}
                onChangeText={setDate}
              />

              <Text style={styles.inputLabel}>Time * (e.g. 10:30 AM)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10:30 AM"
                value={time}
                onChangeText={setTime}
              />

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                placeholder="Describe your concern..."
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <TouchableOpacity
                style={[styles.bookBtn, booking && { opacity: 0.7 }]}
                onPress={handleBook}
                disabled={booking}
              >
                <Text style={styles.bookBtnText}>
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  addBtn: {
    backgroundColor: '#2D6A4F',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aptCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  docName: { fontSize: 16, fontWeight: 'bold' },
  specialty: { color: '#888', fontSize: 13, marginTop: 2, marginBottom: 10 },
  detailsRow: { flexDirection: 'row', marginBottom: 12 },
  detail: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  detailText: { marginLeft: 5, color: '#666', fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', padding: 6 },
  cancelText: { color: '#E63946', fontSize: 13, marginLeft: 4, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15, lineHeight: 24 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  prefilledBox: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  prefilledLabel: { fontSize: 11, color: '#2D6A4F', fontWeight: '700', textTransform: 'uppercase' },
  prefilledValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  prefilledSub: { fontSize: 13, color: '#666' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 4,
  },
  bookBtn: {
    backgroundColor: '#2D6A4F',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  closeBtn: { alignItems: 'center', marginTop: 14, padding: 10 },
  closeBtnText: { color: '#999', fontSize: 14 },
});

export default AppointmentsScreen;
