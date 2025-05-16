import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const HelpTopicScreen = ({ route, navigation }) => {
  const { topic } = route.params;
  const { userType } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [topicDetails, setTopicDetails] = useState(null);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  
  // Fetch topic details on component mount
  useEffect(() => {
    fetchTopicDetails();
  }, []);
  
  // Fetch topic details (mock implementation)
  const fetchTopicDetails = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock data based on the topic ID
      let details;
      let related;
      
      if (topic.id === 'create-project') {
        details = {
          title: 'Creating a Project',
          description: 'Learn how to post a new project and find the right handyman for your needs.',
          steps: [
            {
              id: '1',
              title: 'Navigate to Home Screen',
              description: 'Tap on the Home tab in the bottom navigation bar.',
              image: require('../assets/images/help/create-project-1.png') // Replace with actual image
            },
            {
              id: '2',
              title: 'Start a New Project',
              description: 'Tap on the "Post a Project" button at the top of the screen.',
              image: require('../assets/images/help/create-project-2.png') // Replace with actual image
            },
            {
              id: '3',
              title: 'Fill in Project Details',
              description: 'Enter all required information including title, description, category, and budget. Be as specific as possible to attract the right handymen.',
              image: require('../assets/images/help/create-project-3.png') // Replace with actual image
            },
            {
              id: '4',
              title: 'Set Schedule Preferences',
              description: 'Choose your preferred date and time for the project.',
              image: require('../assets/images/help/create-project-4.png') // Replace with actual image
            },
            {
              id: '5',
              title: 'Add Photos (Optional)',
              description: 'Upload photos to help handymen better understand your requirements.',
              image: require('../assets/images/help/create-project-5.png') // Replace with actual image
            },
            {
              id: '6',
              title: 'Review and Submit',
              description: 'Review all details and tap "Post Project" to publish your request.',
              image: require('../assets/images/help/create-project-6.png') // Replace with actual image
            }
          ],
          tips: [
            'Be detailed in your description to attract qualified handymen',
            'Add clear photos to help handymen understand the job better',
            'Set a realistic budget to get more responses',
            'Mark your budget as "negotiable" if you\'re flexible on pricing',
            'Provide accurate location information for better matches'
          ]
        };
        
        related = [
          {
            id: '1',
            question: 'How do I edit my project after posting?',
            route: 'HelpTopic',
            params: { topic: { id: 'edit-project', title: 'Editing a Project' } }
          },
          {
            id: '2',
            question: 'How long will my project be visible to handymen?',
            route: 'HelpTopic',
            params: { topic: { id: 'project-visibility', title: 'Project Visibility' } }
          },
          {
            id: '3',
            question: 'Can I cancel my project after posting it?',
            route: 'HelpTopic',
            params: { topic: { id: 'cancel-project', title: 'Cancelling a Project' } }
          }
        ];
      } else if (topic.id === 'hiring-handyman') {
        details = {
          title: 'Hiring a Handyman',
          description: 'Learn how to review offers, communicate with handymen, and select the right professional for your project.',
          steps: [
            {
              id: '1',
              title: 'Review Incoming Offers',
              description: 'Go to "My Projects" and select your posted project to view all offers.',
              image: require('../assets/images/help/hiring-1.png') // Replace with actual image
            },
            {
              id: '2',
              title: 'Compare Handyman Profiles',
              description: "Tap on a handyman's name to view their profile, ratings, reviews, and completed projects.",
              image: require('../assets/images/help/hiring-2.png') // Replace with actual image
            },
            {
              id: '3',
              title: 'Communicate with Handymen',
              description: 'Use the chat feature to discuss project details and ask questions before making a decision.',
              image: require('../assets/images/help/hiring-3.png') // Replace with actual image
            },
            {
              id: '4',
              title: 'Accept an Offer',
              description: "When you're ready, select the handyman's offer and tap \"Accept Offer\".",
              image: require('../assets/images/help/hiring-4.png') // Replace with actual image
            },
            {
              id: '5',
              title: 'Make Payment',
              description: 'Make the agreed payment which will be held in escrow until the project is completed.',
              image: require('../assets/images/help/hiring-5.png') // Replace with actual image
            }
          ],
          tips: [
            'Always check ratings and reviews before hiring',
            'Communicate clearly about your expectations',
            'Discuss all details before accepting an offer',
            'Ask for photos of previous similar work',
            'Confirm availability before hiring'
          ]
        };
        
        related = [
          {
            id: '1',
            question: 'How does the escrow payment work?',
            route: 'HelpTopic',
            params: { topic: { id: 'escrow-payment', title: 'Escrow Payments' } }
          },
          {
            id: '2',
            question: "What if I'm not satisfied with the work?",
            route: 'HelpTopic',
            params: { topic: { id: 'unsatisfied-work', title: 'Unsatisfied with Work' } }
          },
          {
            id: '3',
            question: 'How do I leave a review for a handyman?',
            route: 'HelpTopic',
            params: { topic: { id: 'leave-review', title: 'Leaving Reviews' } }
          }
        ];
      } else if (topic.id === 'payments') {
        details = {
          title: 'Payments & Billing',
          description: 'Learn how payments work, how to make payments, and how the escrow system protects both parties.',
          steps: [
            {
              id: '1',
              title: 'Understanding the Payment Process',
              description: 'When you accept an offer, you\'ll be asked to make a payment that will be held in escrow until the project is completed.',
              image: require('../assets/images/help/payments-1.png') // Replace with actual image
            },
            {
              id: '2',
              title: 'Making a Payment',
              description: 'Select your preferred payment method and complete the transaction. We accept credit/debit cards, online banking, and e-wallet options.',
              image: require('../assets/images/help/payments-2.png') // Replace with actual image
            },
            {
              id: '3',
              title: 'Payment Confirmation',
              description: 'You\'ll receive a payment confirmation via email and in the app once your payment is processed.',
              image: require('../assets/images/help/payments-3.png') // Replace with actual image
            },
            {
              id: '4',
              title: 'Escrow Protection',
              description: 'Your payment is held in escrow and only released to the handyman once you confirm the project is completed to your satisfaction.',
              image: require('../assets/images/help/payments-4.png') // Replace with actual image
            },
            {
              id: '5',
              title: 'Releasing Payment',
              description: 'Once the handyman completes the work, you can review and confirm completion to release the payment.',
              image: require('../assets/images/help/payments-5.png') // Replace with actual image
            }
          ],
          tips: [
            'Always pay through the TooKang platform for protection',
            'Never make direct payments to handymen outside the app',
            'Check your payment status in "Transaction History"',
            'Save your payment receipts for reference',
            'Contact support immediately if you have payment issues'
          ]
        };
        
        related = [
          {
            id: '1',
            question: 'What payment methods are accepted?',
            route: 'HelpTopic',
            params: { topic: { id: 'payment-methods', title: 'Payment Methods' } }
          },
          {
            id: '2',
            question: 'How do refunds work?',
            route: 'HelpTopic',
            params: { topic: { id: 'refunds', title: 'Refunds' } }
          },
          {
            id: '3',
            question: 'Is there a fee to use TooKang?',
            route: 'HelpTopic',
            params: { topic: { id: 'platform-fees', title: 'Platform Fees' } }
          }
        ];
      } else if (topic.id === 'find-jobs') {
        // Content for handyman specific topic
        details = {
          title: 'Finding Jobs',
          description: 'Learn how to discover and bid on projects that match your skills and preferences.',
          steps: [
            {
              id: '1',
              title: 'Browse Available Projects',
              description: 'Use the Home tab to see all available projects in your area.',
              image: require('../assets/images/help/find-jobs-1.png') // Replace with actual image
            },
            {
              id: '2',
              title: 'Filter Projects',
              description: 'Use filters to narrow down projects by category, location, and budget range.',
              image: require('../assets/images/help/find-jobs-2.png') // Replace with actual image
            },
            {
              id: '3',
              title: 'Review Project Details',
              description: 'Tap on a project to view all details including description, location, and customer requirements.',
              image: require('../assets/images/help/find-jobs-3.png') // Replace with actual image
            },
            {
              id: '4',
              title: 'Send a Bid',
              description: "If you're interested in a project, submit your bid with your proposed price and timeline.",
              image: require('../assets/images/help/find-jobs-4.png') // Replace with actual image
            },
            {
              id: '5',
              title: 'Follow Up',
              description: 'Use the chat feature to answer any questions the customer may have about your offer.',
              image: require('../assets/images/help/find-jobs-5.png') // Replace with actual image
            }
          ],
          tips: [
            'Set up notifications to be alerted about new projects',
            'Respond quickly to gain a competitive advantage',
            'Be clear about your pricing and estimated completion time',
            'Highlight your relevant experience for each project',
            'Maintain a complete profile with portfolio examples'
          ]
        };
        
        related = [
          {
            id: '1',
            question: 'How do I optimize my profile to get more jobs?',
            route: 'HelpTopic',
            params: { topic: { id: 'profile-optimization', title: 'Optimizing Your Profile' } }
          },
          {
            id: '2',
            question: 'What should I include in my project bid?',
            route: 'HelpTopic',
            params: { topic: { id: 'bidding', title: 'Bidding & Offers' } }
          },
          {
            id: '3',
            question: 'How does the job matching system work?',
            route: 'HelpTopic',
            params: { topic: { id: 'job-matching', title: 'Job Matching' } }
          }
        ];
      } else {
        // Generic content for other topics
        details = {
          title: topic.title,
          description: `Detailed information about ${topic.title.toLowerCase()}.`,
          steps: [
            {
              id: '1',
              title: 'Step 1',
              description: 'First step description.',
              image: require('../assets/images/help/generic-1.png') // Replace with actual image
            },
            {
              id: '2',
              title: 'Step 2',
              description: 'Second step description.',
              image: require('../assets/images/help/generic-2.png') // Replace with actual image
            }
          ],
          tips: [
            'This is a helpful tip',
            'This is another helpful tip'
          ]
        };
        
        related = [
          {
            id: '1',
            question: 'Related question 1?',
            route: 'Help'
          },
          {
            id: '2',
            question: 'Related question 2?',
            route: 'Help'
          }
        ];
      }
      
      setTopicDetails(details);
      setRelatedQuestions(related);
      setIsLoading(false);
    }, 1000);
  };
  
  // Render step item
  const renderStep = ({ item, index }) => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepNumberContainer}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
        </View>
        
        <View style={styles.stepContentContainer}>
          <Text style={styles.stepTitle}>{item.title}</Text>
          <Text style={styles.stepDescription}>{item.description}</Text>
          
          {item.image && (
            <Image 
              source={item.image} 
              style={styles.stepImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    );
  };
  
  // Navigate to another help topic
  const navigateToRelatedTopic = (topic) => {
    if (topic.route === 'HelpTopic') {
      navigation.push('HelpTopic', topic.params);
    } else {
      navigation.navigate(topic.route);
    }
  };
  
  // Navigate to customer support
  const contactSupport = () => {
    // Navigate to support chat or open contact options
    Alert.alert('Contact Support', 'Would you like to contact our support team?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Contact Support',
        onPress: () => navigation.navigate('Help')
      }
    ]);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading help content...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{topicDetails.title}</Text>
            <Text style={styles.headerDescription}>{topicDetails.description}</Text>
          </View>
          
          {/* Step-by-Step Guide */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step-by-Step Guide</Text>
            <FlatList
              data={topicDetails.steps}
              renderItem={renderStep}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
          
          {/* Tips and Best Practices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips & Best Practices</Text>
            
            <View style={styles.tipsContainer}>
              {topicDetails.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="bulb-outline" size={22} color={Colors.primary} style={styles.tipIcon} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Related Questions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Questions</Text>
            
            {relatedQuestions.map((question) => (
              <TouchableOpacity 
                key={question.id}
                style={styles.relatedQuestionItem}
                onPress={() => navigateToRelatedTopic(question)}
              >
                <Text style={styles.relatedQuestionText}>{question.question}</Text>
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Didn't Find What You're Looking For */}
          <View style={styles.notFoundSection}>
            <Text style={styles.notFoundTitle}>Didn't find what you're looking for?</Text>
            <TouchableOpacity 
              style={styles.contactSupportButton}
              onPress={contactSupport}
            >
              <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
              <Text style={styles.contactSupportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
          
          {/* Footer Space */}
          <View style={styles.footerSpace} />
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContentContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 12,
  },
  stepImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#F5F5F5', // Placeholder color
  },
  tipsContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
  relatedQuestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  relatedQuestionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    marginRight: 8,
  },
  notFoundSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  notFoundTitle: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactSupportButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactSupportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerSpace: {
    height: 40,
  }
});

export default HelpTopicScreen;