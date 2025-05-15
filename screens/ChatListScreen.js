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

// Mock data for conversation list
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name: 'John the Plumber',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastMessage: 'Okay, I understand. I will bring the necessary tools and parts to fix a bathroom sink pipe. See you tomorrow at 10am!',
    timestamp: new Date(Date.now() - 61200000).toISOString(), // 17 hours ago
    unread: 0,
    userType: 'handyman',
    service: 'Plumbing',
    project: 'Bathroom Sink Repair',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: "I've finished painting the living room. Let me know what you think!",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    unread: 2,
    userType: 'handyman',
    service: 'Painting',
    project: 'Living Room Renovation',
  },
  {
    id: '3',
    name: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    lastMessage: 'The ceiling fan installation is complete. Here are some care instructions.',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    unread: 0,
    userType: 'handyman',
    service: 'Electrical',
    project: 'Ceiling Fan Installation',
  },
  {
    id: '4',
    name: 'Jennifer Lopez',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    lastMessage: 'Your garden looks beautiful now. I\'ve left some plant care tips in your mailbox.',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    unread: 0,
    userType: 'handyman',
    service: 'Landscaping',
    project: 'Garden Maintenance',
  },
  {
    id: '5',
    name: 'David Lee',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    lastMessage: 'I\'ll be arriving at 9am tomorrow to fix your AC unit.',
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    unread: 1,
    userType: 'handyman',
    service: 'HVAC',
    project: 'AC Repair',
  },
];

const HANDYMAN_CONVERSATIONS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    lastMessage: 'Okay, I understand. I will bring the necessary tools and parts to fix a bathroom sink pipe. See you tomorrow at 10am!',
    timestamp: new Date(Date.now() - 61200000).toISOString(), // 17 hours ago
    unread: 0,
    userType: 'customer',
    project: 'Bathroom Sink Repair',
  },
  {
    id: '2',
    name: 'James Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    lastMessage: 'Thanks for your quote. When can you start the kitchen renovation?',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    unread: 3,
    userType: 'customer',
    project: 'Kitchen Renovation',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    lastMessage: 'Could you bring some paint samples next time?',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    unread: 0,
    userType: 'customer',
    project: 'Living Room Painting',
  },
];

const ChatListScreen = ({ navigation }) => {
  const { userType } = useAuth();
  const conversations = userType === 'customer' ? MOCK_CONVERSATIONS : HANDYMAN_CONVERSATIONS;

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Last week - show day name
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[messageDate.getDay()];
    } else {
      // Older - show date
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const navigateToChat = (conversation) => {
    navigation.navigate('Chat', { 
      recipient: {
        id: conversation.id,
        name: conversation.name,
        avatar: conversation.avatar,
        lastSeen: 'Online now',
        service: conversation.service,
        project: conversation.project,
      } 
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
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
        
        <Text style={styles.projectName}>
          {item.project}
        </Text>
        
        <Text 
          style={[styles.lastMessage, item.unread > 0 && styles.unreadMessage]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Conversation List */}
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={50} color="#CCC" />
          <Text style={styles.emptyTitle}>No Messages</Text>
          <Text style={styles.emptyText}>
            You don't have any conversations yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    backgroundColor: Colors.primary || '#3498db',
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
    marginBottom: 2,
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
    color: Colors.primary || '#3498db',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  }
});

export default ChatListScreen;