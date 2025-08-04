import React, { useState, useRef, useEffect, useMemo } from 'react';
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
} from '@/utils/chatStorage';

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
  const { t } = useTranslation();
  const { selectFromGallery, requestPermissions } = useCamera();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Detect location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          // Reverse geocode
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await res.json();
            setLocationName(data.display_name || '');
          } catch {
            setLocationName('');
          }
        },
        () => setLocationName(''),
        { enableHighAccuracy: true }
      );
    }
  }, []);

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
    const mealType = getMealTypeFromTime();
    
    // Check if user already completed feedback for this meal today
    if (mealType) {
      const existingSession = getSessionForMealToday(mealType);
      if (existingSession) {
        // Show "already completed" message
        const nextMealTime = getNextMealTime();
        const alreadyCompletedMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          type: 'completion',
          content: {
            text: `${t('alreadyCompleted', 'You have already completed')} ${t(mealType)} ${t('feedbackToday', 'feedback today')}. ${t('seeYouAt', 'See you at')} ${nextMealTime} 😊`,
          },
          timestamp: new Date(),
        };
        setMessages([alreadyCompletedMessage]);
        return;
      }
    }

    // If no existing session or outside meal time, start normal flow
    const sessionId = generateSessionId();

    const greeting: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'system',
      content: {
        text: t('greetingFull', {
          greeting: t('goodMorning'),
          help: t('greetingHelp'),
          question: t('whatDidYouHave'),
          meal: t(mealType || 'meal'),
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

  // Mock AI analysis function
  const analyzeImage = async (imageFile: File): Promise<AnalysisResult> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      itemsFood: ['Poha', 'Banana', 'Milk', 'jalebi'],
      inputMenu: ['jalebi'],
      foundItems: ['jalebi'],
      missingItems: [],
      nutritions: {
        Poha: {
          calories: 'approximately 400-500 kcal per 100g',
          protein: '7-10g',
          fat: '20-30g',
          carbs: '50-60g',
        },
        Banana: {
          calories: 'about 20 kcal per 100g',
          protein: '0.9g',
          fat: '0.2g',
          carbs: '4.3g',
        },
        Milk: {},
      },
    };
  };

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

      const result = await analyzeImage(file);

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

      toast.success('Image analysis completed!');

      setTimeout(() => {
        setIsTyping(false);

        startFeedbackFlow();
      }, 1000);
    } catch (error) {
      setIsTyping(false);
      toast.error('Failed to analyze image. Please try again.');
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

  // Camera-only photo capture for food prompt
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleImageUpload(imageUrl);
    }
  };

  const handleGallerySelect = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      fileInputRef.current?.click();
      return;
    }

    const result = await selectFromGallery();
    if (result?.dataUrl) {
      handleImageUpload(result.dataUrl);
    }
  };

  // Feedback flow state
  const [feedbackStep, setFeedbackStep] = useState(0);
  const [feedbackData, setFeedbackData] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

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
            text: t('feedbackIntro', "Now I have a few quick questions about your meal experience. Let's start:"),
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
    if (totalMinutes < 510) return 'breakfast (8:30 – 9:30 AM)';
    if (totalMinutes < 750) return 'lunch (12:30 – 1:30 PM)';
    return 'breakfast (8:30 – 9:30 AM)'; // Next day
  };

  const handleFeedbackAnswer = (questionKey: string, answer: string) => {
    const updatedFeedbackData = { ...feedbackData, [questionKey]: answer };
    setFeedbackData(updatedFeedbackData);
    setAnsweredQuestions(prev => new Set([...prev, feedbackStep - 1]));

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
      const nextMeal = getNextMealTime();
      
      const completionMessage: ChatMessage = {
        id: `msg_${Date.now()}_completion`,
        type: 'completion',
        content: {
          text: `${t('feedbackSaved', 'Thank you! Your feedback has been saved successfully.')} ${t('seeYouAt', 'See you at')} ${nextMeal} 🙏`,
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
      }

      toast.success(t('feedbackSubmitted', 'Feedback submitted successfully!'));

      setTimeout(() => {
        onNavigateToHistory?.();
        toast.success(t('redirectingToHistory', 'Redirecting to history dashboard...'));
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
            <h1 className="font-semibold">{t('appName', 'Poshan Tracker')}</h1>
            <p className="text-sm opacity-90">{t('nutritionAssistant', 'Nutrition Assistant')}</p>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex flex-col items-center">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/20">
        {messages.map((message, index) => (
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
                    <span>{t('todaysMenu', "Today's Menu")}</span>
                  </div>
                  <div className="mb-2 text-xs text-muted-foreground">
                    <div>
                      <span>
                        {t('date', 'Date')}: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span>{t('mealType', 'Meal Type')}: Breakfast</span>
                    </div>
                    <div>
                      <span>
                        {t('location', 'Location')}: {locationName || t('detectingLocation', 'Detecting...')}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    {message?.content?.menu.map((item: MenuItem, idx: number) => (
                      <div key={idx} className="flex items-center text-sm mb-1">
                        <span className="mr-2">{item.emoji}</span>
                        <span>
                          {item.name} - {item.quantity}
                          {t('gram')}
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
                  {message?.content?.text ===
                    t(
                      'aiPhotoPrompt',
                      'Can you take a photo of your meal so I can analyze the nutritional content? 📸'
                    ) && (
                    <Button
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg mt-3"
                      onClick={() => setShowCamera(true)}
                    >
                      <Camera className="w-5 h-5" />
                      <span>{t('uploadPhoto', 'Upload Photo')}</span>
                    </Button>
                  )}

                  {/* ...existing menu rendering... */}
                  {message?.content?.showMenu && message?.content?.menu && (
                    <div className="mt-3 bg-background/80 rounded-lg p-3 border border-border/50">
                      <h4 className="font-semibold text-sm mb-2">📋 {t('todaysMenu', "Today's Meal Menu:")}</h4>
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
                    <p className="font-semibold text-success">✅ {t('analysisComplete', 'Analysis Complete')}!</p>

                    <div className="bg-success/10 p-3 rounded-lg">
                      <p className="text-sm font-medium text-success mb-2">{t('itemsFound', 'Items Found')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {message?.content?.foundItems.map((item: string, idx: number) => (
                          <span key={idx} className="bg-success text-white text-xs px-2 py-1 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {message?.content?.missingItems.length > 0 && (
                      <div className="bg-destructive/10 p-3 rounded-lg">
                        <p className="text-sm font-medium text-destructive mb-2">
                          {t('missingItems', 'Missing Items')}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message?.content?.missingItems.map((item: string, idx: number) => (
                            <span key={idx} className="bg-destructive text-white text-xs px-2 py-1 rounded-full">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-sm font-medium text-primary mb-2">{t('nutritionInfo', 'Nutrition Info')}:</p>
                      <div className="space-y-2 text-xs">
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
                    </div>
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
                      const messageIndex = messages.findIndex(msg => msg.id === message.id);
                      const questionIndex = feedbackQuestions.findIndex(q => q.key === message?.content?.questionKey);
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

            {message.type === 'questionnaire' && (
              <div className="flex justify-end mb-3">
                <div className="message-bubble-user max-w-[80%]">
                  <div className="space-y-2">
                    <p className="font-semibold">📝 Feedback Submitted</p>
                    <div className="space-y-1 text-sm">
                      <p>Freshness: {message?.content?.freshness}</p>
                      <p>Quantity: {message?.content?.quantity}</p>
                      <p>Satisfaction: {message?.content?.satisfaction}</p>
                      {message?.content?.comments && <p>Comments: {message?.content?.comments}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-1">
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <CheckCircle className="w-3 h-3 opacity-75 ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatInterface;
