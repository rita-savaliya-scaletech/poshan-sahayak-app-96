import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export interface CameraResult {
  dataUrl: string;
  format: string;
}

export const useCamera = () => {
  const requestPermissions = async () => {
    try {
      // On web, we need to request permissions explicitly
      if (Capacitor.getPlatform() === 'web') {
        // Check if we're in a PWA context
        const isPWA =
          window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

        if (isPWA) {
          // For PWA, try to request camera permission through getUserMedia
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
            return true;
          } catch (permissionError) {
            console.error('Camera permission denied:', permissionError);
            toast.error(
              'Camera permission is required to take photos. Please allow camera access in your browser settings.'
            );
            return false;
          }
        } else {
          // For regular web, permissions are handled by file input
          return true;
        }
      }

      // For native platforms, use Capacitor Camera permissions
      const permissions = await Camera.requestPermissions({
        permissions: ['camera', 'photos'],
      });
      return permissions.camera === 'granted' || permissions.photos === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      toast.error('Failed to request camera permissions. Please check your device settings.');
      return false;
    }
  };

  return {
    requestPermissions,
  };
};
