import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Updated categories - only 5 as requested
const CATEGORIES = [
  { id: '1', name: 'Plumber', icon: 'water-outline' },
  { id: '2', name: 'Electrician', icon: 'flash-outline' },
  { id: '3', name: 'Painter', icon: 'color-palette-outline' },
  { id: '4', name: 'Cleaner', icon: 'sparkles-outline' },
  { id: '5', name: 'Others', icon: 'apps-outline' }
];

const HANDYMEN = [
  {
    id: '1',
    name: 'John Smith',
    profession: 'Plumber',
    rating: 4.8,
    hourlyRate: 45,
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Michael Johnson',
    profession: 'Electrician',
    rating: 4.7,
    hourlyRate: 50,
    profilePicture: 'https://randomuser.me/api/portraits/men/36.jpg',
  },
  {
    id: '3',
    name: 'Sarah Williams',
    profession: 'Painter',
    rating: 4.9,
    hourlyRate: 40,
    profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '4',
    name: 'Robert Brown',
    profession: 'Carpenter',
    rating: 4.6,
    hourlyRate: 55,
    profilePicture: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  {
    id: '5',
    name: 'Emily Davis',
    profession: 'Cleaner',
    rating: 4.8,
    hourlyRate: 35,
    profilePicture: 'https://randomuser.me/api/portraits/women/28.jpg',
  }
];

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [handymen, setHandymen] = useState(HANDYMEN);
  
  // Filter handymen when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        if (category.name === 'Others') {
          // For 'Others' category, show all handymen not matching other specific categories
          const specificProfessions = ['Plumber', 'Electrician', 'Painter', 'Cleaner'];
          const filtered = HANDYMEN.filter(
            handyman => !specificProfessions.includes(handyman.profession)
          );
          setHandymen(filtered);
        } else {
          const filtered = HANDYMEN.filter(
            handyman => handyman.profession.toLowerCase() === category.name.toLowerCase()
          );
          setHandymen(filtered);
        }
      }
    } else {
      setHandymen(HANDYMEN);
    }
  }, [selectedCategory]);

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleHandymanPress = (handyman) => {
    navigation.navigate('HandymanDetail', { handyman });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategoryButton
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={selectedCategory === item.id ? '#FFFFFF' : '#333333'}
      />
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.id && styles.selectedCategoryName
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderHandymanItem = ({ item }) => (
    <TouchableOpacity
      style={styles.handymanCard}
      onPress={() => handleHandymanPress(item)}
    >
      <Image
        source={{ uri: item.profilePicture }}
        style={styles.handymanImage}
      />
      <View style={styles.handymanInfo}>
        <Text style={styles.handymanName}>{item.name}</Text>
        <Text style={styles.handymanProfession}>{item.profession}</Text>
        <View style={styles.handymanBottom}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.priceText}>RM {item.hourlyRate}/hr</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Categories */}
      <View style={styles.categorySection}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>
      
      {/* Handymen List */}
      <View style={styles.handymenSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory 
            ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Services` 
            : 'All Services'}
        </Text>
        
        {handymen.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No handymen found</Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={styles.resetButtonText}>Show All</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={handymen}
            renderItem={renderHandymanItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categorySection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginTop: 10,
  },
  categoryList: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryName: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333333',
  },
  selectedCategoryName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  handymenSection: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  handymanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  handymanImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  handymanInfo: {
    flex: 1,
    marginLeft: 12,
  },
  handymanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  handymanProfession: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  handymanBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  chevron: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 15,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen;