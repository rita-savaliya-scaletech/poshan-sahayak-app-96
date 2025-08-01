import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, School, MapPin, Languages, Settings, LogOut, Bell, HelpCircle, Check } from 'lucide-react';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  // Mock teacher data - in real app, this would come from authentication
  const teacherData = {
    name: 'Priya Sharma',
    id: 'TCH001',
    school: 'Government Primary School, Sector 15',
    district: 'Gandhinagar',
    state: 'Gujarat',
    language: i18n.language === 'gu' ? t('gujarati') : t('english'),
    joinDate: '2023-04-15',
    totalReports: 45,
    rank: 'Senior Teacher',
  };

  const handleLanguageSwitch = (newLang: string) => {
    i18n.changeLanguage(newLang);
    setShowLanguageDialog(false);
  };

  const menuItems = [
    { icon: Languages, label: t('changeLanguage', 'Change Language'), action: () => setShowLanguageDialog(true) },
    { icon: Bell, label: t('notifications', 'Notifications'), action: () => {} },
    { icon: HelpCircle, label: t('helpSupport', 'Help & Support'), action: () => {} },
    { icon: Settings, label: t('settings', 'Settings'), action: () => {} },
  ];

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10">
      {/* Header - Matching splash screen style */}
      <div className="p-6 bg-white/90 backdrop-blur-sm border-b border-primary/20 shadow-sm">
        <h2 className="text-2xl font-bold text-primary">{t('profile')}</h2>
        <p className="text-muted-foreground font-medium">Manage your account information</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card - Enhanced style */}
        <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-primary/10 rounded-2xl">
          <div className="space-y-4">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary">{teacherData.name}</h3>
                <p className="text-muted-foreground font-medium">ID: {teacherData.id}</p>
                <Badge variant="secondary" className="bg-primary text-white px-3 py-1 rounded-full shadow-sm">
                  {teacherData.rank}
                </Badge>
              </div>
            </div>

            {/* School Info */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center space-x-3">
                <School className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{teacherData.school}</p>
                  <p className="text-sm text-muted-foreground">School</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {teacherData.district}, {teacherData.state}
                  </p>
                  <p className="text-sm text-muted-foreground">Location</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Languages className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{teacherData.language}</p>
                  <p className="text-sm text-muted-foreground">Preferred Language</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Card - Enhanced style */}
        <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-primary/10 rounded-2xl">
          <h4 className="font-bold mb-4 text-primary">Activity Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
              <p className="text-3xl font-bold text-primary">{teacherData.totalReports}</p>
              <p className="text-sm text-muted-foreground font-medium">Total Reports</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl border border-secondary/20">
              <p className="text-3xl font-bold text-secondary">98%</p>
              <p className="text-sm text-muted-foreground font-medium">Accuracy Rate</p>
            </div>
          </div>
        </Card>

        {/* Menu Items - Enhanced style */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-primary/10 rounded-2xl overflow-hidden divide-y divide-border/50">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center space-x-4 p-5 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="flex-1 text-left font-semibold text-foreground">{item.label}</span>
                <div className="w-3 h-3 bg-primary/20 rounded-full"></div>
              </button>
            );
          })}
        </Card>

        {/* Government Info - Enhanced style */}
        <Card className="p-6 bg-gradient-to-r from-govt-blue/10 to-govt-blue/15 border-2 border-govt-blue/30 rounded-2xl shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-2xl">🇮🇳</div>
              </div>
              <h4 className="font-bold text-govt-blue text-lg">Government of Gujarat</h4>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Ministry of Education • Sarva Shiksha Abhiyan</p>
            <p className="text-xs text-muted-foreground">
              Member since: {new Date(teacherData.joinDate).toLocaleDateString()}
            </p>
          </div>
        </Card>

        {/* Logout Button - Enhanced style */}
        {/* <Button
          variant="outline"
          className="w-full border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl py-3 font-semibold shadow-lg"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button> */}
      </div>

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-primary">
              <Languages className="w-5 h-5 mr-2" />
              Choose Language
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSwitch(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  i18n.language === lang.code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{lang.code === 'en' ? '🇺🇸' : '🇮🇳'}</div>
                  <div className="text-left">
                    <p className="font-semibold">{lang.nativeName}</p>
                    <p className="text-sm text-muted-foreground">{lang.name}</p>
                  </div>
                </div>
                {i18n.language === lang.code && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileScreen;
