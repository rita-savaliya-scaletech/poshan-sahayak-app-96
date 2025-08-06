import { useEffect, useRef, useState } from 'react';
import { X, Download } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { isMobile } from '@/utils/chatStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '/icon-512.png';

const PWAInstallPrompt = () => {
  const { showInstallPrompt, installApp, dismissPrompt, canInstall, getInstallInstructions } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  // Duration to auto-hide (5000s).
  const AUTO_HIDE_MS = 5000;

  // When the hook says showInstallPrompt and not dismissed, show the banner.
  useEffect(() => {
    if (!isMobile()) {
      // Don't run on non-mobile
      return;
    }
    if (showInstallPrompt && !isDismissed) {
      // start visible (with animation)
      setIsVisible(true);

      // start auto-hide timer
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        // mark dismissed after animation completes (allow 200ms for animation)
        window.setTimeout(() => {
          setIsDismissed(true);
          dismissPrompt();
        }, 200);
      }, AUTO_HIDE_MS);
    }

    // If not showing, ensure visible false and clear timers
    if (!showInstallPrompt || isDismissed) {
      setIsVisible(false);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInstallPrompt, isDismissed]);

  // clear timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  if (!showInstallPrompt || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    // stop auto-hide while handling install
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    const success = await installApp();
    if (!success && !canInstall) {
      // fallback for iOS / unsupported browsers
      alert(getInstallInstructions());
    }

    // hide banner after attempt
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      dismissPrompt();
    }, 200);
  };

  const handleDismiss = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      dismissPrompt();
    }, 200);
  };

  return (
    // top-center banner; pointer-events trick so it doesn't block other interactions
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div
        className={`mx-auto w-full max-w-sm pointer-events-auto transition-all duration-200 ease-out
          ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
        role="dialog"
        aria-live="polite"
      >
        <Card className="relative overflow-hidden rounded-lg border border-neutral-200/30 bg-[rgba(255,249,240,0.98)] backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
          <CardHeader className="px-3 py-2 pb-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent">
                  <img src={Logo} alt="logo" className="h-6 w-auto" />
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-sm leading-tight">AI Poshan Tracker</CardTitle>
                  <CardDescription className="text-xs text-neutral-600">
                    Install Poshan Tracker for a better experience
                  </CardDescription>
                </div>
              </div>

              <button
                aria-label="Close install banner"
                onClick={handleDismiss}
                className="ml-2 -mr-1 rounded-md p-1 text-neutral-700 hover:bg-neutral-100/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="px-3 pb-3 pt-2">
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#2eb85c] hover:bg-[#28a651] text-white text-xs"
              >
                <Download className="h-3 w-3" />
                Install
              </Button>

              <Button variant="outline" onClick={handleDismiss} size="sm" className="text-xs rounded-md px-3">
                Later
              </Button>
            </div>
          </CardContent>

          <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-neutral-200/30 to-transparent pointer-events-none" />
        </Card>
      </div>
    </div>
  );
};
export default PWAInstallPrompt;
