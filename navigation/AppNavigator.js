import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';
import { getUserDisplayInfo, getRoleNavigationOptions } from '../utils/authUtils';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Home Stack Screens
import HomeScreen from '../screens/HomeScreen';
import HandymanHomeScreen from '../screens/HandymanHomeScreen';
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
import ReviewScreen from '../screens/ReviewScreen';

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
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

// Additional Screens
import ScheduleManagementScreen from '../screens/ScheduleManagementScreen';
import HelpScreen from '../screens/HelpScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpTopicScreen from '../screens/HelpTopicScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Menu button component - Only shows on Home and HandymanHome screens
const MenuButton = ({ navigation, screenName }) => {
  // Only show the menu button on HomeScreen and HandymanHomeScreen
  if (screenName === 'Home' || screenName === 'HandymanHome') {
    return (
      <TouchableOpacity 
        style={{ marginLeft: 15 }}
        onPress={() => navigation.openDrawer()}
      >
        <Ionicons name="menu" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }
  
  // For all other screens, return a back button instead
  return (
    <TouchableOpacity 
      style={{ marginLeft: 15 }}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

// Logo component for header
const LogoTitle = () => (
  <Image
    source={require('../assets/images/tookang_logo.png')}
    style={{ height: 30, width: 120 }}
    resizeMode="contain"
  />
);

// Base screen options without menu button
const screenOptionsBase = {
  headerStyle: { backgroundColor: Colors.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' }
};

// Authentication Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionsBase} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />
        }} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />
        }} 
      />
    </Stack.Navigator>
  );
};

// Home Stack Navigator
const HomeStack = () => {
  const { isHandyman } = useAuth();
  
  return (
    <Stack.Navigator 
      initialRouteName={isHandyman ? "HandymanHome" : "Home"}
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => <MenuButton navigation={navigation} screenName={route.name} />,
        headerTitle: () => <LogoTitle />,
        // Add role indicator for handyman in the header right area
        headerRight: () => isHandyman ? (
          <View style={styles.headerRoleBadge}>
            <Text style={styles.headerRoleBadgeText}>HANDYMAN</Text>
          </View>
        ) : null
      })}
    >
      {/* Regular Home Screen for Customers */}
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Home'
        }}
      />
      
      {/* Handyman-specific Home Screen */}
      <Stack.Screen 
        name="HandymanHome" 
        component={HandymanHomeScreen} 
        options={{ 
          title: 'Available Jobs'
        }}
      />
      
      <Stack.Screen name="HandymanDetail" component={HandymanDetailScreen} />
      <Stack.Screen name="ProjectBid" component={ProjectBidScreen} />
      <Stack.Screen name="ServiceCategory" component={ServiceCategoryScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      
      {/* IMPORTANT: Add ProjectDetailScreen to HomeStack too */}
      <Stack.Screen name="ProjectDetails" component={ProjectDetailScreen} />
      <Stack.Screen name="ProjectOffer" component={ProjectOfferScreen} />
      
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccessScreen} 
        options={{ headerLeft: () => null }} 
      />
      <Stack.Screen name="AdjustmentApproval" component={AdjustmentApprovalScreen} />
      
      {/* Add the ReviewScreen */}
      <Stack.Screen 
        name="ReviewScreen" 
        component={ReviewScreen}
        options={{ 
          title: 'Write a Review',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack.Navigator>
  );
};

