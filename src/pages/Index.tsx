import { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import LanguageSelection from '@/components/LanguageSelection';
import ChatInterface from '@/components/ChatInterface';
import HistoryDashboard from '@/components/HistoryDashboard';
import ProfileScreen from '@/components/ProfileScreen';
import BottomNavigation from '@/components/BottomNavigation';

type AppState = 'splash' | 'language' | 'main';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('splash');
  const [activeTab, setActiveTab] = useState('chat');

  const handleSplashComplete = () => {
    // setAppState('language');
    localStorage.setItem('language', 'gu');
    setAppState('main');
  };

  /*  const handleLanguageSelect = () => {
    setAppState('main');
  }; */

  const handleNavigateToHistory = () => {
    setActiveTab('history');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface onNavigateToHistory={handleNavigateToHistory} />;
      case 'history':
        return <HistoryDashboard />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <ChatInterface onNavigateToHistory={handleNavigateToHistory} />;
    }
  };

  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  /* if (appState === 'language') {
    return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  } */

  return (
    <div className="h-screen flex flex-col bg-background min-w-[320px] max-w-[768px] mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
