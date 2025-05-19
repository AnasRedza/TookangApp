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
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

// Guaranteed working image URLs for testing
const TEST_IMAGES = {
  BID_ATTACHMENTS: [
    'https://reactnative.dev/docs/assets/p_cat2.png',
    'https://reactnative.dev/img/header_logo.svg'
  ]
};

const ProjectDetailScreen = ({ route, navigation }) => {
  const { 
    projectId, 
    project: passedProject, 
    viewMode = 'normal', 
    status = 'viewing' 
  } = route.params || {};
  
  const { isHandyman } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!passedProject);
  const [projectStatus, setProjectStatus] = useState(status);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
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
  };

  // Initialize project data
  useEffect(() => {
    if (passedProject) {
      normalizeProjectData(passedProject);
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
  
  // Normalize project data from different sources
  const normalizeProjectData = (rawProject) => {
    let normalizedProject = { ...rawProject };
    
    // Handle different data formats
    if (rawProject.customerName && !rawProject.customer) {
      normalizedProject = {
        ...rawProject,
        initialBudget: extractBudgetAmount(rawProject.budget),
        customer: {
          name: rawProject.customerName,
          avatar: `https://randomuser.me/api/portraits/${rawProject.customerName.includes('Sarah') ? 'women' : 'men'}/30.jpg`, 
          rating: rawProject.customerRating || 4.5,
          id: `c${rawProject.id}`
        },
        preferredDate: rawProject.preferredDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        preferredTime: rawProject.preferredTime || 'morning',
        status: rawProject.status || 'pending_handyman_review'
      };
    }
    
    if (rawProject.handyman && !rawProject.handyman.avatar) {
      normalizedProject.handyman = {
        ...rawProject.handyman,
        avatar: `https://randomuser.me/api/portraits/men/${parseInt(rawProject.id) + 20}.jpg`
      };
    }
    
    // Ensure bidAttachments is always an array
    if (!rawProject.bidAttachments || !Array.isArray(rawProject.bidAttachments)) {
      normalizedProject.bidAttachments = [];
    }
    
    setProject(normalizedProject);
  };
  
  // Fetch project details
  const fetchProjectData = (id) => {
    setLoading(true);
    // Mock data fetch - simulate API call
    setTimeout(() => {
      const mockProject = {
        id: id,
        title: 'Fix Leaking Kitchen Sink',
        description: 'The kitchen sink has been leaking for a week and needs repair. Water is slowly dripping from the pipes underneath the sink and collecting in a small puddle.',
        location: 'Kuala Lumpur',
        address: '123 Jalan Bukit Bintang, Apartment 12A, Kuala Lumpur',
        budget: 'RM120-RM180',
        isNegotiable: true,
        customerName: 'Sarah Wong',
        customerRating: 4.8,
        customerPhone: '+60123456789',
        postedDate: '2 days ago',
        category: 'Plumbing',
        distance: '3.5 km',
        status: 'open',
        preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        preferredTime: 'morning',
        materials: 'May need new P-trap or seals.',
        notes: 'Water shutoff valve is located under the sink.',
        bidAttachments: TEST_IMAGES.BID_ATTACHMENTS
      };
      normalizeProjectData(mockProject);
      setLoading(false);
    }, 1000);
  };
  
  // Helper functions
  const extractBudgetAmount = (budgetString) => {
    if (!budgetString) return 100;
    const match = budgetString.match(/RM(\d+)/);
    return match && match[1] ? parseInt(match[1]) : 100;
  };
  
  const getOtherParty = () => {
    if (!project) return null;
    
    const defaultCustomer = { 
      name: project.customerName || 'Customer', 
      avatar: `https://randomuser.me/api/portraits/${project.customerName?.includes('Sarah') ? 'women' : 'men'}/30.jpg`, 
      id: 'unknown', 
      rating: project.customerRating || 4.5 
    };
    
    const defaultHandyman = { 
      name: 'Handyman', 
      avatar: `https://randomuser.me/api/portraits/men/20.jpg`, 
      id: 'unknown', 
      rating: 4.5 
    };
    
    const otherParty = isHandyman 
      ? (project.customer || defaultCustomer) 
      : (project.handyman || defaultHandyman);
      
    if (!otherParty.avatar) {
      otherParty.avatar = isHandyman ? defaultCustomer.avatar : defaultHandyman.avatar;
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
      open: isHandyman ? 'Available Job' : 'Open Project',
      accepted: isHandyman ? 'Accepted Job' : 'Accepted',
      negotiating: 'In Negotiation'
    };
    
    return statusMap[status] || status;
  };
  
  // Image gallery functions
  const hasBidAttachments = project?.bidAttachments && Array.isArray(project.bidAttachments) && project.bidAttachments.length > 0;
  
  // Attachments for gallery viewing
  const allImages = [...(project?.bidAttachments || [])];
  const imagesLength = allImages.length;
  
  const openImageGallery = (index) => {
    if (hasBidAttachments) {
      setSelectedImageIndex(index);
      setShowImageGallery(true);
    }
  };
  
  // Action handlers
  const handleAcceptProject = () => {
    Alert.alert(
      "Accept Project",
      "Are you sure you want to accept this project with the customer's budget?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: () => {
            setIsLoading(true);
            setTimeout(() => {
              setProjectStatus('accepted');
              setProject(prev => ({...prev, status: 'accepted'}));
              setIsLoading(false);
              Alert.alert("Project Accepted", "You have accepted this project.");
            }, 1000);
          }
        }
      ]
    );
  };
  
  // Fixed negotiate button handler to prevent navigation error
  const handleNegotiateProject = () => {
    // Check if ProjectOffer screen is available in your navigation
    try {
      // Option 1: Set negotiation state directly instead of navigating
      setIsLoading(true);
      setTimeout(() => {
        setProjectStatus('negotiating');
        setProject(prev => ({...prev, status: 'negotiating'}));
        setIsLoading(false);
        Alert.alert("Negotiation Started", "You've started negotiating this project.");
      }, 1000);
      
      // Option 2 (commented out): Safely check if screen exists before navigating
      // if (navigation && navigation.navigate) {
      //   navigation.navigate('ProjectOffer', { 
      //     projectId: project.id, 
      //     project, 
      //     mode: 'negotiate', 
      //     viewMode: 'handyman'
      //   });
      // } else {
      //   Alert.alert("Navigation Error", "Cannot navigate to offer screen.");
      // }
    } catch (error) {
      console.log("Navigation error:", error);
      Alert.alert("Navigation Error", "Could not open negotiation screen.");
    }
  };
  
  const handleDeclineProject = () => {
    Alert.alert(
      "Decline Project",
      "Are you sure you want to decline this project?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Decline", style: "destructive", onPress: () => navigation.goBack() }
      ]
    );
  };
  
  const handleContactUser = () => {
    const otherParty = getOtherParty();
    if (!otherParty) return;
    
    // Check if Chat screen exists in navigation
    try {
      navigation.navigate('Chat', {
        recipient: {
          id: otherParty.id || `other-${project.id}`,
          name: otherParty.name,
          avatar: otherParty.avatar,
          role: isHandyman ? 'customer' : 'handyman',
          project: project.title
        },
        otherUser: otherParty,
        projectId: project.id
      });
    } catch (error) {
      console.log("Chat navigation error:", error);
      Alert.alert("Chat Error", `Couldn't open chat with ${otherParty.name}.`);
    }
  };
  
  const handlePayForProject = () => {
    // Check if Payment screen exists in navigation
    try {
      navigation.navigate('Payment', {
        project: project,
        total: parseFloat(project.adjustedBudget || project.agreedBudget || 
          project.initialBudget || extractBudgetAmount(project.budget))
      });
    } catch (error) {
      console.log("Payment navigation error:", error);
      Alert.alert("Payment Error", "Payment screen is not available.");
    }
  };

  const handleViewAdjustment = () => {
    // Check if AdjustmentApproval screen exists in navigation
    try {
      navigation.navigate('AdjustmentApproval', { 
        project: project, 
        adjustment: { 
          newAmount: project.adjustedBudget || extractBudgetAmount(project.budget),
          reason: project.adjustmentReason || 'Additional work required'
        }
      });
    } catch (error) {
      console.log("Adjustment navigation error:", error);
      Alert.alert("Adjustment Error", "Adjustment screen is not available.");
    }
  };

  const handleCompleteJob = () => {
    Alert.alert(
      "Complete Job",
      "Have you completed all the required work for this job?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Complete", 
          onPress: () => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              setProject(prev => ({
                ...prev,
                status: 'completed',
                completedAt: new Date().toISOString()
              }));
              setProjectStatus('completed');
              Alert.alert("Job Completed", "You have marked this job as completed.");
            }, 1000);
          } 
        }
      ]
    );
  };

  const handleRequestBudgetAdjustment = () => {
    // Check if BudgetAdjustment screen exists in navigation
    try {
      navigation.navigate('BudgetAdjustment', { project: project });
    } catch (error) {
      console.log("Budget adjustment navigation error:", error);
      Alert.alert("Budget Adjustment", "Budget adjustment screen is not available.");
    }
  };

  const handleReviewUser = () => {
    const otherParty = getOtherParty();
    if (!otherParty) return;
    
    // Check if ReviewScreen exists in navigation
    try {
      navigation.navigate('ReviewScreen', { 
        project: project,
        userToReview: otherParty.name,
        userType: isHandyman ? 'customer' : 'handyman',
        onReviewSubmitted: (reviewData) => {
          setProject(prev => ({...prev, isReviewed: true, reviewData}));
        }
      });
    } catch (error) {
      console.log("Review navigation error:", error);
      Alert.alert("Review Error", "Review screen is not available.");
    }
  };

  const handleCancel = () => {
    Alert.alert(
      isHandyman ? "Cancel Job" : "Cancel Project",
      `Are you sure you want to cancel this ${isHandyman ? 'job' : 'project'}?`,
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          style: "destructive",
          onPress: () => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              setProject(prev => ({...prev, status: 'cancelled'}));
              setProjectStatus('cancelled');
              Alert.alert("Project Cancelled", "You have cancelled this project.", 
                [{ text: "OK", onPress: () => navigation.goBack() }]);
            }, 1000);
          } 
        }
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{project.title}</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      {/* Main content */}
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          {projectStatus !== 'viewing' && projectStatus !== 'open' && (
            <View style={[styles.statusBanner, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{getStatusLabel(projectStatus)}</Text>
            </View>
          )}
          
          {/* Project Title & Category */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{project.category}</Text>
                </View>
                <Text style={styles.postedDate}>Posted {project.postedDate}</Text>
              </View>
              <View style={styles.budgetContainer}>
                <Text style={styles.budgetLabel}>Budget</Text>
                <Text style={styles.budgetValue}>
                  {formatBudget(project.budget || project.adjustedBudget || 
                  project.agreedBudget || project.initialBudget)}
                </Text>
                {project.isNegotiable && (
                  <Text style={styles.negotiableText}>Negotiable</Text>
                )}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.descriptionText}>{project.description}</Text>
          </View>
          
          {/* Customer Bid Attachments Section */}
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
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(project.preferredDate)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
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
          
          {/* Customer/Handyman Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isHandyman ? 'Customer' : 'Handyman'}</Text>
            <View style={styles.userInfo}>
              <Image 
                source={{ uri: otherParty.avatar }} 
                style={styles.userAvatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{otherParty.name}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingValue}>{(otherParty.rating || 4.5).toFixed(1)} ★</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Bottom padding to ensure content isn't covered by action buttons */}
          <View style={styles.bottomPadding} />
        </ScrollView>
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isHandyman ? (
            // HANDYMAN ACTIONS
            <>
              {/* Available Jobs */}
              {(viewMode === 'handyman' || project.status === 'open') && projectStatus === 'viewing' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={handleDeclineProject}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.negotiateButton]}
                    onPress={handleNegotiateProject}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#F57C00" />
                    ) : (
                      <Text style={styles.negotiateButtonText}>Negotiate</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={handleAcceptProject}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Ongoing Jobs */}
              {(viewMode === 'normal' || ['in_progress', 'agreed_scheduled'].includes(project.status)) && 
                projectStatus !== 'viewing' && (
                  <View style={styles.buttonRow}>
                    {project.status === 'in_progress' && (
                      <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={handleCompleteJob}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.primaryButtonText}>Mark Complete</Text>
                        )}
                      </TouchableOpacity>
                    )}
                    
                    {(project.status === 'agreed_scheduled' || project.status === 'in_progress') && (
                      <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={handleRequestBudgetAdjustment}
                      >
                        <Text style={styles.secondaryButtonText}>Request Adjustment</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              }
              
              {/* Completed Jobs */}
              {project.status === 'completed' && !project.isReviewed && (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleReviewUser}
                >
                  <Text style={styles.primaryButtonText}>Review Customer</Text>
                </TouchableOpacity>
              )}
              
              {/* Message button */}
              {(projectStatus === 'accepted' || project.status === 'accepted' || 
               project.status === 'in_progress' || project.status === 'agreed_scheduled') && (
                <TouchableOpacity 
                  style={styles.messageButton}
                  onPress={handleContactUser}
                >
                  <Text style={styles.messageButtonText}>Message Customer</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // CUSTOMER ACTIONS
            <>
              {/* Payment actions */}
              {(project.status === 'requires_payment' || project.status === 'agreed_scheduled') && (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handlePayForProject}
                >
                  <Text style={styles.primaryButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
              
              {/* Budget adjustment actions */}
              {project.status === 'requires_adjustment' && (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleViewAdjustment}
                >
                  <Text style={styles.primaryButtonText}>View Adjustment</Text>
                </TouchableOpacity>
              )}
              
              {/* Review actions */}
              {project.status === 'completed' && !project.isReviewed && (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleReviewUser}
                >
                  <Text style={styles.primaryButtonText}>Review Handyman</Text>
                </TouchableOpacity>
              )}
              
              {/* Cancel actions */}
              {['pending_handyman_review', 'in_negotiation', 'open'].includes(project.status) && (
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel Project</Text>
                </TouchableOpacity>
              )}
              
              {/* Message button */}
              {(project.status === 'in_progress' || project.status === 'agreed_scheduled') && (
                <TouchableOpacity 
                  style={styles.messageButton}
                  onPress={handleContactUser}
                >
                  <Text style={styles.messageButtonText}>Message Handyman</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      
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
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          
          {allImages.length > 0 && (
            <View style={styles.galleryImageContainer}>
              <Image
                source={{ uri: allImages[selectedImageIndex] }}
                style={styles.galleryImage}
                resizeMode="contain"
              />
              
              <View style={styles.galleryInfo}>
                <Text style={styles.galleryInfoText}>Customer Attachment</Text>
              </View>
            </View>
          )}
          
          <View style={styles.galleryControls}>
            <Text style={styles.galleryCounter}>
              {selectedImageIndex + 1} / {imagesLength}
            </Text>
            <View style={styles.galleryNavButtons}>
              <TouchableOpacity 
                style={[styles.galleryNavButton, selectedImageIndex === 0 && {opacity: 0.5}]}
                onPress={() => {
                  if (selectedImageIndex > 0) {
                    setSelectedImageIndex(selectedImageIndex - 1);
                  }
                }}
                disabled={selectedImageIndex === 0}
              >
                <Text style={styles.navButtonText}>Prev</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.galleryNavButton, 
                  selectedImageIndex === imagesLength - 1 && {opacity: 0.5}]}
                onPress={() => {
                  if (selectedImageIndex < imagesLength - 1) {
                    setSelectedImageIndex(selectedImageIndex + 1);
                  }
                }}
                disabled={selectedImageIndex === imagesLength - 1}
              >
                <Text style={styles.navButtonText}>Next</Text>
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
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 60,
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
    borderRadius: 8,
    margin: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
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
    fontSize: 18,
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
  // Description
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
  // No image message
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
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
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
    width: 50,
    height: 50,
    borderRadius: 25,
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
    height: 100,
  },
  // Action buttons
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  negotiateButton: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  declineButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  negotiateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Gallery
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
  galleryInfo: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    alignItems: 'center',
  },
  galleryInfoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  closeGalleryButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  galleryControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  galleryCounter: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  galleryNavButtons: {
    flexDirection: 'row',
  },
  galleryNavButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default ProjectDetailScreen;