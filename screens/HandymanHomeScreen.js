import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const HandymanHomeScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for available jobs
  const MOCK_JOBS = [
    {
      id: '1',
      title: 'Fix Leaking Kitchen Sink',
      description: 'The kitchen sink has been leaking for a week and needs repair.',
      location: 'Kuala Lumpur',
      budget: 'RM120-RM180',
      customerName: 'Sarah Wong',
      customerRating: 4.8,
      postedDate: '2 days ago',
      category: 'Plumbing',
      distance: '3.5 km',
      status: 'open',
    },
    {
      id: '2',
      title: 'Ceiling Fan Installation',
      description: 'Need someone to install 3 ceiling fans in a new apartment.',
      location: 'Petaling Jaya',
      budget: 'RM200-RM300',
      customerName: 'Michael Tan',
      customerRating: 4.2,
      postedDate: '5 hours ago',
      category: 'Electrical',
      distance: '5.1 km',
      status: 'open',
    },
    {
      id: '3',
      title: 'Bathroom Tile Repair',
      description: 'Several tiles in the bathroom have cracked and need replacement.',
      location: 'Subang Jaya',
      budget: 'RM250-RM350',
      customerName: 'Ahmad Ismail',
      customerRating: 4.5,
      postedDate: '1 day ago',
      category: 'Tiling',
      distance: '7.2 km',
      status: 'open',
    },
    {
      id: '4',
      title: 'Paint Living Room Walls',
      description: 'Need painting service for living room (approx 400 sq ft).',
      location: 'Shah Alam',
      budget: 'RM500-RM700',
      customerName: 'Lily Chen',
      customerRating: 4.9,
      postedDate: '3 days ago',
      category: 'Painting',
      distance: '12.4 km',
      status: 'open',
    },
    {
      id: '5',
      title: 'Build Bookshelf',
      description: 'Looking for someone to build a custom bookshelf (6ft x 4ft).',
      location: 'Ampang',
      budget: 'RM400-RM600',
      customerName: 'David Lee',
      customerRating: 4.7,
      postedDate: '1 day ago',
      category: 'Carpentry',
      distance: '8.7 km',
      status: 'open',
    },
    {
      id: '6',
      title: 'Deep Clean Apartment',
      description: 'Need deep cleaning for 2-bedroom apartment before move-in.',
      location: 'Cheras',
      budget: 'RM300-RM450',
      customerName: 'Priya Nair',
      customerRating: 4.6,
      postedDate: '6 hours ago',
      category: 'Cleaning',
      distance: '10.3 km',
      status: 'open',
    },
  ];
  
  // Load jobs on component mount
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setJobs(MOCK_JOBS);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, this would refresh data from API
    setTimeout(() => {
      setJobs(MOCK_JOBS);
      setRefreshing(false);
    }, 1000);
  };
  
  // Navigate to project details
  const navigateToProjectDetails = (project, status = 'viewing') => {
    navigation.navigate('ProjectDetails', { 
      projectId: project.id,
      project: project,
      viewMode: 'handyman',
      status: status
    });
  };
  
  // Handle handyman responses to jobs
  const handleAcceptJob = (project) => {
    Alert.alert(
      "Accept Project",
      "Are you sure you want to accept this project with the customer's budget?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: () => {
            Alert.alert(
              "Project Accepted",
              "You have accepted this project. The customer will be notified.",
              [{ 
                text: "OK",
                onPress: () => navigateToProjectDetails(project, 'accepted')
              }]
            );
          }
        }
      ]
    );
  };
  
  const handleNegotiateJob = (project) => {
    navigation.navigate('ProjectOffer', { 
      projectId: project.id,
      project: project,
      mode: 'negotiate',
      viewMode: 'handyman'
    });
  };
  
  const handleDeclineJob = (projectId) => {
    Alert.alert(
      "Decline Project",
      "Are you sure you want to decline this project?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Decline", 
          style: "destructive",
          onPress: () => {
            setJobs(prevJobs => prevJobs.filter(job => job.id !== projectId));
          }
        }
      ]
    );
  };
  
  // Render job item
  const renderJobItem = ({ item }) => (
    <View style={styles.jobCard}>
      <TouchableOpacity 
        style={styles.jobInfoContainer}
        onPress={() => navigateToProjectDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.jobHeader}>
          <Text style={styles.categoryChip}>{item.category}</Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
        
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobDescription} numberOfLines={3}>{item.description}</Text>
        
        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color={Colors.primary} />
            <Text style={styles.detailText}>{item.budget}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={styles.detailText}>{item.postedDate}</Text>
          </View>
        </View>
        
        <View style={styles.customerInfo}>
          <Image 
            source={{ uri: `https://randomuser.me/api/portraits/${item.customerName.includes('Sarah') || item.customerName.includes('Lily') || item.customerName.includes('Priya') ? 'women' : 'men'}/${parseInt(item.id) + 30}.jpg` }}
            style={styles.customerAvatar}
          />
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineJob(item.id)}
        >
          <Ionicons name="close-outline" size={18} color="#E53935" />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.negotiateButton]}
          onPress={() => handleNegotiateJob(item)}
        >
          <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
          <Text style={styles.negotiateButtonText}>Negotiate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptJob(item)}
        >
          <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Show loading indicator while data loads
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Finding available projects...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Jobs list */}
      <FlatList
        data={jobs}
        renderItem={renderJobItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.jobsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={60} color={Colors.textLight} />
            <Text style={styles.emptyText}>No projects available</Text>
            <Text style={styles.emptySubText}>Pull down to refresh</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
    color: Colors.textMedium,
  },
  jobsList: {
    padding: 16,
    paddingBottom: 80,
    paddingTop: 12,
  },
  jobCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  jobInfoContainer: {
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryChip: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  distance: {
    fontSize: 12,
    color: Colors.textMedium,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 16,
    lineHeight: 20,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textMedium,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  // Action buttons
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  negotiateButton: {
    backgroundColor: Colors.highlight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  declineButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  negotiateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 4,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textMedium,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HandymanHomeScreen;