// Projects Stack Navigator
const ProjectsStack = () => {
  const { isHandyman } = useAuth();
  
  return (
    <Stack.Navigator 
      initialRouteName="MyProjects"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerTitle: () => <LogoTitle />,
        // Add role indicator for handyman in the header right area
        headerRight: () => isHandyman ? (
          <View style={styles.headerRoleBadge}>
            <Text style={styles.headerRoleBadgeText}>HANDYMAN</Text>
          </View>
        ) : null
      })}
    >
      <Stack.Screen 
        name="MyProjects" 
        component={MyProjectsScreen} 
        options={({ route }) => ({ 
          title: isHandyman ? 'My Jobs' : 'My Projects'
        })}
      />
      
      {/* IMPORTANT: Make sure the name is exactly "ProjectDetails" */}
      <Stack.Screen name="ProjectDetails" component={ProjectDetailScreen} />
      
      <Stack.Screen name="ProjectOffer" component={ProjectOfferScreen} />
      <Stack.Screen name="BudgetAdjustment" component={BudgetAdjustmentScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccessScreen}
        options={{ headerLeft: () => null }} 
      />
      <Stack.Screen name="AdjustmentApproval" component={AdjustmentApprovalScreen} />
      
      {/* Add the ReviewScreen */}
      <Stack.Screen 
        name="ReviewScreen" 
        component={ReviewScreen}
        options={{ 
          title: 'Write a Review',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStack = () => {
  const { isHandyman } = useAuth();
  
  return (
    <Stack.Navigator 
      initialRouteName="Chats"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerTitle: route.name === 'Chats' ? () => <LogoTitle /> : undefined,
        // Add role indicator for handyman in the header right area when not in a chat
        headerRight: () => (route.name === 'Chats' && isHandyman) ? (
          <View style={styles.headerRoleBadge}>
            <Text style={styles.headerRoleBadgeText}>HANDYMAN</Text>
          </View>
        ) : null
      })}
    >
      <Stack.Screen name="Chats" component={ChatListScreen} />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={({ route }) => ({ title: route.params?.recipient?.name || 'Chat' })} 
      />
      
      {/* IMPORTANT: Add these screens to enable navigation from chat */}
      <Stack.Screen name="ProjectDetails" component={ProjectDetailScreen} />
      <Stack.Screen name="ProjectOffer" component={ProjectOfferScreen} />
      
      {/* Add ReviewScreen here too in case it's needed from chat */}
      <Stack.Screen 
        name="ReviewScreen" 
        component={ReviewScreen}
        options={{ 
          title: 'Write a Review',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  const { isHandyman } = useAuth();
  
  return (
    <Stack.Navigator 
      initialRouteName="Profile"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerTitle: route.name === 'Profile' ? () => <LogoTitle /> : undefined,
        // Add role indicator for handyman in the header right area when on profile screen
        headerRight: () => (route.name === 'Profile' && isHandyman) ? (
          <View style={styles.headerRoleBadge}>
            <Text style={styles.headerRoleBadgeText}>HANDYMAN</Text>
          </View>
        ) : null
      })}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notification Settings' }} />
      
      {/* IMPORTANT: Add these screens to enable navigation from profile */}
      <Stack.Screen name="ProjectDetails" component={ProjectDetailScreen} />
      <Stack.Screen name="ProjectOffer" component={ProjectOfferScreen} />
      
      {/* Add ReviewScreen here too in case it's needed from profile (e.g. viewing past reviews) */}
      <Stack.Screen 
        name="ReviewScreen" 
        component={ReviewScreen}
        options={{ 
          title: 'Write a Review',
          headerBackTitle: 'Back'
        }} 
      />
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
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerTitle: route.name === 'Help' ? () => <LogoTitle /> : undefined
      })}
    >
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen 
        name="HelpTopic" 
        component={HelpTopicScreen}
        options={({ route }) => ({ title: route.params?.topic?.title || 'Help Topic' })} 
      />
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
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerTitle: route.name === 'Settings' ? () => <LogoTitle /> : undefined
      })}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen 
        name="SettingsNotifications" 
        component={NotificationSettingsScreen} 
        options={{ title: 'Notification Settings' }} 
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
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerTitle: () => <LogoTitle />
      })}
    >
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
    </Stack.Navigator>
  );
};

// Transaction History Stack Navigator
const TransactionHistoryStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="TransactionHistory"
      screenOptions={({ navigation, route }) => ({
        ...screenOptionsBase,
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerTitle: () => <LogoTitle />
      })}
    >
        <Stack.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen}
        options={{ 
          title: 'Transaction History',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#FFFFFF'
        }}
      />
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
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerTitle: () => <LogoTitle />
      })}
    >
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  const { isHandyman } = useAuth(); // Get role info
  const roleOptions = getRoleNavigationOptions(isHandyman ? 'handyman' : 'customer');
  
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            // Different icons for handyman vs customer
            if (isHandyman) {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else {
              iconName = focused ? 'home' : 'home-outline';
            }
          }
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
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ 
          title: roleOptions.homeTabTitle
        }} 
      />
      <Tab.Screen 
        name="ProjectsTab"
        component={ProjectsStack} 
        options={{ 
          title: roleOptions.projectsTabTitle
        }} 
      />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

