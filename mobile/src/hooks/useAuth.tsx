/**
 * Auth Hook
 * 
 * Authentication state management
 */

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { Locale } from '../i18n';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    locale: Locale;
    timezone: string;
    region: string;
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string, locale?: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
}

interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    birthday: string;
    gender: string;
    locale?: string;
    timezone?: string;
}

const AUTH_STORAGE_KEY = '@indate/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // Load saved auth state on mount
    useEffect(() => {
        loadAuthState();
    }, []);

    const loadAuthState = async () => {
        try {
            const saved = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (saved) {
                const { user, token } = JSON.parse(saved);
                setState({
                    user,
                    token,
                    isLoading: false,
                    isAuthenticated: true,
                });
                // Set token for API calls
                api.setAuthToken(token);
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            console.error('Failed to load auth state:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const saveAuthState = async (user: User, token: string) => {
        try {
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
        } catch (error) {
            console.error('Failed to save auth state:', error);
        }
    };

    const clearAuthState = async () => {
        try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear auth state:', error);
        }
    };

    const login = useCallback(async (email: string, password: string, locale?: string) => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await api.post('/auth/login', { email, password, locale });
            const { user, token } = response.data;

            api.setAuthToken(token);
            await saveAuthState(user, token);

            setState({
                user,
                token,
                isLoading: false,
                isAuthenticated: true,
            });
        } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    const signup = useCallback(async (data: SignupData) => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await api.post('/auth/register', data);
            const { user, token } = response.data;

            api.setAuthToken(token);
            await saveAuthState(user, token);

            setState({
                user,
                token,
                isLoading: false,
                isAuthenticated: true,
            });
        } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore logout API errors
        }

        api.clearAuthToken();
        await clearAuthState();

        setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
        });
    }, []);

    const updateUser = useCallback((updates: Partial<User>) => {
        setState(prev => {
            if (!prev.user) return prev;

            const updatedUser = { ...prev.user, ...updates };
            saveAuthState(updatedUser, prev.token!);

            return { ...prev, user: updatedUser };
        });
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default { AuthProvider, useAuth };
