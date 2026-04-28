import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  SafeAreaView, Modal, TextInput, Alert 
} from 'react-native';
import { ChevronLeft, Save, Edit3, Bed, RefreshCcw } from 'lucide-react-native';

const StaffDashboard = ({ navigation }) => {
  const [selectedWard, setSelectedWard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bedCount, setBedCount] = useState('');

  // Initial Data for Wards
  const [wards, setWards] = useState([
    { id: '1', name: 'ICU - Level 3', available: 4, total: 10, status: 'Critical' },
    { id: '2', name: 'General Ward A', available: 12, total: 25, status: 'Normal' },
    { id: '3', name: 'Pediatric Wing', available: 2, total: 8, status: 'Full' },
    { id: '4', name: 'Emergency - ER', available: 1, total: 15, status: 'Critical' },
    { id: '5', name: 'Surgery Recovery', available: 6, total: 12, status: 'Normal' },
  ]);

  const openUpdateModal = (ward) => {
    setSelectedWard(ward);
    setBedCount(ward.available.toString());
    setModalVisible(true);
  };

  const handleUpdate = () => {
    const newCount = parseInt(bedCount);
    if (isNaN(newCount) || newCount > selectedWard.total) {
      Alert.alert("Invalid Input", "Please enter a valid number within ward capacity.");
      return;
    }

    setWards(wards.map(w => 
      w.id === selectedWard.id ? { ...w, available: newCount } : w
    ));
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#333" size={28} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Staff Portal</Text>
          <Text style={styles.hospitalName}>Beirut General Hospital</Text>
        </View>
        <TouchableOpacity><RefreshCcw color="#4A90E2" size={20} /></TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Bed Availability Management</Text>
        
        <FlatList
          data={wards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.wardCard}>
              <View style={styles.wardInfo}>
                <Text style={styles.wardName}>{item.name}</Text>
                <Text style={[styles.statusBadge, 
                  { color: item.status === 'Critical' ? '#E63946' : '#2D6A4F' }
                ]}>
                  ● {item.status}
                </Text>
              </View>
              
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
          )}
        />
      </View>

      {/* Edit Modal */}
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
              placeholder="Enter available beds"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                <Save color="#FFF" size={18} />
                <Text style={styles.saveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#FFF' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A2B3C' },
  hospitalName: { fontSize: 12, color: '#4A90E2', fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 20, textTransform: 'uppercase' },
  wardCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  wardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  wardName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { fontSize: 12, fontWeight: '700' },
  bedCountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countBox: { flexDirection: 'row', alignItems: 'baseline' },
  availableNum: { fontSize: 28, fontWeight: 'bold', color: '#1A2B3C' },
  totalNum: { fontSize: 14, color: '#999', marginLeft: 5 },
  editBtn: { 
    backgroundColor: '#1A2B3C', 
    flexDirection: 'row', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  editBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: '85%', borderRadius: 24, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  modalSub: { color: '#666', marginBottom: 20 },
  input: { 
    backgroundColor: '#F0F4F8', 
    width: '100%', 
    height: 55, 
    borderRadius: 12, 
    textAlign: 'center', 
    fontSize: 20, 
    fontWeight: 'bold',
    marginBottom: 25 
  },
  modalButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelText: { color: '#999', fontWeight: '600' },
  saveBtn: { 
    flex: 2, 
    backgroundColor: '#2D6A4F', 
    flexDirection: 'row', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  saveText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 }
});

export default StaffDashboard;