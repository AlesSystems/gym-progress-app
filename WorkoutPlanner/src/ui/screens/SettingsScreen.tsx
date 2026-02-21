import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SettingsStorage, AppSettings } from '../../data/storage/SettingsStorage';
import { FirebaseSync } from '../../data/storage/FirebaseSync';
import { spacing, borderRadius, typography } from '../theme';
import { Alert } from '../utils/Alert';
import { ActiveWorkoutBanner } from '../components/ActiveWorkoutBanner';

export function SettingsScreen({ navigation }: any) {
  const { themeMode, isDarkMode, setThemeMode, colors } = useTheme();
  const { user, isAuthenticated, isFirebaseEnabled } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSyncStatus();
  }, []);

  const loadSettings = async () => {
    const loaded = await SettingsStorage.getSettings();
    setSettings(loaded);
  };

  const loadSyncStatus = async () => {
    const status = await FirebaseSync.getSyncStatus();
    setSyncStatus(status);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const workoutsData = await AsyncStorage.getItem('@workouts');
      const templatesData = await AsyncStorage.getItem('@workout_templates');
      
      const workouts = workoutsData ? JSON.parse(workoutsData) : [];
      const templates = templatesData ? JSON.parse(templatesData) : [];
      
      await FirebaseSync.performFullSync(workouts, templates);
      await loadSyncStatus();
      
      Alert.alert('Success', 'Your data has been synced to the cloud!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data. Please try again.');
      console.error('[Settings] Manual sync error:', error);
    } finally {
      setIsSyncing(false);
    }
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

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
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
                    trackColor={{ false: colors.textMuted, true: colors.primary }}
                    thumbColor={colors.surface}
                  />
                </View>

                {settings.restTimerEnabled && (
                  <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                      <Text style={styles.settingLabel}>Default Rest Time</Text>
                      <Text style={styles.settingDescription}>{settings.defaultRestTime} seconds</Text>
                    </View>
                    <View style={styles.restTimeControls}>
                      <TouchableOpacity
                        style={styles.restTimeButton}
                        onPress={() => updateSetting('defaultRestTime', Math.max(30, settings.defaultRestTime - 15))}
                      >
                        <Text style={styles.restTimeButtonText}>-15</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.restTimeButton}
                        onPress={() => updateSetting('defaultRestTime', Math.min(300, settings.defaultRestTime + 15))}
                      >
                        <Text style={styles.restTimeButtonText}>+15</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
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
                    trackColor={{ false: colors.textMuted, true: colors.primary }}
                    thumbColor={colors.surface}
                  />
                </View>
              </View>
            </>
          )}

          {/* Cloud Backup Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cloud Backup</Text>
            
            {isFirebaseEnabled ? (
              <>
                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Sync Status</Text>
                    <Text style={styles.settingDescription}>
                      {isAuthenticated 
                        ? '✅ Connected - Your data is backed up' 
                        : '⚠️ Connecting...'}
                    </Text>
                  </View>
                </View>

                {syncStatus && (
                  <>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Last Sync</Text>
                      <Text style={styles.settingValue}>
                        {new Date(syncStatus.lastSync).toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Workouts Synced</Text>
                      <Text style={styles.settingValue}>{syncStatus.workoutsCount}</Text>
                    </View>

                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Templates Synced</Text>
                      <Text style={styles.settingValue}>{syncStatus.templatesCount}</Text>
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={styles.syncButton}
                  onPress={handleManualSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color={colors.textOnPrimary} />
                  ) : (
                    <Text style={styles.syncButtonText}>🔄 Sync Now</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    💡 Your workout data is automatically backed up to the cloud. 
                    You won't lose your data when updating the app!
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  ⚠️ Cloud backup is not configured. Your data is stored locally only.
                  To enable cloud backup, configure Firebase in your environment.
                </Text>
              </View>
            )}
          </View>

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
        <ActiveWorkoutBanner navigation={navigation} currentScreen="Settings" />
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.primary,
    },
    title: {
      ...typography.title2,
      color: colors.text,
    },
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    section: {
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
      ...typography.caption1,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      marginBottom: spacing.sm,
      letterSpacing: 0.5,
    },
    settingRow: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderRadius: borderRadius.md,
      marginBottom: 1,
    },
    settingLabel: {
      ...typography.body,
      color: colors.text,
      fontWeight: '500',
    },
    settingLabelContainer: {
      flex: 1,
    },
    settingDescription: {
      ...typography.caption1,
      color: colors.textSecondary,
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
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    themeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    themeButtonText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    themeButtonTextActive: {
      color: colors.textOnPrimary,
    },
    segmentControl: {
      flexDirection: 'row',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    segmentButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: colors.background,
    },
    segmentButtonActive: {
      backgroundColor: colors.primary,
    },
    segmentButtonText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    segmentButtonTextActive: {
      color: colors.textOnPrimary,
    },
    developerName: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
    },
    versionText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    settingValue: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: '400',
    },
    syncButton: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    syncButtonText: {
      color: colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    infoCard: {
      backgroundColor: colors.surfaceHighlight,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.sm,
    },
    infoText: {
      ...typography.caption1,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    resetButton: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.danger,
    },
    resetButtonText: {
      color: colors.danger,
      fontSize: 17,
      fontWeight: '600',
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 30,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    restTimeControls: {
      flexDirection: 'row',
      gap: 10,
    },
    restTimeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 8,
    },
    restTimeButtonText: {
      color: colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
