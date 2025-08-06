import { Capacitor } from '@capacitor/core';

export interface PWAContext {
  isPWA: boolean;
  isStandalone: boolean;
  platform: string;
}

export const getPWAContext = (): PWAContext => {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  const platform = Capacitor.getPlatform();

  return {
    isPWA: isStandalone || platform !== 'web',
    isStandalone,
    platform,
  };
};
