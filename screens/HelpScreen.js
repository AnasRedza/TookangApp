import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const HelpScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [faqs, setFaqs] = useState([]);
  
  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFaqs();
  }, []);
  
  // Fetch FAQs (mock data)
  const fetchFaqs = () => {
    // Simulate API call
    setTimeout(() => {
      // Mock FAQ data (simplified to most common questions)
      const mockFaqs = [
        {
          id: '1',
          question: 'How do I post a new project?',
          answer: 'To post a new project, go to the Home tab and click on "Post a Project". Fill in all the required details including project description, budget, and preferred schedule.'
        },
        {
          id: '2',
          question: 'How does payment work?',
          answer: 'When you approve a handyman\'s offer, you\'ll be asked to make a payment. The payment is held in escrow until the project is completed to your satisfaction. Once you confirm completion, the funds are released to the handyman.'
        },
        {
          id: '3',
          question: 'What if I\'m not satisfied with the work?',
          answer: 'If you\'re not satisfied, first discuss your concerns with the handyman. If you still can\'t reach a resolution, you can open a dispute through our resolution center.'
        },
        {
          id: '4',
          question: 'Can I negotiate the price with handymen?',
          answer: 'Yes, when posting a project, you can mark your budget as "negotiable". Handymen can then send you offers with their proposed price. You can discuss and finalize before accepting.'
        },
        {
          id: '5',
          question: 'How do I reset my password?',
          answer: 'Go to the login screen and click on "Forgot Password". Enter your email address, and we\'ll send you a password reset link.'
        }
      ];
      
      setFaqs(mockFaqs);
      setIsLoading(false);
    }, 1000);
  };
  
  // Toggle FAQ section expansion
  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };
  
  // Handle support option selection
  const handleContactSupport = (method) => {
    // Contact support implementation would go here
    alert(`Support via ${method} would be initiated here`);
  };
  
  // Render FAQ item
  const renderFaqItem = (item) => {
    const isExpanded = expandedSection === item.id;
    
    return (
      <TouchableOpacity
        key={item.id}
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
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Minimalist Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Support</Text>
        </View>
        
        {/* FAQs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <View>
              {faqs.map(faq => renderFaqItem(faq))}
            </View>
          )}
        </View>
        
        {/* Contact Support Section - Minimalist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <View style={styles.supportOptions}>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => handleContactSupport('email')}
            >
              <Ionicons name="mail-outline" size={22} color="#333" />
              <Text style={styles.supportButtonText}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => handleContactSupport('phone')}
            >
              <Ionicons name="call-outline" size={22} color="#333" />
              <Text style={styles.supportButtonText}>Phone</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => handleContactSupport('chat')}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#333" />
              <Text style={styles.supportButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Minimalist Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Terms</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Privacy</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Contact</Text>
          </TouchableOpacity>
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
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  section: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  faqAnswerContainer: {
    marginTop: 10,
    paddingTop: 10,
    paddingLeft: 2,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  supportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportButton: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 4,
    padding: 16,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
  },
  supportButtonText: {
    color: '#333333',
    fontWeight: '500',
    marginTop: 8,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerLink: {
    paddingHorizontal: 10,
  },
  footerLinkText: {
    fontSize: 13,
    color: '#666666',
  },
  footerDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#EEEEEE',
  }
});

export default HelpScreen;