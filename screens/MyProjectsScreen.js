import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Mock projects data
const PROJECTS = [
  {
    id: '1',
    title: 'Fix leaking bathroom sink',
    description: 'The sink in the main bathroom has been leaking for a few days. Need someone to fix it ASAP.',
    category: 'Plumbing',
    budget: 100,
    location: 'Kuala Lumpur',
    date: '2025-05-10',
    status: 'Open',
    bids: [],
  },
  {
    id: '2',
    title: 'Install ceiling fan',
    description: 'Need a new ceiling fan installed in the living room. I have the fan, just need installation.',
    category: 'Electrical',
    budget: 80,
    location: 'Petaling Jaya',
    date: '2025-05-15',
    status: 'Open',
    bids: [],
  },
  {
    id: '3',
    title: 'Paint living room walls',
    description: 'Looking for someone to paint my living room. The room is approximately 15 x 20 feet with 9-foot ceilings.',
    category: 'Painting',
    budget: 350,
    location: 'Subang Jaya',
    date: '2025-05-20',
    status: 'Ongoing',
    bids: [],
    handyman: {
      id: '4',
      name: 'Sarah Williams',
    },
  },
  {
    id: '4',
    title: 'Fix garden irrigation system',
    description: 'The automatic irrigation system in my garden is not working properly. Need an expert to diagnose and fix the issue.',
    category: 'Landscaping',
    budget: 150,
    location: 'Kuala Lumpur',
    date: '2025-04-30',
    status: 'Completed',
    bids: [],
    handyman: {
      id: '5',
      name: 'David Lee',
    },
  },
];

const MyProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState(PROJECTS);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'open', 'ongoing', 'completed'

  const filteredProjects = projects.filter((project) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return project.status === 'Open';
    if (activeTab === 'ongoing') return project.status === 'Ongoing';
    if (activeTab === 'completed') return project.status === 'Completed';
    return true;
  });

  const handleCancelProject = (projectId) => {
    Alert.alert(
      'Cancel Project',
      'Are you sure you want to cancel this project?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // Update project status to Cancelled
            const updatedProjects = projects.map((project) =>
              project.id === projectId ? { ...project, status: 'Cancelled' } : project
            );
            setProjects(updatedProjects);
          },
        },
      ]
    );
  };

  const renderProjectItem = ({ item }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <View>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectCategory}>{item.category}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'Open' && styles.openStatus,
          item.status === 'Ongoing' && styles.ongoingStatus,
          item.status === 'Completed' && styles.completedStatus,
          item.status === 'Cancelled' && styles.cancelledStatus,
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.projectDescription}>{item.description}</Text>

      <View style={styles.projectDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={16} color={Colors.darkGray} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color={Colors.darkGray} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash" size={16} color={Colors.darkGray} />
          <Text style={styles.detailText}>RM{item.budget}</Text>
        </View>
      </View>

      {item.status === 'Open' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => console.log('Edit project', item.id)}
          >
            <Ionicons name="create" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelProject(item.id)}
          >
            <Ionicons name="close-circle" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'Ongoing' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => console.log('Message handyman', item.handyman?.id)}
          >
            <Ionicons name="chatbubble" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => {
              const updatedProjects = projects.map((project) =>
                project.id === item.id ? { ...project, status: 'Completed' } : project
              );
              setProjects(updatedProjects);
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'Completed' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => console.log('Review handyman', item.handyman?.id)}
          >
            <Ionicons name="star" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rehireButton]}
            onPress={() => console.log('Rehire handyman', item.handyman?.id)}
          >
            <Ionicons name="repeat" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Rehire</Text>
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
        You don't have any {activeTab !== 'all' ? activeTab : ''} projects yet.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.createButtonText}>Find a Handyman</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'open' && styles.activeTab]}
          onPress={() => setActiveTab('open')}
        >
          <Text style={[styles.tabText, activeTab === 'open' && styles.activeTabText]}>
            Open
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ongoing' && styles.activeTab]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.activeTabText]}>
            Ongoing
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
  data={filteredProjects}
  renderItem={renderProjectItem}  // Make sure renderProjectItem destructures { item }
  keyExtractor={(item) => item.id}
  contentContainerStyle={styles.listContent}
  ListEmptyComponent={renderEmptyList}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  projectCategory: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    backgroundColor: Colors.mediumGray,
  },
  openStatus: {
    backgroundColor: Colors.accent,
  },
  ongoingStatus: {
    backgroundColor: Colors.primary,
  },
  completedStatus: {
    backgroundColor: Colors.success,
  },
  cancelledStatus: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 15,
    lineHeight: 20,
  },
  projectDetails: {
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  messageButton: {
    backgroundColor: Colors.primary,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  reviewButton: {
    backgroundColor: Colors.accent,
  },
  rehireButton: {
    backgroundColor: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
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
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyProjectsScreen;