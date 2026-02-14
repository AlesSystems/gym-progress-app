import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SettingsStorage, AppSettings } from '../../data/storage/SettingsStorage';

export function SettingsScreen({ navigation }: any) {
  const { themeMode, isDarkMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await SettingsStorage.getSettings();
    setSettings(loaded);
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await SettingsStorage.updateSettings({ [key]: value });
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await SettingsStorage.resetSettings();
            await loadSettings();
          },
        },
      ]
    );
  };

  const styles = createStyles(isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content}>
          {/* Theme Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Theme</Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[styles.themeButton, themeMode === 'light' && styles.themeButtonActive]}
                  onPress={() => setThemeMode('light')}
                >
                  <Text style={[styles.themeButtonText, themeMode === 'light' && styles.themeButtonTextActive]}>☀️ Light</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.themeButton, themeMode === 'dark' && styles.themeButtonActive]}
                  onPress={() => setThemeMode('dark')}
                >
                  <Text style={[styles.themeButtonText, themeMode === 'dark' && styles.themeButtonTextActive]}>🌙 Dark</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.themeButton, themeMode === 'system' && styles.themeButtonActive]}
                  onPress={() => setThemeMode('system')}
                >
                  <Text style={[styles.themeButtonText, themeMode === 'system' && styles.themeButtonTextActive]}>📱 System</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Workout Settings */}
          {settings && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Workout Settings</Text>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Weight Unit</Text>
                  <View style={styles.segmentControl}>
                    <TouchableOpacity
                      style={[styles.segmentButton, settings.weightUnit === 'kg' && styles.segmentButtonActive]}
                      onPress={() => updateSetting('weightUnit', 'kg')}
                    >
                      <Text style={[styles.segmentButtonText, settings.weightUnit === 'kg' && styles.segmentButtonTextActive]}>KG</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.segmentButton, settings.weightUnit === 'lbs' && styles.segmentButtonActive]}
                      onPress={() => updateSetting('weightUnit', 'lbs')}
                    >
                      <Text style={[styles.segmentButtonText, settings.weightUnit === 'lbs' && styles.segmentButtonTextActive]}>LBS</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Rest Timer</Text>
                    <Text style={styles.settingDescription}>Automatic rest timer between sets</Text>
                  </View>
                  <Switch
                    value={settings.restTimerEnabled}
                    onValueChange={(value) => updateSetting('restTimerEnabled', value)}
                    trackColor={{ false: '#767577', true: '#007AFF' }}
                    thumbColor={isDarkMode ? '#f4f3f4' : '#fff'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Default Rest Time</Text>
                    <Text style={styles.settingDescription}>{settings.defaultRestTime} seconds</Text>
                  </View>
                </View>
              </View>

              {/* Feedback Settings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Feedback</Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Vibration</Text>
                    <Text style={styles.settingDescription}>Haptic feedback for actions</Text>
                  </View>
                  <Switch
                    value={settings.vibrationEnabled}
                    onValueChange={(value) => updateSetting('vibrationEnabled', value)}
                    trackColor={{ false: '#767577', true: '#007AFF' }}
                    thumbColor={isDarkMode ? '#f4f3f4' : '#fff'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Sound</Text>
                    <Text style={styles.settingDescription}>Sound effects for PRs</Text>
                  </View>
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={(value) => updateSetting('soundEnabled', value)}
                    trackColor={{ false: '#767577', true: '#007AFF' }}
                    thumbColor={isDarkMode ? '#f4f3f4' : '#fff'}
                  />
                </View>
              </View>
            </>
          )}

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Developer</Text>
              <Text style={styles.developerName}>Altan Esmer</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetSettings}
            >
              <Text style={styles.resetButtonText}>Reset All Settings</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with 💪 by Altan Esmer</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function createStyles(isDarkMode: boolean) {
  const bg = isDarkMode ? '#000000' : '#FFFFFF';
  const bgSecondary = isDarkMode ? '#1C1C1E' : '#F5F5F5';
  const surface = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const text = isDarkMode ? '#FFFFFF' : '#333333';
  const textSecondary = isDarkMode ? '#8E8E93' : '#666666';
  const border = isDarkMode ? '#333333' : '#E0E0E0';

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: bg,
    },
    container: {
      flex: 1,
      backgroundColor: bgSecondary,
    },
    header: {
      backgroundColor: bg,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 28,
      color: '#007AFF',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: text,
    },
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    section: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: textSecondary,
      textTransform: 'uppercase',
      marginBottom: 10,
      letterSpacing: 0.5,
    },
    settingRow: {
      backgroundColor: surface,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: border,
    },
    settingLabel: {
      fontSize: 17,
      color: text,
      fontWeight: '500',
    },
    settingLabelContainer: {
      flex: 1,
    },
    settingDescription: {
      fontSize: 13,
      color: textSecondary,
      marginTop: 2,
    },
    themeButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    themeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: bgSecondary,
    },
    themeButtonActive: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    themeButtonText: {
      fontSize: 14,
      color: text,
      fontWeight: '500',
    },
    themeButtonTextActive: {
      color: '#FFFFFF',
    },
    segmentControl: {
      flexDirection: 'row',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: border,
      overflow: 'hidden',
    },
    segmentButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: bgSecondary,
    },
    segmentButtonActive: {
      backgroundColor: '#007AFF',
    },
    segmentButtonText: {
      fontSize: 14,
      color: text,
      fontWeight: '600',
    },
    segmentButtonTextActive: {
      color: '#FFFFFF',
    },
    developerName: {
      fontSize: 17,
      color: '#007AFF',
      fontWeight: '600',
    },
    versionText: {
      fontSize: 17,
      color: textSecondary,
    },
    resetButton: {
      backgroundColor: surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#FF3B30',
    },
    resetButtonText: {
      color: '#FF3B30',
      fontSize: 17,
      fontWeight: '600',
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 30,
    },
    footerText: {
      fontSize: 14,
      color: textSecondary,
      fontWeight: '500',
    },
  });
}
