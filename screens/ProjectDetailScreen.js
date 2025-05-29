// Fixed ProjectDetailScreen.js - Enhanced Handyman Actions with Proper Flow
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';
import { scheduleService } from '../services/scheduleService';
import firebase from '../firebase';


const { width } = Dimensions.get('window');

const ProjectDetailScreen = ({ route, navigation }) => {
  const { 
    projectId, 
    project: passedProject, 
    viewMode = 'normal', 
    status = 'viewing' 
  } = route.params || {};
  
  const { isHandyman, user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!passedProject);
  const [projectStatus, setProjectStatus] = useState(status);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  // Status colors for different project states
  const STATUS_COLORS = {
    open: '#2196F3',
    accepted: '#4CAF50',
    negotiating: '#FF9800',
    completed: '#4CAF50',
    cancelled: '#F44336',
    pending_handyman_review: '#FFA000',
    in_negotiation: '#2196F3',
    agreed_scheduled: '#8BC34A',
    requires_adjustment: '#FF5722',
    requires_payment: '#E91E63',
    in_progress: '#03A9F4',
    disputed: '#E91E63',
    has_offers: '#9C27B0',
    pending_customer_acceptance: '#FF5722'
  };

  // Initialize project data
  useEffect(() => {
    if (passedProject) {
      normalizeProjectData(passedProject);
      animateIn();
    } else if (projectId) {
      fetchProjectData(projectId);
    }
  }, [passedProject, projectId]);
  
  // Update status when route params change
  useEffect(() => {
    if (status !== 'viewing' && status !== projectStatus) {
      setProjectStatus(status);
    }
  }, [status]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Normalize project data from different sources
  const normalizeProjectData = (rawProject) => {
    let normalizedProject = { ...rawProject };
    
    // Handle different data formats
    if (rawProject.customerName && !rawProject.customer) {
      normalizedProject = {
        ...rawProject,
        customer: {
          name: rawProject.customerName,
          avatar: getUserAvatarUri({ name: rawProject.customerName, profilePicture: rawProject.customerAvatar }),
          rating: rawProject.customerRating || 4.5,
          id: rawProject.customerId || `c${rawProject.id}`
        },
        preferredDate: rawProject.preferredDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        preferredTime: rawProject.preferredTime || 'morning',
        status: rawProject.status || 'open'
      };
    }
    
    // Use the actual handyman data if available
    if (rawProject.handyman) {
      normalizedProject.handyman = {
        ...rawProject.handyman,
        avatar: getUserAvatarUri(rawProject.handyman)
      };
    } else if (route.params?.handyman) {
      normalizedProject.handyman = {
        ...route.params.handyman,
        avatar: getUserAvatarUri(route.params.handyman)
      };
    }
    
    // Handle attachments
    if (rawProject.bidAttachments && Array.isArray(rawProject.bidAttachments)) {
      normalizedProject.bidAttachments = rawProject.bidAttachments;
    } else if (rawProject.images && Array.isArray(rawProject.images)) {
      normalizedProject.bidAttachments = rawProject.images;
    } else {
      normalizedProject.bidAttachments = [];
    }
    
    setProject(normalizedProject);
  };
  
  // Fetch project details
  const fetchProjectData = async (id) => {
    try {
      setLoading(true);
      const projectData = await projectService.getProjectById(id);
      if (projectData) {
        normalizeProjectData(projectData);
      } else {
        Alert.alert('Error', 'Project not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      Alert.alert('Error', 'Failed to load project details');
      navigation.goBack();
    } finally {
      setLoading(false);
      animateIn();
    }
  };
  

  
  const getOtherParty = () => {
    if (!project) return null;
    
    const defaultCustomer = { 
      name: project.customerName || 'Customer', 
      avatar: getUserAvatarUri({ name: project.customerName, profilePicture: project.customerAvatar }),
      id: project.customerId || 'unknown', 
      rating: project.customerRating || 4.5 
    };
    
    const defaultHandyman = { 
      name: project.requestedHandymanName || 'Handyman', 
      avatar: getUserAvatarUri({ name: project.requestedHandymanName, profilePicture: project.requestedHandymanAvatar }),
      id: project.requestedHandymanId || 'unknown', 
      rating: 4.5 
    };

    const otherParty = isHandyman 
      ? (project.customer || defaultCustomer) 
      : (project.requestedHandyman || defaultHandyman);
      
    // Ensure avatar is properly set
    if (!otherParty.avatar || otherParty.avatar.includes('randomuser.me')) {
      otherParty.avatar = getUserAvatarUri(otherParty);
    }
    
    return otherParty;
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    
    try {
      if (typeof date === 'string') date = new Date(date);
      if (isNaN(date.getTime())) return 'Not specified';
      
      return date.toLocaleDateString(undefined, 
        { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Not specified';
    }
  };
  
  const formatTime = (time) => {
    if (!time) return 'Flexible';
    
    if (typeof time === 'object' && time instanceof Date) {
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (typeof time === 'string') {
      switch(time) {
        case 'morning': return 'Morning (8am - 12pm)';
        case 'afternoon': return 'Afternoon (12pm - 5pm)';
        case 'evening': return 'Evening (5pm - 8pm)';
        default: return 'Anytime';
      }
    }
    
    return 'Flexible';
  };
  
  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    
    if (typeof budget === 'string' && budget.includes('-')) {
      return budget;
    } else if (typeof budget === 'string' && budget.includes('RM')) {
      return budget;
    } else {
      return `RM ${parseFloat(budget).toFixed(2)}`;
    }
  };
  
const getStatusLabel = (status) => {
    const statusMap = {
      pending_handyman_review: isHandyman ? 'New Job Request' : 'Pending Review',
      in_negotiation: isHandyman ? 'In Discussion' : 'In Negotiation',
      agreed_scheduled: isHandyman ? 'Job Scheduled' : 'Agreed & Scheduled',
      requires_adjustment: isHandyman ? 'Budget Adjustment Sent' : 'Adjustment Needed',
      requires_payment: isHandyman ? 'Awaiting Payment' : 'Payment Required',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
      accepted: isHandyman ? 'Accepted Job' : 'Accepted',
      negotiating: 'In Negotiation',
      has_offers: isHandyman ? 'Offer Submitted' : 'Has Offers',
      pending_customer_acceptance: isHandyman ? 'Awaiting Customer Response' : 'Review Offer'
    };
    
    return statusMap[status] || status;
  };
  
  // Image gallery functions
  const hasBidAttachments = project?.bidAttachments && Array.isArray(project.bidAttachments) && project.bidAttachments.length > 0;
  const allImages = [...(project?.bidAttachments || [])];
  
  const openImageGallery = (index) => {
    if (hasBidAttachments) {
      setSelectedImageIndex(index);
      setShowImageGallery(true);
    }
  };

  // Enhanced action handlers for handymen
  const showActionConfirmation = (type) => {
    setModalType(type);
    setShowActionModal(true);
  };

  const executeAction = async (action) => {
     console.log('🔍 executeAction called with:', action); 
    setShowActionModal(false);
    setActionLoading(action);
    
    try {
      switch (action) {
        case 'accept':
           console.log('🔍 Calling handleDirectAccept');
          await handleDirectAccept();
          break;
        case 'negotiate':
          await handleOpenNegotiation();
          break;
        case 'decline':
          await handleDeclineProject();
          break;
      }
    } catch (error) {
      console.error('Action error:', error);
      Alert.alert('Error', 'Failed to complete action. Please try again.');
    } finally {
      setActionLoading('');
    }
  };

  // Action handlers with improved navigation
const handleDirectAccept = async () => {
  console.log('🔍 handleDirectAccept with schedule check');
  
  try {
    // Check for schedule conflicts first
    const projectDate = new Date(project.preferredDate);
    const conflict = await scheduleService.checkScheduleConflict(
      user.id, 
      projectDate
    );
    
    if (conflict.hasConflict) {
      // Show conflict information
      const conflictMessage = scheduleService.formatConflictMessage(conflict.conflictingProjects);
      
      Alert.alert(
        "⚠️ Schedule Conflict",
        `${conflictMessage}\n\nWould you like to:\n• Negotiate a different date\n• Accept anyway (not recommended)`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Negotiate Date",
            onPress: () => {
              navigation.navigate('ProjectOffer', { 
                projectId: project.id,
                project: project,
                mode: 'negotiate_schedule',
                viewMode: 'handyman'
              });
            }
          },
          {
            text: "Accept Anyway",
            style: "destructive",
            onPress: () => promptForDeposit()
          }
        ]
      );
      return;
    }
    
    // No conflict, proceed with deposit prompt
    promptForDeposit();
    
  } catch (error) {
    console.error('Error checking schedule:', error);
    Alert.alert(
      'Schedule Check Failed', 
      'Unable to verify your availability. Would you like to proceed anyway?',
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: () => promptForDeposit() }
      ]
    );
  }
};

// ADD this new function
const promptForDeposit = () => {
  console.log('🔍 promptForDeposit called');
  Alert.prompt(
    "💰 Request Deposit",
    "Enter the deposit amount you'd like to request from the customer:",
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          // User cancelled, don't accept the project
        }
      },
      {
        text: "Accept Project",
        onPress: (depositAmount) => {
          if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid deposit amount.");
            return;
          }
          
          // Now accept the project with deposit
          acceptProjectWithDeposit(parseFloat(depositAmount));
        }
      }
    ],
    'plain-text',
    '',
    'numeric'
  );
};

