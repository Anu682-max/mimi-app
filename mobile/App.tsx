import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import i18n from './src/i18n';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for authenticated users
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0A0A0F',
                    borderTopColor: '#1A1A24',
                },
                tabBarActiveTintColor: '#EC4899',
                tabBarInactiveTintColor: '#6B7280',
            }}
        >
            <Tab.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{
                    tabBarLabel: 'さがす',
                    tabBarIcon: ({ color }) => <TabIcon name="heart" color={color} />,
                }}
            />
            <Tab.Screen
                name="ChatList"
                component={ChatListScreen}
                options={{
                    tabBarLabel: 'メッセージ',
                    tabBarIcon: ({ color }) => <TabIcon name="chat" color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'プロフィール',
                    tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

// Simple tab icon component
function TabIcon({ name, color }: { name: string; color: string }) {
    const icons: Record<string, string> = {
        heart: '💕',
        chat: '💬',
        user: '👤',
    };
    return (
        <React.Fragment>
            {/* Using emoji as placeholder, replace with proper icons */}
        </React.Fragment>
    );
}

function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null; // Show splash screen
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0A0A0F' },
            }}
        >
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="Main" component={MainTabs} />
                    <Stack.Screen name="Chat" component={ChatScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <I18nextProvider i18n={i18n}>
                <AuthProvider>
                    <NavigationContainer>
                        <StatusBar style="light" />
                        <AppNavigator />
                    </NavigationContainer>
                </AuthProvider>
            </I18nextProvider>
        </SafeAreaProvider>
    );
}
