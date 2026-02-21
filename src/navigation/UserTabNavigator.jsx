import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../context/ChatContext';
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import InstructorDetailScreen from '../screens/user/InstructorDetailScreen';
import PlanCheckoutScreen from '../screens/user/PlanCheckoutScreen';
import ChatScreen from '../screens/instructor/ChatScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';

const PRIMARY = '#820AD1';
const Tab = createBottomTabNavigator();
const MapStack = createNativeStackNavigator();

function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <MapStack.Screen name="UserDashboard" component={UserDashboardScreen} />
      <MapStack.Screen name="InstructorDetail" component={InstructorDetailScreen} />
      <MapStack.Screen name="PlanCheckout" component={PlanCheckoutScreen} />
    </MapStack.Navigator>
  );
}

export default function UserTabNavigator() {
  const { conversations, getUnreadCount } = useChat();

  const totalUnread = conversations.reduce((acc, conv) => acc + getUnreadCount(conv.id), 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="MapaTab"
        component={MapStackNavigator}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MensagensTab"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Mensagens',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
              {totalUnread > 0 && (
                <View style={{
                  position: 'absolute', top: -4, right: -8,
                  backgroundColor: '#EF4444', borderRadius: 8,
                  minWidth: 16, height: 16,
                  alignItems: 'center', justifyContent: 'center',
                  paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#FFF',
                }}>
                  <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={UserProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
