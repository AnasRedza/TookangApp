import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Onboarding data - each screen contains title, description, and image
  const onboardingData = [
    {
      id: '1',
      title: 'Welcome to TooKang',
      description: 'Your one-stop solution for finding reliable handymen for all your home improvement needs.',
      image: require('../assets/images/onboarding-1.png'), // Replace with your image
    },
    {
      id: '2',
      title: 'Negotiate Your Price',
      description: 'Set your budget and negotiate directly with skilled professionals to get the best deal.',
      image: require('../assets/images/onboarding-2.png'), // Replace with your image
    },
    {
      id: '3',
      title: 'Secure Payments',
      description: 'Pay only after you approve the work. Your payment is held securely until the job is completed.',
      image: require('../assets/images/onboarding-3.png'), // Replace with your image
    },
    {
      id: '4',
      title: 'Ready to Start?',
      description: 'Create an account or sign in to find the perfect handyman for your next project.',
      image: require('../assets/images/onboarding-4.png'), // Replace with your image
    },
  ];

  // Handle next button press
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Navigate to Login screen if on last slide
      navigation.navigate('Login');
    }
  };

  // Handle skip button press
  const handleSkip = () => {
    navigation.navigate('Login');
  };

  // Render individual onboarding item
  const renderItem = ({ item, index }) => {
    const isLastItem = index === onboardingData.length - 1;
    
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        
        {isLastItem ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signUpButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.signUpButtonText}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  // Handle scroll event
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  // Render pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { opacity: index === currentIndex ? 1 : 0.3 }
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Skip button */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}
      
      {/* Onboarding slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination dots */}
        {renderPaginationDots()}
        
        {/* Next button (only shown if not on last slide) */}
        {currentIndex < onboardingData.length - 1 && (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: 'contain',
  },
  textContainer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginHorizontal: 5,
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  signUpButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;