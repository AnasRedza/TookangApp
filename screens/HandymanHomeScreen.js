// Enhanced HandymanHomeScreen.js Implementation with Navigation

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Mock project requests data
const PROJECT_REQUESTS = [
  {
    id: '1',
    title: 'Fix leaking bathroom sink',
    clientName: 'Sarah Johnson',
    description: 'The sink in the main bathroom has been leaking for a few days. Need someone to fix it ASAP.',
    category: 'Plumbing',
    budget: 100,
    location: 'Kuala Lumpur',
    date: '2025-05-10',
    status: 'New',
  },
  {
    id: '2',
    title: 'Install ceiling fan',
    clientName: 'Michael Chen',
    description: 'Need a new ceiling fan installed in the living room. I have the fan, just need installation.',
    category: 'Electrical',
    budget: 80,
    location: 'Petaling Jaya',
    date: '2025-05-15',
    status: 'New',
  },
  {
    id: '3',
    title: 'Paint living room walls',
    clientName: 'Jessica Tan',
    description: 'Looking for someone to paint my living room. The room is approximately 15 x 20 feet with 9-foot ceilings.',
    category: 'Painting',
    budget: 350,
    location: 'Subang Jaya',
    date: '2025-05-20',
    status: 'New',
  },
];

const HandymanHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [projectRequests, setProjectRequests] = useState(PROJECT_REQUESTS);
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'accepted', 'completed'

  // Filter project requests based on the active tab
  const filteredRequests = projectRequests.filter((project) => {
    if (activeTab === 'new') return project.status === 'New';
    if (activeTab === 'accepted') return project.status === 'Accepted';
    if (activeTab === 'completed') return project.status === 'Completed';
    return true;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAcceptProject = useCallback((projectId) => {
    setProjectRequests(prevProjects =>
      prevProjects.map((project) =>
        project.id === projectId ? { ...project, status: 'Accepted' } : project
      )
    );
  }, []);

  const handleDeclineProject = useCallback((projectId) => {
    setProjectRequests(prevProjects =>
      prevProjects.filter((project) => project.id !== projectId)
    );
  }, []);

  const getCategoryIcon = useCallback((category) => {
    switch (category.toLowerCase()) {
      case 'plumbing':
        return 'water-outline';
      case 'electrical':
        return 'flash-outline';
      case 'painting':
        return 'color-palette-outline';
      case 'carpentry':
        return 'hammer-outline';
      case 'landscaping':
        return 'leaf-outline';
      default:
        return 'construct-outline';
    }
  }, []);

  // Navigation function to view project details
  const handleViewProjectDetails = useCallback((project) => {
    navigation.navigate('ProjectDetails', { project });
  }, [navigation]);

  const renderProjectItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => handleViewProjectDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Ionicons name={getCategoryIcon(item.category)} size={16} color="#FFF" />
        </View>
        <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
      </View>
      
      <View style={styles.clientRow}>
        <View style={styles.clientInfo}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.clientName}>{item.clientName}</Text>
        </View>
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetAmount}>RM{item.budget}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color="#777" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color="#777" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
      </View>
      
      {item.status === 'New' && (
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={() => handleDeclineProject(item.id)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAcceptProject(item.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {item.status === 'Accepted' && (
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={() => navigation.navigate('ChatTab', {
              screen: 'Chat', 
              params: { recipient: { name: item.clientName, id: item.id } }
            })}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
            <Text style={styles.messageButtonText}>Message Client</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  ), [getCategoryIcon, handleViewProjectDetails, handleAcceptProject, handleDeclineProject, navigation]);

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'plumbing':
        return '#2196F3';
      case 'electrical':
        return '#FF9800';
      case 'painting':
        return '#9C27B0';
      case 'carpentry':
        return '#795548';
      case 'landscaping':
        return '#4CAF50';
      default:
        return Colors.primary;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="construct-outline" size={64} color="#DDD" />
      <Text style={styles.emptyStateTitle}>No Projects Found</Text>
      <Text style={styles.emptyStateMessage}>
        You don't have any {activeTab} projects at the moment
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.tabs}>
        {['New', 'Accepted', 'Completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab.toLowerCase() && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.toLowerCase())}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.toLowerCase() && styles.activeTabText
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <FlatList
        data={filteredRequests}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#777',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  budgetContainer: {
    padding: 6,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 4,
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 6,
    marginRight: 8,
  },
  declineButtonText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '500',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    marginLeft: 8,
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  messageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  }
});

export default HandymanHomeScreen;