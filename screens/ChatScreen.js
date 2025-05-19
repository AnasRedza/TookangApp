import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

// Simple mock messages with dates
const MOCK_MESSAGES = [
  { 
    id: '1', 
    sender: 'customer', 
    text: "Hello! I'm interested in repairing my kitchen sink.", 
    timestamp: '9:30 AM',
    date: 'Today',
    hasImage: false
  },
  { 
    id: '2', 
    sender: 'handyman', 
    text: "Hi there! I can help with your kitchen sink. What's the issue?", 
    timestamp: '9:35 AM',
    date: 'Today',
    hasImage: false
  },
  { 
    id: '3', 
    sender: 'customer', 
    text: 'The sink is draining slowly and there\'s a small leak under the cabinet.', 
    timestamp: '9:40 AM',
    date: 'Today',
    hasImage: true,
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg' // Placeholder image
  },
  { 
    id: '4', 
    sender: 'handyman', 
    text: 'I can check it out and fix it. When would you like me to come over?', 
    timestamp: '9:45 AM',
    date: 'Today',
    hasImage: false
  },
  { 
    id: '5', 
    sender: 'customer', 
    text: 'Would tomorrow at 10am work for you?', 
    timestamp: '9:50 AM',
    date: 'Today',
    hasImage: false
  },
  { 
    id: '6', 
    sender: 'handyman', 
    text: 'That works for me. My rate is RM45/hour for 1-2 hours.', 
    timestamp: '9:55 AM',
    date: 'Today',
    hasImage: false
  },
];

const ChatScreen = ({ route, navigation }) => {
  const { isHandyman } = useAuth();
  
  // Default recipient if none is provided
  const defaultRecipient = {
    name: isHandyman ? 'Sarah Client' : 'John the Handyman',
  };
  
  // Get recipient from route params or use default
  const recipient = route?.params?.recipient || defaultRecipient;
  
  // State
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);

  // Refs
  const flatListRef = useRef(null);
  
  // Set header title with white back button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: recipient.name,
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: Colors.primary
      },
      headerTintColor: '#FFFFFF'
    });
  }, [navigation, recipient]);
  
  // Handle attaching image
  const handleAttachImage = () => {
    setIsAttaching(!isAttaching);
    // In a real app, you would open an image picker here
    if (!isAttaching) {
      alert("Image attachment functionality would open an image picker here");
    }
  };
  
  // Send message function
  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now().toString(),
      sender: isHandyman ? 'handyman' : 'customer',
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: 'Today',
      hasImage: false
    };

    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');
    setIsAttaching(false);
    
    // Scroll to bottom after sending
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd();
      }
    }, 100);
  };
  
  // Group messages by date
  const getMessageGroups = () => {
    const result = [];
    let currentDate = null;
    
    messages.forEach((message) => {
      // If date changes or first message, add a date header
      if (message.date !== currentDate) {
        result.push({
          id: `date-${message.date}`,
          type: 'date',
          date: message.date
        });
        currentDate = message.date;
      }
      
      result.push({
        ...message,
        type: 'message'
      });
    });
    
    return result;
  };
  
  // Render item (date header or message)
  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      );
    }
    
    // Message rendering
    const isMyMessage = (isHandyman && item.sender === 'handyman') || 
                      (!isHandyman && item.sender === 'customer');
                      
    return (
      <View style={[
        styles.messageRow,
        isMyMessage ? styles.myMessageRow : styles.theirMessageRow
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.theirBubble
        ]}>
          {item.hasImage && (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.messageImage} 
              resizeMode="cover"
            />
          )}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timeText,
            isMyMessage ? styles.myTimeText : styles.theirTimeText
          ]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
      >
        <FlatList
          ref={flatListRef}
          data={getMessageGroups()}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onLayout={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
        />
        
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={[styles.attachButton, isAttaching && styles.attachButtonActive]}
            onPress={handleAttachImage}
          >
            <Ionicons name="image-outline" size={24} color={isAttaching ? Colors.primary : "#999"} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxHeight={80}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              !newMessage.trim() && styles.disabledButton
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageRow: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
  },
  theirMessageRow: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  myBubble: {
    backgroundColor: Colors.primary,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#333333',
  },
  timeText: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimeText: {
    color: '#999999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  attachButtonActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  }
});

export default ChatScreen;