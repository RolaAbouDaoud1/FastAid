// import React, { useState } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform
// } from 'react-native';
// import { Send, MessageCircle } from 'lucide-react-native';

// const GREEN = '#2D6A4F'; // nice modern green

// const AIHelpScreen = () => {

//   const [message, setMessage] = useState('');

//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: 'Hello! How can I assist with your health concerns today?',
//       sender: 'ai'
//     }
//   ]);

//   const sendMessage = () => {
//     if (message.trim() === '') return;

//     const newMessage = {
//       id: Date.now(),
//       text: message,
//       sender: 'user'
//     };

//     setMessages([...messages, newMessage]);
//     setMessage('');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={20}
//       >

//         <View style={styles.header}>
//           <MessageCircle color={GREEN} size={28} />
//           <Text style={[styles.title, { color: GREEN }]}>
//             AI Medical Assistant
//           </Text>
//         </View>

//         <ScrollView
//           contentContainerStyle={styles.chatArea}
//           keyboardShouldPersistTaps="handled"
//         >
//           {messages.map((msg) => (
//             <View
//               key={msg.id}
//               style={msg.sender === 'ai' ? styles.aiBubble : styles.userBubble}
//             >
//               <Text
//                 style={[
//                   styles.chatText,
//                   msg.sender === 'user' && { color: '#FFF' }
//                 ]}
//               >
//                 {msg.text}
//               </Text>
//             </View>
//           ))}
//         </ScrollView>

//         <View style={styles.inputRow}>
//           <TextInput
//             placeholder="Type symptoms..."
//             style={styles.input}
//             value={message}
//             onChangeText={setMessage}
//           />

//           <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
//             <Send color="#FFF" size={20} />
//           </TouchableOpacity>
//         </View>

//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAFC' },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//     marginTop: 40
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginLeft: 10
//   },

//   chatArea: {
//     padding: 20,
//     flexGrow: 1
//   },

//   aiBubble: {
//     backgroundColor: '#E6F9ED', // light green
//     alignSelf: 'flex-start',
//     padding: 15,
//     borderRadius: 15,
//     borderBottomLeftRadius: 0,
//     marginBottom: 15,
//     maxWidth: '80%'
//   },

//   userBubble: {
//     backgroundColor: '#2D6A4F', // main green
//     alignSelf: 'flex-end',
//     padding: 15,
//     borderRadius: 15,
//     borderBottomRightRadius: 0,
//     marginBottom: 15,
//     maxWidth: '80%'
//   },

//   chatText: {
//     fontSize: 14,
//     lineHeight: 20
//   },

//   inputRow: {
//     flexDirection: 'row',
//     padding: 15,
//     backgroundColor: '#FFF',
//     alignItems: 'center'
//   },

//   input: {
//     flex: 1,
//     backgroundColor: '#F1F3F5',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     height: 45
//   },

//   sendBtn: {
//     backgroundColor:'#2D6A4F',
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 10
//   }
// });

// export default AIHelpScreen;



import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, ScrollView,
  TouchableOpacity, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Linking, Alert
} from 'react-native';
import { Send, MessageCircle, MapPin, Star, Bed, Phone } from 'lucide-react-native';
import * as Location from 'expo-location';
import API from '../services/api';

const GREEN = '#2D6A4F';
const ANTHROPIC_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE'; // ← paste your key

// ── Call Claude claude-sonnet-4-20250514 to analyze the case ─────────────────────────
const analyzeCase = async (userMessage) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: `You are a medical triage assistant for FastAid, a Lebanese emergency app.
When the user describes a medical situation:
1. Identify the most urgent medical specialty needed (one of: Cardiology, Trauma Surgery, Neurosurgery, Neurology, Orthopedics, Emergency Medicine, Pediatrics, Oncology, General Surgery, Burns & Plastic Surgery, Obstetrics & Gynecology, Critical Care, Internal Medicine).
2. Give a brief (2-3 sentence) triage assessment.
3. State urgency level: CRITICAL / URGENT / MODERATE.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "specialty": "Trauma Surgery",
  "urgency": "CRITICAL",
  "assessment": "The patient likely has multiple trauma injuries from the fall...",
  "advice": "Keep the patient still, call emergency services immediately."
}`,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) throw new Error('AI service error');
  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
};

// ── Urgency colors ────────────────────────────────────────
const URGENCY_STYLE = {
  CRITICAL: { bg: '#FFE5E5', text: '#E63946', label: '🚨 CRITICAL' },
  URGENT:   { bg: '#FFF3E0', text: '#FB8500', label: '⚠️ URGENT' },
  MODERATE: { bg: '#E8F5E9', text: '#2D6A4F', label: '✅ MODERATE' },
};

