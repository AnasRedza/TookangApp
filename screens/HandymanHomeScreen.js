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
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';

const HandymanHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadAvailableJobs();
    
    // Set up real-time listener for open projects
    const unsubscribe = projectService.subscribeToOpenProjects(
      (projects) => {
        enrichProjectsWithCustomerData(projects);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error in projects subscription:', error);
        setError('Failed to load projects');
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe && unsubscribe();
  }, []);

  const loadAvailableJobs = async () => {
    try {
      setError(null);
      const openProjects = await projectService.getOpenProjects();
      await enrichProjectsWithCustomerData(openProjects);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load available jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const enrichProjectsWithCustomerData = async (projects) => {
    try {
      const enrichedProjects = await Promise.all(
        projects.map(async (project) => {
          try {
            if (project.customerId) {
              const customer = await userService.getUserById(project.customerId);
              return {
                ...project,
                customer: customer,
                customerName: customer?.name || project.customerName || 'Unknown Customer',
                customerRating: customer?.rating || 4.5,
                customerAvatar: getUserAvatarUri(customer)
              };
            }
            return {
              ...project,
              customerName: project.customerName || 'Unknown Customer',
              customerRating: project.customerRating || 4.5,
              customerAvatar: getUserAvatarUri({ name: project.customerName || 'Customer' })
            };
          } catch (error) {
            console.error('Error enriching project:', error);
            return {
              ...project,
              customerName: project.customerName || 'Unknown Customer',
              customerRating: 4.5,
              customerAvatar: getUserAvatarUri({ name: 'Customer' })
            };
          }
        })
      );
      
      setJobs(enrichedProjects);
    } catch (error) {
      console.error('Error enriching projects:', error);
      setJobs(projects);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAvailableJobs();
    setRefreshing(false);
  };
  
  const navigateToProjectDetails = (project, status = 'viewing') => {
    navigation.navigate('ProjectDetails', { 
      projectId: project.id,
      project: project,
      viewMode: 'handyman',
      status: status
    });
  };
  
  const handleAcceptJob = async (project) => {
    Alert.alert(
      "Accept Project",
      "Are you sure you want to accept this project with the customer's budget?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: async () => {
            try {
              await projectService.assignHandymanToProject(
                project.id, 
                user.id, 
                project.initialBudget || extractBudgetAmount(project.budget)
              );
              
              Alert.alert(
                "Project Accepted",
                "You have accepted this project. The customer will be notified.",
                [{ 
                  text: "OK",
                  onPress: () => navigateToProjectDetails(project, 'accepted')
                }]
              );
            } catch (error) {
              console.error('Error accepting project:', error);
              Alert.alert("Error", "Failed to accept project. Please try again.");
            }
          }
        }
      ]
    );
  };
  
  const handleNegotiateJob = (project) => {
    try {
      navigation.navigate('ProjectOffer', { 
        projectId: project.id,
        project: project,
        mode: 'negotiate',
        viewMode: 'handyman'
      });
    } catch (error) {
      console.log("Navigation error:", error);
      Alert.alert("Navigation Error", "Could not open negotiation screen.");
    }
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
            // Remove from local state
            setJobs(prevJobs => prevJobs.filter(job => job.id !== projectId));
          }
        }
      ]
    );
  };

  const extractBudgetAmount = (budgetString) => {
    if (!budgetString) return 100;
    const match = budgetString.match(/RM(\d+)/);
    return match && match[1] ? parseInt(match[1]) : 100;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Not specified';
    }
  };

  const formatBudget = (project) => {
    if (project.initialBudget) {
      return `RM ${project.initialBudget}${project.isNegotiable ? ' (Negotiable)' : ''}`;
    }
    if (project.budget) {
      return project.budget;
    }
    return 'Budget not specified';
  };
  
  const renderJobItem = ({ item }) => (
    <View style={styles.jobCard}>
      <TouchableOpacity 
        style={styles.jobInfoContainer}
        onPress={() => navigateToProjectDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.jobHeader}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
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
            <Text style={styles.detailText}>{formatBudget(item)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.detailText}>{formatDate(item.preferredDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={styles.detailText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.customerInfo}>
          <Image 
            source={{ uri: item.customerAvatar }}
            style={styles.customerAvatar}
          />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.customerRating?.toFixed(1) || '4.5'}</Text>
            </View>
          </View>
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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="briefcase-outline" size={60} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>No Projects Available</Text>
      <Text style={styles.emptyText}>There are no open projects at the moment.</Text>
      <Text style={styles.emptySubText}>Pull down to refresh</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={60} color={Colors.error} />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadAvailableJobs}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding available projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {renderErrorState()}
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
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
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
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
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
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
    marginRight: 12,
    marginBottom: 4,
    width: '45%',
  },
  detailText: {
    fontSize: 13,
    color: Colors.textMedium,
    marginLeft: 4,
    flex: 1,
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
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.textMedium,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
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
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textMedium,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HandymanHomeScreen;