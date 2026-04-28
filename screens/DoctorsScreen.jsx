import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Search, ChevronLeft, Phone, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const DoctorsScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const allDoctors = [
    { id: '1', name: "Dr. Sarah Johnson", specialty: "Cardiologist", exp: "12 yrs", img: "https://i.pravatar.cc/150?u=sarah" },
    { id: '2', name: "Dr. Michael Chen", specialty: "Neurologist", exp: "8 yrs", img: "https://i.pravatar.cc/150?u=michael" },
    { id: '3', name: "Dr. Elena Rodriguez", specialty: "Pediatrician", exp: "10 yrs", img: "https://i.pravatar.cc/150?u=elena" },
    { id: '4', name: "Dr. James Wilson", specialty: "Dermatologist", exp: "15 yrs", img: "https://i.pravatar.cc/150?u=james" },
    { id: '5', name: "Dr. Amara Okafor", specialty: "General Surgeon", exp: "7 yrs", img: "https://i.pravatar.cc/150?u=amara" },
  ];

  const filtered = allDoctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#333" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Doctors</Text>
      </View>

      <View style={styles.searchBar}>
        <Search color="#999" size={20} />
        <TextInput 
          placeholder="Search specialists..." 
          value={search} 
          onChangeText={setSearch} 
          style={styles.input} 
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.docCard}>
            <Image source={{ uri: item.img }} style={styles.docImg} />
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{item.name}</Text>
              <Text style={styles.docSub}>{item.specialty} • {item.exp} exp</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.callBtn}><Phone color="#FFF" size={14} /></TouchableOpacity>
                <TouchableOpacity 
                  style={styles.bookBtn} 
                  onPress={() => navigation.navigate('AppointmentsScreen')}
                >
                  <Calendar color="#2D6A4F" size={14} />
                  <Text style={styles.bookText}>Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  searchBar: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20, elevation: 2 },
  input: { flex: 1, marginLeft: 10 },
  docCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 2 },
  docImg: { width: 70, height: 70, borderRadius: 35 },
  docInfo: { flex: 1, marginLeft: 15 },
  docName: { fontSize: 16, fontWeight: 'bold' },
  docSub: { color: '#999', fontSize: 13, marginVertical: 4 },
  btnRow: { flexDirection: 'row', marginTop: 5 },
  callBtn: { backgroundColor: '#FF5A5F', padding: 8, borderRadius: 8, marginRight: 10 },
  bookBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2D6A4F', paddingHorizontal: 12, borderRadius: 8 },
  bookText: { color: '#2D6A4F', fontWeight: 'bold', marginLeft: 5, fontSize: 12 }
});

export default DoctorsScreen;