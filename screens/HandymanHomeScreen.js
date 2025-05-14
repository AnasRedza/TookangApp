import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  StatusBar,
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

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAcceptProject = (projectId) => {
    const updatedProjects = projectRequests.map((project) =>
      project.id === projectId ? { ...project, status: 'Accepted' } : project
    );
    setProjectRequests(updatedProjects);
  };

  const handleDeclineProject = (projectId) => {
    const updatedProjects = projectRequests.filter(
      (project) => project.id !== projectId
    );
    setProjectRequests(updatedProjects);
  };

  const renderProjectItem = ({ item }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetLabel}>Budget:</Text>
          <Text style={styles.budget}>RM{item.budget}</Text>
        </View>
      </View>

      <View style={styles.clientInfo}>
        <Ionicons name="person" size={16} color={Colors.primary} />
        <Text style={styles.clientName}>{item.clientName}</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color={Colors.darkGray} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={16} color={Colors.darkGray} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="construct" size={16} color={Colors.darkGray} />
          <Text style={styles.detailText}>{item.category}</Text>
        </View>
      </View>

      {item.status === 'New' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDeclineProject(item.id)}
          >
            <Ionicons name="close" size={20} color={Colors.error} />
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptProject(item.id)}
          >
            <Ionicons name="checkmark" size={20} color={Colors.white} />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'Accepted' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => console.log('Message client')}
          >
            <Ionicons name="chatbubble" size={20} color={Colors.white} />
            <Text style={styles.buttonText}>Message Client</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct" size={60} color={Colors.mediumGray} />
      <Text style={styles.emptyTitle}>No Projects Found</Text>
      <Text style={styles.emptyText}>
        There are no {activeTab} project requests at the moment.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
        style={styles.headerBackground}
      >
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>TooKang</Text>
          <Text style={styles.headerSubtitle}>Handyman Dashboard</Text>
        </View>
      </ImageBackground>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'new' && styles.activeTab]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>
            New Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.activeTab]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>
            Accepted
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={renderEmptyList}
      />

      <TouchableOpacity 
        style={styles.editProfileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons name="settings" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  headerBackground: {
    height: 150,
    width: '100%',
  },
  headerOverlay: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  projectCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  budgetContainer: {
    alignItems: 'flex-end',
  },
  budgetLabel: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  budget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 5,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 15,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 15,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: Colors.darkGray,
    marginLeft: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
  },
  declineButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginLeft: 10,
  },
  acceptButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
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
    marginBottom: 20,
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HandymanHomeScreen;