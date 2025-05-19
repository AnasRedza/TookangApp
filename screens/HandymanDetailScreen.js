import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const HandymanDetailScreen = ({ route, navigation }) => {
  // Get handyman data from route params
  const { handyman } = route.params || {
    handyman: {
      id: '1',
      name: 'Default Handyman',
      profession: 'General',
      rating: 4.5,
      reviews: 0,
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      description: 'No description available.',
    }
  };

  // State for read more functionality
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Sample price list - with both services and items
  const priceList = [
    { id: '1', type: 'service', name: 'Basic Inspection', price: 50 },
    { id: '2', type: 'service', name: 'Simple Repair', price: 80 },
    { id: '3', type: 'service', name: 'Standard Installation', price: 120 },
    { id: '4', type: 'item', name: 'Pipe Fitting (each)', price: 15 },
    { id: '5', type: 'item', name: 'Water Tap', price: 35 },
    { id: '6', type: 'item', name: 'Sink Strainer', price: 20 },
    { id: '7', type: 'service', name: 'Emergency Call-out', price: 200 },
  ];
  
  // Sample reviews
  const reviews = [
    {
      id: '1',
      user: 'Sarah L.',
      rating: 5,
      date: '3 days ago',
      comment: 'Excellent service! Very professional and completed the job quickly.',
    },
    {
      id: '2',
      user: 'James T.',
      rating: 4,
      date: '1 week ago',
      comment: 'Good work overall, but took a little longer than expected.',
    },
  ];

  // Function to handle hiring the handyman
  const handleHireNow = () => {
    navigation.navigate('ProjectBid', { handyman });
  };

  // Function to message the handyman
  const handleMessage = () => {
    navigation.navigate('ChatTab', { 
      screen: 'Chat', 
      params: { recipient: handyman }
    });
  };

  // Render rating stars
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(i => (
          <Ionicons 
            key={i} 
            name={i <= fullStars ? "star" : (i === fullStars + 1 && halfStar ? "star-half" : "star-outline")} 
            size={16} 
            color="#FFD700" 
            style={{marginRight: 2}} 
          />
        ))}
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    );
  };

  // Group price list by type
  const services = priceList.filter(item => item.type === 'service');
  const items = priceList.filter(item => item.type === 'item');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: handyman.profilePicture || handyman.avatar }} 
            style={styles.profileImage} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{handyman.name}</Text>
            <Text style={styles.profession}>{handyman.profession}</Text>
            {renderRatingStars(handyman.rating)}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.hireButton} onPress={handleHireNow}>
            <Ionicons name="hammer-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Hire Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Price List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          {/* Services */}
          <View style={styles.priceGroup}>
            <Text style={styles.priceGroupTitle}>Services</Text>
            {services.map(item => (
              <View key={item.id} style={styles.priceItem}>
                <Text style={styles.serviceText}>{item.name}</Text>
                <Text style={styles.priceText}>RM {item.price}</Text>
              </View>
            ))}
          </View>
          
          {/* Items */}
          <View style={styles.priceGroup}>
            <Text style={styles.priceGroupTitle}>Items</Text>
            {items.map(item => (
              <View key={item.id} style={styles.priceItem}>
                <Text style={styles.serviceText}>{item.name}</Text>
                <Text style={styles.priceText}>RM {item.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text 
            style={styles.descriptionText} 
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {handyman.description || 'No description available.'}
          </Text>
          {handyman.description?.length > 100 && (
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.readMoreText}>
                {showFullDescription ? 'Read less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          
          {reviews.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.user}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Ionicons 
                    key={i} 
                    name={i <= review.rating ? "star" : "star-outline"} 
                    size={14} 
                    color="#FFD700" 
                    style={{marginRight: 2}} 
                  />
                ))}
              </View>
              
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))}
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Reviews</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  profileInfo: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profession: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginBottom: 10,
  },
  hireButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  messageButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  priceGroup: {
    marginBottom: 15,
  },
  priceGroupTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceText: {
    fontSize: 14,
    color: '#444444',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
  readMoreText: {
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 5,
  },
  reviewCard: {
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999999',
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 5,
  },
  viewAllText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default HandymanDetailScreen;