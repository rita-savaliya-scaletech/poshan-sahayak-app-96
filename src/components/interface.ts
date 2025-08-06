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

export interface ChatInterfaceProps {
  onNavigateToHistory?: () => void;
}

export interface ChatMessage {
  id: string;
  type: 'system' | 'user' | 'analysis' | 'questionnaire' | 'completion' | 'feedback_question' | 'menu_card';
  content: any;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  analysisResult?: unknown;
  questionnaireData?: unknown;
  status: 'completed' | 'pending' | 'missed';
  createdAt: Date;
  completedAt?: Date;
}
