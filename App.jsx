import 'react-native-gesture-handler';
import React from 'react';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { SecurityProvider } from './src/context/SecurityContext';
import { ScheduleProvider } from './src/context/ScheduleContext';
import { ChatProvider } from './src/context/ChatContext';
import { PlansProvider } from './src/context/PlansContext';
import { SessionProvider } from './src/context/SessionContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          {/* SecurityProvider: dentro do Auth (usa logout) e fora dos demais
              para capturar toques e exibir a tela de privacidade em background */}
          <SecurityProvider>
            <SessionProvider>
              <ScheduleProvider>
                <ChatProvider>
                  <PlansProvider>
                    <NavigationContainer>
                      <AppNavigator />
                      <StatusBar style="auto" />
                    </NavigationContainer>
                  </PlansProvider>
                </ChatProvider>
              </ScheduleProvider>
            </SessionProvider>
          </SecurityProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
