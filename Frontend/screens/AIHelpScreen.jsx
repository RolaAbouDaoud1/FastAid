import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';

import { Send, MessageCircle, Star, Bed, Phone } from 'lucide-react-native';
import * as Location from 'expo-location';
import { analyzeCase, fetchHospitals } from '../services/medicalAI';

const GREEN = '#2D6A4F';

const URGENCY_STYLE = {
  CRITICAL: { bg: '#FFE5E5', text: '#E63946', label: '🚨 CRITICAL' },
  URGENT:   { bg: '#FFF3E0', text: '#FB8500', label: '⚠️ URGENT' },
  MODERATE: { bg: '#E8F5E9', text: '#2D6A4F', label: '✅ MODERATE' },
};

const HospitalCard = ({ item, index }) => (
  <View style={styles.hospCard}>
    <View style={styles.hospRank}>
      <Text style={styles.hospRankText}>#{index + 1}</Text>
    </View>

    <View style={styles.hospInfo}>
      <Text style={styles.hospName}>{item.name}</Text>
      <Text style={styles.hospLocation}>
        📍 {item.location_name || item.address || 'Lebanon'}
      </Text>

      <View style={styles.hospStats}>
        {item.average_rating > 0 && (
          <View style={styles.stat}>
            <Star size={12} fill="#FFD700" color="#FFD700" />
            <Text style={styles.statText}>{item.average_rating}</Text>
          </View>
        )}

        <View style={styles.stat}>
          <Bed size={12} color={GREEN} />
          <Text style={styles.statText}>{item.available_beds ?? '?'} beds</Text>
        </View>

        {item.phone && (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Phone size={13} color="#FFF" />
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
);

export default function AIHelpScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! Describe the medical situation and I will help you.',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
      }
    })();
  }, []);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, { id: Date.now(), ...msg }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const text = message;
    setMessage('');

    addMessage({ sender: 'user', text });
    setLoading(true);

    try {
      const analysis = await analyzeCase(text, userLocation);

      addMessage({
        sender: 'ai',
        text: `${analysis.assessment}\n\n${analysis.advice}`,
        symptom: analysis.symptom,
        specialty: analysis.specialty,
      });

      let hospitals = analysis.hospitals;

      if (!hospitals.length) {
        hospitals = await fetchHospitals(analysis.specialty, userLocation);
      }

      if (hospitals.length) {
        addMessage({
          sender: 'ai',
          text: `Hospitals for ${analysis.specialty}:`,
          recommendations: hospitals,
        });
      }

    } catch (err) {
      addMessage({ sender: 'ai', text: 'Error occurred.' });
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >

        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                padding: 10,
                margin: 10,
                backgroundColor: msg.sender === 'ai' ? '#eee' : GREEN,
                borderRadius: 10,
                alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
              }}
            >
              <Text style={{ color: msg.sender === 'ai' ? '#000' : '#fff' }}>

                {msg.symptom ? (
                  <>
                    <Text>
                      Symptom:{' '}
                      <Text style={{ color: 'green', fontWeight: 'bold' }}>
                        {msg.symptom}
                      </Text>
                    </Text>

                    {'\n'}

                    <Text>
                      Specialty:{' '}
                      <Text style={{ color: '#2D6A4F', fontWeight: 'bold' }}>
                        {msg.specialty}
                      </Text>
                    </Text>

                    {'\n\n'}
                    {msg.text}
                  </>
                ) : (
                  msg.text
                )}

              </Text>

              {msg.recommendations?.map((item, i) => (
                <HospitalCard key={i} item={item} index={i} />
              ))}
            </View>
          ))}

          {loading && (
            <ActivityIndicator size="small" color={GREEN} />
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type message..."
            style={styles.input}
          />

          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Send color="#fff" size={18} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 10,
    padding: 10,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: GREEN,
    padding: 10,
    borderRadius: 10,
  },
  hospCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  hospRank: {
    width: 25,
    height: 25,
    borderRadius: 12,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospRankText: { color: '#fff' },
  hospName: { fontWeight: 'bold' },
  hospLocation: { fontSize: 12, color: '#777' },
  hospStats: { flexDirection: 'row', marginTop: 5, gap: 10 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12 },
  callBtn: {
    backgroundColor: '#E63946',
    padding: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  callBtnText: { color: '#fff', marginLeft: 5 },
});



// import React, { useState, useRef, useEffect } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Linking,
// } from 'react-native';

// import { Send, MessageCircle, Star, Bed, Phone } from 'lucide-react-native';
// import * as Location from 'expo-location';
// import API from '../services/api';

// const GREEN = '#2D6A4F';

// const URGENCY_STYLE = {
//   CRITICAL: { bg: '#FFE5E5', text: '#E63946', label: '🚨 CRITICAL' },
//   URGENT:   { bg: '#FFF3E0', text: '#FB8500', label: '⚠️ URGENT' },
//   MODERATE: { bg: '#E8F5E9', text: '#2D6A4F', label: '✅ MODERATE' },
// };

// const SPECIALTY_KEYWORDS = {
//   Cardiology: ['chest pain','heart','palpitation','shortness of breath','cardiac'],
//   Neurology: ['headache','migraine','stroke','seizure','dizzy'],
//   Orthopedics: ['bone','fracture','joint','back pain'],
//   Pulmonology: ['cough','breathing','asthma','lung'],
//   Gastroenterology: ['stomach','nausea','vomiting'],
//   Dermatology: ['rash','skin','itch','burn'],
//   Ophthalmology: ['eye','vision','blur'],
//   ENT: ['ear','nose','throat'],
//   Psychiatry: ['anxiety','depression','panic'],
//   Emergency: ['unconscious','bleeding','accident','not breathing'],
// };

// const detectSpecialtyLocally = (text) => {
//   const lower = text.toLowerCase();
//   for (const [spec, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
//     if (keywords.some(k => lower.includes(k))) return spec;
//   }
//   return 'Emergency';
// };

// const detectUrgencyLocally = (text) => {
//   const lower = text.toLowerCase();
//   const critical = ['not breathing','unconscious','stroke','heart attack','bleeding'];
//   const urgent = ['chest pain','fracture','severe','high fever'];

//   if (critical.some(w => lower.includes(w))) return 'CRITICAL';
//   if (urgent.some(w => lower.includes(w))) return 'URGENT';
//   return 'MODERATE';
// };

// const analyzeCase = async (userMessage, userLocation) => {
//   try {
//     const body = { symptoms: userMessage };

//     if (userLocation) {
//       body.lat = userLocation.latitude;
//       body.lng = userLocation.longitude;
//     }

//     const res = await API.post('/ai/recommend', body);
//     const data = res.data;

//     return {
//       specialty: data.speciality || detectSpecialtyLocally(userMessage),
//       urgency: detectUrgencyLocally(userMessage),
//       symptom: userMessage,   // ✅ ADDED
//       assessment: `Based on your symptoms, the most likely condition is ${data.top_disease}.`,
//       advice: 'Please seek medical attention promptly.',
//       hospitals: data.recommended_hospitals || [],
//       usedAI: true,
//     };

//   } catch (err) {
//     return {
//       specialty: detectSpecialtyLocally(userMessage),
//       urgency: detectUrgencyLocally(userMessage),
//       symptom: userMessage,   // ✅ ADDED
//       assessment: 'Based on your description, we identified the needed specialty.',
//       advice: 'Please seek medical attention promptly.',
//       hospitals: [],
//       usedAI: false,
//     };
//   }
// };

// const fetchHospitals = async (specialty, userLocation) => {
//   const params = { limit: 5 };

//   if (userLocation) {
//     params.lat = userLocation.latitude;
//     params.lng = userLocation.longitude;
//   }

//   const queryString = new URLSearchParams(params).toString();
//   const res = await API.get(`/hospitals/nearby?${queryString}`);

//   return res.data.hospitals || [];
// };

// const HospitalCard = ({ item, index }) => (
//   <View style={styles.hospCard}>
//     <View style={styles.hospRank}>
//       <Text style={styles.hospRankText}>#{index + 1}</Text>
//     </View>

//     <View style={styles.hospInfo}>
//       <Text style={styles.hospName}>{item.name}</Text>
//       <Text style={styles.hospLocation}>
//         📍 {item.location_name || item.address || 'Lebanon'}
//       </Text>

//       <View style={styles.hospStats}>
//         {item.average_rating > 0 && (
//           <View style={styles.stat}>
//             <Star size={12} fill="#FFD700" color="#FFD700" />
//             <Text style={styles.statText}>{item.average_rating}</Text>
//           </View>
//         )}

//         <View style={styles.stat}>
//           <Bed size={12} color={GREEN} />
//           <Text style={styles.statText}>{item.available_beds ?? '?'} beds</Text>
//         </View>

//         {item.phone && (
//           <TouchableOpacity
//             style={styles.callBtn}
//             onPress={() => Linking.openURL(`tel:${item.phone}`)}
//           >
//             <Phone size={13} color="#FFF" />
//             <Text style={styles.callBtnText}>Call</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   </View>
// );

// export default function AIHelpScreen() {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       sender: 'ai',
//       text: 'Hello! Describe the medical situation and I will help you.',
//     },
//   ]);

//   const [loading, setLoading] = useState(false);
//   const [userLocation, setUserLocation] = useState(null);

//   const scrollRef = useRef(null);

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === 'granted') {
//         const loc = await Location.getCurrentPositionAsync({});
//         setUserLocation(loc.coords);
//       }
//     })();
//   }, []);

//   const addMessage = (msg) => {
//     setMessages(prev => [...prev, { id: Date.now(), ...msg }]);
//     setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
//   };

//   const sendMessage = async () => {
//     if (!message.trim() || loading) return;

//     const text = message;
//     setMessage('');

//     addMessage({ sender: 'user', text });
//     setLoading(true);

//     try {
//       const analysis = await analyzeCase(text, userLocation);

//       addMessage({
//         sender: 'ai',
//         text: `${analysis.assessment}\n\n${analysis.advice}`,
//         symptom: analysis.symptom,        // ✅ ADDED
//         specialty: analysis.specialty,    // ✅ ADDED
//       });

//       let hospitals = analysis.hospitals;

//       if (!hospitals.length) {
//         hospitals = await fetchHospitals(analysis.specialty, userLocation);
//       }

//       if (hospitals.length) {
//         addMessage({
//           sender: 'ai',
//           text: `Hospitals for ${analysis.specialty}:`,
//           recommendations: hospitals,
//         });
//       }

//     } catch (err) {
//       addMessage({ sender: 'ai', text: 'Error occurred.' });
//     }

//     setLoading(false);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={90}
//       >

//         <ScrollView
//           ref={scrollRef}
//           keyboardShouldPersistTaps="handled"
//           contentContainerStyle={{ flexGrow: 1 }}
//         >
//           {messages.map((msg) => (
//             <View
//               key={msg.id}
//               style={{
//                 padding: 10,
//                 margin: 10,
//                 backgroundColor: msg.sender === 'ai' ? '#eee' : GREEN,
//                 borderRadius: 10,
//                 alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
//               }}
//             >
//               <Text style={{ color: msg.sender === 'ai' ? '#000' : '#fff' }}>

//                 {/* ✅ ONLY CHANGE: colored text */}
//                 {msg.symptom ? (
//                   <>
//                     <Text>
//                       Symptom:{' '}
//                       <Text style={{ color: 'green', fontWeight: 'bold' }}>
//                         {msg.symptom}
//                       </Text>
//                     </Text>

//                     {'\n'}

//                     <Text>
//                       Specialty:{' '}
//                       <Text style={{ color: '#2D6A4F', fontWeight: 'bold' }}>
//                         {msg.specialty}
//                       </Text>
//                     </Text>

//                     {'\n\n'}
//                     {msg.text}
//                   </>
//                 ) : (
//                   msg.text
//                 )}

//               </Text>

//               {msg.recommendations?.map((item, i) => (
//                 <HospitalCard key={i} item={item} index={i} />
//               ))}
//             </View>
//           ))}

//           {loading && (
//             <ActivityIndicator size="small" color={GREEN} />
//           )}
//         </ScrollView>

//         <View style={styles.inputRow}>
//           <TextInput
//             value={message}
//             onChangeText={setMessage}
//             placeholder="Type message..."
//             style={styles.input}
//           />

//           <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
//             <Send color="#fff" size={18} />
//           </TouchableOpacity>
//         </View>

//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAFC' },
//   inputRow: {
//     flexDirection: 'row',
//     padding: 10,
//     backgroundColor: '#fff',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#eee',
//     borderRadius: 10,
//     padding: 10,
//   },
//   sendBtn: {
//     marginLeft: 10,
//     backgroundColor: GREEN,
//     padding: 10,
//     borderRadius: 10,
//   },
//   hospCard: {
//     backgroundColor: '#fff',
//     padding: 10,
//     marginTop: 10,
//     borderRadius: 10,
//   },
//   hospRank: {
//     width: 25,
//     height: 25,
//     borderRadius: 12,
//     backgroundColor: GREEN,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   hospRankText: { color: '#fff' },
//   hospName: { fontWeight: 'bold' },
//   hospLocation: { fontSize: 12, color: '#777' },
//   hospStats: { flexDirection: 'row', marginTop: 5, gap: 10 },
//   stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
//   statText: { fontSize: 12 },
//   callBtn: {
//     backgroundColor: '#E63946',
//     padding: 5,
//     borderRadius: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   callBtnText: { color: '#fff', marginLeft: 5 },
// });