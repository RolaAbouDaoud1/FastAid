import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Send, MessageCircle } from 'lucide-react-native';

const AIHelpScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><MessageCircle color="#6A4C93" size={28} /><Text style={styles.title}>AI Medical Assistant</Text></View>
      <ScrollView contentContainerStyle={styles.chatArea}>
        <View style={styles.aiBubble}><Text style={styles.chatText}>Hello! How can I assist with your health concerns today?</Text></View>
        <View style={styles.userBubble}><Text style={[styles.chatText, { color: '#FFF' }]}>I have a slight headache and feel dizzy.</Text></View>
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput placeholder="Type symptoms..." style={styles.input} />
        <TouchableOpacity style={styles.sendBtn}><Send color="#FFF" size={20} /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  chatArea: { padding: 20 },
  aiBubble: { backgroundColor: '#EEE', alignSelf: 'flex-start', padding: 15, borderRadius: 15, borderBottomLeftRadius: 0, marginBottom: 15, maxWidth: '80%' },
  userBubble: { backgroundColor: '#6A4C93', alignSelf: 'flex-end', padding: 15, borderRadius: 15, borderBottomRightRadius: 0, marginBottom: 15, maxWidth: '80%' },
  chatText: { fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', padding: 15, backgroundColor: '#FFF', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F1F3F5', borderRadius: 20, paddingHorizontal: 15, height: 45 },
  sendBtn: { backgroundColor: '#6A4C93', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});

export default AIHelpScreen;