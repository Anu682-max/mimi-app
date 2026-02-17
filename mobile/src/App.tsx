/**
 * mimi Mobile App Entry Point
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { I18nextProvider } from 'react-i18next';

import i18n, { initializeI18n } from './i18n';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Screens
import { LoginScreen } from './screens/auth/LoginScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { ChatScreen } from './screens/chat/ChatScreen';

// Placeholder screens
const DiscoverScreen = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Discover</Text>
    </View>
);

const MatchesScreen = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Matches</Text>
    </View>
);

const MessagesScreen = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Messages</Text>
    </View>
);

const ProfileScreen = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Profile</Text>
    </View>
);

// Navigation stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack (Login, Signup, etc.)
function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0A0A0F' },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* Add SignUp, ForgotPassword screens here */}
        </Stack.Navigator>
    );
}

// Main Tab Navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#1A1A24',
                    borderTopColor: '#2A2A3A',
                },
                tabBarActiveTintColor: '#FF4D6A',
                tabBarInactiveTintColor: '#666',
                headerStyle: {
                    backgroundColor: '#0A0A0F',
                },
                headerTintColor: '#FFFFFF',
            }}
        >
            <Tab.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{ tabBarLabel: 'Discover' }}
            />
            <Tab.Screen
                name="Matches"
                component={MatchesScreen}
                options={{ tabBarLabel: 'Matches' }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{ tabBarLabel: 'Messages' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

// App Stack (includes modals and other screens)
function AppStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#0A0A0F',
                },
                headerTintColor: '#FFFFFF',
                contentStyle: { backgroundColor: '#0A0A0F' },
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ title: '' }}
            />
        </Stack.Navigator>
    );
}

// Navigation container with auth state
function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#FF4D6A" />
            </View>
        );
    }

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                    primary: '#FF4D6A',
                    background: '#0A0A0F',
                    card: '#1A1A24',
                    text: '#FFFFFF',
                    border: '#2A2A3A',
                    notification: '#FF4D6A',
                },
            }}
        >
            {isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

// Root App Component
export default function App() {
    const [isI18nReady, setI18nReady] = useState(false);

    useEffect(() => {
        // Initialize i18n on app start
        initializeI18n().then(() => {
            setI18nReady(true);
        });
    }, []);

    if (!isI18nReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#FF4D6A" />
            </View>
        );
    }

    return (
        <I18nextProvider i18n={i18n}>
            <AuthProvider>
                <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
                <AppNavigator />
            </AuthProvider>
        </I18nextProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A0A0F',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A0A0F',
    },
    placeholderText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
