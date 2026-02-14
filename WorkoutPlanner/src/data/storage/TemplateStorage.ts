import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplate } from '../models/WorkoutTemplate';

const TEMPLATES_KEY = '@workout_templates';

export class TemplateStorage {
  static async saveTemplate(template: WorkoutTemplate): Promise<void> {
    try {
      const templates = await this.getAllTemplates();
      const index = templates.findIndex(t => t.id === template.id);
      
      if (index >= 0) {
        templates[index] = template;
      } else {
        templates.push(template);
      }
      
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  static async getAllTemplates(): Promise<WorkoutTemplate[]> {
    try {
      const data = await AsyncStorage.getItem(TEMPLATES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  static async getTemplateById(id: string): Promise<WorkoutTemplate | null> {
    try {
      const templates = await this.getAllTemplates();
      return templates.find(t => t.id === id) || null;
    } catch (error) {
      console.error('Error getting template by id:', error);
      return null;
    }
  }

  static async deleteTemplate(id: string): Promise<void> {
    try {
      const templates = await this.getAllTemplates();
      const filtered = templates.filter(t => t.id !== id);
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
}
