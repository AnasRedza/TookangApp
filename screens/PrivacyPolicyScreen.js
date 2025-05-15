import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, // Make sure this is included
  ScrollView 
} from 'react-native';

// Component code...

const PrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: May 15, 2025</Text>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to TooKang's Privacy Policy. This policy describes how TooKang collects, uses, and shares your personal information when you use our mobile application and services.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us, such as when you create an account, complete your profile, post projects, or communicate with other users. This may include your name, email address, phone number, location, profile picture, and payment information.
        </Text>
        
        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to provide, maintain, and improve our services, to process transactions, to communicate with you about your account and our services, and to personalize your experience.
        </Text>
        
        {/* More sections would go here in a real app */}
        
        <Text style={styles.contactInfo}>
          If you have any questions about this Privacy Policy, please contact us at:
          {'\n\n'}
          TooKang Inc.
          {'\n'}
          123 Main Street
          {'\n'}
          Kuala Lumpur, Malaysia
          {'\n'}
          privacy@tookang.com
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 16,
  },
  contactInfo: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginTop: 32,
    marginBottom: 40,
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
  }
});

export default PrivacyPolicyScreen;