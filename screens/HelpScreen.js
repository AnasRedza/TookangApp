import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Linking,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const HelpScreen = ({ navigation }) => {
  const { userType } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [allFaqs, setAllFaqs] = useState([]);
  
  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFaqs();
  }, []);
  
  // Filter FAQs when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFaqs(allFaqs);
    } else {
      const filtered = allFaqs.filter(
        faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFaqs(filtered);
    }
  }, [searchQuery, allFaqs]);
  
  // Fetch FAQs (mock data)
  const fetchFaqs = () => {
    // Simulate API call
    setTimeout(() => {
      // Mock FAQ data
      const mockFaqs = [
        {
          id: '1',
          question: 'How do I post a new project?',
          answer: 'To post a new project, go to the Home tab and click on "Post a Project". Fill in all the required details including project description, budget, and preferred schedule. You can also add photos to help handymen understand your requirements better.',
          category: 'projects'
        },
        {
          id: '2',
          question: 'How does payment work?',
          answer: 'When you approve a handyman\'s offer, you\'ll be asked to make a payment. The payment is held in escrow until the project is completed to your satisfaction. Once you confirm completion, the funds are released to the handyman. This ensures both parties are protected throughout the transaction.',
          category: 'payments'
        },
        {
          id: '3',
          question: 'What if I\'m not satisfied with the work?',
          answer: 'If you\'re not satisfied with the completed work, you should first discuss your concerns with the handyman. Most issues can be resolved through communication. If you still can\'t reach a resolution, you can open a dispute through our resolution center. Our team will review the case and may request photos or additional information before making a decision.',
          category: 'disputes'
        },
        {
          id: '4',
          question: 'Can I negotiate the price with handymen?',
          answer: 'Yes, TooKang is designed to allow negotiation between customers and handymen. When posting a project, you can mark your budget as "negotiable". Handymen can then send you offers with their proposed price. You can discuss and finalize the terms before accepting an offer.',
          category: 'projects'
        },
        {
          id: '5',
          question: 'How do I become a handyman on TooKang?',
          answer: 'To register as a handyman, click on "Switch to Handyman" in the Profile tab. You\'ll need to provide information about your skills, experience, pricing, and service area. We\'ll also require verification documents like ID and relevant certifications. After review, your profile will be activated and visible to customers.',
          category: 'account'
        },
        {
          id: '6',
          question: 'What happens if a handyman doesn\'t show up?',
          answer: 'If a handyman doesn\'t arrive at the scheduled time, you can first try contacting them through the app. If you can\'t reach them or they fail to reschedule, you can cancel the project through the app and request a refund of your escrow payment. You can also leave feedback about your experience to help other customers.',
          category: 'projects'
        },
        {
          id: '7',
          question: 'How do I reset my password?',
          answer: 'To reset your password, go to the login screen and click on "Forgot Password". Enter the email address associated with your account, and we\'ll send you a password reset link. If you\'re already logged in, you can change your password in the Profile tab under Settings.',
          category: 'account'
        },
        {
          id: '8',
          question: 'Is there a fee to use TooKang?',
          answer: 'TooKang is free for customers to post projects and hire handymen. For handymen, we charge a service fee of 10% on completed projects. This fee helps us maintain the platform, provide customer support, and ensure secure payment processing.',
          category: 'payments'
        },
        {
          id: '9',
          question: 'How do I contact customer support?',
          answer: 'You can contact our customer support team through the "Contact Us" section at the bottom of this Help screen. We offer support via email, in-app chat, and phone during business hours. For urgent matters, please use the phone support option.',
          category: 'support'
        },
        {
          id: '10',
          question: 'Can I cancel a project after it\'s been accepted?',
          answer: 'Yes, you can cancel a project after it\'s been accepted, but there may be cancellation fees depending on how close to the scheduled start time you cancel. To cancel, go to the project details and click "Cancel Project". Please note that frequent cancellations may affect your account standing.',
          category: 'projects'
        }
      ];
      
      setAllFaqs(mockFaqs);
      setFilteredFaqs(mockFaqs);
      setIsLoading(false);
    }, 1000);
  };
  
  // Toggle FAQ section expansion
  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };
  
  // Handle contact support
  const handleContactSupport = (method) => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@tookang.com');
        break;
      case 'phone':
        Linking.openURL('tel:+60123456789');
        break;
      case 'chat':
        Alert.alert(
          'Start Chat',
          'Would you like to start a chat with our support team?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Start Chat',
              onPress: () => {
                // Navigate to support chat or open chat interface
                Alert.alert('Support Chat', 'Support chat would open here');
              }
            }
          ]
        );
        break;
      default:
        break;
    }
  };
  
  // Navigate to help topic
  const navigateToHelpTopic = (topic) => {
    navigation.navigate('HelpTopic', { topic });
  };
  
  // Render FAQ item
  const renderFaqItem = ({ item }) => {
    const isExpanded = expandedSection === item.id;
    
    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => toggleSection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666666" 
          />
        </View>
        
        {isExpanded && (
          <View style={styles.faqAnswerContainer}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
            <TouchableOpacity 
              style={styles.helpfulButton}
              onPress={() => Alert.alert('Feedback', 'Thank you for your feedback!')}
            >
              <Ionicons name="thumbs-up-outline" size={16} color={Colors.primary} />
              <Text style={styles.helpfulButtonText}>Helpful</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Render help topics based on user type
  const renderHelpTopics = () => {
    const customerTopics = [
      { id: 'create-project', title: 'Creating a Project', icon: 'create-outline' },
      { id: 'hiring-handyman', title: 'Hiring a Handyman', icon: 'person-outline' },
      { id: 'payments', title: 'Payments & Billing', icon: 'card-outline' },
      { id: 'project-management', title: 'Managing Your Project', icon: 'list-outline' },
      { id: 'disputes', title: 'Disputes & Resolutions', icon: 'shield-outline' },
      { id: 'account-settings', title: 'Account Settings', icon: 'settings-outline' }
    ];
    
    const handymanTopics = [
      { id: 'find-jobs', title: 'Finding Jobs', icon: 'search-outline' },
      { id: 'bidding', title: 'Bidding & Offers', icon: 'pricetag-outline' },
      { id: 'getting-paid', title: 'Getting Paid', icon: 'cash-outline' },
      { id: 'job-management', title: 'Managing Your Jobs', icon: 'list-outline' },
      { id: 'profile-optimization', title: 'Optimizing Your Profile', icon: 'star-outline' },
      { id: 'account-settings', title: 'Account Settings', icon: 'settings-outline' }
    ];
    
    const topics = userType === 'customer' ? customerTopics : handymanTopics;
    
    return (
      <View style={styles.topicsGrid}>
        {topics.map((topic) => (
          <TouchableOpacity 
            key={topic.id}
            style={styles.topicCard}
            onPress={() => navigateToHelpTopic(topic)}
          >
            <View style={styles.topicIconContainer}>
              <Ionicons name={topic.icon} size={24} color={Colors.primary} />
            </View>
            <Text style={styles.topicTitle}>{topic.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with illustration */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>How can we help you?</Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <Image
            source={require('../assets/images/help-illustration.png')} // Replace with your illustration
            style={styles.headerIllustration}
            resizeMode="contain"
          />
        </View>
        
        {/* Help Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Help Topics</Text>
          {renderHelpTopics()}
        </View>
        
        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading FAQs...</Text>
            </View>
          ) : (
            <>
              {searchQuery && (
                <Text style={styles.searchResultsText}>
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                </Text>
              )}
              
              {filteredFaqs.length > 0 ? (
                <FlatList
                  data={filteredFaqs}
                  renderItem={renderFaqItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search" size={48} color="#CCCCCC" />
                  <Text style={styles.noResultsText}>No results found</Text>
                  <Text style={styles.noResultsSubtext}>
                    Try different keywords or browse the help topics above
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        
        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.supportOptionsContainer}>
            <TouchableOpacity 
              style={styles.supportOption}
              onPress={() => handleContactSupport('email')}
            >
              <View style={[styles.supportIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="mail" size={24} color="#2196F3" />
              </View>
              <Text style={styles.supportOptionTitle}>Email</Text>
              <Text style={styles.supportOptionDescription}>
                Get a response within 24 hours
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.supportOption}
              onPress={() => handleContactSupport('phone')}
            >
              <View style={[styles.supportIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="call" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.supportOptionTitle}>Phone</Text>
              <Text style={styles.supportOptionDescription}>
                Available 9AM-6PM, Mon-Fri
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.supportOption}
              onPress={() => handleContactSupport('chat')}
            >
              <View style={[styles.supportIconContainer, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="chatbubble-ellipses" size={24} color="#FFC107" />
              </View>
              <Text style={styles.supportOptionTitle}>Live Chat</Text>
              <Text style={styles.supportOptionDescription}>
                Chat with support agents
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <TouchableOpacity 
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://www.tookang.com/terms')}
          >
            <Ionicons name="document-text-outline" size={20} color="#666666" />
            <Text style={styles.resourceText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://www.tookang.com/privacy')}
          >
            <Ionicons name="shield-outline" size={20} color="#666666" />
            <Text style={styles.resourceText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://www.tookang.com/safety')}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#666666" />
            <Text style={styles.resourceText}>Safety Guidelines</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://www.tookang.com/community')}
          >
            <Ionicons name="people-outline" size={20} color="#666666" />
            <Text style={styles.resourceText}>Community Guidelines</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            TooKang Help Center • Version 1.0.0
          </Text>
          <Text style={styles.footerCopyright}>
            © 2025 TooKang. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  headerIllustration: {
    width: 200,
    height: 120,
    marginTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    width: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topicIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicTitle: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  faqAnswerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderRadius: 16,
    backgroundColor: Colors.primary + '10',
  },
  helpfulButtonText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  supportOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  supportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  supportOptionDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resourceText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#999999',
  },
});

export default HelpScreen;