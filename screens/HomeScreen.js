import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Mock data for demonstration
const CATEGORIES = [
  { id: '1', name: 'Plumbing', icon: 'water-outline' },
  { id: '2', name: 'Electrical', icon: 'flash-outline' },
  { id: '3', name: 'Carpentry', icon: 'hammer-outline' },
  { id: '4', name: 'Painting', icon: 'color-palette-outline' },
  { id: '5', name: 'Cleaning', icon: 'sparkles-outline' },
  { id: '6', name: 'Gardening', icon: 'leaf-outline' }
];

const HANDYMEN = [
  {
    id: '1',
    name: 'John Smith',
    profession: 'Plumber',
    rating: 4.8,
    totalReviews: 124,
    hourlyRate: 45,
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'San Francisco, CA',
    skills: ['Leak Repair', 'Pipe Installation', 'Toilet Repair'],
    yearsExperience: 8
  },
  {
    id: '2',
    name: 'Michael Johnson',
    profession: 'Electrician',
    rating: 4.7,
    totalReviews: 98,
    hourlyRate: 50,
    profilePicture: 'https://randomuser.me/api/portraits/men/36.jpg',
    location: 'San Francisco, CA',
    skills: ['Wiring', 'Lighting', 'Electrical Repairs'],
    yearsExperience: 10
  },
  {
    id: '3',
    name: 'Sarah Williams',
    profession: 'Painter',
    rating: 4.9,
    totalReviews: 156,
    hourlyRate: 40,
    profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: 'Oakland, CA',
    skills: ['Interior Painting', 'Exterior Painting', 'Wall Repair'],
    yearsExperience: 6
  },
  {
    id: '4',
    name: 'Robert Brown',
    profession: 'Carpenter',
    rating: 4.6,
    totalReviews: 87,
    hourlyRate: 55,
    profilePicture: 'https://randomuser.me/api/portraits/men/46.jpg',
    location: 'San Jose, CA',
    skills: ['Furniture Assembly', 'Woodworking', 'Cabinet Installation'],
    yearsExperience: 12
  },
  {
    id: '5',
    name: 'Emily Davis',
    profession: 'Cleaner',
    rating: 4.8,
    totalReviews: 112,
    hourlyRate: 35,
    profilePicture: 'https://randomuser.me/api/portraits/women/28.jpg',
    location: 'San Francisco, CA',
    skills: ['Deep Cleaning', 'Move-in/out Cleaning', 'Regular Maintenance'],
    yearsExperience: 5
  }
];

const HomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredHandymen, setFilteredHandymen] = useState(HANDYMEN);

  // Filter handymen when search or category changes
  useEffect(() => {
    filterHandymen();
  }, [searchQuery, selectedCategory]);

  const filterHandymen = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = [...HANDYMEN];
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          handyman => 
            handyman.name.toLowerCase().includes(query) ||
            handyman.profession.toLowerCase().includes(query) ||
            handyman.skills.some(skill => skill.toLowerCase().includes(query))
        );
      }
      
      // Filter by category
      if (selectedCategory) {
        const category = CATEGORIES.find(c => c.id === selectedCategory);
        if (category) {
          filtered = filtered.filter(
            handyman => handyman.profession.toLowerCase() === category.name.toLowerCase()
          );
        }
      }
      
      setFilteredHandymen(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleHandymanPress = (handyman) => {
    navigation.navigate('HandymanDetail', { handyman });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons
          name={item.icon}
          size={24}
          color={selectedCategory === item.id ? Colors.white : Colors.primary}
        />
      </View>
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
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating} ({item.totalReviews})</Text>
        </View>
      </View>
      <View style={styles.handymanPrice}>
        <Text style={styles.priceValue}>${item.hourlyRate}</Text>
        <Text style={styles.priceLabel}>/hour</Text>
        <View style={styles.bookButton}>
          <Text style={styles.bookButtonText}>View</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TooKang</Text>
        <Text style={styles.headerSubtitle}>Find a handyman quickly</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for handyman or service..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category List */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
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
      <View style={styles.handymenContainer}>
        <Text style={styles.sectionTitle}>Available Handymen</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : filteredHandymen.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={40} color="#999" />
            <Text style={styles.noResultsText}>No handymen found</Text>
            <Text style={styles.noResultsSubtext}>Try adjusting your search</Text>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredHandymen}
            renderItem={renderHandymanItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Create Project Button */}
      <TouchableOpacity 
        style={styles.createProjectButton}
        onPress={() => navigation.navigate('PostJob')}
      >
        <Ionicons name="add-outline" size={24} color="#FFF" />
        <Text style={styles.createProjectText}>Post a New Job</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -15,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  categoryList: {
    paddingRight: 20,
  },
  categoryItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F7FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8F1FA',
  },
  selectedCategoryItem: {
    opacity: 1,
  },
  selectedCategoryName: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  handymenContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  handymanCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  handymanImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  handymanInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  handymanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  handymanProfession: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  handymanPrice: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  noResultsSubtext: {
    color: '#999',
    marginTop: 5,
  },
  clearButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  createProjectButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  createProjectText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default HomeScreen;