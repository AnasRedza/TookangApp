import React, { Alert } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Home Stack Screens
import HomeScreen from '../screens/HomeScreen';
import HandymanDetailScreen from '../screens/HandymanDetailScreen';
import ProjectBidScreen from '../screens/ProjectBidScreen';
import ServiceCategoryScreen from '../screens/ServiceCategoryScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';

// Projects Stack Screens
import MyProjectsScreen from '../screens/MyProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import ProjectOfferScreen from '../screens/ProjectOfferScreen';
import BudgetAdjustmentScreen from '../screens/BudgetAdjustmentScreen';
import AdjustmentApprovalScreen from '../screens/AdjustmentApprovalScreen';

// Payment Screens
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';

// Chat Stack Screens
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';

// Profile Stack Screens
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

// Additional Screens
import HelpScreen from '../screens/HelpScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpTopicScreen from '../screens/HelpTopicScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Menu button component
const MenuButton = ({ navigation }) => (
  <TouchableOpacity 
    style={{ marginLeft: 15 }}
    onPress={() => navigation.openDrawer()}
  >
    <Ionicons name="menu" size={24} color="#FFFFFF" />
  </TouchableOpacity>
);

// Back button with drawer option
const BackButtonWithDrawer = ({ navigation, canGoBack }) => {
  if (canGoBack) {
    return (
      <TouchableOpacity 
        style={{ marginLeft: 15 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    );
  } else {
    return <MenuButton navigation={navigation} />;
  }
};

// Common header options with drawer menu
const getScreenOptions = (navigation) => ({
  headerStyle: { backgroundColor: Colors.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' },
  headerLeft: () => <MenuButton navigation={navigation} />
});

// Authentication Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionsBase} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
};

// Base screen options without menu button
const screenOptionsBase = {
  headerStyle: { backgroundColor: Colors.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' }
};

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => {
          const isFirstRouteInParent = route.name === 'Home';
          return isFirstRouteInParent 
            ? <MenuButton navigation={navigation} />
            : <BackButtonWithDrawer navigation={navigation} canGoBack={true} />;
        }
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'TooKang' }} />
      <Stack.Screen name="HandymanDetail" component={HandymanDetailScreen} options={{ title: 'Handyman Profile' }} />
      <Stack.Screen name="ProjectBid" component={ProjectBidScreen} options={{ title: 'Create Project' }} />
      <Stack.Screen name="ServiceCategory" component={ServiceCategoryScreen} 
        options={({ route }) => ({ title: route.params?.category || 'Category' })} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ title: 'Search Results' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} 
        options={{ title: 'Payment Complete', headerLeft: () => null }} />
      <Stack.Screen name="AdjustmentApproval" component={AdjustmentApprovalScreen} options={{ title: 'Budget Adjustment' }} />
    </Stack.Navigator>
  );
};

// Projects Stack Navigator
const ProjectsStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="MyProjects"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => {
          const isFirstRouteInParent = route.name === 'MyProjects';
          return isFirstRouteInParent 
            ? <MenuButton navigation={navigation} />
            : <BackButtonWithDrawer navigation={navigation} canGoBack={true} />;
        }
      })}
    >
      <Stack.Screen name="MyProjects" component={MyProjectsScreen} options={{ title: 'My Projects' }} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailScreen} options={{ title: 'Project Details' }} />
      <Stack.Screen name="ProjectOffer" component={ProjectOfferScreen} options={{ title: 'Make an Offer' }} />
      <Stack.Screen name="BudgetAdjustment" component={BudgetAdjustmentScreen} options={{ title: 'Adjust Budget' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} 
        options={{ title: 'Payment Complete', headerLeft: () => null }} />
      <Stack.Screen name="AdjustmentApproval" component={AdjustmentApprovalScreen} options={{ title: 'Budget Adjustment' }} />
    </Stack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Chats"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => {
          const isFirstRouteInParent = route.name === 'Chats';
          return isFirstRouteInParent 
            ? <MenuButton navigation={navigation} />
            : <BackButtonWithDrawer navigation={navigation} canGoBack={true} />;
        }
      })}
    >
      <Stack.Screen name="Chats" component={ChatListScreen} options={{ title: 'Messages' }} />
      <Stack.Screen name="Chat" component={ChatScreen} 
        options={({ route }) => ({ title: route.params?.recipient?.name || 'Chat' })} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Profile"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => {
          const isFirstRouteInParent = route.name === 'Profile';
          return isFirstRouteInParent 
            ? <MenuButton navigation={navigation} />
            : <BackButtonWithDrawer navigation={navigation} canGoBack={true} />;
        }
      })}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notification Settings' }} />
    </Stack.Navigator>
  );
};

