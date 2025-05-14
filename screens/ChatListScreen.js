import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(
    userType === 'customer' ? MOCK_CONVERSATIONS : HANDYMAN_CONVERSATIONS
  );

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

  const renderItem = ({ item }) => {
    // Skip if filtering by search query
    if (
      searchQuery && 
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.project.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return null;
    }
    
    return (
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
          
          <View style={styles.conversationSubheader}>
            <Text style={styles.projectName}>
              {item.project}
              {userType === 'customer' && item.service ? ` • ${item.service}` : ''}
            </Text>
          </View>
          
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
  };

  const filtered = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    return (
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conversation.service && 
       conversation.service.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.darkGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={60} color={Colors.mediumGray} />
          <Text style={styles.emptyTitle}>No Conversations</Text>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? `No results found for "${searchQuery}"`
              : `Start communicating with your ${userType === 'customer' ? 'handymen' : 'customers'}`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <TouchableOpacity style={styles.newChatButton}>
        <Ionicons name="add" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80, // Extra space for the FAB
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
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
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  conversationSubheader: {
    marginBottom: 5,
  },
  projectName: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: Colors.text,
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
    color: Colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
  },
  newChatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ChatListScreen;