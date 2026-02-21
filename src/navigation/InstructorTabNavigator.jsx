import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../context/ChatContext';
import DashboardScreen from '../screens/instructor/DashboardScreen';
import ScheduleScreen from '../screens/instructor/ScheduleScreen';
import StatsScreen from '../screens/instructor/StatsScreen';
import ProfileScreen from '../screens/instructor/ProfileScreen';
import ChatScreen from '../screens/instructor/ChatScreen';

const Tab = createBottomTabNavigator();

const PRIMARY = '#820AD1';
const GRAY = '#9CA3AF';

function TabIcon({ name, focused, color }) {
  return <Ionicons name={name} size={24} color={color} />;
}

function ChatTabIcon({ focused, color }) {
  const { getTotalUnreadCount } = useChat();
  const count = getTotalUnreadCount();
  return (
    <View>
      <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
      {count > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -6,
          backgroundColor: '#EF4444', borderRadius: 8,
          minWidth: 16, height: 16,
          justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2,
        }}>
          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>
            {count > 9 ? '9+' : count}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function InstructorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Painel',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Estatísticas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ focused, color }) => <ChatTabIcon focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
