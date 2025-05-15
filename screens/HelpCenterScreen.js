// HelpCenterScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I create a new project?',
    answer: 'To create a new project, go to the Home tab and tap the "+" button in the bottom right corner. Fill in the project details and submit to post your project.',
  },
  {
    id: '2',
    question: 'How do payments work?',
    answer: 'TooKang offers secure payment processing through our app. You can pay handymen via credit card, online banking, or e-wallets. Payments are held in escrow until you confirm the job is complete.',
  },
  {
    id: '3',
    question: 'What if I\'m not satisfied with the work?',
    answer: 'If you\'re not satisfied with the work performed, you can raise a dispute through the app. Our support team will help mediate and resolve the issue between you and the handyman.',
  },
  {
    id: '4',
    question: 'How do I become a handyman on TooKang?',
    answer: 'To register as a handyman, select "Handyman" during the signup process. You\'ll need to provide additional information including your skills, experience, and service areas.',
  },
  {
    id: '5',
    question: 'Can I cancel a project?',
    answer: 'Yes, you can cancel a project before a handyman has been assigned. If a handyman has already accepted the project, you may still cancel but might incur a cancellation fee depending on the circumstances.',
  },
];

const HelpCenterScreen = () => {
  const [expandedId, setExpandedId] = React.useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderFaqItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <TouchableOpacity 
        style={styles.faqItem} 
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.questionRow}>
          <Text style={styles.question}>{item.question}</Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#777" 
          />
        </View>
        
        {isExpanded && (
          <Text style={styles.answer}>{item.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <Text style={styles.headerSubtitle}>
          Find answers to common questions about using TooKang
        </Text>
      </View>
      
      <FlatList
        data={FAQ_ITEMS}
        renderItem={renderFaqItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.faqList}
      />
      
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need more help?</Text>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="chatbubbles-outline" size={20} color={Colors.white} />
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  faqList: {
    paddingHorizontal: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  answer: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  contactSection: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  contactButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  }
});

export default HelpCenterScreen;