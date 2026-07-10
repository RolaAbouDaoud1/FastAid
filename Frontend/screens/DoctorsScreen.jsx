import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, FlatList, Image,
  TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator, Linking
} from 'react-native';
import { Search, ChevronLeft, Phone, Calendar, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API from '../services/api';

const GREEN = '#2D6A4F';

// ─── Unique image per doctor ───────────────────────────────────────────────────
// Uses Pravatar (seeded avatars) as default — always the same face per doctor.
// Falls back to a seeded Unsplash medical portrait if image_url present.
// const getDoctorImage = (item) => {
//   if (item.image_url) return { uri: item.image_url };
//   // Pravatar gives a consistent photo for the same seed/name string
//   const seed = encodeURIComponent((item._id || item.name || 'doctor').slice(0, 30));
//   return { uri: `https://i.pravatar.cc/150?u=${seed}` };
// };
const DOCTOR_IMAGES = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400',
];

const getDoctorImage = (item) => {
  const index =
    Math.abs(
      (item._id || item.name || '')
        .split('')
        .reduce((a, c) => a + c.charCodeAt(0), 0)
    ) % DOCTOR_IMAGES.length;

  return { uri: DOCTOR_IMAGES[index] };
};
// const getDoctorImage = (item) => {
//   if (item.image_url) return { uri: item.image_url };

//   const index =
//     Math.abs((item._id || item.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) %
//     DOCTOR_IMAGES.length;

//   return { uri: DOCTOR_IMAGES[index] };
// };

// Specialty icon map
const SPEC_ICON = {
  Cardiology:       '❤️',
  Neurology:        '🧠',
  Orthopedics:      '🦴',
  Pulmonology:      '🫁',
  Gastroenterology: '🫃',
  Dermatology:      '🩹',
  Ophthalmology:    '👁️',
  ENT:              '👂',
  Psychiatry:       '🧘',
  Emergency:        '🚑',
  General:          '🩺',
  Pediatrics:       '👶',
  Oncology:         '🎗️',
};

const getSpecIcon = (spec) => {
  if (!spec) return '🩺';
  for (const [key, icon] of Object.entries(SPEC_ICON)) {
    if (spec.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '🩺';
};

const DoctorsScreen = () => {
  const navigation          = useNavigation();
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await API.get('/doctors?limit=50');
      setDoctors(res.data.doctors || []);
    } catch (e) {
      console.log('Failed to load doctors:', e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCall  = (phone) => { if (phone) Linking.openURL(`tel:${phone}`); };
  const handleBook  = (doctor) => navigation.navigate('Main', {
  screen: 'Appointments',
  params: {
    selectedDoctor: doctor,
  },
});

  const renderItem = ({ item }) => {
    const icon = getSpecIcon(item.specialization);

    return (
      <View style={styles.docCard}>
        {/* Doctor photo — unique per doctor */}
        <View style={styles.imgWrapper}>
          <Image
            source={getDoctorImage(item)}
            style={styles.docImg}
          />
          <View style={styles.specIconBadge}>
            <Text style={{ fontSize: 14 }}>{icon}</Text>
          </View>
        </View>

        <View style={styles.docInfo}>
          <Text style={styles.docName}>{item.name}</Text>

          <Text style={styles.docSpec}>
            {icon} {item.specialization || 'General Practitioner'}
            {item.experience_years ? ` • ${item.experience_years} yrs` : ''}
          </Text>

          {item.hospital?.name ? (
            <Text style={styles.hospitalName}>🏥 {item.hospital.name}</Text>
          ) : null}

          {item.average_rating > 0 && (
            <View style={styles.ratingRow}>
              <Star size={12} fill="#FFD700" color="#FFD700" />
              <Text style={styles.ratingText}>{item.average_rating}</Text>
            </View>
          )}

          <View style={styles.btnRow}>
            {item.phone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(item.phone)}
              >
                <Phone color="#FFF" size={14} />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => handleBook(item)}
            >
              <Calendar color={GREEN} size={14} />
              <Text style={styles.bookText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Main")}>
          <ChevronLeft color="#333" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Doctors</Text>
      </View>

      <View style={styles.searchBar}>
        <Search color="#999" size={18} />
        <TextInput
          placeholder="Search name or specialty…"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 60 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No doctors found.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: '#1a1a1a' },

  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14 },

  docCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  imgWrapper: { position: 'relative', marginRight: 14 },
  docImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#E8F5E9',
    backgroundColor: '#eee',
  },
  specIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  docInfo:   { flex: 1 },
  docName:   { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 3 },
  docSpec:   { color: '#555', fontSize: 13, marginBottom: 2 },
  hospitalName: { color: '#4A90E2', fontSize: 12, marginBottom: 4 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  ratingText: { fontSize: 12, color: '#666' },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },

  callBtn: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  callText: { color: '#fff', fontWeight: '600', fontSize: 12 },

  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  bookText: { color: GREEN, fontWeight: 'bold', fontSize: 12 },

  emptyText: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },
});

export default DoctorsScreen;
