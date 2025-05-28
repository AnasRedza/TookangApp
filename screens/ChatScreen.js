import React, { useState, useRef, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';



const ChatScreen = ({ route, navigation }) => {
  const { user, isHandyman } = useAuth();
  
  // Get params from navigation
  const { 
    conversationId, 
    recipient, 
    projectId, 
    projectTitle 
  } = route?.params || {};
  
  // State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  // Refs
  const flatListRef = useRef(null);
  
  // Initialize conversation and load messages
  useEffect(() => {
    if (!user?.id || !recipient?.id) return;
    
    initializeChat();
  }, [user?.id, recipient?.id]);
  
  // Set up real-time message listener
  useEffect(() => {
    if (!currentConversationId) return;
    
    const unsubscribe = chatService.subscribeToMessages(
      currentConversationId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setIsLoading(false);
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      },
      (error) => {
        console.error('Error in messages subscription:', error);
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe && unsubscribe();
  }, [currentConversationId]);

  const initializeChat = async () => {
    try {
      let convId = currentConversationId;
      
      // Create conversation if it doesn't exist
      if (!convId) {
        const projectData = projectId ? { id: projectId, title: projectTitle } : null;
        convId = await chatService.createOrGetConversation(user.id, recipient.id, projectData);
        setCurrentConversationId(convId);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat');
    }
  };
  
  // Set header title with project info if available
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: recipient?.name || 'Chat',
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
      headerRight: () => projectTitle ? (
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle} numberOfLines={1}>
            {projectTitle}
          </Text>
        </View>
      ) : null,
      headerStyle: {
        backgroundColor: Colors.primary
      },
      headerTintColor: '#FFFFFF'
    });
  }, [navigation, recipient, projectTitle]);
  
  // Handle attaching image
  const handleAttachImage = () => {
    setIsAttaching(!isAttaching);
    // In a real app, you would open an image picker here
    if (!isAttaching) {
      alert("Image attachment functionality would open an image picker here");
    }
  };
  
  // Send message function
const handleSend = async () => {
  if (newMessage.trim() === '' || !currentConversationId || isSending) return;

  setIsSending(true);
  const messageText = newMessage.trim();
  setNewMessage(''); // Clear input immediately for better UX
  
  try {
    await chatService.sendMessage(
      currentConversationId,
      user.id,
      user.name,
      messageText
    );
    
    setIsAttaching(false);
  } catch (error) {
    console.error('Error sending message:', error);
    Alert.alert('Error', 'Failed to send message');
    // Restore message text if sending failed
    setNewMessage(messageText);
  } finally {
    setIsSending(false);
  }
};
  
 // Format message timestamp
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

  // Group messages by date
  const getMessageGroups = () => {
    const result = [];
    let currentDate = null;
    
    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp).toDateString();
      
      // If date changes or first message, add a date header
      if (messageDate !== currentDate) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        let dateLabel = messageDate;
        if (messageDate === today) dateLabel = 'Today';
        else if (messageDate === yesterday) dateLabel = 'Yesterday';
        else dateLabel = new Date(message.timestamp).toLocaleDateString();
        
        result.push({
          id: `date-${messageDate}`,
          type: 'date',
          date: dateLabel
        });
        currentDate = messageDate;
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
    const isMyMessage = item.senderId === user.id;
                      
    return (
      <View style={[
        styles.messageRow,
        isMyMessage ? styles.myMessageRow : styles.theirMessageRow
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.theirBubble
        ]}>
          {item.imageUrl && (
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
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };
  
    if (isLoading) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        </SafeAreaView>    
      );
    }

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
                (!newMessage.trim() || isSending) && styles.disabledButton
              ]}
              onPress={handleSend}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
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
  },
  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textMedium || '#666',
  },
  projectInfo: {
    marginRight: 15,
    maxWidth: 120,
  },
  projectTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  }
});

export default ChatScreen;