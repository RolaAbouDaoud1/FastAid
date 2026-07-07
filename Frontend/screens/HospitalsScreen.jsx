import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Search, MapPin, Star } from "lucide-react-native";
import * as Location from "expo-location";
import API from "../services/api";
import HospitalAvatar from "../Avatar/InitialsAvatar";
// Fallback image when hospital has no image
// const FALLBACK_IMG = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400';


const HospitalsScreen = () => {
  const [search, setSearch] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // ── Fetch location then hospitals ──────────────────────
  // useEffect(() => {
  //   const init = async () => {
  //     // Try to get user location (best effort — doesn't block if denied)
  //     try {
  //       const { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status === 'granted') {
  //         const loc = await Location.getCurrentPositionAsync({
  //           accuracy: Location.Accuracy.Balanced,
  //         });
  //         setUserLocation(loc.coords);
  //         await fetchHospitals(loc.coords.latitude, loc.coords.longitude);
  //       } else {
  //         // No location permission — fetch without coordinates
  //         await fetchHospitals(null, null);
  //       }
  //     } catch {
  //       await fetchHospitals(null, null);
  //     }
  //   };
  //   init();
  // }, []);
  useEffect(() => {
    fetchHospitals();
  }, []);
  
  const fetchHospitals = async () => {
    setLoading(true);

    try {
      const res = await API.get("/hospitals"); // 👈 THIS is the key change
      setHospitals(res.data.hospitals || res.data || []);
    } catch (e) {
      console.log("Failed to load hospitals:", e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate straight-line distance in km between two coordinates
  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lat2) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  // Client-side search filter
  const filtered = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }) => {
    console.log(item.name, item.image_url);
    const distKm =
      userLocation && item.location?.lat && item.location?.lng
        ? getDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            item.location.lat,
            item.location.lng,
          )
        : null;

    return (
      <TouchableOpacity style={styles.card}>
        {/* <Image source={{ uri: item.image_url }} style={styles.img} /> */}
        <View style={styles.info}>
          <HospitalAvatar name={item.name} image_url={item.image_url} size={44} />
          <Text style={styles.name}>{item.name}</Text>

          <View style={styles.row}>
            {distKm ? (
              <>
                <MapPin size={14} color="#E63946" />
                <Text style={styles.sub}>{distKm} km • </Text>
              </>
            ) : item.address ? (
              <>
                <MapPin size={14} color="#E63946" />
                <Text style={styles.sub}>{item.address} • </Text>
              </>
            ) : null}

            {/* <Star size={14} fill="#FFD700" color="#FFD700" />
            <Text style={styles.sub}>
              {" "}
              {item.average_rating > 0
                ? `${item.average_rating} (${item.total_reviews})`
                : "No reviews"}
            </Text> */}
          </View>
          <View style={styles.row}>
        <Star size={14} fill="#FFD700" color="#FFD700" />
        <Text style={styles.sub}>
          {item.average_rating > 0
            ? `${item.average_rating} (${item.total_reviews})`
            : "No reviews"}
        </Text>
      </View>


          {/* Bed availability badge */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.available_beds === 0 ? "#FFE5E5" : "#E8F5E9",
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: item.available_beds === 0 ? "#E63946" : "#2D6A4F",
              }}
            >
              {item.available_beds === 0
                ? "🚨 Full"
                : `✅ ${item.available_beds} beds available`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Hospitals Directory</Text>

      <View style={styles.searchBar}>
        <Search color="#999" size={20} />
        <TextInput
          placeholder="Search by name..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ marginTop: 60 }}
        />
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No hospitals found.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  input: { flex: 1, marginLeft: 10 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
  },
  img: { width: "100%", height: 150, backgroundColor: "#EEE" },
  info: { padding: 15 },
  name: { fontSize: 16, fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  sub: { color: "#666", fontSize: 13 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 60,
    fontSize: 15,
  },
});

export default HospitalsScreen;
