import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { SUPPORTED_LOCALES, LOCALE_DISPLAY_NAMES, Locale } from '../config';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const { logout } = useAuth();

    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [showLanguageModal, setShowLanguageModal] = React.useState(false);

    const handleLogout = async () => {
        await logout();
    };

    const changeLanguage = (locale: Locale) => {
        i18n.changeLanguage(locale);
        setShowLanguageModal(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← {t('common.back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('settings.title')}</Text>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingText}>{t('profile.edit_profile')}</Text>
                        <Text style={styles.settingArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.language')}</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => setShowLanguageModal(true)}
                    >
                        <Text style={styles.settingText}>{t('settings.change_language')}</Text>
                        <Text style={styles.settingValue}>
                            {LOCALE_DISPLAY_NAMES[i18n.language as Locale] || 'English'} ›
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.settingItem}>
                        <Text style={styles.settingText}>{t('settings.notifications')}</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#374151', true: '#EC4899' }}
                            thumbColor="#FFF"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.settingItem}
                        onPress={() => (navigation as any).navigate('NotificationTest')}
                    >
                        <Text style={styles.settingText}>🔔 Test Notifications</Text>
                        <Text style={styles.settingArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Privacy Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingText}>{t('settings.privacy')}</Text>
                        <Text style={styles.settingArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>{t('settings.logout')}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Language Modal */}
            {showLanguageModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('settings.change_language')}</Text>
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        {SUPPORTED_LOCALES.map((locale) => (
                            <TouchableOpacity
                                key={locale}
                                style={[
                                    styles.languageItem,
                                    i18n.language === locale && styles.languageItemActive,
                                ]}
                                onPress={() => changeLanguage(locale)}
                            >
                                <Text style={[
                                    styles.languageText,
                                    i18n.language === locale && styles.languageTextActive,
                                ]}>
                                    {LOCALE_DISPLAY_NAMES[locale]}
                                </Text>
                                {i18n.language === locale && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0F',
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    backButton: {
        color: '#9CA3AF',
        fontSize: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1A1A24',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingText: {
        fontSize: 16,
        color: '#FFF',
    },
    settingValue: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    settingArrow: {
        fontSize: 20,
        color: '#6B7280',
    },
    logoutButton: {
        backgroundColor: '#1A1A24',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EC4899',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1A24',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    modalClose: {
        fontSize: 24,
        color: '#9CA3AF',
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#374151',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    languageItemActive: {
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
    },
    languageText: {
        fontSize: 16,
        color: '#FFF',
    },
    languageTextActive: {
        color: '#EC4899',
    },
    checkmark: {
        fontSize: 16,
        color: '#EC4899',
    },
});
