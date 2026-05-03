import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, ScrollView, Image, 
  TouchableOpacity, SafeAreaView, Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Search, Bell, Hospital as HospitalIcon, MapPin, 
  Star, Plus, BriefcaseMedical, MessageCircle, AlertCircle 
} from 'lucide-react-native';

const Home = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  // const [activeTab, setActiveTab] = useState('Home');

  // Data Arrays
  const hospitals = [
    { id: 1, name: "Beirut General Hospital", dist: "2.3 km", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=500" },
    { id: 2, name: "Saint Jude Medical", dist: "4.1 km", img: "https://images.unsplash.com/photo-1586773860418-d3b97998c637?q=80&w=500" },
    { id: 3, name: "Cedar Sinai Clinic", dist: "5.8 km", img: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=500" },
    { id: 4, name: "City Hope Center", dist: "6.2 km", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500" },
  ];

  const doctors = [
    { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiologist", img: "https://i.pravatar.cc/150?u=sarah" },
    { id: 2, name: "Dr. Michael Chen", specialty: "Neurologist", img: "https://i.pravatar.cc/150?u=michael" },
    { id: 3, name: "Dr. Elena Rodriguez", specialty: "Pediatrician", img: "https://i.pravatar.cc/150?u=elena" },
    { id: 4, name: "Dr. James Wilson", specialty: "Dermatologist", img: "https://i.pravatar.cc/150?u=james" },
    { id: 5, name: "Dr. Amara Okafor", specialty: "Surgeon", img: "https://i.pravatar.cc/150?u=amara" },
  ];

  const reviews = [
    { id: 1, user: "Alex T.", rating: 5, comment: "Dr. Sarah was extremely professional. Seamless experience!" },
    { id: 2, user: "Maya R.", rating: 4, comment: "Quick response from the emergency feature. Highly recommend." },
    { id: 3, user: "Jordan K.", rating: 5, comment: "The AI help gave me great initial guidance before my visit." },
    { id: 4, user: "Liam W.", rating: 5, comment: "Cleanest hospital I've visited. 10/10 service." }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}><HospitalIcon color="#4A90E2" size={32} /></View>
        <TouchableOpacity style={styles.bellBtn}>
          <View style={styles.notificationBadge} />
          <Bell color="#333" size={28} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Find Your Desired Health Solution</Text>
            <Text style={styles.heroSubtitle}>Fast access to doctors & services</Text>
          </View>
          <Text style={styles.starIcon}>✱</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#999" size={20} />
          <TextInput 
            placeholder="Search doctors, hospitals..." 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.categoryGrid}>
          <CategoryItem onPress={() => navigation.navigate('Hospitals')} IconComp={HospitalIcon} color="#2D6A4F" label="Hospitals" />
          <CategoryItem onPress={() => navigation.navigate('Pharmacy')} IconComp={BriefcaseMedical} color="#FB8500" label="Pharmacy" />
          <CategoryItem onPress={() => navigation.navigate('AI')} IconComp={MessageCircle} color="#6A4C93" label="AI Help" />
          <CategoryItem onPress={() => navigation.navigate('Emergency')} IconComp={AlertCircle} color="#E63946" label="Emergency" />
        </View>

        {/* Nearby Hospitals Section */}
        <SectionHeader title="Nearby Hospitals" onSeeAll={() => navigation.navigate('Hospitals')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListPadding}>
          {hospitals.map(h => (
            <View key={h.id} style={styles.hospitalCard}>
              <Image source={{ uri: h.img }} style={styles.hospitalImg} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>  {h.name}</Text>
                <View style={styles.distRow}><MapPin size={12} color="#E63946" marginLeft={10} marginBottom={5} /><Text style={styles.distText}>{h.dist} away</Text></View>
              </View>
            </View>
          ))}
          <SeeMoreCard onPress={() => navigation.navigate('Hospitals')} />
        </ScrollView>

        {/* Top Doctors Section */}
        <SectionHeader title="Top Doctors" onSeeAll={() => navigation.navigate('DoctorsList')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListPadding}>
          {doctors.map(doc => (
            <View key={doc.id} style={styles.doctorCard}>
              <Image source={{ uri: doc.img }} style={styles.doctorAvatar} />
              <Text style={styles.cardTitle}>{doc.name}</Text>
              <Text style={styles.cardSubTitle}>{doc.specialty}</Text>
              <TouchableOpacity style={styles.primaryBtn}><Text style={styles.btnText}>Call Now</Text></TouchableOpacity>
            </View>
          ))}
          <SeeMoreCard onPress={() => navigation.navigate('DoctorsList')} />
        </ScrollView>

        {/* Top Reviews Section */}
        <Text style={styles.sectionTitleFixed}>Top Patient Reviews</Text>
        <View style={styles.reviewsWrapper}>
          {reviews.map(rev => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.revHeader}>
                <Text style={styles.revUser}>{rev.user}</Text>
                <View style={styles.stars}>
                  {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="#FFD700" color="#FFD700" />)}
                </View>
              </View>
              <Text style={styles.revComment}>{rev.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

// Sub-components
const SectionHeader = ({ title, onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity onPress={onSeeAll}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
  </View>
);

const CategoryItem = ({ IconComp, color, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.catItem}>
    <View style={styles.catIconWrapper}><IconComp color={color} size={24} /></View>
    <Text style={styles.catLabel}>{label}</Text>
  </TouchableOpacity>
);

const SeeMoreCard = ({ onPress }) => (
  <TouchableOpacity style={styles.seeMoreCard} onPress={onPress}>
    <View style={styles.plusCircle}><Plus color="#2D6A4F" size={28} /></View>
    <Text style={styles.seeMoreText}>Full List</Text>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC' 
  },
  scrollContent: {
    paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 25,
    alignItems: 'center' },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#E63946',
    width: 9,
    height: 9,
    borderRadius: 5, 
    zIndex: 2, 
    borderWidth: 1.5, 
    borderColor: '#F8FAFC' },
  heroCard: { 
    backgroundColor: '#FFF',
    margin: 16,
    padding: 24,
    borderRadius: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 4 },
  heroTitle: { 
    fontSize: 20,
     fontWeight: 'bold',
      color: '#333' },
  heroSubtitle: { 
    fontSize: 13,
     color: '#777', 
     marginTop: 6 },
  starIcon: { 
    fontSize: 36,
     color: '#E63946', 
     marginLeft: 10 },
  searchContainer: { 
    backgroundColor: '#FFF',
     marginHorizontal: 16,
      borderRadius: 16, 
      flexDirection: 'row',
       alignItems: 'center',
        paddingHorizontal: 16,
         height: 54, 
         elevation: 2 },
  searchInput: {
     flex: 1, 
    marginLeft: 12, 
    fontSize: 15 },
  categoryGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 20 },
  catItem: { width: '22%', alignItems: 'center' },
  catIconWrapper: { backgroundColor: '#FFF', padding: 14, borderRadius: 18, elevation: 3 },
  catLabel: { fontSize: 11, marginTop: 8, fontWeight: '600', color: '#444' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: '#2D6A4F', fontSize: 13, fontWeight: '700' },
  horizontalListPadding: { paddingLeft: 16, paddingRight: 8, paddingBottom: 10 },
  hospitalCard: { backgroundColor: '#FFF', width: 230, borderRadius: 22, marginRight: 16, elevation: 3, overflow: 'hidden' },
  hospitalImg: { width: '100%', height: 120, backgroundColor: '#EEE' },
  doctorCard: { backgroundColor: '#FFF', width: 180, borderRadius: 22, marginRight: 16, elevation: 3, alignItems: 'center', padding: 18 },
  doctorAvatar: { width: 75, height: 75, borderRadius: 38, marginBottom: 12 },
  cardTitle: { fontWeight: 'bold', fontSize: 15 },
  cardSubTitle: { color: '#888', fontSize: 13, marginBottom: 14 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  distText: { fontSize: 12, color: '#666', marginLeft: 5 },
  primaryBtn: { backgroundColor: '#FF5A5F', width: '100%', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  seeMoreCard: { backgroundColor: '#FFF', width: 150, borderRadius: 22, marginRight: 16, justifyContent: 'center', alignItems: 'center', elevation: 2, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#CCC' },
  plusCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  seeMoreText: { color: '#2D6A4F', fontWeight: 'bold' },
  sectionTitleFixed: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginTop: 30, marginBottom: 15 },
  reviewsWrapper: { paddingHorizontal: 16 },
  reviewCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 14, elevation: 2 },
  revHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  revUser: { fontWeight: 'bold', fontSize: 15 },
  stars: { flexDirection: 'row' },
  revComment: { color: '#555', fontSize: 14, lineHeight: 20 },
  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EEE', justifyContent: 'space-around', width: '100%', height: 80, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  tabItem: { alignItems: 'center', flex: 1 },
  tabLabel: { fontSize: 10, marginTop: 4, color: '#999' }
});

export default Home;