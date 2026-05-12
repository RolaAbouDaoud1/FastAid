import React, { useState } from 'react';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  SafeAreaView, Modal, TextInput
} from 'react-native';

import { ChevronLeft, Save, Edit3, Bed, RefreshCcw } from 'lucide-react-native';

const StaffDashboard = ({ navigation }) => {

  const [selectedWard, setSelectedWard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bedCount, setBedCount] = useState('');
  const [banner, setBanner] = useState(null);

  const [wards, setWards] = useState([
    { id: '1', name: 'ICU - Level 3', available: 4, total: 10 },
    { id: '2', name: 'General Ward A', available: 12, total: 25 },
    { id: '3', name: 'Pediatric Wing', available: 2, total: 8 },
    { id: '4', name: 'Emergency - ER', available: 1, total: 15 },
    { id: '5', name: 'Surgery Recovery', available: 6, total: 12 },
  ]);

  // 📊 STATUS LOGIC
  const getStatus = (available, total) => {
    const ratio = available / total;

    if (available === 0) return 'Full';
    if (ratio <= 0.2) return 'Critical';
    return 'Normal';
  };

  const openUpdateModal = (ward) => {
    setSelectedWard(ward);
    setBedCount(ward.available.toString());
    setModalVisible(true);
  };

  const handleUpdate = () => {
    const newCount = parseInt(bedCount);

    if (isNaN(newCount) || newCount > selectedWard.total) {
      return;
    }

    setWards(
      wards.map(w =>
        w.id === selectedWard.id
          ? {
              ...w,
              available: newCount,
              status: getStatus(newCount, w.total)
            }
          : w
      )
    );

    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#333" size={28} />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Staff Portal</Text>
          <Text style={styles.hospitalName}>Beirut General Hospital</Text>
        </View>

        <TouchableOpacity>
          <RefreshCcw color="#4A90E2" size={20} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Bed Availability Management</Text>

        <FlatList
          data={wards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {

            const status = getStatus(item.available, item.total);

            return (
              <View
                style={[
                  styles.wardCard,
                  status === 'Full' && styles.fullCard
                ]}
              >

                {/* STATUS */}
                <View style={styles.wardInfo}>
                  <Text style={styles.wardName}>{item.name}</Text>

                  <Text
                    style={[
                      styles.statusBadge,
                      {
                        color:
                          status === 'Full'
                            ? '#E63946'
                            : status === 'Critical'
                            ? '#E63946'
                            : '#2D6A4F',

                        marginTop: status === 'Full' ? 20 : 0
                      }
                    ]}
                  >
                    {status === 'Full'
                      ? '🚨 FULL'
                      : status === 'Critical'
                      ? '⚠️ SPACE AVAILABLE'
                      : '✔ NORMAL'}
                  </Text>
                </View>

                {/* BEDS */}
                <View style={styles.bedCountRow}>
                  <View style={styles.countBox}>
                    <Text style={styles.availableNum}>{item.available}</Text>
                    <Text style={styles.totalNum}>/ {item.total} Beds</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openUpdateModal(item)}
                  >
                    <Edit3 color="#FFF" size={18} />
                    <Text style={styles.editBtnText}>Update</Text>
                  </TouchableOpacity>
                </View>

              </View>
            );
          }}
        />
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <Bed color="#4A90E2" size={40} style={{ marginBottom: 10 }} />

            <Text style={styles.modalTitle}>Update Availability</Text>
            <Text style={styles.modalSub}>{selectedWard?.name}</Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={bedCount}
              onChangeText={setBedCount}
            />

            <View style={styles.modalButtons}>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleUpdate}
              >
                <Save color="#FFF" size={18} />
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default StaffDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 40,
  },

  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  hospitalName: { fontSize: 12, color: '#4A90E2' },

  content: { flex: 1, padding: 20 },

  sectionLabel: { fontWeight: 'bold', marginBottom: 20 },

  wardCard: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 15,
    borderRadius: 16
  },

  // 🔴 FULL CARD STYLE
  fullCard: {
    backgroundColor: '#FFE5E5',
    borderWidth: 2,
    borderColor: '#E63946'
  },

  wardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  wardName: { fontSize: 16, fontWeight: 'bold' },

  statusBadge: { fontSize: 12, fontWeight: '700' },

  bedCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },

  countBox: { flexDirection: 'row' },

  availableNum: { fontSize: 28, fontWeight: 'bold' },

  totalNum: { marginLeft: 5 },

  editBtn: {
    backgroundColor: '#1A2B3C',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10
  },

  editBtnText: { color: '#FFF', marginLeft: 5 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000066'
  },

  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 25,
    borderRadius: 20
  },

  modalTitle: { fontSize: 18, fontWeight: 'bold' },

  modalSub: { color: '#666', marginBottom: 10 },

  input: {
    backgroundColor: '#F0F4F8',
    padding: 15,
    borderRadius: 10,
    textAlign: 'center'
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },

  cancelText: { color: '#999' },

  saveBtn: {
    backgroundColor: '#2D6A4F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row'
  },

  saveText: { color: '#FFF', marginLeft: 5 }
});