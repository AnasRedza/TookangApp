import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  RefreshControl
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import Colors from '../constants/Colors';
import firebase from '../firebase';
import { getUserAvatarUri } from '../utils/imageUtils';
import { reviewService } from '../services/reviewService';
// ADD this import (around line 15)
import { transactionService } from '../services/transactionService';


const MyProjectsScreen = ({ route, navigation }) => {
  const { user, isHandyman } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Different tab labels based on role
  const tabs = isHandyman ? 
    ['assigned', 'completed'] : 
    ['active', 'past'];
  
  const [activeTab, setActiveTab] = useState(tabs[0]);
  
  useEffect(() => {
    fetchProjects();
    
    // Check if there's a new project from the route params
    if (route.params?.newProject) {
      addNewProject(route.params.newProject);
    }
  }, [activeTab, route.params?.newProject]);
  
  // Real-time listener for projects
  useEffect(() => {
    if (!user?.id) return;
    
    const unsubscribe = projectService.subscribeToUserProjects(
      user.id,
      isHandyman ? 'handyman' : 'customer',
      (updatedProjects) => {
        setProjects(updatedProjects);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error in projects subscription:', error);
        setError('Failed to load projects');
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe && unsubscribe();
  }, [user?.id, isHandyman]);
  
  const fetchProjects = async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      const userProjects = await projectService.getUserProjects(
        user.id, 
        isHandyman ? 'handyman' : 'customer'
      );
      
      // Enrich projects with user data
      const enrichedProjects = await Promise.all(
        userProjects.map(async (project) => {
          try {
            // Get the other party's info (customer for handyman, handyman for customer)
            const otherUserId = isHandyman ? project.customerId : project.handymanId;
            if (otherUserId) {
              const otherUser = await userService.getUserById(otherUserId);
              if (isHandyman) {
                project.customer = otherUser;
              } else {
                project.handyman = otherUser;
              }
            }
            return project;
          } catch (error) {
            console.error('Error enriching project:', error);
            return project;
          }
        })
      );
      
      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };
  
  // Add new project
  const addNewProject = (newProject) => {
    setProjects(prevProjects => [newProject, ...prevProjects]);
  };
  
  // Get filtered projects based on active tab
  const getFilteredProjects = () => {
    if (isHandyman) {
      if (activeTab === 'assigned') {
        return projects.filter(project => 
          !['completed', 'cancelled', 'disputed'].includes(project.status)
        );
      } else {
        return projects.filter(project => 
          ['completed', 'cancelled', 'disputed'].includes(project.status)
        );
      }
    } else {
      // Customer view
      if (activeTab === 'active') {
        return projects.filter(project => 
          !['completed', 'cancelled', 'disputed', 'declined'].includes(project.status)
        );
      } else {
        return projects.filter(project => 
          ['completed', 'cancelled', 'disputed', 'declined'].includes(project.status)
        );
      }
    }
  };
  
  // Handle navigation to project details
  const handleViewProject = (project) => {
    console.log('Navigating to project details for:', project.title);
    
    navigation.navigate('ProjectDetails', { 
      project: project,
      viewMode: 'normal'
    });
  };
  
  // Handle pay now button
const handlePayForProject = async (project) => {
  try {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeTab',
        params: {
          screen: 'Payment',
          params: {
            project: project,
            projectDetails: project,
            // ADD: Pass deposit amount from project
            depositAmount: project.depositAmount || 0
          }
        },
      })
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    Alert.alert('Error', 'Failed to process payment. Please try again.');
  }
};
  
  // Handle view adjustment
  const handleViewAdjustment = (project) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeTab',
        params: {
          screen: 'AdjustmentApproval',
          params: { 
            project, 
            adjustment: { 
              newAmount: project.adjustedBudget || project.initialBudget,
              reason: project.adjustmentReason || 'Additional work required'
            }
          }
        },
      })
    );
  };
  
  // Handle project completion (for handymen)
  const handleCompleteProject = async (project) => {
    Alert.alert(
      "Complete Project",
      "Mark this project as completed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Complete", 
          onPress: async () => {
            try {
              await projectService.updateProjectStatus(project.id, 'completed', {
                completedAt: new Date().toISOString()
              });
              
              Alert.alert("Success", "Project marked as completed!");
            } catch (error) {
              console.error('Error completing project:', error);
              Alert.alert("Error", "Failed to update project status. Please try again.");
            }
          }
        }
      ]
    );
  };
  
  // Handle project cancellation
  const handleCancelProject = async (project) => {
    Alert.alert(
      "Cancel Project",
      "Are you sure you want to cancel this project?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          style: "destructive",
          onPress: async () => {
            try {
              await projectService.updateProjectStatus(project.id, 'cancelled');
              Alert.alert("Project Cancelled", "The project has been cancelled.");
            } catch (error) {
              console.error('Error cancelling project:', error);
              Alert.alert("Error", "Failed to cancel project. Please try again.");
            }
          }
        }
      ]
    );
  };
  
  const handleMarkComplete = async (project) => {
  Alert.alert(
    "Mark Project Complete",
    `Are you sure the work for "${project.title}" is completed?`,
    [
      { text: "Not Yet", style: "cancel" },
      { 
        text: "Yes, Complete", 
        onPress: async () => {
          try {
            await projectService.updateProjectStatus(project.id, 'pending_completion', {
              markedCompleteAt: new Date().toISOString(),
              markedCompleteBy: user.id
            });
            
            Alert.alert(
              "Work Marked Complete", 
              "The customer will be notified to confirm completion of the work."
            );
          } catch (error) {
            console.error('Error marking project complete:', error);
            Alert.alert("Error", "Failed to update project status. Please try again.");
          }
        }
      }
    ]
  );
};

