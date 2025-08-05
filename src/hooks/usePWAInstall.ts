import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    if (!isStandalone) {
      // Listen for the beforeinstallprompt event but don't prevent default
      // This allows the browser to show its native install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        console.log('beforeinstallprompt event fired - browser will show native prompt');
        setDeferredPrompt(e as BeforeInstallPromptEvent);

        // Allow browser to show native install prompt for a few seconds
        setTimeout(() => {
          // Store the event but don't prevent the native prompt
        }, 3000);
      };

      // Listen for app installed event
      const handleAppInstalled = () => {
        console.log('PWA was installed');
        setIsInstalled(true);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  return {
    isInstalled,
    canInstall: !!deferredPrompt,
  };
};
