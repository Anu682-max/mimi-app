import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { register } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        if (!firstName || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError('');
        setIsLoading(true);

        const result = await register({ email, password, firstName });

        if (!result.success) {
            setError(result.error || 'Registration failed');
        }

        setIsLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>← {t('common.back')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>{t('auth.signup_title')}</Text>

                    {/* Error */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Your name"
                                placeholderTextColor="#6B7280"
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.email')}</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('auth.email')}
                                placeholderTextColor="#6B7280"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.password')}</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder={t('auth.password')}
                                placeholderTextColor="#6B7280"
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.signupButtonText}>
                                    {t('auth.signup_button')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Login link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>{t('auth.login_button')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0F',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 24,
    },
    backText: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 32,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
    },
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1A1A24',
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 12,
        padding: 16,
        color: '#FFF',
        fontSize: 16,
    },
    signupButton: {
        backgroundColor: '#EC4899',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
    },
    signupButtonDisabled: {
        opacity: 0.6,
    },
    signupButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        color: '#9CA3AF',
    },
    loginLink: {
        color: '#EC4899',
        fontWeight: '600',
    },
});
