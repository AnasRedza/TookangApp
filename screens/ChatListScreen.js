import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';





const ChatListScreen = ({ navigation }) => {
  const { user, isHandyman } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    
    loadConversations();
    
    // Set up real-time listener
    const unsubscribe = chatService.subscribeToConversations(
      user.id,
      (updatedConversations) => {
        setConversations(updatedConversations);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error in conversations subscription:', error);
        setError('Failed to load conversations');
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe && unsubscribe();
  }, [user?.id]);

  const loadConversations = async () => {
    try {
      setError(null);
      const userConversations = await chatService.getUserConversations(user.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      
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
      // Get the other participant's info
      const otherParticipantId = conversation.participants.find(p => p !== user.id);
      const otherParticipant = conversation.participantDetails?.[otherParticipantId];
      
      navigation.navigate('Chat', { 
        conversationId: conversation.id,
        recipient: {
          id: otherParticipantId,
          name: otherParticipant?.name || 'User',
          avatar: getUserAvatarUri(otherParticipant),
          role: otherParticipant?.role
        },
        projectId: conversation.projectId,
        projectTitle: conversation.projectTitle
      });
    };
  
  const renderConversationItem = ({ item }) => {
    // Get the other participant's info
    const otherParticipantId = item.participants.find(p => p !== user.id);
    const otherParticipant = item.participantDetails?.[otherParticipantId];
    const unreadCount = item.unreadCount?.[user.id] || 0;
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => navigateToChat(item)}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: getUserAvatarUri(otherParticipant) }} 
            style={styles.avatar} 
          />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.name}>
              {otherParticipant?.name || 'Unknown User'}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.lastMessageTimestamp)}
            </Text>
          </View>
          
          {item.projectTitle && (
            <Text style={styles.projectName}>{item.projectTitle}</Text>
          )}
          
          <Text 
            style={[styles.lastMessage, unreadCount > 0 && styles.unreadMessage]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

if (isLoading) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>
              {error ? error : 'No conversations yet'}
            </Text>
            {error && (
              <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
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
  },
  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textMedium,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default ChatListScreen;