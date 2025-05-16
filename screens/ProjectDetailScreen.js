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
  SafeAreaView
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const ProjectDetailScreen = ({ route, navigation }) => {
  const { project: initialProject } = route.params;
  const [project, setProject] = useState(initialProject);
  const [isLoading, setIsLoading] = useState(false);
  const { userType } = useAuth();
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time preference
  const formatTimePreference = (time) => {
    switch(time) {
      case 'morning': return 'Morning (8am - 12pm)';
      case 'afternoon': return 'Afternoon (12pm - 5pm)';
      case 'evening': return 'Evening (5pm - 9pm)';
      case 'anytime': return 'Anytime';
      default: return time;
    }
  };
  
  // Get status color
  const getStatusColor = () => {
    switch(project.status) {
      case 'pending_handyman_review': return '#FFA000';
      case 'in_negotiation': return '#2196F3';
      case 'agreed_scheduled': return '#8BC34A';
      case 'requires_adjustment': return '#FF5722';
      case 'in_progress': return '#03A9F4';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'disputed': return '#E91E63';
      default: return '#9E9E9E';
    }
  };
  
  // Get formatted status text
  const getStatusText = () => {
    switch(project.status) {
      case 'pending_handyman_review': return 'Pending Review';
      case 'in_negotiation': return 'In Negotiation';
      case 'agreed_scheduled': return 'Agreed & Scheduled';
      case 'requires_adjustment': return 'Requires Adjustment';
      case 'requires_payment': return 'Payment Required';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      default: return project.status;
    }
  };
  
  // Handle making an offer (for handyman)
  const handleMakeOffer = () => {
    navigation.navigate('ProjectOffer', { project });
  };
  
  // Handle adjusting budget (for handyman)
  const handleAdjustBudget = () => {
    navigation.navigate('BudgetAdjustment', { project });
  };
  
  // Handle approving adjustment (for customer)
  const handleApproveAdjustment = () => {
    // Use CommonActions to navigate to ensure it works from any position
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
  
  // Handle proceeding to payment (for customer)
  const handleProceedToPayment = () => {
    // Use CommonActions to navigate to ensure it works from any position
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeTab',
        params: {
          screen: 'Payment',
          params: {
            project: project,
            total: parseFloat(project.adjustedBudget || project.agreedBudget || project.initialBudget)
          }
        },
      })
    );
  };
  
  // Handle message
  const handleMessage = () => {
    const recipient = userType === 'customer' ? project.handyman : project.customer;
    
    navigation.navigate('ChatTab', {
      screen: 'Chat',
      params: { 
        recipient: recipient
      }
    });
  };
  
  // Handle cancellation
  const handleCancel = () => {
    Alert.alert(
      'Cancel Project',
      'Are you sure you want to cancel this project?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            
            // Simulate API call
            setTimeout(() => {
              const updatedProject = {
                ...project,
                status: 'cancelled'
              };
              setProject(updatedProject);
              setIsLoading(false);
            }, 1000);
          }
        }
      ]
    );
  };
  
  // Handle start project (for handyman)
  const handleStartProject = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedProject = {
        ...project,
        status: 'in_progress',
        startedAt: new Date().toISOString()
      };
      setProject(updatedProject);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle mark as complete (for handyman)
  const handleMarkComplete = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedProject = {
        ...project,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      setProject(updatedProject);
      setIsLoading(false);
      
      Alert.alert(
        'Project Completed',
        'You have marked this project as complete. The customer will be notified to confirm completion.'
      );
    }, 1000);
  };
  
  // Handle confirm completion (for customer)
  const handleConfirmCompletion = () => {
    Alert.alert(
      'Confirm Completion',
      'Are you satisfied with the completed work? This will release payment to the handyman.',
      [
        {
          text: 'Not Yet',
          style: 'cancel'
        },
        {
          text: 'Confirm & Pay',
          onPress: () => {
            setIsLoading(true);
            
            // Simulate API call
            setTimeout(() => {
              const updatedProject = {
                ...project,
                status: 'completed',
                customerConfirmedAt: new Date().toISOString()
              };
              setProject(updatedProject);
              setIsLoading(false);
              
              Alert.alert(
                'Payment Released',
                'The payment has been released to the handyman.'
              );
            }, 1000);
          }
        }
      ]
    );
  };
  
  // Render Customer Action Buttons
  const renderCustomerActions = () => {
    switch(project.status) {
      case 'requires_adjustment':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleApproveAdjustment}
            >
              <Text style={styles.primaryButtonText}>Review Adjustment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'agreed_scheduled':
      case 'requires_payment':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleProceedToPayment}
            >
              <Text style={styles.primaryButtonText}>Pay Now</Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Ionicons name="close-circle-outline" size={20} color="#F44336" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'in_progress':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message Handyman</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'pending_review':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleConfirmCompletion}
            >
              <Text style={styles.primaryButtonText}>Confirm Completion</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };
  
  // Render Handyman Action Buttons
  const renderHandymanActions = () => {
    switch(project.status) {
      case 'pending_handyman_review':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleMakeOffer}
            >
              <Text style={styles.primaryButtonText}>Make an Offer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'agreed_scheduled':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleAdjustBudget}
            >
              <Text style={styles.primaryButtonText}>Adjust Budget</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryButton, {backgroundColor: '#4CAF50'}]}
              onPress={handleStartProject}
            >
              <Text style={styles.primaryButtonText}>Start Project</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'in_progress':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.primaryButton, {backgroundColor: '#4CAF50'}]}
              onPress={handleMarkComplete}
            >
              <Text style={styles.primaryButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        
        {/* Project Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          
          <View style={styles.categoryRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{project.category}</Text>
            </View>
            <Text style={styles.dateText}>
              Created on {formatDate(project.createdAt)}
            </Text>
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{project.description}</Text>
          </View>
          
          {/* Budget Information */}
          <View style={styles.budgetContainer}>
            <Text style={styles.sectionTitle}>Budget</Text>
            
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Initial Budget:</Text>
              <Text style={styles.budgetValue}>RM {parseFloat(project.initialBudget).toFixed(2)}</Text>
            </View>
            
            {project.agreedBudget && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Agreed Budget:</Text>
                <Text style={styles.budgetValue}>RM {parseFloat(project.agreedBudget).toFixed(2)}</Text>
              </View>
            )}
            
            {project.adjustedBudget && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Adjusted Budget:</Text>
                <Text style={[styles.budgetValue, styles.adjustedBudget]}>RM {parseFloat(project.adjustedBudget).toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.negotiableRow}>
              <Ionicons name={project.isNegotiable ? "checkmark-circle" : "close-circle"} size={18} color={project.isNegotiable ? "#4CAF50" : "#F44336"} />
              <Text style={styles.negotiableText}>
                {project.isNegotiable ? "Budget is negotiable" : "Budget is fixed"}
              </Text>
            </View>
          </View>
          
          {/* Schedule Information */}
          <View style={styles.scheduleContainer}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            
            <View style={styles.scheduleRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.scheduleText}>
                {formatDate(project.preferredDate)}
              </Text>
            </View>
            
            <View style={styles.scheduleRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.scheduleText}>
                {formatTimePreference(project.preferredTime)}
              </Text>
            </View>
          </View>
          
          {/* Location */}
          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Service Location</Text>
            
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.locationText}>{project.location}</Text>
            </View>
          </View>
          
          {/* Project Images */}
          {project.images && project.images.length > 0 && (
            <View style={styles.imagesContainer}>
              <Text style={styles.sectionTitle}>Project Images</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesScroll}
              >
                {project.images.map((image, index) => (
                  <Image 
                    key={index}
                    source={{ uri: image }}
                    style={styles.projectImage}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Additional Notes */}
          {project.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={styles.notesText}>{project.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Action Buttons */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        userType === 'customer' ? renderCustomerActions() : renderHandymanActions()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  statusBanner: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  budgetContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 15,
    color: '#666',
  },
  budgetValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  adjustedBudget: {
    color: '#E53935',
  },
  negotiableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  negotiableText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  scheduleContainer: {
    marginBottom: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 8,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 8,
    flex: 1,
  },
  imagesContainer: {
    marginBottom: 16,
  },
  imagesScroll: {
    paddingRight: 16,
  },
  projectImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginRight: 8,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 15,
    color: '#444',
    fontStyle: 'italic',
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  messageButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
});

export default ProjectDetailScreen;