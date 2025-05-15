import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

// Import screens for Customer side
import HomeScreen from '../screens/HomeScreen';
import HandymanDetailScreen from '../screens/HandymanDetailScreen';
import ProjectBidScreen from '../screens/ProjectBidScreen';
import MyProjectsScreen from '../screens/MyProjectsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';

// Import screens for Handyman side
import HandymanHomeScreen from '../screens/HandymanHomeScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';

// Import settings screens
import SettingsScreen from '../screens/SettingsScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';

// Import auth screens
import LoginScreen from '../screens/LoginScreen';

// Define DrawerContent component inline
const DrawerContent = ({ navigation }) => {
  const { userType, logout } = useAuth();
  
  // Sample user profile data
  const user = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: userType === 'handyman' ? 4.8 : null,
  };

  // Helper function to navigate to the correct tab via the tab navigator
  const navigateToTab = (tabName) => {
    navigation.navigate(userType === 'handyman' ? 'HandymanTabs' : 'CustomerTabs', {
      screen: tabName
    });
    navigation.closeDrawer();
  };

  // Helper function to navigate to a nested screen within a tab
  const navigateToNestedScreen = (tabName, screenName, params = {}) => {
    navigation.navigate(userType === 'handyman' ? 'HandymanTabs' : 'CustomerTabs', {
      screen: tabName,
      params: {
        screen: screenName,
        params: params
      }
    });
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <View style={styles.userInfoSection}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {userType === 'handyman' && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>{user.rating}</Text>
            </View>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.menuSection}>
        {/* Dashboard/Home */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToTab(userType === 'handyman' ? 'Dashboard' : 'HomeTab')}
        >
          <Ionicons name="home-outline" size={22} color="#555" />
          <Text style={styles.menuItemText}>{userType === 'handyman' ? 'Dashboard' : 'Home'}</Text>
        </TouchableOpacity>
        
        {/* My Projects */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToTab('MyProjects')}
        >
          <Ionicons name={userType === 'handyman' ? 'construct-outline' : 'briefcase-outline'} size={22} color="#555" />
          <Text style={styles.menuItemText}>My Projects</Text>
        </TouchableOpacity>
        
        {/* Messages */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToTab('ChatTab')}
        >
          <Ionicons name="chatbubbles-outline" size={22} color="#555" />
          <Text style={styles.menuItemText}>Messages</Text>
        </TouchableOpacity>
        
        {/* Profile */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToTab('ProfileTab')}
        >
          <Ionicons name="person-outline" size={22} color="#555" />
          <Text style={styles.menuItemText}>Profile</Text>
        </TouchableOpacity>
        
        {/* Settings */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToNestedScreen('ProfileTab', 'Settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#555" />
          <Text style={styles.menuItemText}>Settings</Text>
        </TouchableOpacity>
        
        {/* Help & Support */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToNestedScreen('ProfileTab', 'HelpCenter')}
        >
          <Ionicons name="help-circle-outline" size={22} color="#555" />
          <Text style={styles.menuItemText}>Help & Support</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={() => {
            logout();
            navigation.closeDrawer();
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#E53935" />
          <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Common header options to include the menu button on all stack screens
const getStackScreenOptions = (navigation) => ({
  headerStyle: {
    backgroundColor: Colors.primary,
  },
  headerTintColor: Colors.white,
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerLeft: () => (
    <Ionicons
      name="menu"
      size={25}
      color={Colors.white}
      style={{ marginLeft: 15 }}
      onPress={() => navigation.openDrawer()}
    />
  ),
});

// Authentication stack navigator
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Chat stack navigator for both user types
function ChatStack({ navigation }) {
  return (
    <Stack.Navigator screenOptions={() => getStackScreenOptions(navigation)}>
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen} 
        options={{ title: 'Messages' }} 
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={({ route }) => ({ 
          title: route.params?.recipient?.name || '' 
        })} 
      />
    </Stack.Navigator>
  );
}

// Settings stack navigator
function SettingsStack({ navigation }) {
  return (
    <Stack.Navigator screenOptions={() => getStackScreenOptions(navigation)}>
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name="LanguageSettings" 
        component={LanguageSettingsScreen} 
        options={{ title: 'Language' }} 
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: 'Change Password' }} 
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen} 
        options={{ title: 'Privacy Policy' }} 
      />
      <Stack.Screen 
        name="HelpCenter" 
        component={HelpCenterScreen} 
        options={{ title: 'Help Center' }} 
      />
      <Stack.Screen 
        name="ContactSupport" 
        component={ContactSupportScreen} 
        options={{ title: 'Contact Support' }} 
      />
    </Stack.Navigator>
  );
}

// Profile stack navigator for both user types
function ProfileStack({ navigation }) {
  return (
    <Stack.Navigator screenOptions={() => getStackScreenOptions(navigation)}>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsStack} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Customer's home stack navigator
function HomeStack({ navigation }) {
  return (
    <Stack.Navigator screenOptions={() => getStackScreenOptions(navigation)}>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'TooKang' }}
      />
      <Stack.Screen 
        name="HandymanDetail" 
        component={HandymanDetailScreen} 
        options={{ title: 'Handyman Profile' }} 
      />
      <Stack.Screen 
        name="ProjectBid" 
        component={ProjectBidScreen} 
        options={{ title: 'Create Project Bid' }} 
      />
    </Stack.Navigator>
  );
}