// ADD this new function
  const acceptProjectWithDeposit = async (depositAmount) => {
    try {
    const projectStartDate = new Date(project.preferredDate);
    const estimatedDurationHours = 4; // Default 4 hours duration
    const projectEndDate = new Date(projectStartDate.getTime() + estimatedDurationHours * 60 * 60 * 1000);
    
    // Update project with complete acceptance data including schedule
    await projectService.updateProject(project.id, {
      status: 'awaiting_payment',
      handymanId: user.id,
      handymanName: user.name,
      handymanAvatar: user.profilePicture,
      depositAmount: depositAmount,
      depositRequested: true,
      acceptedAt: new Date().toISOString(),
      // Add schedule information
      scheduledStartDate: firebase.firestore.Timestamp.fromDate(projectStartDate),
      scheduledEndDate: firebase.firestore.Timestamp.fromDate(projectEndDate),
      estimatedDurationHours: estimatedDurationHours
    });
      
    setProjectStatus('awaiting_payment');
    setProject(prev => ({
      ...prev, 
      status: 'awaiting_payment',
      depositAmount: depositAmount,
      depositRequested: true,
      scheduledStartDate: projectStartDate,
      scheduledEndDate: projectEndDate
    }));

    Alert.alert(
      "🎉 Project Accepted!",
      `Great! You've accepted this project for ${projectStartDate.toLocaleDateString()} and requested a deposit of RM${depositAmount.toFixed(2)}. The customer will be notified.`,
      [
        {
          text: "View My Jobs",
          onPress: () => {
            navigation.navigate('ProjectsTab', {
              screen: 'MyProjects'
            });
          }
        },
        { text: "Continue", style: "cancel" }
      ]
    );
      
    } catch (error) {
      console.error('Error accepting project with deposit:', error);
      Alert.alert("Error", "Failed to accept project. Please try again.");
    }
  };
  
  const handleOpenNegotiation = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Navigate to the enhanced negotiation screen
          navigation.navigate('ProjectOffer', { 
            projectId: project.id, 
            project, 
            mode: 'negotiate', 
            viewMode: 'handyman'
          });
        } catch (error) {
          console.error('Navigation error:', error);
          Alert.alert(
            "Start Discussion",
            "You can now discuss project details with the customer. Would you like to send them a message?",
            [
              {
                text: "Send Message",
                onPress: () => handleContactUser()
              },
              { text: "Later", style: "cancel" }
            ]
          );
        }
        resolve();
      }, 1000);
    });
  };

  const handleDeclineProject = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        Alert.alert(
          "Project Declined",
          "You've declined this project. It has been removed from your available jobs list.",
          [
            { 
              text: "Find More Jobs", 
              onPress: () => navigation.goBack() 
            }
          ]
        );
        resolve();
      }, 1000);
    });
  };

  const handlePayForProject = async () => {
  try {
    navigation.navigate('HomeTab', {
      screen: 'Payment',
      params: {
        project: project,
        projectDetails: project // For compatibility
      }
    });
  } catch (error) {
    console.error('Error navigating to payment:', error);
    Alert.alert('Error', 'Unable to proceed to payment. Please try again.');
  }
};
  
  const handleContactUser = () => {
    const otherParty = getOtherParty();
    if (!otherParty) return;
    
    try {
      navigation.navigate('ChatTab', {
        screen: 'Chat',
        params: {
          recipient: {
            id: otherParty.id || `other-${project.id}`,
            name: otherParty.name,
            avatar: otherParty.avatar,
            role: isHandyman ? 'customer' : 'handyman',
            project: project.title
          },
          otherUser: otherParty,
          projectId: project.id,
          projectTitle: project.title
        }
      });
    } catch (error) {
      console.log("Chat navigation error:", error);
      Alert.alert("Chat Error", `Couldn't open chat with ${otherParty.name}.`);
    }
  };

  // Modal content for different actions
  const getModalContent = () => {
    const budget = formatBudget(project?.budget || project?.adjustedBudget || project?.agreedBudget || project?.initialBudget);
    
    switch (modalType) {
      case 'accept':
        return {
          title: '✅ Accept This Project?',
          message: `You're about to accept "${project?.title}".\n\nYou'll be prompted to request a deposit amount from the customer.`,
          confirmText: 'Continue',
          confirmColor: Colors.success,
          onConfirm: () => executeAction('accept')
        };
      case 'negotiate':
        return {
          title: '💬 Open Negotiation?',
          message: `You'll be able to:\n• Discuss project details and timeline\n• Make a counter-offer if needed\n• Accept the current terms\n• Just start a general conversation\n\nThis opens up all communication options.`,
          confirmText: 'Open Negotiation',
          confirmColor: Colors.primary,
          onConfirm: () => executeAction('negotiate')
        };
      case 'decline':
        return {
          title: '❌ Decline This Project?',
          message: `You're about to decline "${project?.title}".\n\nThis project will be removed from your available jobs and you won't see it again.`,
          confirmText: 'Yes, Decline',
          confirmColor: '#E53935',
          onConfirm: () => executeAction('decline')
        };
      default:
        return null;
    }
  };

  // Show loading indicator
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }
  
  // Check if project data exists
  if (!project) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Project not found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get status color
  const statusColor = STATUS_COLORS[project.status] || STATUS_COLORS[projectStatus] || Colors.primary;
  
  // Get the other party (customer or handyman)
  const otherParty = getOtherParty();
  const modalContent = getModalContent();

  // Determine if handyman should see action buttons
