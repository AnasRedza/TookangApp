// CustomerOfferReviewScreen.js - Interface for customers to review and accept offers
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
import { offersService } from '../services/offerService';
import { projectService } from '../services/projectService';
import { getUserAvatarUri } from '../utils/imageUtils';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const CustomerOfferReviewScreen = ({ route, navigation }) => {
  const { 
    offerId,
    offer: passedOffer, 
    projectId,
    project: passedProject
  } = route.params || {};
  
  const { user } = useAuth();
  const [offer, setOffer] = useState(passedOffer);
  const [project, setProject] = useState(passedProject);
  const [loading, setLoading] = useState(!passedOffer || !passedProject);
  const [actionLoading, setActionLoading] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Load offer and project data
  useEffect(() => {
    if (!passedOffer || !passedProject) {
      loadData();
    } else {
      animateIn();
    }
  }, []);

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

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [offerData, projectData] = await Promise.all([
        offerId ? offersService.getOfferById(offerId) : Promise.resolve(passedOffer),
        projectId ? projectService.getProjectById(projectId) : Promise.resolve(passedProject)
      ]);
      
      if (!offerData || !projectData) {
        Alert.alert('Error', 'Offer or project not found');
        navigation.goBack();
        return;
      }
      
      setOffer(offerData);
      setProject(projectData);
      animateIn();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load offer details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Not specified';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Flexible';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Flexible';
    }
  };

  const calculateSavings = () => {
    if (!offer || !project) return 0;
    const originalBudget = project.initialBudget || 0;
    const offerAmount = offer.amount || 0;
    return originalBudget - offerAmount;
  };

  // Action handlers
  const showActionConfirmation = (type) => {
    setModalType(type);
    setShowActionModal(true);
  };

  const executeAction = async (action) => {
    setShowActionModal(false);
    setActionLoading(action);
    
    try {
      switch (action) {
        case 'accept':
          await handleAcceptOffer();
          break;
        case 'reject':
          await handleRejectOffer();
          break;
        case 'negotiate':
          await handleNegotiate();
          break;
      }
    } catch (error) {
      console.error('Action error:', error);
      Alert.alert('Error', 'Failed to complete action. Please try again.');
    } finally {
      setActionLoading('');
    }
  };

  const handleAcceptOffer = async () => {
    try {
      await offersService.acceptOffer(offer.id, project.id, user.id);
      
      Alert.alert(
        "🎉 Offer Accepted!",
        `Great! You've accepted ${offer.handymanName}'s offer for RM${offer.amount}. The handyman has been notified and you can now coordinate the work.`,
        [
          {
            text: "View Project",
            onPress: () => {
              navigation.navigate('ProjectsTab', {
                screen: 'ProjectDetails',
                params: { projectId: project.id }
              });
            }
          },
          {
            text: "Message Handyman",
            onPress: () => {
              navigation.navigate('ChatTab', {
                screen: 'Chat',
                params: {
                  recipient: {
                    id: offer.handymanId,
                    name: offer.handymanName,
                    avatar: getUserAvatarUri({ name: offer.handymanName, profilePicture: offer.handymanAvatar }),
                    role: 'handyman'
                  },
                  projectId: project.id,
                  projectTitle: project.title
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      throw error;
    }
  };

  const handleRejectOffer = async () => {
    try {
      await offersService.rejectOffer(offer.id, 'Not the right fit for this project', user.id);
      
      Alert.alert(
        "Offer Declined",
        "The handyman has been notified of your decision. You can still discuss alternatives or wait for other offers.",
        [
          {
            text: "Back to Project",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      throw error;
    }
  };

  const handleNegotiate = async () => {
    navigation.navigate('ChatTab', {
      screen: 'Chat',
      params: {
        recipient: {
          id: offer.handymanId,
          name: offer.handymanName,
          avatar: getUserAvatarUri({ name: offer.handymanName, profilePicture: offer.handymanAvatar }),
          role: 'handyman'
        },
        projectId: project.id,
        projectTitle: project.title
      }
    });
  };

  // Modal content
  const getModalContent = () => {
    switch (modalType) {
      case 'accept':
        return {
          title: '✅ Accept This Offer?',
          message: `You're about to accept ${offer?.handymanName}'s offer for RM${offer?.amount}.\n\nThis will assign the project to them and they can begin work coordination.`,
          confirmText: 'Accept Offer',
          confirmColor: Colors.success,
          onConfirm: () => executeAction('accept')
        };
      case 'reject':
        return {
          title: '❌ Decline This Offer?',
          message: `You're about to decline ${offer?.handymanName}'s offer.\n\nThey will be notified and you can continue to receive other offers or negotiate.`,
          confirmText: 'Decline Offer',
          confirmColor: '#E53935',
          onConfirm: () => executeAction('reject')
        };
      case 'negotiate':
        return {
          title: '💬 Start Discussion?',
          message: `Open a chat with ${offer?.handymanName} to discuss the project details, timeline, or negotiate terms.`,
          confirmText: 'Start Chat',
          confirmColor: Colors.primary,
          onConfirm: () => executeAction('negotiate')
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading offer details...</Text>
      </View>
    );
  }

  if (!offer || !project) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Offer not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const modalContent = getModalContent();
  const savings = calculateSavings();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Offer</Text>
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
          {/* Offer Summary Card */}
          <View style={styles.card}>
            <View style={styles.offerHeader}>
              <View style={styles.offerBadge}>
                <Ionicons name="briefcase" size={16} color={Colors.primary} />
                <Text style={styles.offerBadgeText}>New Offer</Text>
              </View>
              <Text style={styles.offerDate}>
                {new Date(offer.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.offerAmountContainer}>
              <Text style={styles.offerAmountLabel}>Offered Amount</Text>
              <Text style={styles.offerAmount}>RM {offer.amount}</Text>
              {savings !== 0 && (
                <Text style={[
                  styles.savingsText,
                  savings > 0 ? styles.savingsPositive : styles.savingsNegative
                ]}>
                  {savings > 0 ? `Save RM${savings}` : `+RM${Math.abs(savings)} more`}
                </Text>
              )}
            </View>

            <View style={styles.offerDetails}>
              <View style={styles.offerDetailRow}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={styles.offerDetailLabel}>Duration:</Text>
                <Text style={styles.offerDetailValue}>{offer.estimatedDuration}</Text>
              </View>
              
              <View style={styles.offerDetailRow}>
                <Ionicons name="construct-outline" size={16} color={Colors.primary} />
                <Text style={styles.offerDetailLabel}>Materials:</Text>
                <Text style={styles.offerDetailValue}>
                  {offer.materialsIncluded ? 'Included' : 'Not included'}
                </Text>
              </View>

              {offer.proposedDate && (
                <View style={styles.offerDetailRow}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                  <Text style={styles.offerDetailLabel}>Proposed Date:</Text>
                  <Text style={styles.offerDetailValue}>{formatDate(offer.proposedDate)}</Text>
                </View>
              )}

              {offer.proposedTime && (
                <View style={styles.offerDetailRow}>
                  <Ionicons name="alarm-outline" size={16} color={Colors.primary} />
                  <Text style={styles.offerDetailLabel}>Proposed Time:</Text>
                  <Text style={styles.offerDetailValue}>{formatTime(offer.proposedTime)}</Text>
                </View>
              )}
            </View>

            {offer.message && (
              <View style={styles.offerMessageContainer}>
                <Text style={styles.offerMessageLabel}>Message from Handyman:</Text>
                <View style={styles.offerMessageBubble}>
                  <Text style={styles.offerMessageText}>"{offer.message}"</Text>
                </View>
              </View>
            )}
          </View>

          {/* Handyman Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About the Handyman</Text>
            <View style={styles.handymanInfo}>
              <Image 
                source={{ uri: getUserAvatarUri({ name: offer.handymanName, profilePicture: offer.handymanAvatar }) }}
                style={styles.handymanAvatar}
              />
              <View style={styles.handymanDetails}>
                <Text style={styles.handymanName}>{offer.handymanName}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>4.8 (124 reviews)</Text>
                </View>
                <Text style={styles.handymanExperience}>5+ years experience</Text>
              </View>
            </View>
          </View>

          {/* Project Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Project Summary</Text>
            <View style={styles.projectSummary}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectCategory}>{project.category}</Text>
              <Text style={styles.projectDescription} numberOfLines={3}>
                {project.description}
              </Text>
              
              <View style={styles.projectDetails}>
                <View style={styles.projectDetailRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.textMedium} />
                  <Text style={styles.projectDetailText}>{project.location}</Text>
                </View>
                <View style={styles.projectDetailRow}>
                  <Ionicons name="cash-outline" size={14} color={Colors.textMedium} />
                  <Text style={styles.projectDetailText}>
                    Original Budget: RM {project.initialBudget}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => showActionConfirmation('reject')}
              disabled={actionLoading !== ''}
            >
              {actionLoading === 'reject' ? (
                <ActivityIndicator size="small" color="#E53935" />
              ) : (
                <>
                  <Ionicons name="close-outline" size={20} color="#E53935" />
                  <Text style={styles.rejectButtonText}>Decline</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.negotiateButton]}
              onPress={() => showActionConfirmation('negotiate')}
              disabled={actionLoading !== ''}
            >
              {actionLoading === 'negotiate' ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
                  <Text style={styles.negotiateButtonText}>Discuss</Text>
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
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  
  // Offer Summary
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  offerDate: {
    fontSize: 12,
    color: '#666666',
  },
  offerAmountContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  offerAmountLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  offerAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.success,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  savingsPositive: {
    color: Colors.success,
  },
  savingsNegative: {
    color: Colors.warning,
  },
  offerDetails: {
    marginBottom: 16,
  },
  offerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerDetailLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  offerDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  offerMessageContainer: {
    marginTop: 16,
  },
  offerMessageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  offerMessageBubble: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  offerMessageText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  
  // Handyman Info
  handymanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handymanAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  handymanDetails: {
    flex: 1,
  },
  handymanName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  handymanExperience: {
    fontSize: 12,
    color: '#999999',
  },
  
  // Project Summary
  projectSummary: {
    
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectDetails: {
    
  },
  projectDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectDetailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  
  bottomPadding: {
    height: 120,
  },
  
  // Action Buttons
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
    minHeight: 60,
    flexDirection: 'row',
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
    backgroundColor: Colors.highlight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  rejectButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FFCDD2',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  negotiateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 6,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
    marginLeft: 6,
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
});

export default CustomerOfferReviewScreen;