// Custom Drawer Content Component
const CustomDrawerContent = (props) => {
  const { logout, user, isHandyman } = useAuth();
  const userDisplayInfo = getUserDisplayInfo(user);
  
  return (
    <DrawerContentScrollView {...props}>
      {/* Logo Header - Always shown for both user types */}
      <View style={styles.drawerHeader}>
        <Image 
          source={require('../assets/images/tookang_logo.png')}
          style={styles.drawerLogo}
          resizeMode="contain"
        />
        
        {/* User Info Section */}
        {userDisplayInfo && (
          <View style={styles.userInfoSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{userDisplayInfo.initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userDisplayInfo.name}</Text>
              <Text style={styles.userEmail}>{userDisplayInfo.email}</Text>
              <View style={[
                styles.roleBadge,
                { backgroundColor: isHandyman ? Colors.handyman : Colors.primary }
              ]}>
                <Text style={styles.roleBadgeText}>{userDisplayInfo.roleDisplay}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
      
      {/* Custom drawer items based on user type */}
      {isHandyman ? (
        // Handyman - Show schedule management and earnings
        <View>
          {/* My Schedule - NEW */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('ScheduleManagement');
            }}
          >
            <Ionicons name="calendar" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>My Schedule</Text>
          </TouchableOpacity>
          
          {/* Earnings */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('EarningsDrawer');
            }}
          >
            <Ionicons name="cash" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>My Earnings</Text>
          </TouchableOpacity>
          
          {/* Help & Support */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('HelpDrawer');
            }}
          >
            <Ionicons name="help-circle" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>Help & Support</Text>
          </TouchableOpacity>
          
          {/* Settings */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('SettingsDrawer');
            }}
          >
            <Ionicons name="settings" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>Settings</Text>
          </TouchableOpacity>
          
          {/* About Us */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('AboutDrawer');
            }}
          >
            <Ionicons name="information-circle" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>About Us</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Customer - Only show payment methods and other specified menu items
        <View>
          {/* Payment Methods */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('PaymentMethodsDrawer');
            }}
          >
            <Ionicons name="card" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>Payment Methods</Text>
          </TouchableOpacity>
          
          {/* Transaction History */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('TransactionHistoryDrawer');
            }}
          >
            <Ionicons name="receipt" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>Transaction History</Text>
          </TouchableOpacity>
          
          {/* Help & Support */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('HelpDrawer');
            }}
          >
            <Ionicons name="help-circle" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>Help & Support</Text>
          </TouchableOpacity>
          
          {/* Settings */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('SettingsDrawer');
            }}
          >
            <Ionicons name="settings" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>Settings</Text>
          </TouchableOpacity>
          
          {/* About Us */}
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('AboutDrawer');
            }}
          >
            <Ionicons name="information-circle" size={24} color="#666" style={styles.drawerItemIcon} />
            <Text style={styles.drawerItemText}>About Us</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Custom Logout Item for both customers and handyman */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          props.navigation.closeDrawer();
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
        }}
      >
        <Ionicons name="log-out" size={24} color="#666" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

// Main Drawer Navigator
const MainDrawer = () => {
  const { isHandyman } = useAuth(); // Get user and role info
  
  return (
    <Drawer.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: '#666',
        drawerType: 'front'
      }}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      {/* Main Tabs - This is here for navigation purposes but won't show in drawer */}
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{
          title: isHandyman ? 'My Jobs' : 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name={isHandyman ? "briefcase" : "home"} color={color} size={size} />
          )
        }}
      />

      {/* Schedule Management - NEW (only for handymen) */}
      {isHandyman && (
        <Drawer.Screen 
          name="ScheduleManagement" 
          component={ScheduleManagementScreen} 
          options={{
            title: 'My Schedule',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar" color={color} size={size} />
            )
          }}
        />
      )}
      
      {/* Payment Methods */}
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
      
      {/* Earnings - only for handyman but registered for navigation */}
      <Drawer.Screen 
        name="EarningsDrawer" 
        component={TransactionHistoryStack} 
        options={{
          title: 'My Earnings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cash" color={color} size={size} />
          )
        }}
      />
      
      {/* Transaction History */}
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
      
      {/* Help & Support */}
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
      
      {/* Settings */}
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
      
      {/* About Us */}
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
    </Drawer.Navigator>
  );
};

// App Navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  
  // Show a loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      {user ? <MainDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textMedium,
  },
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
    marginBottom: 8,
  },
  drawerLogo: {
    height: 40,
    width: 160,
    marginBottom: 16,
  },
  userInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textMedium,
    marginTop: 2,
  },
  // Role badge styles
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Header role badge
  headerRoleBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 16,
  },
  headerRoleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  // Drawer item style (for custom handyman drawer)
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  drawerItemIcon: {
    marginRight: 32,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#666666',
  },
  // Logout button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  logoutIcon: {
    marginRight: 32,
  },
  logoutText: {
    color: '#666666',
    fontSize: 16,
  }
});

export default AppNavigator;