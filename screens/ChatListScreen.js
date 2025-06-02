import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert
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

  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time listener for conversations
    const unsubscribe = chatService.subscribeToConversations(
      user.id,
      (updatedConversations) => {
        setConversations(updatedConversations);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error in conversations subscription:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [user?.id]);

  const onRefresh = async () => {
    if (!user?.id) return;
    
    setRefreshing(true);
    try {
      const updatedConversations = await chatService.getUserConversations(user.id);
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
      Alert.alert('Error', 'Failed to refresh conversations');
    } finally {
      setRefreshing(false);
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - messageDate) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation.participantDetails) return null;
    
    const otherParticipantId = conversation.participants?.find(id => id !== user.id);
    if (!otherParticipantId) return null;
    
    const otherParticipant = conversation.participantDetails[otherParticipantId];
    return otherParticipant || null;
  };

  const formatLastMessage = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    // Handle different message types
    switch (conversation.lastMessageType) {
      case 'image':
        return '📷 Image';
      case 'offer':
        return '💼 New Offer';
      case 'system':
        return '🔔 System Message';
      default:
        return conversation.lastMessage.length > 40 
          ? conversation.lastMessage.substring(0, 40) + '...'
          : conversation.lastMessage;
    }
  };

  const navigateToChat = (conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) {
      Alert.alert('Error', 'Unable to load chat participant information');
      return;
    }

    // Mark messages as read when opening chat
    chatService.markMessagesAsRead(conversation.id, user.id).catch(error => {
      console.error('Error marking messages as read:', error);
    });

    navigation.navigate('Chat', {
      conversationId: conversation.id,
      recipient: {
        id: otherParticipant.id,
        name: otherParticipant.name,
        avatar: getUserAvatarUri({ 
          name: otherParticipant.name, 
          profilePicture: otherParticipant.avatar 
        }),
        role: otherParticipant.role
      },
      projectId: conversation.projectId,
      projectTitle: conversation.projectTitle
    });
  };

  const renderConversationItem = ({ item }) => {
    const otherParticipant = getOtherParticipant(item);
    if (!otherParticipant) return null;

    const unreadCount = item.unreadCount?.[user.id] || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
        onPress={() => navigateToChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: getUserAvatarUri({ 
                name: otherParticipant.name, 
                profilePicture: otherParticipant.avatar 
              })
            }}
            style={styles.avatar}
          />
          {otherParticipant.role === 'handyman' && (
            <View style={styles.roleBadge}>
              <Ionicons name="build" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.participantName, hasUnread && styles.unreadText]}>
              {otherParticipant.name}
            </Text>
            <Text style={styles.lastMessageTime}>
              {formatLastMessageTime(item.lastMessageTimestamp)}
            </Text>
          </View>

          {/* Project info if available */}
          {item.projectTitle && (
            <View style={styles.projectInfo}>
              <Ionicons name="briefcase-outline" size={12} color={Colors.primary} />
              <Text style={styles.projectTitle} numberOfLines={1}>
                {item.projectTitle}
              </Text>
            </View>
          )}

          <View style={styles.lastMessageContainer}>
            <Text 
              style={[styles.lastMessage, hasUnread && styles.unreadText]} 
              numberOfLines={1}
            >
              {formatLastMessage(item)}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
      <Text style={styles.emptyStateText}>
        {isHandyman 
          ? 'Start conversations with your customers to discuss projects'
          : 'Start conversations with handymen about your projects'
        }
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.emptyStateButtonText}>
          {isHandyman ? 'Find Projects' : 'Browse Services'}
        </Text>
      </TouchableOpacity>
    </View>
  );

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
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={conversations.length === 0 ? styles.emptyListContainer : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  unreadConversation: {
    backgroundColor: '#FAFBFC',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#999999',
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatListScreen;