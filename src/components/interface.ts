export interface MenuItem {
  name: string;
  quantity: string;
  emoji: string;
}

export interface FeedbackOption {
  value: string;
  label: string;
  icon?: string;
}

export interface FeedbackQuestion {
  key: string;
  text: string;
  icon?: string;
  type: 'single' | 'multi';
  options: FeedbackOption[];
}

export interface ChatInterfaceProps {
  onNavigateToHistory?: () => void;
}
