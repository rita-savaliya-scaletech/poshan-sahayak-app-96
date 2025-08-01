export interface ChatMessage {
  id: string;
  type: 'system' | 'user' | 'analysis' | 'questionnaire' | 'completion' | 'feedback_question';
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
  status: 'completed' | 'pending';
  createdAt: Date;
  completedAt?: Date;
}

const STORAGE_KEY = 'poshan_chat_history';

export const saveChatSession = (session: ChatSession): void => {
  try {
    const existingHistory = getChatHistory();
    const updatedHistory = [session, ...existingHistory.filter((s) => s.id !== session.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save chat session:', error);
  }
};

export const getChatHistory = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((session) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
      messages: session.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
};

export const updateChatSession = (sessionId: string, updates: Partial<ChatSession>): void => {
  try {
    const history = getChatHistory();
    const sessionIndex = history.findIndex((s) => s.id === sessionId);

    if (sessionIndex !== -1) {
      history[sessionIndex] = { ...history[sessionIndex], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Failed to update chat session:', error);
  }
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getMealTypeFromTime = (): 'breakfast' | 'lunch' | 'dinner' => {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  return 'dinner';
};
