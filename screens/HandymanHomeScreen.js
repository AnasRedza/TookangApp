// Enhanced HandymanHomeScreen.js - Smoother Project Interactions
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
  SafeAreaView,
  Animated,
  Dimensions,
  Modal, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const HandymanHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [processingJobs, setProcessingJobs] = useState(new Set());
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [depositInput, setDepositInput] = useState('');
  
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
    // Also get projects that are in negotiation with this handyman
    const negotiatingProjects = await projectService.getNegotiatingProjectsForHandyman(user.id);
    const allProjects = [...openProjects, ...negotiatingProjects];
    await enrichProjectsWithCustomerData(allProjects);
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
  
  const setJobProcessing = (jobId, processing) => {
    setProcessingJobs(prev => {
      const newSet = new Set(prev);
      if (processing) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  };

  const removeJobFromList = (jobId) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };

 const handleAcceptJob = async (project) => {
  console.log('handleAccept accessed');
  Alert.alert(
    "Accept Project",
    `Are you sure you want to accept "${project.title}"?`,
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Continue", 
        onPress: () => {
          // Prompt for deposit instead of directly accepting
          console.log('continue pressed');
          promptForDepositAmount(project);
        }
      }
    ]
  );

};

// ADD this new function to HandymanHomeScreen.js
const promptForDepositAmount = (project) => {
  console.log('About to show deposit prompt modal'); // ADD THIS DEBUG
  setSelectedProject(project);
  setShowDepositModal(true);
};

// ADD this new function to HandymanHomeScreen.js
const acceptJobWithDeposit = async (project, depositAmount) => {
  setJobProcessing(project.id, true);
  
  try {
    // Update project with complete acceptance data including deposit
    await projectService.updateProject(project.id, {
      status: 'awaiting_payment', // Changed from 'accepted' to 'awaiting_payment'
      handymanId: user.id,
      handymanName: user.name,
      handymanAvatar: user.profilePicture,
      depositAmount: depositAmount,
      depositRequested: true,
      acceptedAt: new Date().toISOString()
    });
  
    // Remove from available jobs list
    removeJobFromList(project.id);
    
    // Show success feedback with deposit info
    Alert.alert(
      "✅ Project Accepted!",
      `You've successfully accepted "${project.title}" and requested a deposit of RM${depositAmount.toFixed(2)}. The customer will be notified and can proceed with payment.`,
      [
        { 
          text: "View Project",
          onPress: () => {
            navigation.navigate('ProjectsTab', {
              screen: 'MyProjects'
            });
          }
        },
        { text: "Continue Browsing", style: "cancel" }
      ]
    );
    
  } catch (error) {
    console.error('Error accepting project:', error);
    Alert.alert(
      "❌ Error", 
      "Failed to accept project. Please check your connection and try again."
    );
  } finally {
    setJobProcessing(project.id, false);
  }
};
  
const handleNegotiateJob = (project) => {
  // If already negotiating, go directly to chat
  if (project.status === 'in_negotiation' && project.negotiatingHandymanId === user.id) {
    handleContactCustomer(project);
    return;
  }
  
  try {
    // Show what negotiation means first
    Alert.alert(
      "💬 Start Negotiation",
      "You can discuss the project details, timeline, and budget with the customer. Would you like to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Discussion",
          onPress: () => {
            navigation.navigate('ProjectOffer', { 
              projectId: project.id,
              project: project,
              mode: 'negotiate',
              viewMode: 'handyman'
            });
          }
        }
      ]
    );
  } catch (error) {
    console.log("Navigation error:", error);
    Alert.alert("Navigation Error", "Could not open negotiation screen.");
  }
};

