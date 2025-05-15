import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const HandymanDetailScreen = ({ route, navigation }) => {
  // Get handyman data from route params or use defaults if not available
  const { handyman } = route.params || {
    handyman: {
      id: '1',
      name: 'Default Handyman',
      profession: 'General',
      rating: 4.5,
      reviews: 0,
      hourlyRate: 0,
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      description: 'No description available.',
      categories: [],
      completedJobs: 0,
    }
  };

  // State for read more functionality
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllPrices, setShowAllPrices] = useState(false);
  
  // Mock price list for services/items
  const priceList = [
    { id: '1', service: 'Basic Plumbing Service', price: 50 },
    { id: '2', service: 'Sink Installation', price: 120 },
    { id: '3', service: 'Toilet Repair', price: 80 },
    { id: '4', service: 'Pipe Replacement (per foot)', price: 15 },
    { id: '5', service: 'Shower Installation', price: 250 },
    { id: '6', service: 'Water Heater Repair', price: 100 },
    { id: '7', service: 'Water Heater Installation', price: 350 },
    { id: '8', service: 'Drain Cleaning', price: 75 },
  ];
  
  // Mock reviews for demonstration
  const mockReviews = [
    {
      id: '1',
      user: 'Sarah L.',
      rating: 5,
      date: '2025-04-28',
      comment: 'Excellent service! Very professional and completed the job quickly.',
      project: 'Fixed leaking sink',
    },
    {
      id: '2',
      user: 'James T.',
      rating: 4,
      date: '2025-04-15',
      comment: 'Good work overall, but took a little longer than expected.',
      project: 'Installed ceiling fan',
    },
    {
      id: '3',
      user: 'Michelle R.',
      rating: 5,
      date: '2025-04-05',
      comment: 'Fantastic work! Will definitely hire again for future projects.',
      project: 'Repaired bathroom tiles',
    },
  ];

  // Function to handle bidding on a project
  const handleBidProject = () => {
    navigation.navigate('ProjectBid', { handyman });
  };

  // Function to message the handyman
  const handleMessageHandyman = () => {
    navigation.navigate('Chat', { recipient: handyman });
  };

  // Render rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#FFD700" style={{ marginRight: 2 }} />
        );
      } else if (i === fullStars + 1 && halfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" style={{ marginRight: 2 }} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFD700" style={{ marginRight: 2 }} />
        );
      }
    }
    return stars;
  };

  // Render a review item
  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <Text style={styles.reviewUserName}>{item.user}</Text>
          <View style={styles.reviewRating}>
            {renderRatingStars(item.rating)}
          </View>
        </View>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>
      <Text style={styles.reviewProject}>Project: {item.project}</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header with avatar and basic info */}
        <View style={styles.header}>
          <Image 
            source={{ uri: handyman.avatar || handyman.profilePicture }} 
            style={styles.avatar} 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{handyman.name}</Text>
            <Text style={styles.profession}>{handyman.profession}</Text>
            <View style={styles.ratingContainer}>
              {renderRatingStars(handyman.rating)}
              <Text style={styles.reviewCount}>
                ({handyman.reviews || handyman.totalReviews || 0} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={handleMessageHandyman}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bidButton}
            onPress={handleBidProject}
          >
            <Ionicons name="hammer-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Create Project Bid</Text>
          </TouchableOpacity>
        </View>

        {/* Hourly Rate Banner */}
        <View style={styles.rateContainer}>
          <Text style={styles.rateLabel}>Hourly Rate</Text>
          <Text style={styles.rateValue}>RM {handyman.hourlyRate}/hr</Text>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 3}>
            {handyman.description || handyman.about || 'No description available.'}
          </Text>
          {(handyman.description?.length > 120 || handyman.about?.length > 120) && (
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.readMoreText}>
                {showFullDescription ? 'Read less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Services/Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.categoriesContainer}>
            {(handyman.categories || handyman.skills || []).map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price List Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Price List</Text>
            <TouchableOpacity onPress={() => setShowAllPrices(!showAllPrices)}>
              <Text style={styles.seeAllText}>
                {showAllPrices ? 'Show Less' : 'See All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceListContainer}>
            {priceList.slice(0, showAllPrices ? priceList.length : 4).map((item) => (
              <View key={item.id} style={styles.priceListItem}>
                <Text style={styles.priceListService}>{item.service}</Text>
                <Text style={styles.priceListPrice}>RM {item.price}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.priceNotesContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#999999" />
            <Text style={styles.priceNotes}>
              Prices may vary based on job complexity and materials needed. Final quotation will be provided after assessment.
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience & Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="briefcase-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{handyman.yearsExperience || '5'}+ years</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{handyman.completedJobs || handyman.completedProjects || 85}</Text>
              <Text style={styles.statLabel}>Projects Done</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time-outline" size={22} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>95%</Text>
              <Text style={styles.statLabel}>On-time</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Reviews List */}
          {mockReviews.length > 0 ? (
            <FlatList
              data={mockReviews.slice(0, 3)}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
              contentContainerStyle={styles.reviewsContainer}
            />
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          )}
        </View>
        
        {/* Bottom padding */}
        <View style={{ height: 20 }} />
        
        {/* Fixed Bid Button at bottom */}
        <View style={styles.fixedBottomContainer}>
          <TouchableOpacity
            style={styles.fixedBidButton}
            onPress={handleBidProject}
          >
            <Text style={styles.fixedBidButtonText}>Hire {handyman.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  headerInfo: {
    marginLeft: 15,
    justifyContent: 'center',
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profession: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bidButton: {
    flex: 2,
    backgroundColor: Colors.primary || '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rateContainer: {
    backgroundColor: Colors.primary || '#3498db',
    padding: 15,
    alignItems: 'center',
  },
  rateLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  rateValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary || '#3498db',
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
  },
  readMoreText: {
    marginTop: 5,
    color: Colors.primary || '#3498db',
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#EBF5FF',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.primary || '#3498db',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F7FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  reviewsContainer: {
    paddingBottom: 10,
  },
  reviewItem: {
    padding: 15,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 5,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewUser: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999999',
  },
  reviewProject: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary || '#3498db',
    marginBottom: 5,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  priceListContainer: {
    marginBottom: 10,
  },
  priceListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  priceListService: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
    paddingRight: 10,
  },
  priceListPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
  },
  priceNotesContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  priceNotes: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
    marginLeft: 8,
    lineHeight: 18,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  fixedBidButton: {
    backgroundColor: Colors.primary || '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  fixedBidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HandymanDetailScreen;