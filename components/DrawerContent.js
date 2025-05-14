import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const DrawerContent = (props) => {
  const { userType, logout } = useAuth();
  
  // Mock user data - in a real app, this would come from your auth context
  const user = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  };
  
  const handleLogout = () => {
    // Call logout function from Auth Context
    logout();
  };
  
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.userInfoSection}>
        <TouchableOpacity 
          style={styles.userInfoHeader}
          onPress={() => props.navigation.navigate('ProfileTab')}
        >
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.userTypeContainer}>
              <Ionicons 
                name={userType === 'customer' ? 'person' : 'hammer'} 
                size={12} 
                color={Colors.white} 
              />
              <Text style={styles.userTypeText}>
                {userType === 'customer' ? 'Customer' : 'Handyman'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.drawerSection}>
        <DrawerItem
          icon={({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          )}
          label="Home"
          onPress={() => props.navigation.navigate('Home')}
          activeTintColor={Colors.primary}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          icon={({ color, size }) => (
            <Ionicons name="briefcase-outline" color={color} size={size} />
          )}
          label="My Projects"
          onPress={() => props.navigation.navigate('MyProjects')}
          activeTintColor={Colors.primary}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          icon={({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          )}
          label="Messages"
          onPress={() => props.navigation.navigate('ChatTab')}
          activeTintColor={Colors.primary}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          icon={({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          )}
          label="Favorites"
          onPress={() => props.navigation.navigate('Favorites')}
          activeTintColor={Colors.primary}
          style={styles.drawerItem}
        />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.drawerSection}>
        <DrawerItem
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          )}
          label="Settings"
          onPress={() => props.navigation.navigate('ProfileTab')}
          activeTintColor={Colors.primary}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          icon={({ color, size }) => (
            <Ionicons name="help-circle-outline" color={color} size={size} />
          )}
          label="Help & Support"
          onPress={() => props.navigation.navigate('Help')}
          activeTintColor={Colors.primary}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          icon={({ color, size }) => (
            <Ionicons name="information-circle-outline" color={color} size={size} />
          )}
          label="About"
          onPress={() => props.navigation.navigate('About')}
          activeTintColor={Colors.primary}
          style={styles.drawerItem}
        />
      </View>
      
      <View style={styles.divider} />
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>TooKang v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    backgroundColor: Colors.primary,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userInfo: {
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  email: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 5,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    color: Colors.white,
    fontSize: 10,
    marginLeft: 3,
  },
  drawerSection: {
    marginTop: 10,
  },
  drawerItem: {
    borderRadius: 10,
    marginVertical: 0,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  logoutText: {
    marginLeft: 30,
    color: Colors.error,
    fontWeight: 'bold',
  },
  versionContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: Colors.darkGray,
  },
});

export default DrawerContent;