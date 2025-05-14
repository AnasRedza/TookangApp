import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.primary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search for handymen by name or service..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={Colors.mediumGray}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={Colors.darkGray} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 25,
    flex: 1,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
});

export default SearchBar;