const handleConfirmCompletion = async (project) => {
  Alert.alert(
    "Confirm Work Completion",
    `Are you satisfied with the work completed for "${project.title}"?`,
    [
      { text: "Not Yet", style: "cancel" },
      { 
        text: "Yes, Confirmed", 
        onPress: async () => {
          try {
            await projectService.updateProjectStatus(project.id, 'completed', {
              completedAt: new Date().toISOString(),
              confirmedBy: user.id
            });
            
            Alert.alert(
              "Project Completed!", 
              "The project has been marked as completed. You can now leave a review for the handyman."
            );
          } catch (error) {
            console.error('Error confirming completion:', error);
            Alert.alert("Error", "Failed to confirm completion. Please try again.");
          }
        }
      }
    ]
  );
};

const handleLeaveReview = async (project) => {
  const userToReview = isHandyman ? 'customer' : 'handyman';
  
  // Check if user has already reviewed this project
  try {
    const hasReviewed = await reviewService.hasUserReviewedProject(user.id, project.id);
    if (hasReviewed) {
      Alert.alert(
        "Already Reviewed",
        "You have already submitted a review for this project.",
        [{ text: "OK" }]
      );
      return;
    }
  } catch (error) {
    console.error('Error checking review status:', error);
  }
  
  navigation.navigate('ReviewScreen', {
    project: project,
    userToReview: project[userToReview] || {
      name: isHandyman ? project.customerName : project.handymanName,
      avatar: isHandyman ? project.customerAvatar : project.handymanAvatar,
      id: isHandyman ? project.customerId : project.handymanId
    },
    userType: userToReview,
    onReviewSubmitted: (reviewData) => {
      // Update local project state to reflect review submission
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === project.id 
            ? { ...p, [`${user.role}ReviewSubmitted`]: true }
            : p
        )
      );
    }
  });
};


  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status label
  const getStatusLabel = (status) => {
  if (isHandyman) {
    switch(status) {
      case 'open': return 'Available Job';
      case 'pending_handyman_review': return 'New Job Request';
      case 'in_negotiation': return 'In Discussion';
      case 'agreed_scheduled': return 'Job Scheduled';
      case 'awaiting_payment': return 'Awaiting Payment';
      case 'requires_adjustment': return 'Budget Adjustment Sent';
      case 'requires_payment': return 'Awaiting Payment';
      case 'payment_processing': return 'Payment Processing';
      case 'in_progress': return 'Work In Progress';
      case 'pending_completion': return 'Ready to Complete';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      case 'declined': return 'Declined Job';
      default: return status;
    }
  } else {
    switch(status) {
      case 'open': return 'Open Project';
      case 'pending_handyman_review': return 'Pending Review';
      case 'in_negotiation': return 'In Negotiation';
      case 'agreed_scheduled': return 'Agreed & Scheduled';
      case 'awaiting_payment': return 'Payment Required';
      case 'requires_adjustment': return 'Adjustment Needed';
      case 'requires_payment': return 'Payment Required';
      case 'payment_processing': return 'Payment Processing';
      case 'in_progress': return 'Work In Progress';
      case 'pending_completion': return 'Awaiting Completion';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      case 'declined': return 'Declined by Handyman';
      default: return status;
    }
  }
};
  
  // Get status color
