// Full AppNavigator.js with ProjectDetailScreen added

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

// Import custom drawer content
import DrawerContent from '../components/DrawerContent';

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
import ProjectDetailScreen from '../screens/ProjectDetailScreen'; // Added import for ProjectDetailScreen

// Import auth screens
import LoginScreen from '../screens/LoginScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Authentication stack navigator
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Chat stack navigator for both user types
function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen} 
        options={{ title: 'Messages' }} 
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ title: '' }} 
      />
    </Stack.Navigator>
  );
}

// Profile stack navigator for both user types
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
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
    </Stack.Navigator>
  );
}

// Customer's home stack navigator
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={({ navigation }) => ({
          title: 'TooKang',
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
function HandymanStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HandymanDashboard" 
        component={HandymanHomeScreen} 
        options={({ navigation }) => ({
          title: 'Dashboard',
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
      {/* Added ProjectDetails screen to the Handyman Stack */}
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
        options={{ 
          title: 'My Projects',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
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

// Customer drawer navigation
function CustomerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '75%',
        },
      }}
    >
      <Drawer.Screen name="CustomerTabs" component={CustomerTabs} />
    </Drawer.Navigator>
  );
}

// Handyman drawer navigation
function HandymanDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '75%',
        },
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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

export default AppNavigator;