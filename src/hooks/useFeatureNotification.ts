// src/hooks/useFeatureNotification.ts
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'k8s-rbactory:feature-notification-dismissed';

interface UseFeatureNotificationReturn {
  shouldShowNotification: boolean;
  dismissOnce: () => void;
  dismissPermanently: () => void;
}

/**
 * Hook to manage feature notification state
 * Checks if user has previously dismissed the notification
 */
export const useFeatureNotification = (
  featureDisabled: boolean
): UseFeatureNotificationReturn => {
  const [shouldShowNotification, setShouldShowNotification] = useState(false);

  useEffect(() => {
    // Only show if feature is disabled and user hasn't dismissed it
    if (featureDisabled) {
      try {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
          setShouldShowNotification(true);
        }
      } catch (error) {
        // If localStorage is unavailable, don't show notification
        // to avoid annoying users on every page load
        console.warn('localStorage unavailable:', error);
      }
    }
  }, [featureDisabled]);

  const dismissOnce = useCallback(() => {
    setShouldShowNotification(false);
  }, []);

  const dismissPermanently = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      setShouldShowNotification(false);
    } catch (error) {
      console.error('Failed to save dismissal preference:', error);
      // Still dismiss for this session
      setShouldShowNotification(false);
    }
  }, []);

  return {
    shouldShowNotification,
    dismissOnce,
    dismissPermanently,
  };
};

