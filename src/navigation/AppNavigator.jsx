import React from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/auth/LoginScreen';
import InstructorTabNavigator from './InstructorTabNavigator';
import UserTabNavigator from './UserTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#820AD1' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: Platform.OS === 'web' ? 'none' : 'fade' }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user?.role === 'instructor' ? (
        <Stack.Screen name="InstructorTabs" component={InstructorTabNavigator} />
      ) : (
        <Stack.Screen name="UserTabs" component={UserTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
