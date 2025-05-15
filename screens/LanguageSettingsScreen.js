// LanguageSettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const LANGUAGES = [
  { id: 'en', name: 'English', selected: true },
  { id: 'ms', name: 'Bahasa Malaysia', selected: false },
  { id: 'zh', name: 'Chinese (简体中文)', selected: false },
  { id: 'ta', name: 'Tamil (தமிழ்)', selected: false },
];

const LanguageSettingsScreen = () => {
  const [languages, setLanguages] = React.useState(LANGUAGES);

  const handleSelectLanguage = (id) => {
    setLanguages(
      languages.map(lang => ({
        ...lang,
        selected: lang.id === id
      }))
    );
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.languageItem} 
      onPress={() => handleSelectLanguage(item.id)}
    >
      <Text style={styles.languageName}>{item.name}</Text>
      {item.selected && (
        <Ionicons name="checkmark" size={22} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Select your preferred language. This will change the language throughout the app.
      </Text>
      <FlatList
        data={languages}
        renderItem={renderLanguageItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.languageList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  description: {
    fontSize: 14,
    color: '#666',
    margin: 16,
    marginBottom: 8,
  },
  languageList: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    margin: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 16,
  }
});

export default LanguageSettingsScreen;