// Handyman stack navigator
function HandymanStack({ navigation }) {
  return (
    <Stack.Navigator screenOptions={() => getStackScreenOptions(navigation)}>
      <Stack.Screen 
        name="HandymanDashboard" 
        component={HandymanHomeScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="ProjectDetails" 
        component={ProjectDetailScreen} 
        options={{ title: 'Project Details' }} 
      />
    </Stack.Navigator>
  );
}

// Customer's bottom tab navigator
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyProjects') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ 
          headerShown: false,
          title: 'Home'
        }} 
      />
      <Tab.Screen 
        name="MyProjects" 
        component={MyProjectsScreen} 
        options={({ navigation }) => ({
          title: 'My Projects',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <Ionicons
              name="menu"
              size={25}
              color={Colors.white}
              style={{ marginLeft: 15 }}
              onPress={() => navigation.openDrawer()}
            />
          ),
        })} 
      />
      <Tab.Screen 
        name="ChatTab" 
        component={ChatStack} 
        options={{ 
          headerShown: false,
          title: 'Messages'
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{ 
          headerShown: false,
          title: 'Profile'
        }} 
      />
    </Tab.Navigator>
  );
}

// Handyman's bottom tab navigator
function HandymanTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HandymanStack} 
        options={{ 
          headerShown: false,
          title: 'Dashboard'
        }} 
      />
      <Tab.Screen 
        name="ChatTab" 
        component={ChatStack} 
        options={{ 
          headerShown: false,
          title: 'Messages'
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{ 
          headerShown: false,
          title: 'Profile'
        }} 
      />
    </Tab.Navigator>
  );
}

// Customer drawer navigation with gesture enabled
function CustomerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '75%',
        },
        gestureEnabled: true,  // Enable gesture to open drawer on all screens
      }}
    >
      <Drawer.Screen name="CustomerTabs" component={CustomerTabs} />
    </Drawer.Navigator>
  );
}

// Handyman drawer navigation with gesture enabled
function HandymanDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '75%',
        },
        gestureEnabled: true,  // Enable gesture to open drawer on all screens
      }}
    >
      <Drawer.Screen name="HandymanTabs" component={HandymanTabs} />
    </Drawer.Navigator>
  );
}

// Root navigator with Auth context
const AppNavigator = () => {
  // Get authentication state from context
  const { isLoading, userToken, userType } = useAuth();
  
  // Show loading indicator while checking authentication state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  // Return the appropriate navigator based on authentication state
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken === null ? (
        // User is not logged in
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : userType === 'customer' ? (
        // User logged in as customer
        <Stack.Screen name="CustomerRoot" component={CustomerDrawer} />
      ) : (
        // User logged in as handyman
        <Stack.Screen name="HandymanRoot" component={HandymanDrawer} />
      )}
    </Stack.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  userInfoSection: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  menuSection: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 16,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingVertical: 8,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutText: {
    color: '#E53935',
  }
});

export default AppNavigator;