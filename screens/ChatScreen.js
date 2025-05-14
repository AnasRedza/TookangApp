import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

// Mock data for conversations
const MOCK_MESSAGES = [
  {
    id: '1',
    text: 'Hello, I am interested in your plumbing services. I have a leaking sink that needs fixing.',
    sender: 'customer',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    text: 'Hi there! I would be happy to help you with your leaking sink. When would you like me to come and take a look?',
    sender: 'handyman',
    timestamp: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
  },
  {
    id: '3',
    text: 'Would tomorrow at 10am work for you?',
    sender: 'customer',
    timestamp: new Date(Date.now() - 79200000).toISOString(), // 22 hours ago
  },
  {
    id: '4',
    text: 'Yes, that works for me. Please send me your address and I will be there at 10am.',
    sender: 'handyman',
    timestamp: new Date(Date.now() - 75600000).toISOString(), // 21 hours ago
  },
  {
    id: '5',
    text: 'My address is 123 Main Street, Apartment 4B. There is parking available on the street.',
    sender: 'customer',
    timestamp: new Date(Date.now() - 72000000).toISOString(), // 20 hours ago
  },
  {
    id: '6',
    text: 'Great! I have your address noted. Do you know what type of sink it is? Is it a kitchen or bathroom sink?',
    sender: 'handyman',
    timestamp: new Date(Date.now() - 68400000).toISOString(), // 19 hours ago
  },
  {
    id: '7',
    text: 'It is a bathroom sink. The leak is coming from the pipe under the sink.',
    sender: 'customer',
    timestamp: new Date(Date.now() - 64800000).toISOString(), // 18 hours ago
  },
  {
    id: '8',
    text: 'Okay, I understand. I will bring the necessary tools and parts to fix a bathroom sink pipe. See you tomorrow at 10am!',
    sender: 'handyman',
    timestamp: new Date(Date.now() - 61200000).toISOString(), // 17 hours ago
  },
];

const ChatScreen = ({ route, navigation }) => {
  const { userType } = useAuth();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Get chat recipient from route params
  const { recipient } = route.params || {
    recipient: {
      id: 'default',
      name: userType === 'customer' ? 'John the Plumber' : 'Sarah Customer',
      avatar: userType === 'customer' 
        ? 'https://randomuser.me/api/portraits/men/1.jpg' 
        : 'https://randomuser.me/api/portraits/women/2.jpg',
      lastSeen: 'Online now',
    }
  };

  // Set navigation header with recipient info
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Image source={{ uri: recipient.avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{recipient.name}</Text>
            <Text style={styles.headerStatus}>{recipient.lastSeen}</Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call" size={22} color={Colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, recipient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: userType === 'customer' ? 'customer' : 'handyman',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate receiving a reply
    if (messages.length % 3 === 0) {
      setIsLoading(true);
      setTimeout(() => {
        const replyMessage = {
          id: (Date.now() + 1).toString(),
          text: userType === 'customer' 
            ? 'Thanks for your message! I will get back to you soon.' 
            : 'Got it! Let me know if you need anything else.',
          sender: userType === 'customer' ? 'handyman' : 'customer',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, replyMessage]);
        setIsLoading(false);
      }, 2000);
    }
  };

  const renderItem = ({ item, index }) => {
    const isCurrentUser = 
      (userType === 'customer' && item.sender === 'customer') || 
      (userType === 'handyman' && item.sender === 'handyman');
    
    // Show date separator if first message or if date changes from previous message
    const showDateSeparator = index === 0 || 
      formatDate(item.timestamp) !== formatDate(messages[index - 1].timestamp);
    
    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
          ]}>
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            ]}>{item.text}</Text>
          </View>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color={Colors.darkGray} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          {inputText.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={24} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic" size={24} color={Colors.darkGray} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerName: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerStatus: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.8,
  },
  headerButton: {
    marginRight: 10,
  },
  messagesList: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 2,
  },
  currentUserBubble: {
    backgroundColor: Colors.primary,
  },
  otherUserBubble: {
    backgroundColor: Colors.white,
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: Colors.white,
  },
  otherUserText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.darkGray,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 15,
  },
  dateSeparatorText: {
    backgroundColor: Colors.lightGray,
    color: Colors.darkGray,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  loadingContainer: {
    padding: 10,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1E1E1',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 70,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
  },
  micButton: {
    padding: 8,
  },
});

export default ChatScreen;