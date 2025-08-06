import { ChatSession } from '@/components/interface';

const STORAGE_KEY = 'poshan_chat_history';

const MEAL_TIMES = {
  BREAKFAST_START: 510, // 8:30
  BREAKFAST_END: 570, // 9:30
  LUNCH_START: 750, // 12:30
  LUNCH_END: 810, // 13:30
  DINNER_START: 960, // 4:00 PM
};

const MEAL_LABELS = {
  breakfast: 'breakfasts',
  lunch: 'lunch',
  dinner: 'dinners',
};

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

const toMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();
export const getMealTypeFromTime = (now = new Date()): keyof typeof MEAL_LABELS | null => {
  const mins = toMinutes(now);
  const { BREAKFAST_START, LUNCH_START, DINNER_START } = MEAL_TIMES;

  if (mins >= BREAKFAST_START && mins < LUNCH_START) return 'breakfast';
  if (mins >= LUNCH_START && mins < DINNER_START) return 'lunch';
  return 'dinner';
};

export const getMealInfo = (now = new Date()) => {
  const mins = toMinutes(now);
  const { BREAKFAST_START, BREAKFAST_END, LUNCH_START, LUNCH_END } = MEAL_TIMES;

  if (mins < BREAKFAST_START) {
    return { currentMealKey: null, nextMealKey: MEAL_LABELS.breakfast, nextMealTime: '8:30 – 9:30 AM' };
  }
  if (mins <= BREAKFAST_END) {
    return { currentMealKey: MEAL_LABELS.breakfast, nextMealKey: MEAL_LABELS.lunch, nextMealTime: '12:30 – 1:30 PM' };
  }
  if (mins < LUNCH_START) {
    return { currentMealKey: null, nextMealKey: MEAL_LABELS.lunch, nextMealTime: '12:30 – 1:30 PM' };
  }
  if (mins <= LUNCH_END) {
    return { currentMealKey: MEAL_LABELS.lunch, nextMealKey: MEAL_LABELS.breakfast, nextMealTime: '8:30 – 9:30 AM' };
  }
  return { currentMealKey: null, nextMealKey: MEAL_LABELS.breakfast, nextMealTime: '8:30 – 9:30 AM' };
};

// Build localized placeholders for completed meal
export const buildPlaceholdersForCompleted = (t: any, completedMealKey: string | null) => {
  // completedMealKey is expected to be e.g. 'breakfasts' or 'lunch'
  const { nextMealKey, nextMealTime } = getMealInfo();

  // localize meal names
  const completedMealLabel = completedMealKey ? t(completedMealKey) : '';
  let nextMealLabel = nextMealKey ? t(nextMealKey) : '';

  // If the user completed lunch, the next breakfast occurs tomorrow — prefix with `tomorrow`
  if (completedMealKey === 'lunch') {
    nextMealLabel = `${t('tomorrow')} ${t('breakfasts')}`; // "કાલે નાસ્તા"
  }

  return {
    currentMeal: completedMealLabel,
    nextMeal: nextMealLabel,
    nextMealTime,
  };
};

// Helper to get dynamic greeting
export const getDynamicGreeting = (t: any) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('goodMorning');
  if (hour < 17) return t('goodAfternoon');
  return t('goodEvening');
};

export const askForLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve('');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await res.json();
          resolve(
            data.display_name || `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          );
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
          resolve(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve('');
      },
      { enableHighAccuracy: true }
    );
  });
};

export const isMobile = (): boolean =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const isIOSDevice = (): boolean =>
  /iPhone|iPad|iPod|iPad Simulator|iPhone Simulator|iPod Simulator/i.test(navigator.userAgent);