const handleContactCustomer = (project) => {
  try {
    navigation.navigate('ChatTab', {
      screen: 'Chat',
      params: {
        recipient: {
          id: project.customerId,
          name: project.customerName,
          avatar: project.customerAvatar,
          role: 'customer'
        },
        projectId: project.id,
        projectTitle: project.title
      }
    });
  } catch (error) {
    console.log("Chat navigation error:", error);
    Alert.alert("Navigation Error", "Could not open chat.");
  }
};
  
  const handleDeclineJob = (project) => {
    Alert.alert(
      "Decline Project",
      `Are you sure you want to decline "${project.title}"? This project will be removed from your available jobs.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Decline", 
          style: "destructive",

  onPress: async () => {
      try {
        // Update project status to declined
        await projectService.updateProject(project.id, {
          status: 'declined',
          declinedBy: user.id,
          declinedByName: user.name,
          declinedAt: new Date().toISOString()
        });
        
        // Remove from local list
        removeJobFromList(project.id);
        
        // Show brief feedback
        Alert.alert(
          "Project Declined",
          "The project has been removed from your list.",
          [{ text: "OK" }]
        );
        
      } catch (error) {
        console.error('Error declining project:', error);
        // Still remove from list even if Firebase update fails
        removeJobFromList(project.id);
      }
    }
            }
          ]
        );
      };


  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Flexible';
    }
  };


  const getUrgencyIndicator = (project) => {
    try {
      const preferredDate = new Date(project.preferredDate);
      const today = new Date();
      const diffDays = Math.ceil((preferredDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) return { color: '#E53935', text: 'URGENT', icon: 'warning' };
      if (diffDays <= 3) return { color: '#FF9800', text: 'SOON', icon: 'time' };
      return null;
    } catch (error) {
      return null;
    }
  };
  
  const renderJobItem = ({ item }) => {
    const isProcessing = processingJobs.has(item.id);
    const urgency = getUrgencyIndicator(item);
    
    return (
      <View style={[styles.jobCard, isProcessing && styles.processingCard]}>
        {/* Urgency indicator */}
        {urgency && (
          <View style={[styles.urgencyBadge, { backgroundColor: urgency.color }]}>
            <Ionicons name={urgency.icon} size={12} color="#FFFFFF" />
            <Text style={styles.urgencyText}>{urgency.text}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.jobInfoContainer}
          onPress={() => navigateToProjectDetails(item)}
          activeOpacity={0.7}
          disabled={isProcessing}
        >
          <View style={styles.jobHeader}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.postedTime}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.jobDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
              <Text style={styles.detailText}>{formatDate(item.preferredDate)}</Text>
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
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDeclineJob(item)}
            disabled={isProcessing}
          >
            <Ionicons name="close-outline" size={16} color="#E53935" />
            <Text style={styles.declineButtonText}>Pass</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.negotiateButton]}
            onPress={() => handleNegotiateJob(item)}
            disabled={isProcessing}
          >
            <Ionicons name={item.status === 'in_negotiation' ? "chatbubbles" : "chatbubble-outline"} size={16} color={Colors.primary} />
            <Text style={styles.negotiateButtonText}>
              {item.status === 'in_negotiation' ? 'Continue Chat' : 'Discuss'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptJob(item)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={16} color="#FFFFFF" />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Processing overlay */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="briefcase-outline" size={80} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>No Projects Available</Text>
      <Text style={styles.emptyText}>
        There are no new projects matching your skills at the moment.
      </Text>
      <Text style={styles.emptySubText}>Pull down to refresh or check back later</Text>
      
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        <Text style={styles.refreshButtonText}>Refresh Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={80} color={Colors.error} />
      <Text style={styles.emptyTitle}>Connection Error</Text>
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
          <Text style={styles.loadingText}>Finding projects for you...</Text>
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
      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {jobs.filter(job => getUrgencyIndicator(job)).length}
          </Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {jobs.filter(job => job.isNegotiable).length}
          </Text>
          <Text style={styles.statLabel}>Negotiable</Text>
        </View>
      </View>
      
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
            title="Finding new projects..."
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
      {/* Deposit Input Modal */}
<Modal
  visible={showDepositModal}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setShowDepositModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>💰 Request Deposit</Text>
      <Text style={styles.modalMessage}>
        Enter the deposit amount you'd like to request from the customer:
      </Text>
      
      <View style={styles.depositInputContainer}>
        <Text style={styles.currencyLabel}>RM</Text>
        <TextInput
          style={styles.depositInput}
          value={depositInput}
          onChangeText={setDepositInput}
          placeholder="Enter amount"
          keyboardType="numeric"
          autoFocus={true}
        />
      </View>
      
      <View style={styles.modalButtons}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => {
            setShowDepositModal(false);
            setDepositInput('');
            setSelectedProject(null);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => {
            if (!depositInput || isNaN(depositInput) || parseFloat(depositInput) <= 0) {
              Alert.alert("Invalid Amount", "Please enter a valid deposit amount.");
              return;
            }
            
            setShowDepositModal(false);
            acceptJobWithDeposit(selectedProject, parseFloat(depositInput));
            setDepositInput('');
            setSelectedProject(null);
          }}
        >
          <Text style={styles.acceptButtonText}>Accept Project</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textMedium,
    fontWeight: '500',
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMedium,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  jobsList: {
    padding: 16,
    paddingBottom: 80,
  },
  jobCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  processingCard: {
    opacity: 0.7,
  },
  urgencyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  jobInfoContainer: {
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  postedTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
    lineHeight: 24,
  },
  jobDescription: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 16,
    lineHeight: 20,
  },
  jobDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textMedium,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.textMedium,
    marginLeft: 4,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAED',
    marginVertical: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    minHeight: 44,
  },
  acceptButton: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  negotiateButton: {
    backgroundColor: Colors.highlight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  declineButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  negotiateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 6,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
    marginLeft: 6,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  itemSeparator: {
    height: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textMedium,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: Colors.error,
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
  // ADD these to your styles object
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
modalContent: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 24,
  width: '100%',
  maxWidth: 320,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333333',
  textAlign: 'center',
  marginBottom: 12,
},
modalMessage: {
  fontSize: 16,
  color: '#666666',
  textAlign: 'center',
  marginBottom: 20,
  lineHeight: 22,
},
depositInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#DDDDDD',
  borderRadius: 8,
  paddingHorizontal: 12,
  marginBottom: 20,
},
currencyLabel: {
  fontSize: 16,
  color: '#333333',
  marginRight: 8,
},
depositInput: {
  flex: 1,
  paddingVertical: 12,
  fontSize: 16,
  color: '#333333',
},
modalButtons: {
  flexDirection: 'row',
  gap: 12,
},
cancelButton: {
  flex: 1,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: '#DDDDDD',
  borderRadius: 8,
  alignItems: 'center',
},
cancelButtonText: {
  fontSize: 16,
  color: '#666666',
  fontWeight: '600',
},
acceptButton: {
  flex: 1,
  backgroundColor: Colors.success,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
acceptButtonText: {
  fontSize: 16,
  color: '#FFFFFF',
  fontWeight: 'bold',
}
});

export default HandymanHomeScreen;