// ── Hospital recommendation card ───────────────────────────
const HospitalCard = ({ item, index }) => (
  <View style={styles.hospCard}>
    <View style={styles.hospRank}>
      <Text style={styles.hospRankText}>#{index + 1}</Text>
    </View>
    <View style={styles.hospInfo}>
      <Text style={styles.hospName}>{item.hospital.name}</Text>
      <Text style={styles.hospLocation}>
        📍 {item.hospital.location_name || item.hospital.address}
        {item.hospital.distance_km ? ` • ${item.hospital.distance_km} km` : ''}
      </Text>

      <View style={styles.hospStats}>
        <View style={styles.stat}>
          <Star size={12} fill="#FFD700" color="#FFD700" />
          <Text style={styles.statText}> {item.hospital.average_rating}</Text>
        </View>
        <View style={styles.stat}>
          <Bed size={12} color={item.hospital.available_beds === 0 ? '#E63946' : GREEN} />
          <Text style={[styles.statText, { color: item.hospital.available_beds === 0 ? '#E63946' : GREEN }]}>
            {' '}{item.hospital.available_beds} beds
          </Text>
        </View>
      </View>

      {item.top_doctor && (
        <Text style={styles.hospDoctor}>
          👨‍⚕️ {item.top_doctor.name} — {item.top_doctor.specialization}
        </Text>
      )}

      {item.hospital.phone ? (
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${item.hospital.phone}`)}
        >
          <Phone size={13} color="#FFF" />
          <Text style={styles.callBtnText}>Call Hospital</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

// ── Main Screen ───────────────────────────────────────────
const AIHelpScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! Describe the medical situation and I will identify the right specialty and recommend the best hospitals in Lebanon.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const scrollRef = useRef(null);

  // Get user location silently
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation(loc.coords);
        }
      } catch {}
    })();
  }, []);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || loading) return;

    setMessage('');
    addMessage({ sender: 'user', text });
    setLoading(true);

    try {
      // ── Step 1: Claude analyzes the case ───────────────────
      const analysis = await analyzeCase(text);
      const urgencyStyle = URGENCY_STYLE[analysis.urgency] || URGENCY_STYLE.MODERATE;

      // Add AI assessment bubble
      addMessage({
        sender: 'ai',
        text: `${urgencyStyle.label}\n\n${analysis.assessment}\n\n💡 ${analysis.advice}`,
        urgency: analysis.urgency,
        specialty: analysis.specialty,
      });

      // ── Step 2: Fetch hospital recommendations ─────────────
      addMessage({ sender: 'ai', text: `🔍 Finding best hospitals for **${analysis.specialty}** in Lebanon...` });

      const params = new URLSearchParams({ specialty: analysis.specialty, limit: '5' });
      if (userLocation) {
        params.append('lat', userLocation.latitude);
        params.append('lng', userLocation.longitude);
      }

      const res = await API.get(`/recommend?${params.toString()}`);
      const { results, specialty } = res.data;

      if (!results || results.length === 0) {
        addMessage({
          sender: 'ai',
          text: `No hospitals found for ${specialty}. Please call emergency services: 140`,
        });
      } else {
        addMessage({
          sender: 'ai',
          text: `Top ${results.length} recommended hospitals for **${specialty}**:`,
          recommendations: results,
        });
      }
    } catch (err) {
      console.log('AI Error:', err.message);
      addMessage({
        sender: 'ai',
        text: 'Sorry, I had trouble analyzing that. Please call 140 for emergencies.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <MessageCircle color={GREEN} size={28} />
          <Text style={[styles.title, { color: GREEN }]}>AI Medical Assistant</Text>
        </View>

        {/* CHAT */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatArea}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const urgencyStyle = msg.urgency ? URGENCY_STYLE[msg.urgency] : null;

            return (
              <View
                key={msg.id}
                style={[
                  msg.sender === 'ai' ? styles.aiBubble : styles.userBubble,
                  urgencyStyle && { backgroundColor: urgencyStyle.bg, borderLeftWidth: 4, borderLeftColor: urgencyStyle.text },
                ]}
              >
                {/* Plain text message */}
                <Text
                  style={[
                    styles.chatText,
                    msg.sender === 'user' && { color: '#FFF' },
                    urgencyStyle && { color: '#222' },
                  ]}
                >
                  {msg.text}
                </Text>

                {/* Hospital recommendation cards */}
                {msg.recommendations && msg.recommendations.map((item, idx) => (
                  <HospitalCard key={item.hospital._id} item={item} index={idx} />
                ))}
              </View>
            );
          })}

          {loading && (
            <View style={styles.aiBubble}>
              <ActivityIndicator color={GREEN} size="small" />
              <Text style={[styles.chatText, { color: '#888', marginTop: 6 }]}>
                Analyzing case...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Describe symptoms or the situation..."
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={loading}
          >
            <Send color="#FFF" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AIHelpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  chatArea: { padding: 20, flexGrow: 1 },
  aiBubble: {
    backgroundColor: '#E6F9ED',
    alignSelf: 'flex-start',
    padding: 15,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    marginBottom: 15,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: GREEN,
    alignSelf: 'flex-end',
    padding: 15,
    borderRadius: 15,
    borderBottomRightRadius: 0,
    marginBottom: 15,
    maxWidth: '80%',
  },
  chatText: { fontSize: 14, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: GREEN,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // Hospital cards inside chat
  hospCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    elevation: 2,
  },
  hospRank: {
    backgroundColor: GREEN,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  hospRankText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  hospInfo: { flex: 1 },
  hospName: { fontSize: 13, fontWeight: 'bold', color: '#222' },
  hospLocation: { fontSize: 11, color: '#888', marginTop: 2 },
  hospStats: { flexDirection: 'row', marginTop: 6, gap: 14 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 12, color: '#555' },
  hospDoctor: { fontSize: 11, color: '#2D6A4F', marginTop: 5 },
  callBtn: {
    backgroundColor: '#E63946',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    gap: 5,
  },
  callBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },
});
