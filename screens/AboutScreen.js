import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Dimensions,
  Platform,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const AboutScreen = () => {
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [buildNumber, setBuildNumber] = useState('100');
  
  // Get app version on mount (mock implementation)
  useEffect(() => {
    // In a real app, you'd use a library like react-native-device-info
    // to get the actual version and build number
    if (Platform.OS === 'ios') {
      setAppVersion('1.0.0');
      setBuildNumber('100');
    } else {
      setAppVersion('1.0.0');
      setBuildNumber('100');
    }
  }, []);
  
  // Share app
  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: 'Check out TooKang, the app that connects you with skilled handymen for all your home improvement needs! Download it now: https://tookang.com/download',
        url: 'https://tookang.com/download',
        title: 'TooKang - Your Home Services App'
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  // Open website
  const openWebsite = () => {
    Linking.openURL('https://www.tookang.com');
  };
  
  // Open social media
  const openSocialMedia = (platform) => {
    let url;
    
    switch (platform) {
      case 'facebook':
        url = 'https://www.facebook.com/tookangapp';
        break;
      case 'twitter':
        url = 'https://www.twitter.com/tookangapp';
        break;
      case 'instagram':
        url = 'https://www.instagram.com/tookangapp';
        break;
      default:
        return;
    }
    
    Linking.openURL(url);
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
  
  // Render feature item
  const renderFeature = (icon, title, description) => {
    return (
      <View style={styles.featureItem}>
        <View style={styles.featureIconContainer}>
          <Ionicons name={icon} size={28} color={Colors.primary} />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
      </View>
    );
  };
  
  // Render team member
  const renderTeamMember = (name, role, image) => {
    return (
      <View style={styles.teamMemberCard}>
        <Image source={image} style={styles.teamMemberImage} />
        <Text style={styles.teamMemberName}>{name}</Text>
        <Text style={styles.teamMemberRole}>{role}</Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* App Logo and Name */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')} // Replace with your app logo
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>TooKang</Text>
          <Text style={styles.appTagline}>Your Home Service Solution</Text>
          <Text style={styles.versionText}>
            Version {appVersion} (Build {buildNumber})
          </Text>
        </View>
        
        {/* About Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.aboutText}>
            TooKang is Malaysia's premier platform connecting homeowners with skilled handymen. 
            Our mission is to make home maintenance and improvement simple, affordable, and reliable 
            for everyone.
          </Text>
          <Text style={styles.aboutText}>
            Founded in 2023, we've helped thousands of customers find the right professionals 
            for their projects, while providing handymen with steady work opportunities and fair compensation.
          </Text>
        </View>
        
        {/* Our Story */}
        <View style={styles.storySection}>
          <View style={styles.storyImageContainer}>
            <Image
              source={require('../assets/images/story-image.jpg')} // Replace with your story image
              style={styles.storyImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.storyContent}>
            <Text style={styles.storySectionTitle}>Our Story</Text>
            <Text style={styles.storyText}>
              TooKang was born from a simple frustration: finding reliable handymen in Malaysia was 
              unnecessarily difficult. Our founder, Sarah Tan, experienced this firsthand when she 
              moved into a new home in Kuala Lumpur and struggled to find qualified professionals for 
              various repairs.
            </Text>
            <Text style={styles.storyText}>
              What started as a simple local directory quickly evolved into a comprehensive platform 
              with verified professionals, secure payments, and a dedication to quality service that 
              has made us the leading home service platform in Malaysia.
            </Text>
          </View>
        </View>
        
        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          {renderFeature(
            'search',
            'Find Skilled Handymen',
            'Browse profiles of verified handymen specializing in various home services.'
          )}
          
          {renderFeature(
            'cash',
            'Transparent Pricing',
            'Clear pricing with no hidden fees. Negotiate directly with service providers.'
          )}
          
          {renderFeature(
            'shield-checkmark',
            'Secure Payments',
            'Payments held in escrow until you approve the completed work.'
          )}
          
          {renderFeature(
            'star',
            'Verified Reviews',
            'Read honest reviews from real customers before making your choice.'
          )}
          
          {renderFeature(
            'chatbubbles',
            'Direct Communication',
            'Chat directly with handymen to discuss your project details.'
          )}
        </View>
        
        {/* Our Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leadership Team</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamContainer}
          >
            {renderTeamMember(
              'Sarah Tan',
              'Founder & CEO',
              require('../assets/images/team-sarah.jpg') // Replace with actual image
            )}
            
            {renderTeamMember(
              'Raj Kumar',
              'CTO',
              require('../assets/images/team-raj.jpg') // Replace with actual image
            )}
            
            {renderTeamMember(
              'David Wong',
              'COO',
              require('../assets/images/team-david.jpg') // Replace with actual image
            )}
            
            {renderTeamMember(
              'Lisa Chen',
              'Head of Marketing',
              require('../assets/images/team-lisa.jpg') // Replace with actual image
            )}
          </ScrollView>
        </View>
        
        {/* Connect with Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect with Us</Text>
          
          <View style={styles.socialMediaContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openSocialMedia('facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color="#3b5998" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openSocialMedia('twitter')}
            >
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openSocialMedia('instagram')}
            >
              <Ionicons name="logo-instagram" size={24} color="#C13584" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.websiteButton}
            onPress={openWebsite}
          >
            <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
            <Text style={styles.websiteButtonText}>Visit Our Website</Text>
          </TouchableOpacity>
        </View>
        
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>
              Level 28, KL Tower, 50088 Kuala Lumpur, Malaysia
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => contactTeam('email')}
          >
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>info@tookang.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => contactTeam('phone')}
          >
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>+60 12-345-6789</Text>
          </TouchableOpacity>
        </View>
        
        {/* Share App */}
        <View style={styles.shareSection}>
          <Text style={styles.shareText}>
            Love TooKang? Share with your friends!
          </Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareApp}
          >
            <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share App</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2023-2025 TooKang Sdn Bhd. All rights reserved.
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.tookang.com/terms')}>
              <Text style={styles.legalLinkText}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.tookang.com/privacy')}>
              <Text style={styles.legalLinkText}>Privacy</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
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
    fontSize: 12,
    color: '#999999',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 12,
  },
  storySection: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  storyImageContainer: {
    height: 200,
    width: '100%',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyContent: {
    padding: 24,
  },
  storySectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  storyText: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  teamContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  teamMemberCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 120,
  },
  teamMemberImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: '#F0F0F0', // Placeholder color
  },
  teamMemberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
    textAlign: 'center',
  },
  teamMemberRole: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  websiteButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  websiteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    flex: 1,
  },
  shareSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F8F8',
  },
  shareText: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLinkText: {
    fontSize: 14,
    color: Colors.primary,
  },
  legalDot: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 8,
  }
});

export default AboutScreen;