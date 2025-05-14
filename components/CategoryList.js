import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { CATEGORIES } from '../constants/MockData';

const CategoryList = ({ selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryItem,
            !selectedCategory && styles.allCategorySelected,
          ]}
          onPress={() => onSelectCategory('')}
        >
          <View style={[
            styles.iconContainer,
            !selectedCategory && styles.selectedIconContainer
          ]}>
            <Ionicons
              name="grid"
              size={24}
              color={!selectedCategory ? Colors.white : Colors.primary}
            />
          </View>
          <Text
            style={[
              styles.categoryName,
              !selectedCategory && styles.selectedCategoryName,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.name && styles.selectedCategory,
            ]}
            onPress={() => onSelectCategory(category.name)}
          >
            <View style={[
              styles.iconContainer,
              selectedCategory === category.name && styles.selectedIconContainer
            ]}>
              <Ionicons
                name={category.icon}
                size={24}
                color={selectedCategory === category.name ? Colors.white : Colors.primary}
              />
            </View>
            <Text
              style={[
                styles.categoryName,
                selectedCategory === category.name && styles.selectedCategoryName,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  selectedCategory: {
    opacity: 1,
  },
  allCategorySelected: {
    opacity: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedIconContainer: {
    backgroundColor: Colors.primary,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.darkGray,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedCategoryName: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});

export default CategoryList;