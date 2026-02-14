import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@app_settings';

export interface AppSettings {
  weightUnit: 'kg' | 'lbs';
  restTimerEnabled: boolean;
  defaultRestTime: number;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  weightUnit: 'kg',
  restTimerEnabled: true,
  defaultRestTime: 90,
  vibrationEnabled: true,
  soundEnabled: false,
};

export class SettingsStorage {
  static async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  static async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}
