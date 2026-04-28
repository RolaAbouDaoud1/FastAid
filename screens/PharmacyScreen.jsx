import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Plus } from 'lucide-react-native';

const PharmacyScreen = () => {
  const products = [
    { id: '1', name: 'Panadol Advance', price: '$5.00', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300' },
    { id: '2', name: 'Vitamin C 1000mg', price: '$12.50', img: 'https://images.unsplash.com/photo-1616671285441-26966f36476e?w=300' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Quick Pharmacy</Text>
      <FlatList
        data={products}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.img }} style={styles.prodImg} />
            <Text style={styles.prodName}>{item.name}</Text>
            <Text style={styles.price}>{item.price}</Text>
            <TouchableOpacity style={styles.addBtn}><Plus color="#FFF" size={16} /></TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  productCard: { backgroundColor: '#FFF', flex: 0.5, margin: 8, padding: 15, borderRadius: 15, alignItems: 'center', elevation: 2 },
  prodImg: { width: 100, height: 100, borderRadius: 10 },
  prodName: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  price: { color: '#2D6A4F', marginTop: 5 },
  addBtn: { backgroundColor: '#2D6A4F', padding: 8, borderRadius: 10, marginTop: 10 }
});

export default PharmacyScreen;