import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Mock projects data
const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'Fix leaking bathroom sink',
    description: 'The sink in the main bathroom has been leaking for a few days. Need someone to fix it ASAP.',
    category: 'Plumbing',
    budget: 100,
    location: 'Kuala Lumpur',
    date: '2025-05-10',
    status: 'Open',
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
    handyman: {
      id: '5',
      name: 'David Lee',
    },
  },
];

const MyProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [activeTab, setActiveTab] = useState('all');

  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    return project.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleCancelProject = (projectId) => {
    Alert.alert(
      'Cancel Project',
      'Are you sure you want to cancel this project?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => {
            setProjects(
              projects.map(project => 
                project.id === projectId 
                  ? {...project, status: 'Cancelled'} 
                  : project
              )
            );
          } 
        }
      ]
    );
  };

  const handleMarkComplete = (projectId) => {
    setProjects(
      projects.map(project => 
        project.id === projectId 
          ? {...project, status: 'Completed'} 
          : project
      )
    );
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'open': return '#4CAF50';
      case 'ongoing': return '#2196F3';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => navigation.navigate('ProjectDetails', { project: item })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      
      <Text style={styles.projectDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.projectDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color="#777" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={14} color="#777" />
          <Text style={styles.detailText}>RM{item.budget}</Text>
        </View>
      </View>
      
      <View style={styles.projectFooter}>
        <Text style={styles.categoryText}>{item.category}</Text>
        
        {item.status === 'Open' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => navigation.navigate('EditProject', { project: item })}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleCancelProject(item.id)}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.status === 'Ongoing' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleMarkComplete(item.id)}
            >
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => navigation.navigate('Chat', { recipient: item.handyman })}
            >
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.status === 'Completed' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => navigation.navigate('LeaveReview', { project: item })}
          >
            <Ionicons name="star-outline" size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>No Projects Found</Text>
      <Text style={styles.emptyText}>
        You don't have any {activeTab !== 'all' ? activeTab.toLowerCase() : ''} projects yet
      </Text>
      <TouchableOpacity
        style={styles.findButton}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.findButtonText}>Find a Handyman</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {['All', 'Open', 'Ongoing', 'Completed'].map((tab) => (
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
        data={filteredProjects}
        renderItem={renderProjectItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  projectTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectDetails: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  detailText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 4,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 13,
    color: Colors.primary,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
    color: '#777',
    textAlign: 'center',
    marginBottom: 24,
  },
  findButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MyProjectsScreen;