// Help Stack Navigator
const HelpStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Help"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => {
          const isFirstRouteInParent = route.name === 'Help';
          return isFirstRouteInParent 
            ? <MenuButton navigation={navigation} />
            : <BackButtonWithDrawer navigation={navigation} canGoBack={true} />;
        }
      })}
    >
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help & Support' }} />
      <Stack.Screen name="HelpTopic" component={HelpTopicScreen}
        options={({ route }) => ({ title: route.params?.topic?.title || 'Help Topic' })} />
    </Stack.Navigator>
  );
};

// Settings Stack Navigator
const SettingsStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Settings"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => {
          const isFirstRouteInParent = route.name === 'Settings';
          return isFirstRouteInParent 
            ? <MenuButton navigation={navigation} />
            : <BackButtonWithDrawer navigation={navigation} canGoBack={true} />;
        }
      })}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="SettingsNotifications" component={NotificationSettingsScreen} 
        options={{ title: 'Notification Settings' }} />
    </Stack.Navigator>
  );
};

// Payment Methods Stack Navigator
const PaymentMethodsStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="PaymentMethods"
      screenOptions={({ navigation }) => ({
        ...screenOptionsBase,
        headerLeft: () => <MenuButton navigation={navigation} />
      })}
    >
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Payment Methods' }} />
    </Stack.Navigator>
  );
};

// Transaction History Stack Navigator
const TransactionHistoryStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="TransactionHistory"
      screenOptions={({ navigation }) => ({
        ...screenOptionsBase,
        headerLeft: () => <MenuButton navigation={navigation} />
      })}
    >
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={{ title: 'Transaction History' }} />
    </Stack.Navigator>
  );
};

// About Stack Navigator
const AboutStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="About"
      screenOptions={({ navigation }) => ({
        ...screenOptionsBase,
        headerLeft: () => <MenuButton navigation={navigation} />
      })}
    >
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Us' }} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'ProjectsTab') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'ChatTab') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="ProjectsTab" component={ProjectsStack} options={{ title: 'Projects' }} />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

// Main Drawer Navigator
const MainDrawer = () => {
  const { logout } = useAuth();
  
  return (
    <Drawer.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: '#666'
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{
          title: 'TooKang',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="PaymentMethodsDrawer" 
        component={PaymentMethodsStack} 
        options={{
          title: 'Payment Methods',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="card" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="TransactionHistoryDrawer" 
        component={TransactionHistoryStack}
        options={{
          title: 'Transaction History',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="receipt" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="HelpDrawer" 
        component={HelpStack}
        options={{
          title: 'Help & Support',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="SettingsDrawer" 
        component={SettingsStack}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="AboutDrawer" 
        component={AboutStack}
        options={{
          title: 'About Us',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="Logout" 
        component={EmptyComponent}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out" color={color} size={size} />
          )
        }}
        listeners={({ navigation }) => ({
          onPress: () => {
            // Close drawer
            navigation.closeDrawer();
            // Show confirmation dialog
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Logout', 
                  style: 'destructive',
                  onPress: logout
                }
              ]
            );
          }
        })}
      />
    </Drawer.Navigator>
  );
};

// Empty component for logout option
const EmptyComponent = () => <View />;

// App Navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  
  // Show a loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      {user ? <MainDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;