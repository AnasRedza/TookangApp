import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Mock data for messages
const MOCK_MESSAGES = [
  {
    id: '1',
    sender: 'recipient',
    text: "Hello! I'm interested in repairing my kitchen sink. Are you available this week?",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: '2',
    sender: 'user',
    text: "Hi there! Yes, I can help with your kitchen sink. What's the issue you're experiencing?",
    timestamp: new Date(Date.now() - 3000000).toISOString(), // A bit later
  },
  {
    id: '3',
    sender: 'recipient',
    text: 'The sink is draining very slowly and there\'s a small leak under the cabinet. I think the P-trap might need to be replaced.',
    timestamp: new Date(Date.now() - 2400000).toISOString(), 
  },
  {
    id: '4',
    sender: 'user',
    text: 'That sounds like it could be a clogged drain and worn-out seal. I can check it out and fix it. When would you like me to come over?',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '5',
    sender: 'recipient',
    text: 'Would tomorrow at 10am work for you?',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: '6',
    sender: 'user',
    text: 'That works for me. My rate is RM45/hour and I estimate it will take 1-2 hours depending on the condition of the pipes.',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '7',
    sender: 'recipient',
    text: 'That sounds good. Can you provide a total price estimate including any parts?',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  }
];

const ChatScreen = ({ route, navigation }) => {
  const { recipient } = route.params;
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    // Set header title and options
    navigation.setOptions({
      title: recipient.name,
      headerLeft: () => (
        <TouchableOpacity
          style={{ paddingLeft: 16 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerName}>{recipient.name}</Text>
          <Text style={styles.headerProject}>{recipient.project}</Text>
        </View>
      ),
    });
    
    // Hide bottom tab navigator when keyboard is shown
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      if (navigation.getParent()) {
        navigation.getParent().setOptions({
          tabBarStyle: { display: 'none' }
        });
      }
    });
    
    // Show bottom tab navigator when keyboard is hidden
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (navigation.getParent()) {
        navigation.getParent().setOptions({
          tabBarStyle: { display: 'flex' }
        });
      }
    });
    
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      // Restore tab bar when leaving screen
      if (navigation.getParent()) {
        navigation.getParent().setOptions({
          tabBarStyle: { display: 'flex' }
        });
      }
    };
  }, [navigation, recipient]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    // Add new message to the list
    const message = {
      id: Date.now().toString(),
      sender: 'user',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setIsLoading(true);
    
    // Add message immediately but simulate network delay
    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');

    // Scroll to bottom after message is sent
    setTimeout(() => {
      flatListRef.current?.scrollToEnd();
      setIsLoading(false);
    }, 300);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageItem = ({ item, index }) => {
    const isUser = item.sender === 'user';
    const showTimestamp = index === 0 || 
      new Date(item.timestamp).getDate() !== new Date(messages[index - 1].timestamp).getDate();
    
    // Group consecutive messages from the same sender
    const showAvatar = !isUser && (
      index === 0 || 
      messages[index - 1].sender !== 'recipient'
    );
    
    // Add extra styling for grouped messages
    const isFirstInGroup = index === 0 || messages[index - 1].sender !== item.sender;
    const isLastInGroup = index === messages.length - 1 || messages[index + 1].sender !== item.sender;
    
    const bubbleStyle = {
      ...(isUser ? styles.userMessageBubble : styles.recipientMessageBubble),
      ...(isFirstInGroup && { 
        borderTopLeftRadius: isUser ? 18 : (showAvatar ? 18 : 4),
        borderTopRightRadius: isUser ? (isFirstInGroup ? 18 : 4) : 18,
      }),
      ...(isLastInGroup && { 
        borderBottomLeftRadius: isUser ? 18 : (showAvatar ? 18 : 4),
        borderBottomRightRadius: isUser ? (isLastInGroup ? 18 : 4) : 18, 
      }),
      ...((!isFirstInGroup || !isLastInGroup) && {
        marginVertical: 2,
      })
    };
    
    return (
      <View>
        {showTimestamp && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.recipientMessageContainer,
          !isFirstInGroup && { marginTop: 1 },
          !isLastInGroup && { marginBottom: 1 }
        ]}>
          {showAvatar ? (
            <Image source={{ uri: recipient.avatar }} style={styles.avatar} />
          ) : !isUser ? (
            <View style={styles.avatarPlaceholder} />
          ) : null}
          <View style={[
            styles.messageBubble,
            bubbleStyle
          ]}>
            <Text style={[
              styles.messageText,
              isUser ? styles.userMessageText : null
            ]}>{item.text}</Text>
            <Text style={styles.timestampText}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            onFocus={() => {
              if (navigation.getParent()) {
                navigation.getParent().setOptions({
                  tabBarStyle: { display: 'none' }
                });
              }
            }}
            onBlur={() => {
              if (navigation.getParent()) {
                navigation.getParent().setOptions({
                  tabBarStyle: { display: 'flex' }
                });
              }
            }}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            disabled={isLoading || newMessage.trim() === ''}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Lighter background for a cleaner look
    position: 'relative',
    zIndex: 1,
  },
  keyboardAvoidContainer: {
    flex: 1,
    width: '100%',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerProject: {
    fontSize: 12,
    color: '#666',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  recipientMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessageBubble: {
    backgroundColor: Colors.primary || '#3498db',
  },
  recipientMessageBubble: {
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestampText: {
    fontSize: 10,
    color: '#AAA',
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    zIndex: 100,
    elevation: 5, // For Android
    position: 'relative', // Ensure proper stacking
    marginBottom: Platform.OS === 'android' ? 10 : 0, // Add some bottom margin on Android
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    color: '#333333', // Added explicit text color
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: Colors.primary || '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default ChatScreen;