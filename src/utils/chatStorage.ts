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

const STORAGE_KEY = 'poshan_chat_history';

export const saveChatSession = (session: ChatSession): void => {
  try {
    const existingHistory = getAllChatSessions(); // Use internal function that gets all sessions
    const updatedHistory = [session, ...existingHistory.filter((s) => s.id !== session.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save chat session:', error);
  }
};

// Internal function to get all sessions without filtering
const getAllChatSessions = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((session: ChatSession) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
      messages: session.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Failed to load all chat sessions:', error);
    return [];
  }
};

export const getChatHistory = (): ChatSession[] => {
  try {
    const allSessions = getAllChatSessions();
    // Only return completed or missed sessions for history display
    return allSessions.filter((session: ChatSession) => session.status === 'completed' || session.status === 'missed');
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
};

export const updateChatSession = (sessionId: string, updates: Partial<ChatSession>): void => {
  try {
    const allSessions = getAllChatSessions();
    const sessionIndex = allSessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex !== -1) {
      allSessions[sessionIndex] = { ...allSessions[sessionIndex], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
    }
  } catch (error) {
    console.error('Failed to update chat session:', error);
  }
};

export const getSessionForMealToday = (mealType: 'breakfast' | 'lunch' | 'dinner'): ChatSession | null => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allSessions = getAllChatSessions(); // Use internal function to get all sessions
    return (
      allSessions.find(
        (session) => session.date === today && session.mealType === mealType && session.status === 'completed'
      ) || null
    );
  } catch (error) {
    console.error('Failed to get session for meal today:', error);
    return null;
  }
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getMealTypeFromTime = (): 'breakfast' | 'lunch' | null => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hour * 60 + minutes;

  // if (totalMinutes >= 510 && totalMinutes < 570) return 'breakfast'; // 8:30 – 9:30
  // if (totalMinutes >= 750 && totalMinutes < 810) return 'lunch'; // 12:30 – 1:30

  // return null; // Outside of meal time

  // Breakfast: 8:30 AM – 12:30 PM (510 – 750)
  if (totalMinutes >= 510 && totalMinutes < 750) {
    return 'breakfast';
  }

  // Lunch: 12:30 PM – next day 8:30 AM (750 – 1440 and 0 – 510)
  if (totalMinutes >= 750 || totalMinutes < 510) {
    return 'lunch';
  }

  // Just in case (should never reach here)
  return null;
};
