/**
 * Settings Screen
 * 
 * App settings with language selector
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Modal,
    FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../hooks/useAuth';
import { useLanguageSelector, useLocale } from '../../i18n/hooks';

interface SettingItemProps {
    label: string;
    value?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
}

function SettingItem({ label, value, onPress, hasSwitch, switchValue, onSwitchChange }: SettingItemProps) {
    return (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={hasSwitch}
        >
            <Text style={styles.settingLabel}>{label}</Text>
            {hasSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#2A2A3A', true: '#FF4D6A' }}
                    thumbColor="#FFFFFF"
                />
            ) : (
                <View style={styles.settingValueContainer}>
                    {value && <Text style={styles.settingValue}>{value}</Text>}
                    <Text style={styles.chevron}>›</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

export function SettingsScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { logout } = useAuth();
    const { locale, localeDisplayNames } = useLocale();
    const { languages, selectLanguage, isChanging } = useLanguageSelector();

    const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
    const [isDarkMode, setDarkMode] = useState(true);
    const [autoTranslate, setAutoTranslate] = useState(true);

    const handleLanguageSelect = async (code: string) => {
        await selectLanguage(code as any);
        setLanguageModalVisible(false);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{t('settings.title')}</Text>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.account')}</Text>

                    <SettingItem
                        label={t('profile.edit_profile')}
                        onPress={() => navigation.navigate('EditProfile' as never)}
                    />
                    <SettingItem
                        label={t('verification.title')}
                        onPress={() => navigation.navigate('Verification' as never)}
                    />
                </View>

                {/* Discovery Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.discovery_settings')}</Text>

                    <SettingItem
                        label={t('settings.distance_preference')}
                        value="50 km"
                        onPress={() => { }}
                    />
                    <SettingItem
                        label={t('settings.age_range_preference')}
                        value="18-35"
                        onPress={() => { }}
                    />
                    <SettingItem
                        label={t('settings.show_me_on_app')}
                        hasSwitch
                        switchValue={true}
                        onSwitchChange={() => { }}
                    />
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.notifications_setting')}</Text>

                    <SettingItem
                        label={t('settings.notifications_setting')}
                        onPress={() => { }}
                    />
                    <SettingItem
                        label={t('settings.dark_mode')}
                        hasSwitch
                        switchValue={isDarkMode}
                        onSwitchChange={setDarkMode}
                    />
                </View>

                {/* Language & Translation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.language')}</Text>

                    <SettingItem
                        label={t('settings.change_language')}
                        value={localeDisplayNames[locale]}
                        onPress={() => setLanguageModalVisible(true)}
                    />
                    <SettingItem
                        label={t('chat.auto_translate')}
                        hasSwitch
                        switchValue={autoTranslate}
                        onSwitchChange={setAutoTranslate}
                    />
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.help_support')}</Text>

                    <SettingItem
                        label={t('settings.help_support')}
                        onPress={() => { }}
                    />
                    <SettingItem
                        label={t('settings.about')}
                        onPress={() => { }}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>{t('settings.logout')}</Text>
                </TouchableOpacity>

                {/* Delete Account */}
                <TouchableOpacity style={styles.deleteButton} onPress={() => { }}>
                    <Text style={styles.deleteText}>{t('settings.delete_account')}</Text>
                </TouchableOpacity>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                visible={isLanguageModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('settings.change_language')}</Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={languages}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.languageItem,
                                        item.isSelected && styles.languageItemSelected,
                                    ]}
                                    onPress={() => handleLanguageSelect(item.code)}
                                    disabled={isChanging}
                                >
                                    <Text
                                        style={[
                                            styles.languageName,
                                            item.isSelected && styles.languageNameSelected,
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                    {item.isSelected && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0F',
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1A1A24',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    settingLabel: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    settingValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    chevron: {
        fontSize: 20,
        color: '#666',
    },
    logoutButton: {
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#1A1A24',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B8A',
    },
    deleteButton: {
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        alignItems: 'center',
    },
    deleteText: {
        fontSize: 14,
        color: '#666',
    },
    bottomPadding: {
        height: 40,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1A24',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A3A',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    modalClose: {
        fontSize: 20,
        color: '#666',
        padding: 4,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A3A',
    },
    languageItemSelected: {
        backgroundColor: 'rgba(255, 77, 106, 0.1)',
    },
    languageName: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    languageNameSelected: {
        color: '#FF4D6A',
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 18,
        color: '#FF4D6A',
        fontWeight: '700',
    },
});

export default SettingsScreen;
