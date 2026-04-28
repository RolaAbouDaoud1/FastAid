import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Search, MapPin, Star } from 'lucide-react-native';

const HospitalsScreen = () => {
  const [search, setSearch] = useState('');
  const hospitalData = [
    { id: '1', name: 'Beirut General Hospital', rating: 4.8, dist: '2.3 km', img: 'https://images.unsplash.com/photo-1587350859728-117622bc8bfa?w=400' },
    { id: '2', name: 'Saint Jude Medical', rating: 4.5, dist: '4.1 km', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400' },
    { id: '3', name: 'Cedar Sinai Clinic', rating: 4.9, dist: '5.8 km', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400' },
  ];

  const filtered = hospitalData.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Hospitals Directory</Text>
      <View style={styles.searchBar}>
        <Search color="#999" size={20} />
        <TextInput placeholder="Search by name..." value={search} onChangeText={setSearch} style={styles.input} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.img }} style={styles.img} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.row}>
                <MapPin size={14} color="#E63946" />
                <Text style={styles.sub}>{item.dist} • </Text>
                <Star size={14} fill="#FFD700" color="#FFD700" />
                <Text style={styles.sub}> {item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  searchBar: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20, elevation: 2 },
  input: { flex: 1, marginLeft: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 15, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  img: { width: '100%', height: 150 },
  info: { padding: 15 },
  name: { fontSize: 16, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  sub: { color: '#666', fontSize: 13 }
});

export default HospitalsScreen;