const shouldShowActions = isHandyman && 
    (viewMode === 'handyman' || project.status === 'pending_handyman_review') && 
    projectStatus === 'viewing' &&
    !['accepted', 'completed', 'cancelled', 'in_progress'].includes(project.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{project.title}</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      {/* Main content with animation */}
      <Animated.View 
        style={[
          styles.mainContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          {projectStatus !== 'viewing' && projectStatus !== 'open' && (
            <View style={[styles.statusBanner, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{getStatusLabel(projectStatus)}</Text>
            </View>
          )}
          
          {/* Project Status for existing projects */}
          {project.status && project.status !== 'open' && (
            <View style={[styles.statusBanner, { backgroundColor: STATUS_COLORS[project.status] }]}>
              <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
            </View>
          )}
          
          {/* Project Title & Category */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{project.category}</Text>
                </View>
                <Text style={styles.postedDate}>Posted {project.postedDate || 'recently'}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.descriptionText}>{project.description}</Text>
          </View>
          
          {/* Customer Attachments Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Attachments</Text>
            
            {hasBidAttachments ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesContainer}
              >
                {project.bidAttachments.map((image, index) => (
                  <TouchableOpacity
                    key={`bid-image-${index}`}
                    onPress={() => openImageGallery(index)}
                    style={styles.imageWrapper}
                  >
                    <Image
                      source={{ uri: image }}
                      style={styles.projectImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No customer attachments available</Text>
              </View>
            )}
          </View>
          
          {/* Project Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Project Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{project.address || project.location}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preferred Date</Text>
              <Text style={styles.detailValue}>{formatDate(project.preferredDate)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preferred Time</Text>
              <Text style={styles.detailValue}>{formatTime(project.preferredTime)}</Text>
            </View>
            
            {project.distance && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{project.distance} away</Text>
              </View>
            )}
          </View>
          
          {/* Materials & Notes */}
          {(project.materials || project.notes) && (
            <View style={styles.card}>
              {project.materials && (
                <View style={styles.notesSection}>
                  <Text style={styles.cardTitle}>Materials Required</Text>
                  <View style={styles.materialItem}>
                    <Text style={styles.materialText}>{project.materials}</Text>
                  </View>
                </View>
              )}
              
              {project.materials && project.notes && <View style={styles.divider} />}
              
              {project.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.cardTitle}>Additional Notes</Text>
                  <View style={styles.noteItem}>
                    <Text style={styles.noteText}>{project.notes}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Customer/Requested Handyman Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isHandyman ? 'Customer' : 'Requested Handyman'}</Text>
            <View style={styles.userInfo}>
              <Image 
                source={{ uri: isHandyman ? 
                  getUserAvatarUri(project.customer || { name: project.customerName }) :
                  getUserAvatarUri({ name: project.requestedHandymanName, profilePicture: project.requestedHandymanAvatar })
                }} 
                style={styles.userAvatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {isHandyman ? (project.customer?.name || project.customerName) : (project.requestedHandymanName || 'No specific handyman requested')}
                </Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingValue}>
                    {isHandyman ? (project.customer?.rating || project.customerRating || 4.5).toFixed(1) : '★'} ★
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
        
        {/* Enhanced Action Buttons for Handymen */}
    {shouldShowActions && (
  <View style={styles.actionContainer}>
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.declineButton]}
        onPress={() => showActionConfirmation('decline')}
        disabled={actionLoading !== ''}
      >
        {actionLoading === 'decline' ? (
          <ActivityIndicator size="small" color="#E53935" />
        ) : (
          <>
            <Ionicons name="close-outline" size={20} color="#E53935" />
            <Text style={styles.declineButtonText}>Pass</Text>
            <Text style={styles.actionSubtext}>Not interested</Text>
          </>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.negotiateButton]}
        onPress={() => showActionConfirmation('negotiate')}
        disabled={actionLoading !== ''}
      >
        {actionLoading === 'negotiate' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
            <Text style={styles.negotiateButtonText}>Negotiate</Text>
            <Text style={styles.actionSubtext}>Discuss details</Text>
          </>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.acceptButton]}
        onPress={() => showActionConfirmation('accept')}
        disabled={actionLoading !== ''}
      >
        {actionLoading === 'accept' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
            <Text style={styles.acceptButtonText}>Accept</Text>
            <Text style={styles.actionSubtext}>Take the job</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
)}

{/* Payment Button for Customer */}
{!isHandyman && project.status === 'awaiting_payment' && (
  <View style={styles.actionContainer}>
    <TouchableOpacity 
      style={styles.paymentButton}
      onPress={handlePayForProject}
    >
      <Ionicons name="card-outline" size={20} color="#FFFFFF" />
      <Text style={styles.paymentButtonText}>
        Pay Deposit (RM{project.depositAmount ? project.depositAmount.toFixed(2) : '0.00'})
      </Text>
    </TouchableOpacity>
  </View>
)}
      </Animated.View>
      
      {/* Action Confirmation Modal */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalContent && (
              <>
                <Text style={styles.modalTitle}>{modalContent.title}</Text>
                <Text style={styles.modalMessage}>{modalContent.message}</Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.modalCancelButton}
                    onPress={() => setShowActionModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalConfirmButton, { backgroundColor: modalContent.confirmColor }]}
                    onPress={modalContent.onConfirm}
                  >
                    <Text style={styles.modalConfirmText}>{modalContent.confirmText}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Image Gallery Modal */}
      <Modal
        visible={showImageGallery}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageGallery(false)}
      >
        <View style={styles.galleryModal}>
          <TouchableOpacity 
            style={styles.closeGalleryButton}
            onPress={() => setShowImageGallery(false)}
          >
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
          
          {allImages.length > 0 && (
            <View style={styles.galleryImageContainer}>
              <Image
                source={{ uri: allImages[selectedImageIndex] }}
                style={styles.galleryImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 80,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    color: '#333333',
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Card styling
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  postedDate: {
    fontSize: 12,
    color: '#666666',
  },
  budgetContainer: {
    alignItems: 'flex-end',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  negotiableText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444444',
  },
  // Images
  imagesContainer: {
    paddingVertical: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    width: width * 0.65,
    height: 170,
  },
  projectImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImageContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  noImageText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  // Details
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  // Materials & Notes
  notesSection: {
    marginBottom: 8,
  },
  materialItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  materialText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
  },
  noteItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
  },
  // User info
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#F0F0F0',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC107',
  },
  bottomPadding: {
    height: 120,
  },
  // Enhanced Action buttons
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
    minHeight: 70,
  },
  acceptButton: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  negotiateButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  declineButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FFCDD2',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 2,
  },
  negotiateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 2,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
    marginTop: 4,
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 11,
    opacity: 0.8,
    textAlign: 'center',
  },
  // Modal styles
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
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Gallery styles
  galleryModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImageContainer: {
    width: width,
    height: width * 0.8,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  closeGalleryButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentButton: {
  backgroundColor: '#4CAF50',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
  borderRadius: 12,
  marginHorizontal: 16,
  marginBottom: Platform.OS === 'ios' ? 24 : 12,
  shadowColor: '#4CAF50',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
},
paymentButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
  marginLeft: 8,
},
});

export default ProjectDetailScreen;