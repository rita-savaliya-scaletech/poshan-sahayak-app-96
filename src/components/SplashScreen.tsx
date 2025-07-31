import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/15">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Logo - Matching the reference image style */}
        <div className="w-28 h-28 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-primary/20">
          <div className="text-5xl">🌱</div>
        </div>
        
        {/* App Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-primary">AI {t('appName')}</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Empowering Nutrition. Powered by AI.
          </p>
        </div>
        
        {/* Loading Animation - Matching reference dots style */}
        <div className="flex items-center justify-center space-x-1">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Government Branding - Bottom positioning like reference */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-sm text-muted-foreground">
          <p className="font-medium">Gujarat Education Department</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;