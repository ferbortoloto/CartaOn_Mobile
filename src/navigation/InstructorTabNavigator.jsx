import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
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
const PILL_BG = '#F3E8FF';

const TABS = [
  { name: 'Dashboard', label: 'Painel',    icon: 'home-outline',        iconActive: 'home'        },
  { name: 'Schedule',  label: 'Agenda',    icon: 'calendar-outline',    iconActive: 'calendar'    },
  { name: 'Stats',     label: 'Relatório', icon: 'bar-chart-outline',   iconActive: 'bar-chart'   },
  { name: 'Chat',      label: 'Chat',      icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { name: 'Profile',   label: 'Perfil',    icon: 'person-outline',      iconActive: 'person'      },
];

function CustomTabBar({ state, navigation }) {
  const { getTotalUnreadCount } = useChat();
  const unreadCount = getTotalUnreadCount();

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
      paddingHorizontal: 4,
      paddingTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 24 : 10,
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    }}>
      {state.routes.map((route, index) => {
        const tab = TABS[index];
        const focused = state.index === index;
        const isChatTab = tab.name === 'Chat';
        const hasBadge = isChatTab && unreadCount > 0;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.75}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            {focused ? (
              /* Aba ativa: pílula com ícone + label */
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: PILL_BG,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 24,
                gap: 5,
              }}>
                <Ionicons name={tab.iconActive} size={19} color={PRIMARY} />
                <Text style={{
                  color: PRIMARY,
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 0.1,
                }}>
                  {tab.label}
                </Text>
              </View>
            ) : (
              /* Aba inativa: só ícone */
              <View style={{ padding: 8, position: 'relative' }}>
                <Ionicons name={tab.icon} size={22} color="#9CA3AF" />
                {hasBadge && (
                  <View style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: '#EF4444',
                    borderRadius: 7,
                    minWidth: 14,
                    height: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 2,
                    borderWidth: 1.5,
                    borderColor: '#FFF',
                  }}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function InstructorTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Schedule"  component={ScheduleScreen} />
      <Tab.Screen name="Stats"     component={StatsScreen} />
      <Tab.Screen name="Chat"      component={ChatScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}
