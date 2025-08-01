import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LanguageSelectionProps {
  onLanguageSelect: (language: string) => void;
}

const LanguageSelection = ({ onLanguageSelect }: LanguageSelectionProps) => {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = (lng: string) => {
    i18n.changeLanguage(lng);
    onLanguageSelect(lng);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/15 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-strong bg-card/95 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🌍</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('selectLanguage')}</h2>
          <p className="text-muted-foreground">Choose your preferred language</p>
        </div>

        {/* Language Options */}
        <div className="space-y-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-16 text-left justify-start bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-2 hover:border-primary"
            onClick={() => handleLanguageSelect('en')}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <div className="font-semibold text-lg">English</div>
                <div className="text-sm opacity-70">Select for English interface</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-16 text-left justify-start bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-2 hover:border-primary"
            onClick={() => handleLanguageSelect('gu')}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <div className="font-semibold text-lg">ગુજરાતી</div>
                <div className="text-sm opacity-70">ગુજરાતી ઇન્ટરફેસ માટે પસંદ કરો</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">Government of Gujarat • Ministry of Education</p>
        </div>
      </Card>
    </div>
  );
};

export default LanguageSelection;
