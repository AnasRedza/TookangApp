import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </AuthProvider>
  );
}