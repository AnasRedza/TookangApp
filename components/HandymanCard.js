import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const HandymanCard = ({ handyman, onPress }) => {
  // Render stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
      } else if (i === fullStars && halfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#FFD700" />);
      }
    }
    
    return (
      <View style={styles.starsContainer}>
        {stars}
        <Text style={styles.ratingText}>({handyman.totalReviews})</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: handyman.profilePicture || 'https://via.placeholder.com/150' }}
          style={styles.image}
        />
        
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{handyman.name}</Text>
            {handyman.verified && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            )}
          </View>
          
          <Text style={styles.profession}>{handyman.profession}</Text>
          
          {renderStars(handyman.rating)}
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color={Colors.darkGray} />
              <Text style={styles.detailText}>{handyman.location}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="briefcase-outline" size={14} color={Colors.darkGray} />
              <Text style={styles.detailText}>{handyman.yearsExperience} yrs</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Hourly Rate</Text>
          <Text style={styles.price}>${handyman.hourlyRate}</Text>
          <View style={styles.bookButton}>
            <Text style={styles.bookButtonText}>View</Text>
          </View>
        </View>
      </View>
      
      {/* Skills chips */}
      <View style={styles.skillsContainer}>
        {handyman.skills && handyman.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {handyman.skills && handyman.skills.length > 3 && (
          <View style={styles.skillChip}>
            <Text style={styles.skillText}>+{handyman.skills.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: 4,
  },
  profession: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.darkGray,
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 12,
    color: Colors.darkGray,
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.darkGray,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 2,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 4,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  skillsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    marginTop: -4,
  },
  skillChip: {
    backgroundColor: '#EBF5FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  skillText: {
    fontSize: 11,
    color: Colors.primary,
  },
});

export default HandymanCard;