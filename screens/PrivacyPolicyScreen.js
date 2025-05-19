import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import Colors from '../constants/Colors';

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: May 15, 2025</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <View style={styles.divider} />
          <Text style={styles.paragraph}>
            Welcome to TooKang's Privacy Policy. This policy describes how TooKang collects, uses, and shares your personal information when you use our mobile application and services.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <View style={styles.divider} />
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, such as when you create an account, complete your profile, post projects, or communicate with other users. This may include your name, email address, phone number, location, profile picture, and payment information.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <View style={styles.divider} />
          <Text style={styles.paragraph}>
            We use the information we collect to provide, maintain, and improve our services, to process transactions, to communicate with you about your account and our services, and to personalize your experience.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information Sharing</Text>
          <View style={styles.divider} />
          <Text style={styles.paragraph}>
            We may share your information with service providers who perform services on our behalf, with other users as needed to fulfill your requests, and as required by law or to protect our rights.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Choices</Text>
          <View style={styles.divider} />
          <Text style={styles.paragraph}>
            You can update your account information and notification preferences through your account settings. You may also request deletion of your account by contacting our support team.
          </Text>
        </View>
        
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactInfo}>
            TooKang Inc.{'\n'}
            123 Main Street{'\n'}
            Kuala Lumpur, Malaysia{'\n\n'}
            privacy@tookang.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  contactSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  contactInfo: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666666',
  }
});

export default PrivacyPolicyScreen;