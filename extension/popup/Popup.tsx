/**
 * Popup UI: Main router component
 */

import { useEffect } from 'react';
import { useStore } from './store';

// Screen components
import { LockedScreen } from './screens/LockedScreen';
import { OnboardingStartScreen } from './screens/OnboardingStartScreen';
import { OnboardingCreateScreen } from './screens/OnboardingCreateScreen';
import { HomeScreen } from './screens/HomeScreen';
import {
  OnboardingSuccessScreen,
  OnboardingImportScreen,
  SendScreen,
  ReceiveScreen,
  SettingsScreen,
} from './screens/PlaceholderScreens';

export function Popup() {
  const { currentScreen, initialize } = useStore();

  // Initialize app on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Simple router - render screen based on current state
  switch (currentScreen) {
    // Onboarding
    case 'onboarding-start':
      return <OnboardingStartScreen />;
    case 'onboarding-create':
      return <OnboardingCreateScreen />;
    case 'onboarding-success':
      return <OnboardingSuccessScreen />;
    case 'onboarding-import':
      return <OnboardingImportScreen />;

    // Main app
    case 'home':
      return <HomeScreen />;
    case 'settings':
      return <SettingsScreen />;

    // Transactions
    case 'send':
      return <SendScreen />;
    case 'receive':
      return <ReceiveScreen />;

    // System
    case 'locked':
      return <LockedScreen />;

    // Default fallback
    default:
      return <div>Unknown screen: {currentScreen}</div>;
  }
}
