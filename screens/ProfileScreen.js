import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const ProfileScreen = ({ navigation }) => {
  const { user, isHandyman } = useAuth();
  
  // Mock data to match EditProfileScreen content
  const userData = isHandyman ? {
    name: user?.name || 'Ahmad Rahman',
    email: user?.email || 'ahmad.rahman@handyman.my',
    phone: '+60 12-345-6789',
    avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Professional handyman with 10+ years of experience. Licensed and insured for all types of home repairs.',
    serviceCategories: [
      { name: 'Plumbing', price: '40' },
      { name: 'Electrical', price: '50' },
      { name: 'Carpentry', price: '45' }
    ],
    commonItems: [
      { name: 'Basic pipe fitting', price: '15' },
      { name: 'Standard light fixture', price: '25' },
      { name: 'Door hinge replacement', price: '20' }
    ]
  } : {
    name: user?.name || 'Sarah Wong',
    email: user?.email || 'sarah.wong@gmail.com',
    phone: '+60 13-987-6543',
    avatar: user?.avatar || 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Looking for reliable handymen for home improvement projects.'
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Image source={{ uri: userData.avatar }} style={styles.profileImage} />
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.userType}>{isHandyman ? 'Service Provider' : 'Customer'}</Text>
          
          <Text style={styles.bio}>{userData.bio}</Text>
          
          <View style={styles.statsContainer}>
            {isHandyman ? (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>4.8</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>47</Text>
                  <Text style={styles.statLabel}>Jobs</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>36</Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Projects</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>4</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
              </>
            )}
          </View>
        </View>
        
        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#777777" style={styles.infoIcon} />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#777777" style={styles.infoIcon} />
            <Text style={styles.infoText}>{userData.phone}</Text>
          </View>
        </View>
        
        {/* HANDYMAN ONLY: Services and Pricing */}
        {isHandyman && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Pricing</Text>
              
              {userData.serviceCategories.map((category, index) => (
                <View key={`service-${index}`} style={styles.listItem}>
                  <Text style={styles.listItemName}>{category.name}</Text>
                  <Text style={styles.listItemValue}>RM {category.price}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Common Items</Text>
              
              {userData.commonItems.map((item, index) => (
                <View key={`item-${index}`} style={styles.listItem}>
                  <Text style={styles.listItemName}>{item.name}</Text>
                  <Text style={styles.listItemValue}>RM {item.price}</Text>
                </View>
              ))}
            </View>
          </>
        )}
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
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTop: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  editButton: {
    position: 'absolute',
    right: -5,
    bottom: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '90%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#DDDDDD',
  },
  section: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 15,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  listItemName: {
    fontSize: 16,
    color: '#333333',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
});

export default ProfileScreen;