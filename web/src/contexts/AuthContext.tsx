'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: string;
    locale: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, password: string, firstName: string, birthday: string, gender: string, lastName?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3699';
console.log('AuthContext configured with API_URL:', API_URL);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        // Check localStorage first (remember me)
        let savedToken = localStorage.getItem('token');
        let savedUser = localStorage.getItem('user');

        // If not in localStorage, check sessionStorage
        if (!savedToken) {
            savedToken = sessionStorage.getItem('token');
            savedUser = sessionStorage.getItem('user');
        }

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                return { success: false, error: "Server error: Received non-JSON response" };
            }

            if (response.ok) {
                setUser(data.user);
                setToken(data.token);

                if (rememberMe) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                }

                return { success: true };
            } else {
                const errorMessage = typeof data.error === 'string'
                    ? data.error
                    : (data.error?.message || data.message || 'Login failed');
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please check if the backend server is running.' };
        }
    };

    const signup = async (email: string, password: string, firstName: string, birthday: string, gender: string, lastName?: string) => {
        try {
            console.log("Signup attempting fetch to:", `${API_URL}/api/v1/auth/register`);
            const response = await fetch(`${API_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, firstName, lastName, birthday, gender }),
            });
            console.log("Signup response status:", response.status);

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                return { success: false, error: "Server error: Received non-JSON response" };
            }

            if (response.ok) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true };
            } else {
                const errorMessage = typeof data.error === 'string'
                    ? data.error
                    : (data.error?.message || data.message || 'Signup failed');
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
