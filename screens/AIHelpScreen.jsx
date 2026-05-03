import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Send, MessageCircle } from 'lucide-react-native';

const GREEN = '#2D6A4F'; // nice modern green

const AIHelpScreen = () => {

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! How can I assist with your health concerns today?',
      sender: 'ai'
    }
  ]);

  const sendMessage = () => {
    if (message.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user'
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >

        <View style={styles.header}>
          <MessageCircle color={GREEN} size={28} />
          <Text style={[styles.title, { color: GREEN }]}>
            AI Medical Assistant
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.chatArea}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={msg.sender === 'ai' ? styles.aiBubble : styles.userBubble}
            >
              <Text
                style={[
                  styles.chatText,
                  msg.sender === 'user' && { color: '#FFF' }
                ]}
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Type symptoms..."
            style={styles.input}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Send color="#FFF" size={20} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginTop: 40
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10
  },

  chatArea: {
    padding: 20,
    flexGrow: 1
  },

  aiBubble: {
    backgroundColor: '#E6F9ED', // light green
    alignSelf: 'flex-start',
    padding: 15,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    marginBottom: 15,
    maxWidth: '80%'
  },

  userBubble: {
    backgroundColor: '#2D6A4F', // main green
    alignSelf: 'flex-end',
    padding: 15,
    borderRadius: 15,
    borderBottomRightRadius: 0,
    marginBottom: 15,
    maxWidth: '80%'
  },

  chatText: {
    fontSize: 14,
    lineHeight: 20
  },

  inputRow: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    alignItems: 'center'
  },

  input: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45
  },

  sendBtn: {
    backgroundColor:'#2D6A4F',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  }
});

export default AIHelpScreen;