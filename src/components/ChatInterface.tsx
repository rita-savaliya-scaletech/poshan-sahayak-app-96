import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCamera } from '@/hooks/useCamera';
import Webcam from 'react-webcam';
import {
  saveChatSession,
  generateSessionId,
  getMealTypeFromTime,
  getSessionForMealToday,
  type ChatSession,
  type ChatMessage,
  updateChatSession,
} from '@/utils/chatStorage';
import HttpService from '@/shared/services/Http.service';
import { API_CONFIG } from '@/shared/api';
import { Capacitor } from '@capacitor/core';
import { getPWAContext, requestLocationPermission, showPermissionInstructions } from '@/utils/pwaUtils';

// --- Types ---
export interface MenuItem {
  name: string;
  quantity: string;
  emoji: string;
}

export interface NutritionInfo {
  calories?: string;
  protein?: string;
  fat?: string;
  carbs?: string;
}

export interface AnalysisResult {
  itemsFood: string[];
  inputMenu: string[];
  foundItems: string[];
  missingItems: string[];
  nutritions: Record<string, NutritionInfo>;
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

interface ChatInterfaceProps {
  onNavigateToHistory?: () => void;
}

// --- Hooks ---
const useMealQuestionnaireQuestions = () => {
  const { t } = useTranslation();
  return [
    {
      key: '1',
      text: t('question1'),
      icon: '🥗',
      type: 'single',
      options: [
        { value: t('q1opt1'), label: t('q1opt1'), icon: '👍' },
        { value: t('q1opt2'), label: t('q1opt2'), icon: '😐' },
        { value: t('q1opt3'), label: t('q1opt3'), icon: '🙁' },
        { value: t('q1opt4'), label: t('q1opt4'), icon: '🤔' },
      ],
    },
    {
      key: '2',
      text: t('question2'),
      icon: '😋',
      type: 'single',
      options: [
        { value: t('q2opt1'), label: t('q2opt1'), icon: '😍' },
        { value: t('q2opt2'), label: t('q2opt2'), icon: '😋' },
        { value: t('q2opt3'), label: t('q2opt3'), icon: '👍' },
        { value: t('q2opt4'), label: t('q2opt4'), icon: '👎' },
      ],
    },
    {
      key: '3',
      text: t('question3'),
      icon: '🍽️',
      type: 'single',
      options: [
        { value: t('q3opt1'), label: t('q3opt1'), icon: '😅' },
        { value: t('q3opt2'), label: t('q3opt2'), icon: '👍' },
        { value: t('q3opt3'), label: t('q3opt3'), icon: '🙁' },
        { value: t('q3opt4'), label: t('q3opt4'), icon: '👎' },
      ],
    },
    {
      key: '4',
      text: t('question4'),
      icon: '😋',
      type: 'single',
      options: [
        { value: t('q4opt1'), label: t('q4opt1'), icon: '😍' },
        { value: t('q4opt2'), label: t('q4opt2'), icon: '👌' },
        { value: t('q4opt3'), label: t('q4opt3'), icon: '🙂' },
        { value: t('q4opt4'), label: t('q4opt4'), icon: '👎' },
      ],
    },
    {
      key: '5',
      text: t('question5'),
      icon: '🍽️',
      type: 'single',
      options: [
        { value: t('q5opt1'), label: t('q5opt1'), icon: '😍' },
        { value: t('q5opt2'), label: t('q5opt2'), icon: '👌' },
        { value: t('q5opt3'), label: t('q5opt3'), icon: '👍' },
        { value: t('q5opt4'), label: t('q5opt4'), icon: '👎' },
      ],
    },
  ];
};

const ChatInterface = ({ onNavigateToHistory }: ChatInterfaceProps) => {
  const webcamRef = useRef<Webcam>(null);
  const mealType = getMealTypeFromTime();
  const { t } = useTranslation();
  const { requestPermissions } = useCamera();
  const { i18n } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(true);

  // Feedback flow state
  const [feedbackStep, setFeedbackStep] = useState(0);
  const [feedbackData, setFeedbackData] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  // Detect location on mount
  useEffect(() => {
    const detectLocation = async () => {
      const context = getPWAContext();

      if ('geolocation' in navigator) {
        try {
          if (context.isPWA) {
            // For PWA, show a toast to inform user about location permission
            toast.info(t('locationAccessNeeded'));
          }

          const hasPermission = await requestLocationPermission();

          if (!hasPermission) {
            toast.error(showPermissionInstructions('location'));
            setLocationName(t('locationPermissionDenied'));
            return;
          }

          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            });
          });

          // Reverse geocode
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await res.json();
            setLocationName(data.display_name || '');
            toast.success(t('locationDetectedSuccess'));
          } catch (geocodeError) {
            console.error('Geocoding error:', geocodeError);
            setLocationName(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          }
        } catch (locationError) {
          console.error('Location error:', locationError);
          const error = locationError as GeolocationPositionError;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error(showPermissionInstructions('location'));
              setLocationName(t('locationPermissionDenied'));
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error(t('locationUnavailable'));
              setLocationName(t('locationUnavailable'));
              break;
            case error.TIMEOUT:
              toast.error(t('locationTimeout'));
              setLocationName(t('locationTimeout'));
              break;
            default:
              toast.error(t('locationError'));
              setLocationName(t('locationError'));
          }
        }
      } else {
        console.warn('Geolocation is not supported by this browser');
        setLocationName(t('locationNotSupported'));
        toast.info(t('locationServicesUnavailable'));
      }
    };

    detectLocation();
  }, [t]);

  // Memoize menu for performance
  const todaysMenu = useMemo<MenuItem[]>(
    () => [
      { name: t('tuverDalKhichdi'), quantity: '100', emoji: '🍛' },
      { name: t('golVadiFadaLapsi'), quantity: '35', emoji: '🍚' },
      { name: t('seasonalGreenVegetables'), quantity: '50', emoji: '🥬' },
    ],
    [t]
  );

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Simulate conversation on load
  useEffect(() => {
    // Get next meal time for message
    const nextMealTime = getNextMealTime();

    // If outside meal time OR already completed for this meal, show "See you at next meal" message
    if (!mealType) {
      const seeYouMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'completion',
        content: {
          text: t('seeYouAtNextMeal', { nextMeal: nextMealTime }),
        },
        timestamp: new Date(),
      };
      setMessages([seeYouMessage]);
      setCurrentSession(null);
      return;
    }

    const existingSession = getSessionForMealToday(mealType);
    if (existingSession && existingSession.status === 'completed') {
      const alreadyCompletedMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'completion',
        content: {
          text: t('seeYouAtNextMeal', { nextMeal: nextMealTime }),
        },
        timestamp: new Date(),
      };
      setMessages([alreadyCompletedMessage]);
      setCurrentSession(existingSession);
      return;
    }

    // If no existing session or outside meal time, start normal flow
    const sessionId = generateSessionId();

    // Helper to get dynamic greeting
    const getDynamicGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return t('goodMorning');
      if (hour < 17) return t('goodAfternoon');
      return t('goodEvening');
    };

    // ...inside your useEffect or wherever you create the greeting message:
    const greeting: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'system',
      content: {
        text: t('greetingFull', {
          greeting: getDynamicGreeting(),
          help: t('greetingHelp'),
          question: t('whatDidYouHave'),
          meal: t(mealType),
        }),
      },
      timestamp: new Date(),
    };

    const menuCard: ChatMessage = {
      id: `msg_${Date.now()}_menu_card`,
      type: 'menu_card',
      content: {
        menu: todaysMenu,
        mealType,
        time: new Date(),
      },
      timestamp: new Date(),
    };

    setMessages([greeting]);
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, menuCard]);
    }, 2500);
    setTimeout(() => setIsTyping(true), 3000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_2`,
          type: 'system',
          content: { text: t('aiPhotoPrompt') },
          timestamp: new Date(),
        },
      ]);
    }, 4500);

    const newSession: ChatSession = {
      id: sessionId,
      messages: [],
      mealType: mealType || 'breakfast',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date(),
    };
    setCurrentSession(newSession);
    saveChatSession(newSession);
  }, [t, todaysMenu]);

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex mb-4">
      <div className="typing-indicator">
        <div className="flex items-center space-x-1">
          <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full"></div>
          <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full"></div>
          <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full"></div>
        </div>
      </div>
    </div>
  );

  const handleImageUpload = async (imageData: string) => {
    setIsTyping(true);
    // Add user message with image
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: { image: imageData, fileName: 'food-image.jpg' },
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update session
    if (currentSession) {
      const updatedSession = { ...currentSession, messages: updatedMessages };
      setCurrentSession(updatedSession);
      saveChatSession(updatedSession);
    }

    // Show typing indicator while analyzing
    setTimeout(() => {
      setIsTyping(true);
    }, 500);

    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'food-image.jpg', { type: 'image/jpeg' });
      const menuNames = todaysMenu.map((item) => item.name);

      // Create FormData for the API call
      const formData = new FormData();
      formData.append('image', file);
      formData.append('menu', JSON.stringify(menuNames));
      formData.append('lang', i18n.language || 'gu');

      // Make the API call with form-data
      const result = await HttpService.post(API_CONFIG.uploadFoodPhoto, formData, {
        contentType: 'multiparts/form-data',
      });

      setIsTyping(false);

      // Add analysis result
      const analysisMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'analysis',
        content: result,
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, analysisMessage];
      setMessages(finalMessages);

      // Update session with analysis
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          messages: finalMessages,
          analysisResult: result,
        };
        setCurrentSession(updatedSession);
        saveChatSession(updatedSession);
      }

      toast.success(t('imageAnalysisCompleted'));

      setTimeout(() => {
        setIsTyping(false);

        startFeedbackFlow();
      }, 1000);
    } catch (error) {
      setIsTyping(false);
      toast.error(t('imageAnalysisFailed'));
    } finally {
      setIsTyping(false);
    }
  };

  // Camera capture handler
  const handleTakePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      handleImageUpload(imageSrc);
      setShowCamera(false);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const context = getPWAContext();
      const hasPermission = await requestPermissions();
      setCameraPermission(hasPermission);

      if (hasPermission) {
        if (context.isPWA && context.platform === 'web') {
          // For PWA on web, use file input with camera capture
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                handleImageUpload(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        } else {
          // For native or regular web, show camera modal
          setShowCamera(true);
        }
      } else {
        toast.error(showPermissionInstructions('camera'));
      }
    } catch (error) {
      console.error('Camera open error:', error);
      toast.error(t('cameraOpenFailed'));
    }
  };

  const feedbackQuestions = useMealQuestionnaireQuestions();

  const startFeedbackFlow = () => {
    setTimeout(() => {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const feedbackStart: ChatMessage = {
          id: `msg_${Date.now()}_feedback_start`,
          type: 'system',
          content: {
            text: t('feedbackIntro'),
          },
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, feedbackStart]);

        setTimeout(() => setFeedbackStep(1), 1000); // Start from first question
      }, 1500);
    }, 500);
  };

  useEffect(() => {
    // Remove the upper bound check so askNextQuestion runs when feedbackStep > feedbackQuestions.length
    if (feedbackStep > 0) {
      askNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackStep]);

  const askNextQuestion = () => {
    if (feedbackStep <= feedbackQuestions.length) {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const question = feedbackQuestions[feedbackStep - 1];
        if (!question) return;
        const questionMessage: ChatMessage = {
          id: `msg_${Date.now()}_question_${feedbackStep - 1}`,
          type: 'feedback_question',
          content: {
            text: question.text,
            questionKey: question.key,
            questionType: question.type,
            icon: question.icon,
            options: question.options || [],
          },
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, questionMessage]);
      }, 1000);
    } else {
      completeFeedback();
    }
  };

  const getNextMealTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hour * 60 + minutes;

    // Breakfast: 8:30 – 9:30, Lunch: 12:30 – 1:30
    if (totalMinutes < 510) return `${t('breakfast')} (8:30 – 9:30 AM)`;
    if (totalMinutes < 750) return `${t('lunch')} (12:30 – 1:30 PM)`;
    return `${t('breakfast')} (8:30 – 9:30 AM)`; // Next day
  };

  const handleFeedbackAnswer = (questionKey: string, answer: string) => {
    const updatedFeedbackData = { ...feedbackData, [questionKey]: answer };
    setFeedbackData(updatedFeedbackData);
    setAnsweredQuestions((prev) => new Set([...prev, feedbackStep - 1]));

    // Add user response
    const userResponse: ChatMessage = {
      id: `msg_${Date.now()}_answer`,
      type: 'user',
      content: { text: answer },
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userResponse]);

    setTimeout(() => setFeedbackStep((prev) => prev + 1), 1500);
  };

  const completeFeedback = () => {
    setTimeout(() => {
      const completionMessage: ChatMessage = {
        id: `msg_${Date.now()}_completion`,
        type: 'completion',
        content: {
          text: t('feedbackSubmittedSuccess'),
        },
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, completionMessage]);

      if (currentSession) {
        const completedSession = {
          ...currentSession,
          messages: [...messages, completionMessage],
          questionnaireData: feedbackData,
          status: 'completed' as const,
          completedAt: new Date(),
        };
        setCurrentSession(completedSession);
        saveChatSession(completedSession);

        updateChatSession(completedSession.id, {
          status: 'completed',
          completedAt: new Date(),
          questionnaireData: feedbackData,
          messages: [...messages, completionMessage],
        });
      }

      toast.success(t('feedbackSubmitted'));

      setTimeout(() => {
        onNavigateToHistory?.();
        toast.success(t('redirectingToHistory'));
      }, 2000);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* WhatsApp-style Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <span className="text-lg">🥗</span>
          </div>
          <div>
            <h1 className="font-semibold">AI Poshan Tracker</h1>
            <p className="text-sm opacity-90">{t('nutritionAssistant')}</p>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex flex-col items-center">
            {!cameraPermission && (
              <p className="text-xs text-red-600 mb-2">
                {t('cameraPermissionDenied', 'Camera permission denied. Please allow camera access to continue.')}
              </p>
            )}
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              className="rounded-lg"
            />
            <Button className="mt-4" onClick={handleTakePhoto}>
              {t('uploadPhoto', 'Click Photo')}
            </Button>
            <Button className="mt-2" variant="outline" onClick={() => setShowCamera(false)}>
              {t('back', 'Back')}
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-gradient-to-b from-background to-muted/20">
        {messages.map((message, index) => {
          return (
            <div key={index}>
              {message.type === 'user' && (
                <div className="flex justify-end mb-3">
                  {message?.content?.image ? (
                    <div className="message-bubble-user">
                      <img
                        src={message?.content?.image}
                        alt="Food upload"
                        className="w-48 h-36 object-cover rounded-lg mb-2"
                      />
                      <p className="text-xs opacity-75">📸 Photo</p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <CheckCircle className="w-3 h-3 opacity-75" />
                      </div>
                    </div>
                  ) : (
                    <div className="message-bubble-user">
                      <p>{message?.content?.text}</p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <CheckCircle className="w-3 h-3 opacity-75" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Menu Card with location, date, meal type */}
              {message.type === 'menu_card' && (
                <div className="flex justify-start mb-3">
                  <div className="message-bubble-ai rounded-xl p-4 shadow max-w-xs">
                    <div className="mb-2 font-semibold">
                      <h4 className="font-semibold text-sm mb-2">📋 {t('todaysMenu', { meal: t(mealType) })}</h4>
                    </div>
                    <div className="mb-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">
                          {t('date')}: {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {t('mealType')}: {t(mealType)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {t('location')}: {locationName || t('detectingLocation', 'Detecting...')}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      {message?.content?.menu.map((item: MenuItem, idx: number) => (
                        <div key={idx} className="flex items-center text-sm mb-1">
                          <span className="mr-2">{item.emoji}</span>
                          <span>
                            {item.name} - {item.quantity} {t('gram')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {message?.content?.time
                        ? new Date(message?.content?.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </div>
                  </div>
                </div>
              )}

              {(message.type === 'system' || message.type === 'completion') && (
                <div className="flex justify-start mb-3">
                  <div className="message-bubble-ai">
                    <p>{message?.content?.text || message?.content?.greeting}</p>

                    {/* Show green upload button only for aiPhotoPrompt */}
                    {message?.content?.text === t('aiPhotoPrompt') && (
                      <Button
                        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg mt-3"
                        onClick={handleOpenCamera}
                      >
                        <Camera className="w-5 h-5" />
                        <span>{t('uploadPhoto')}</span>
                      </Button>
                    )}

                    {/* ...existing menu rendering... */}
                    {message?.content?.showMenu && message?.content?.menu && (
                      <div className="mt-3 bg-background/80 rounded-lg p-3 border border-border/50">
                        <h4 className="font-semibold text-sm mb-2">📋 {t('todaysMenu', { meal: t(mealType) })}</h4>
                        <div className="space-y-2">
                          {message?.content?.menu.map((item: MenuItem, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="flex items-center">
                                <span className="mr-2">{item.emoji}</span>
                                {item.name}
                              </span>
                              <span className="text-muted-foreground">{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-start mt-1">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {message.type === 'analysis' && (
                <div className="flex justify-start mb-3">
                  <div className="message-bubble-ai max-w-[85%]">
                    <div className="space-y-3">
                      {message?.content?.found_items.length > 0 && (
                        <>
                          <p className="font-semibold text-success">✅ {t('analysisComplete')}!</p>
                          <div className="bg-success/10 p-3 rounded-lg">
                            <p className="text-sm font-medium text-success mb-2">{t('itemsFound')}:</p>
                            <div className="flex flex-wrap gap-1">
                              {message?.content?.found_items?.map((item: string, idx: number) => (
                                <span key={idx} className="bg-success text-white text-xs px-2 py-1 rounded-full">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {message?.content?.nutritions.length > 0 && (
                        <div className="bg-primary/10 p-3 rounded-lg space-y-2 text-xs">
                          {Object.entries(message?.content?.nutritions).map(([food, nutrition], idx) => (
                            <div key={idx} className="bg-background/80 p-2 rounded">
                              <p className="font-medium capitalize">{food}</p>
                              {nutrition &&
                                typeof nutrition === 'object' &&
                                'calories' in nutrition &&
                                nutrition.calories && (
                                  <p className="text-muted-foreground">📊 {String(nutrition.calories)}</p>
                                )}
                            </div>
                          ))}
                        </div>
                      )}

                      {message?.content?.missing_items.length > 0 && (
                        <div className="bg-destructive/10 p-3 rounded-lg">
                          <p className="text-sm font-medium text-destructive mb-2">{t('missingItems')}:</p>
                          <div className="flex flex-wrap gap-1">
                            {message?.content?.missing_items.map((item: string, idx: number) => (
                              <span key={idx} className="bg-destructive text-white text-xs px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {message?.content?.found_items.length === 0 && (
                        <div className="bg-destructive/10 p-3 rounded-lg">
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-destructive text-white text-sm px-2 py-1 rounded-full">
                              {message?.content?.items_food[0]}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-start mt-2">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {message.type === 'feedback_question' && (
                <div className="flex justify-start mb-3">
                  <div className="message-bubble-ai">
                    <p>
                      {message?.content?.icon && <span className="mr-2">{message?.content?.icon}</span>}
                      {message?.content?.text}
                    </p>
                    <div className="flex flex-col gap-2 mt-3">
                      {message?.content?.options?.map((option) => {
                        const messageIndex = messages.findIndex((msg) => msg.id === message.id);
                        const questionIndex = feedbackQuestions.findIndex(
                          (q) => q.key === message?.content?.questionKey
                        );
                        const isAnswered = answeredQuestions.has(questionIndex);

                        return (
                          <Button
                            key={option.value}
                            size="sm"
                            variant="outline"
                            disabled={isAnswered}
                            className={`flex-1 flex items-center justify-start gap-1 px-2 py-1 ${
                              isAnswered
                                ? 'opacity-50 cursor-not-allowed bg-muted'
                                : 'bg-background/80 hover:bg-primary hover:text-primary-foreground'
                            }`}
                            onClick={() => handleFeedbackAnswer(message?.content?.questionKey, option.label)}
                          >
                            {option.icon && <span>{option.icon}</span>}
                            <span>{option.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-start mt-2">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatInterface;
