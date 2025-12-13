/**
 * Login Screen
 * 
 * Authentication screen with i18n support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../i18n/hooks';

export function LoginScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { login, isLoading } = useAuth();
    const { locale } = useLocale();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!email) {
            newErrors.email = t('validation.email_required');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = t('validation.email_invalid');
        }

        if (!password) {
            newErrors.password = t('validation.password_required');
        } else if (password.length < 8) {
            newErrors.password = t('validation.password_min_length', { min: 8 });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            await login(email, password, locale);
        } catch (error: any) {
            Alert.alert(
                t('common.error'),
                error.message || t('errors.server_error')
            );
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword' as never);
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp' as never);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo/Title */}
                <View style={styles.header}>
                    <Text style={styles.title}>{t('auth.login_title')}</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('auth.email')}</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder={t('auth.email')}
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('auth.password')}</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={t('auth.password')}
                            placeholderTextColor="#999"
                            secureTextEntry
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={styles.forgotPassword}>{t('auth.forgot_password')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{t('auth.login_button')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Social Login */}
                <View style={styles.socialSection}>
                    <Text style={styles.orText}>{t('auth.or_continue_with')}</Text>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sign Up Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('auth.dont_have_account')}</Text>
                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={styles.signUpLink}>{t('auth.signup_button')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0F',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1A1A24',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },
    inputError: {
        borderColor: '#FF4D6A',
    },
    errorText: {
        fontSize: 12,
        color: '#FF4D6A',
        marginTop: 6,
    },
    forgotPassword: {
        fontSize: 14,
        color: '#FF6B8A',
        textAlign: 'right',
        marginTop: 8,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#FF4D6A',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    socialSection: {
        marginBottom: 32,
    },
    orText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialButton: {
        backgroundColor: '#1A1A24',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    signUpLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B8A',
        marginLeft: 6,
    },
});

export default LoginScreen;
