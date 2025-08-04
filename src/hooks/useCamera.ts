import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export interface CameraResult {
  dataUrl: string;
  format: string;
}

export const useCamera = () => {
  const takePicture = async (): Promise<CameraResult | null> => {
    try {
      // Check if running on web
      if (Capacitor.getPlatform() === 'web') {
        return await selectFromWebInput();
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        return {
          dataUrl: image.dataUrl,
          format: image.format,
        };
      }
      return null;
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to capture photo. Please try again.');
      return null;
    }
  };

  const selectFromGallery = async (): Promise<CameraResult | null> => {
    try {
      // Check if running on web
      if (Capacitor.getPlatform() === 'web') {
        return await selectFromWebInput();
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        return {
          dataUrl: image.dataUrl,
          format: image.format,
        };
      }
      return null;
    } catch (error) {
      console.error('Gallery error:', error);
      toast.error('Failed to select photo. Please try again.');
      return null;
    }
  };

  const selectFromWebInput = (): Promise<CameraResult | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Prefer rear camera on mobile
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              dataUrl: reader.result as string,
              format: file.type,
            });
          };
          reader.onerror = () => {
            toast.error('Failed to read image file.');
            resolve(null);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  };

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
    takePicture,
    selectFromGallery,
    requestPermissions,
  };
};
