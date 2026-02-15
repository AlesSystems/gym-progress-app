// Native version - just re-export React Native's Alert
import { Alert as RNAlert } from 'react-native';

export const Alert = RNAlert;

// AlertProvider is not needed for native, but export it for compatibility
export function AlertProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
