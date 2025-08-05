import { Capacitor } from '@capacitor/core';

export interface PWAContext {
  isPWA: boolean;
  isMobile: boolean;
  isStandalone: boolean;
  platform: string;
}

export const getPWAContext = (): PWAContext => {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const platform = Capacitor.getPlatform();

  return {
    isPWA: isStandalone || platform !== 'web',
    isMobile,
    isStandalone,
    platform,
  };
};

export const requestCameraPermission = async (): Promise<boolean> => {
  const context = getPWAContext();

  try {
    if (context.platform === 'web') {
      if (context.isPWA) {
        // For PWA, try to request camera permission through getUserMedia
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
          return true;
        } catch (permissionError) {
          console.error('Camera permission denied:', permissionError);
          return false;
        }
      } else {
        // For regular web, permissions are handled by file input
        return true;
      }
    } else {
      // For native platforms, use Capacitor Camera permissions
      const { Camera } = await import('@capacitor/camera');
      const permissions = await Camera.requestPermissions({
        permissions: ['camera', 'photos'],
      });
      return permissions.camera === 'granted' || permissions.photos === 'granted';
    }
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

export const requestLocationPermission = async (): Promise<boolean> => {
  const context = getPWAContext();

  try {
    if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          (error) => {
            console.error('Location permission error:', error);
            resolve(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      });
    }
    return false;
  } catch (error) {
    console.error('Location permission request error:', error);
    return false;
  }
};

export const showPermissionInstructions = (permissionType: 'camera' | 'location') => {
  const context = getPWAContext();

  if (permissionType === 'camera') {
    if (context.isPWA) {
      return 'Camera permission is required. Please allow camera access in your device settings or browser permissions.';
    } else {
      return 'Camera permission is required. Please allow camera access.';
    }
  } else {
    if (context.isPWA) {
      return 'Location permission is required for better service. Please allow location access in your device settings.';
    } else {
      return 'Location permission is required for better service. Please allow location access.';
    }
  }
};

export const checkPWASupport = () => {
  const context = getPWAContext();

  return {
    ...context,
    hasServiceWorker: 'serviceWorker' in navigator,
    hasGeolocation: 'geolocation' in navigator,
    hasMediaDevices: 'mediaDevices' in navigator,
    isHTTPS: window.location.protocol === 'https:',
    canInstall: 'BeforeInstallPromptEvent' in window,
  };
};

export const showPWAPrompt = () => {
  const context = getPWAContext();

  if (!context.isPWA && context.isMobile) {
    return 'For the best experience, consider installing this app on your device. Look for the "Add to Home Screen" option in your browser menu.';
  }

  return null;
};

export const getPermissionStatus = async () => {
  const context = getPWAContext();
  const status = {
    camera: false,
    location: false,
    notifications: false,
  };

  try {
    // Check camera permission
    if (context.platform === 'web' && 'permissions' in navigator) {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      status.camera = cameraPermission.state === 'granted';
    }

    // Check location permission
    if ('permissions' in navigator) {
      const locationPermission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      status.location = locationPermission.state === 'granted';
    }

    // Check notification permission
    if ('permissions' in navigator) {
      const notificationPermission = await navigator.permissions.query({ name: 'notifications' as PermissionName });
      status.notifications = notificationPermission.state === 'granted';
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
  }

  return status;
};
