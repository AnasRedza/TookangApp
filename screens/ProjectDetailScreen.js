// Full ProjectDetailScreen.js Implementation

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ProjectDetailScreen = ({ route, navigation }) => {
  // Extract the project data passed from the previous screen
  const { project } = route.params;
  
  // UI state
  const [isPhotoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock photos - in a real app these would come from the project
  const projectPhotos = [
    { id: '1', uri: 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1581658540337-d7e6a6903efb' }
  ];

  const handleAcceptProject = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Project Accepted",
        "You have successfully accepted this project. You can now contact the client.",
        [
          { text: "OK", onPress: () => navigation.goBack() }
        ]
      );
    }, 1000);
  };

  const handleDeclineProject = () => {
    Alert.alert(
      "Decline Project",
      "Are you sure you want to decline this project?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Decline", 
          style: "destructive",
          onPress: () => {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
              setIsLoading(false);
              navigation.goBack();
            }, 1000);
          }
        }
      ]
    );
  };

  const handleContactClient = () => {
    // Navigate to the Chat screen within the ChatTab navigator
    navigation.navigate('ChatTab', { 
      screen: 'Chat',
      params: {
        recipient: { 
          name: project.clientName, 
          id: 'client-' + project.id 
        }
      }
    });
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setPhotoModalVisible(true);
  };

  const renderPhotoModal = () => (
    <Modal
      visible={isPhotoModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setPhotoModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.closeModalButton}
          onPress={() => setPhotoModalVisible(false)}
        >
          <Ionicons name="close-circle" size={32} color="#FFF" />
        </TouchableOpacity>
        
        {selectedPhoto && (
          <Image 
            source={{ uri: selectedPhoto.uri }} 
            style={styles.modalImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Project Header */}
        <View style={styles.header}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{project.category}</Text>
          </View>
          <Text style={styles.projectTitle}>{project.title}</Text>
          
          <View style={styles.clientRow}>
            <View style={styles.clientInfo}>
              <View style={styles.clientAvatarPlaceholder}>
                <Text style={styles.clientInitials}>{project.clientName.charAt(0)}</Text>
              </View>
              <Text style={styles.clientName}>{project.clientName}</Text>
            </View>
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleContactClient}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Project Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          
          <Text style={styles.description}>{project.description}</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Budget</Text>
              <Text style={styles.detailValue}>RM{project.budget}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{project.location}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{project.date}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={[
                styles.statusBadge,
                project.status === 'New' ? styles.newStatus : null,
                project.status === 'Accepted' ? styles.acceptedStatus : null,
                project.status === 'Completed' ? styles.completedStatus : null,
              ]}>
                <Text style={styles.statusText}>{project.status}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Project Photos */}
        {projectPhotos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Project Photos</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosContainer}
            >
              {projectPhotos.map((photo) => (
                <TouchableOpacity 
                  key={photo.id} 
                  style={styles.photoThumbnail}
                  onPress={() => openPhotoModal(photo)}
                >
                  <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Location Map (Placeholder) */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={32} color="#999" />
            <Text style={styles.mapPlaceholderText}>Map location</Text>
          </View>
        </View>
        
        {/* Additional Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              The client has requested this project to be completed as soon as possible. They have indicated flexibility with the budget for a quick turnaround.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Action buttons at the bottom */}
      {project.status === 'New' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={handleDeclineProject}
            disabled={isLoading}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={handleAcceptProject}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.acceptButtonText}>Accept Project</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {project.status === 'Accepted' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => {
              Alert.alert(
                "Complete Project",
                "Mark this project as completed?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Complete", onPress: () => navigation.goBack() }
                ]
              );
            }}
          >
            <Text style={styles.completeButtonText}>Mark as Completed</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {renderPhotoModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    paddingBottom: 90, // Space for action buttons
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  clientName: {
    fontSize: 16,
    color: '#333',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  messageButtonText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 4,
  },
  detailsSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  newStatus: {
    backgroundColor: '#FFC107',
  },
  acceptedStatus: {
    backgroundColor: '#2196F3',
  },
  completedStatus: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  photosSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 10,
  },
  photosContainer: {
    paddingBottom: 8,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  mapSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 10,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  notesSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  noteBox: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E53935',
    marginRight: 8,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    borderRadius: 8,
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  }
});

export default ProjectDetailScreen;