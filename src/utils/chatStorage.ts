import { ChatMessage, ChatSession } from '@/components/interface';

const STORAGE_KEY = 'poshan_chat_history';

const MEAL_TIMES = {
  BREAKFAST_START: 510, // 8:30 AM
  BREAKFAST_END: 690,   // 11:30 AM
  LUNCH_START: 690,     // 11:30 AM
  LUNCH_END: 1260,      // 9:00 PM
};

const MEAL_LABELS = {
  breakfast: 'breakfasts',
  lunch: 'lunch',
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
  const { BREAKFAST_START, LUNCH_START, LUNCH_END } = MEAL_TIMES;

  if (mins >= BREAKFAST_START && mins < LUNCH_START) return 'breakfast';
  if (mins >= LUNCH_START && mins <= LUNCH_END) return 'lunch';
  // After lunch time or at/after dinner start, return breakfast (next day)
  if (mins > LUNCH_END || mins >= BREAKFAST_START) return 'breakfast';
}

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
export const getDynamicGreeting = (t: any, now = new Date()) => {
  const meal =
    getMealTypeFromTime(now) ||
    (() => {
      const { nextMealKey } = getMealInfo(now);
      return Object.keys(MEAL_LABELS).find((k) => MEAL_LABELS[k] === nextMealKey) || null;
    })();

  if (meal === 'breakfast') return t('goodMorning');
  if (meal === 'lunch') return t('goodAfternoon');
  if (meal === 'dinner') return t('goodEvening');

  const h = now.getHours();
  return h < 12 ? t('goodMorning') : h < 17 ? t('goodAfternoon') : t('goodEvening');
};

export const isMobile = (): boolean =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const isIOSDevice = (): boolean =>
  /iPhone|iPad|iPod|iPad Simulator|iPhone Simulator|iPod Simulator/i.test(navigator.userAgent);

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    // Try to obtain camera stream (prompts user)
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch (err) {
    console.warn('Camera permission denied or error', err);
    return false;
  }
};

export const requestLocationPermission = async (lang: 'gu' | 'en' = 'en'): Promise<any> => {
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
    );

    // Try reverse geocoding, fall back to coords string
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=${lang}`
      );
      const data = await res.json();
      const name = data?.display_name || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      return { granted: true, displayName: name };
    } catch (err) {
      console.error('Reverse geocode failed', err);
      return {
        granted: true,
        displayName: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
      };
    }
  } catch (err) {
    console.warn('Location permission denied or error', err);
    return { granted: false, displayName: '' };
  }
};

export const getTimestampData = () => {
  const now = new Date();
  return {
    now,
    timestamp: now,
    timestampId: Date.now(),
    afterLunch: now.getHours() * 60 + now.getMinutes() > MEAL_TIMES.LUNCH_END,
  };
};

export const getMealKeyFromType = (mealType: string | null | undefined): string | null =>
  mealType === 'breakfast' ? 'breakfasts' : mealType ?? null;
