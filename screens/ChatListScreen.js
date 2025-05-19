import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

// Mock data for conversation list - CUSTOMER VIEW
const CUSTOMER_CONVERSATIONS = [
  {
    id: '1',
    name: 'John the Plumber',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastMessage: 'I will bring the necessary tools tomorrow at 10am.',
    timestamp: new Date(Date.now() - 61200000).toISOString(),
    unread: 0,
    project: 'Bathroom Sink Repair',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: "I've finished painting the living room. Let me know what you think!",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    unread: 2,
    project: 'Living Room Renovation',
  },
  {
    id: '3',
    name: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    lastMessage: 'The ceiling fan installation is complete.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    unread: 0,
    project: 'Ceiling Fan Installation',
  },
];

// Mock data for conversation list - HANDYMAN VIEW
const HANDYMAN_CONVERSATIONS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    lastMessage: 'What time can you arrive tomorrow to fix my bathroom sink?',
    timestamp: new Date(Date.now() - 61200000).toISOString(),
    unread: 0,
    project: 'Bathroom Sink Repair',
    isNewRequest: false,
  },
  {
    id: '2',
    name: 'James Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    lastMessage: 'When can you start the kitchen renovation?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    unread: 3,
    project: 'Kitchen Renovation',
    isNewRequest: true,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    lastMessage: 'Could you bring some paint samples next time?',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    unread: 0,
    project: 'Living Room Painting',
  },
];

const ChatListScreen = ({ navigation }) => {
  const { isHandyman } = useAuth();
  const conversations = isHandyman ? HANDYMAN_CONVERSATIONS : CUSTOMER_CONVERSATIONS;

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const navigateToChat = (conversation) => {
    navigation.navigate('Chat', { 
      recipient: {
        id: conversation.id,
        name: conversation.name,
        avatar: conversation.avatar,
        project: conversation.project
      } 
    });
  };
  
  const renderConversationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.conversationItem, item.isNewRequest && styles.newRequestItem]}
      onPress={() => navigateToChat(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        
        <Text style={styles.projectName}>{item.project}</Text>
        
        <Text 
          style={[styles.lastMessage, item.unread > 0 && styles.unreadMessage]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage}
        </Text>
      </View>
      
      {isHandyman && item.isNewRequest && (
        <View style={styles.newRequestIndicator}>
          <Text style={styles.newRequestText}>NEW</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  newRequestItem: {
    backgroundColor: '#FFFDE7',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  projectName: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  newRequestIndicator: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'center',
    marginLeft: 8,
  },
  newRequestText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
  }
});

export default ChatListScreen;