const getStatusColor = (status) => {
  switch(status) {
    case 'open': return '#2196F3';
    case 'pending_handyman_review': return '#FFA000';
    case 'in_negotiation': return '#2196F3';
    case 'agreed_scheduled': return '#8BC34A';
    case 'awaiting_payment': return '#E91E63';
    case 'requires_adjustment': return '#FF5722';
    case 'requires_payment': return '#E91E63';
    case 'payment_processing': return '#9C27B0';
    case 'in_progress': return '#03A9F4';
    case 'pending_completion': return '#FF9800';
    case 'completed': return '#4CAF50';
    case 'cancelled': return '#F44336';
    case 'disputed': return '#E91E63';
    default: return '#9E9E9E';
  }
};
  
  // Render project item
  const renderProjectItem = ({ item }) => {
    const otherParty = isHandyman ? item.customer : (item.handyman || {
  name: item.requestedHandymanName || 'No handyman assigned',
  avatar: getUserAvatarUri({ name: item.requestedHandymanName, profilePicture: item.requestedHandymanAvatar }),
  rating: 4.5
});
    
    return (
      <TouchableOpacity 
        style={styles.projectCard}
        onPress={() => handleViewProject(item)}
      >
        <View style={styles.projectHeader}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.projectTitle}>{item.title}</Text>
        
        {/* Location info */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
        </View>
        
        {/* Date info */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {isHandyman 
              ? `Scheduled: ${formatDate(item.preferredDate)}` 
              : `Preferred: ${formatDate(item.preferredDate)}`
            }
          </Text>
        </View>
        
        {/* Budget display */}
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetLabel}>{isHandyman ? 'Deposit:' : 'Deposit:'}</Text>
        <Text style={styles.budgetAmount}>
          {item.depositAmount ? `RM ${parseFloat(item.depositAmount).toFixed(2)}` : 'Not set'}
        </Text>
      </View>
        
        <View style={styles.divider} />
        
        <View style={styles.footer}>
          {/* Other party info */}
          <View style={styles.partyInfo}>
            {otherParty ? (
              <>
                <Image 
                  source={{ uri: getUserAvatarUri(otherParty) }} 
                  style={styles.avatarImage} 
                />
                <View style={styles.partyDetails}>
                  <Text style={styles.partyLabel}>{isHandyman ? 'Customer:' : 'Handyman:'}</Text>
                  <Text style={styles.partyName}>{otherParty.name}</Text>
                  {!isHandyman && otherParty.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#FFC107" />
                      <Text style={styles.ratingText}>{otherParty.rating}</Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.partyDetails}>
                <Text style={styles.partyLabel}>{isHandyman ? 'Customer:' : 'Handyman:'}</Text>
                <Text style={styles.partyName}>Loading...</Text>
              </View>
            )}
          </View>
          
          {/* Action buttons */}
      <View style={styles.actions}>
        {/* Customer can pay when status is awaiting_payment */}
        {!isHandyman && item.status === 'awaiting_payment' && (
          <TouchableOpacity 
            style={styles.payButton}
            onPress={() => handlePayForProject(item)}
          >
            <Text style={styles.payButtonText}>Pay Deposit (RM{item.depositAmount})</Text>
          </TouchableOpacity>
        )}
        
        {!isHandyman && item.status === 'requires_payment' && (
          <TouchableOpacity 
            style={styles.payButton}
            onPress={() => handlePayForProject(item)}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )}
        
        {!isHandyman && item.status === 'requires_adjustment' && (
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => handleViewAdjustment(item)}
          >
            <Text style={styles.viewButtonText}>View Adjustment</Text>
          </TouchableOpacity>
        )}
        
        {/* Handyman can mark as complete when in_progress */}
        {isHandyman && item.status === 'in_progress' && (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => handleMarkComplete(item)}
          >
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
        
        {/* Customer can confirm completion when pending_completion */}
        {!isHandyman && item.status === 'pending_completion' && (
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={() => handleConfirmCompletion(item)}
          >
            <Text style={styles.confirmButtonText}>Confirm Completion</Text>
          </TouchableOpacity>
        )}
        
        {/* Both can leave reviews when completed */}
        {item.status === 'completed' && !item[`${user.role}ReviewSubmitted`] && (
          <TouchableOpacity 
            style={styles.reviewButton}
            onPress={() => handleLeaveReview(item)}
          >
            <Text style={styles.reviewButtonText}>Leave Review</Text>
          </TouchableOpacity>
        )}
        
        {(item.status === 'open' || item.status === 'pending_handyman_review') && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelProject(item)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === tabs[0] && styles.activeTab
          ]}
          onPress={() => setActiveTab(tabs[0])}
        >
          <Text style={[
            styles.tabText,
            activeTab === tabs[0] && styles.activeTabText
          ]}>
            {isHandyman ? 'Assigned Jobs' : 'Active Projects'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === tabs[1] && styles.activeTab
          ]}
          onPress={() => setActiveTab(tabs[1])}
        >
          <Text style={[
            styles.tabText,
            activeTab === tabs[1] && styles.activeTabText
          ]}>
            {isHandyman ? 'Job History' : 'Past Projects'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Projects/Jobs List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {isHandyman ? 'Loading jobs...' : 'Loading projects...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredProjects()}
          renderItem={renderProjectItem}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={isHandyman ? "briefcase-outline" : "construct-outline"} 
                size={64} 
                color="#DDD" 
              />
              <Text style={styles.emptyTitle}>
                {isHandyman ? 'No Jobs Found' : 'No Projects Found'}
              </Text>
              <Text style={styles.emptyText}>
                {isHandyman 
                  ? (activeTab === 'assigned' 
                      ? 'You don\'t have any assigned jobs yet' 
                      : 'You don\'t have any completed jobs')
                  : (activeTab === 'active' 
                      ? 'You don\'t have any active projects' 
                      : 'You don\'t have any past projects')
                }
              </Text>
            </View>
          )}
        />
      )}
      
      {/* Create New Project Button (for customers only) */}
      {!isHandyman && activeTab === 'active' && !isLoading && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  partyDetails: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 12,
    color: '#666',
  },
  partyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmButton: {
  backgroundColor: '#4CAF50',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default MyProjectsScreen;