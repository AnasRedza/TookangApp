// ContactSupportScreen.js (continued)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet, // Make sure this is included
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Component code...

const ContactSupportScreen = ({ navigation }) => {
  const [issueType, setIssueType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIssueDropdown, setShowIssueDropdown] = useState(false);

  const handleSelectIssueType = (type) => {
    setIssueType(type);
    setShowIssueDropdown(false);
  };

  const handleSubmit = () => {
    // Validate inputs
    if (!issueType) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }
    
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Support Ticket Created',
        'We\'ve received your message and will respond to you within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Our support team is here to help. Please fill out the form below and we'll get back to you as soon as possible.
        </Text>
        
        {/* Issue Type Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Issue Type *</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowIssueDropdown(!showIssueDropdown)}
          >
            <Text style={issueType ? styles.dropdownText : styles.dropdownPlaceholder}>
              {issueType || 'Select an issue type'}
            </Text>
            <Ionicons 
              name={showIssueDropdown ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#777" 
            />
          </TouchableOpacity>
          
          {/* Dropdown Options */}
          {showIssueDropdown && (
            <View style={styles.dropdownOptions}>
              {ISSUE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectIssueType(type)}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Subject Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of your issue"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Message Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Please provide details about your issue"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            numberOfLines={8}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </Text>
        </TouchableOpacity>
        
        {/* Alternative Contact Methods */}
        <View style={styles.alternativeContact}>
          <Text style={styles.alternativeTitle}>Other ways to reach us:</Text>
          
          <View style={styles.contactMethod}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>support@tookang.com</Text>
          </View>
          
          <View style={styles.contactMethod}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>+60 3-1234-5678</Text>
          </View>
          
          <View style={styles.contactMethod}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>Mon-Fri, 9:00 AM - 6:00 PM MYT</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    minHeight: 150,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeContact: {
    marginTop: 32,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 16,
    borderRadius: 8,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 12,
  }
});

export default ContactSupportScreen;