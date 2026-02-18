/**
 * mimi Mobile App — Үндсэн навигацийн бүтэц
 * Tinder загварын дизайн
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { I18nextProvider } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import i18n, { initializeI18n } from './i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Бодит дэлгэцүүд
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import CallScreen from './screens/CallScreen';
import IncomingCallModal from './components/IncomingCallModal';

// Навигацийн стек, таб
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Нэвтрэлтийн стек (Login, Signup)
function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
    );
}

// Үндсэн таб навигатор
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#E8E6EA',
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarActiveTintColor: '#FF4458',
                tabBarInactiveTintColor: '#656E7B',
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E8E6EA',
                },
                headerTintColor: '#21262E',
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
                // Таб icon-ууд
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'heart';
                    if (route.name === 'Discover') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Matches') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'Messages') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{ title: 'Discover' }}
            />
            <Tab.Screen
                name="Matches"
                component={MatchesScreen}
                options={{ title: 'Matches' }}
            />
            <Tab.Screen
                name="Messages"
                component={ChatListScreen}
                options={{ title: 'Messages' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

// App стек (модал дэлгэцүүд орно)
function AppStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#21262E',
                headerTitleStyle: {
                    fontWeight: '700',
                },
                contentStyle: { backgroundColor: '#F0F2F4' },
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
            <Stack.Screen
                name="Call"
                component={CallScreen}
                options={{
                    headerShown: false,
                    presentation: 'fullScreenModal',
                    contentStyle: { backgroundColor: '#111111' },
                }}
            />
        </Stack.Navigator>
    );
}

// Навигацийн контейнер — нэвтрэлтийн төлөв шалгах
function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#FF4458" />
            </View>
        );
    }

    return (
        <NavigationContainer
            theme={{
                dark: false,
                colors: {
                    primary: '#FF4458',
                    background: '#F0F2F4',
                    card: '#FFFFFF',
                    text: '#21262E',
                    border: '#E8E6EA',
                    notification: '#FF4458',
                },
                fonts: {
                    regular: { fontFamily: 'System', fontWeight: '400' },
                    medium: { fontFamily: 'System', fontWeight: '500' },
                    bold: { fontFamily: 'System', fontWeight: '700' },
                    heavy: { fontFamily: 'System', fontWeight: '900' },
                },
            }}
        >
            {isAuthenticated ? <AppStack /> : <AuthStack />}
            {/* Ирж буй дуудлагын глобал модал */}
            {isAuthenticated && <IncomingCallModal />}
        </NavigationContainer>
    );
}

// Үндсэн App компонент
export default function App() {
    const [isI18nReady, setI18nReady] = useState(false);

    useEffect(() => {
        initializeI18n().then(() => {
            setI18nReady(true);
        });
    }, []);

    if (!isI18nReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#FF4458" />
            </View>
        );
    }

    return (
        <I18nextProvider i18n={i18n}>
            <AuthProvider>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
        backgroundColor: '#FFFFFF',
    },
});
