import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const AboutScreen = () => {
  // Open website
  const openWebsite = () => {
    Linking.openURL('https://www.tookang.com');
  };
  
  // Contact team
  const contactTeam = (method) => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:info@tookang.com');
        break;
      case 'phone':
        Linking.openURL('tel:+60123456789');
        break;
      default:
        return;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* App Logo and Name */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>TooKang</Text>
          <Text style={styles.appTagline}>Your Home Service Solution</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
        
        {/* About Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.aboutText}>
            TooKang connects homeowners with skilled handymen across Malaysia. 
            We make home maintenance and improvement simple, affordable, and reliable.
          </Text>
        </View>
        
        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="search" size={22} color={Colors.primary} style={styles.featureIcon} />
            <Text style={styles.featureText}>Find verified handymen for any home service</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="cash" size={22} color={Colors.primary} style={styles.featureIcon} />
            <Text style={styles.featureText}>Transparent pricing with no hidden fees</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="star" size={22} color={Colors.primary} style={styles.featureIcon} />
            <Text style={styles.featureText}>Read reviews from real customers</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.primary} style={styles.featureIcon} />
            <Text style={styles.featureText}>Secure payments held in escrow until job completion</Text>
          </View>
        </View>
        
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => contactTeam('email')}
          >
            <Ionicons name="mail" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>info@tookang.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => contactTeam('phone')}
          >
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>+60 12-345-6789</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.websiteButton}
            onPress={openWebsite}
          >
            <Text style={styles.websiteButtonText}>Visit Our Website</Text>
          </TouchableOpacity>
        </View>
        
        {/* Privacy Policy */}
        <View style={styles.privacySection}>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.tookang.com/privacy')}>
            <Text style={styles.privacyText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Linking.openURL('https://www.tookang.com/terms')}>
            <Text style={styles.privacyText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 TooKang Sdn Bhd. All rights reserved.
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#444444',
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 16,
    color: '#444444',
    marginLeft: 12,
  },
  websiteButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  websiteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  privacySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  privacyText: {
    color: Colors.primary,
    fontSize: 15,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  }
});

export default AboutScreen;