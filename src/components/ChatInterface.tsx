import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';
import { Camera, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  buildPlaceholdersForCompleted,
  generateSessionId,
  getDynamicGreeting,
  getMealKeyFromType,
  getMealTypeFromTime,
  getSessionForMealToday,
  getTimestampData,
  requestCameraPermission,
  requestLocationPermission,
  saveChatSession,
  updateChatSession,
} from '@/utils/chatStorage';
import { API_CONFIG } from '@/shared/api';
import HttpService from '@/shared/services/Http.service';
import { Button } from '@/components/ui/button';
import { ChatInterfaceProps, ChatMessage, ChatSession, MenuItem } from './interface';
import { dayNames, weeklyMenu } from './constants';

const ChatInterface = ({ onNavigateToHistory }: ChatInterfaceProps) => {
  const todayKey = dayNames[new Date().getDay()];
  const webcamRef = useRef<Webcam>(null);
  const mealType = getMealTypeFromTime();
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(true);
  const [feedbackQuestions, setFeedbackQuestions] = useState([]);
  // Feedback flow state
  const [feedbackStep, setFeedbackStep] = useState(0);
  const [feedbackData, setFeedbackData] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [activeUploadButton, setActiveUploadButton] = useState<'main' | 'recapture' | null>(null);

const todaysMenu = useMemo<MenuItem[]>(
  () =>
    weeklyMenu[todayKey][mealType].map((item) => ({
      name: t(item.name[i18n.language as 'en' | 'gu']), // switch to Gujarati if needed
      quantity: item.quantity,
      emoji: item.emoji,
    })),
  [t, todayKey, mealType, i18n.language]
);
  // Location permission — run on mount
  const fetchLocation = async () => {
    const location = await requestLocationPermission();
    if (location.granted) {
      setLocationName(location.displayName);
    } else {
      setLocationName('');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const createCompletionMessage = (
    t: any,
    afterLunch: boolean,
    currentMeal: string,
    nextMeal: string,
    nextMealTime: string
  ): string => {
    return afterLunch
      ? `${t('seeYouTomorrow')}\n${t('tomorrow')} ${t('breakfasts')} (${nextMealTime}) ${t('seeYouAgain')}`
      : t('seeYouAtNextMeal', { currentMeal, nextMeal, nextMealTime });
  };

  const createChatMessage = (
    id: string,
    type: ChatMessage['type'],
    content: ChatMessage['content'],
    timestamp: Date
  ): ChatMessage => ({
    id,
    type,
    content,
    timestamp,
  });

  const createAndSetCompletionMessage = (completedMealKey: string | null, session: ChatSession | null = null) => {
    const { timestamp, timestampId, afterLunch, now } = getTimestampData();
    const { currentMeal, nextMeal, nextMealTime } = buildPlaceholdersForCompleted(t, completedMealKey);
    const showTomorrow = afterLunch && completedMealKey === 'lunch';
    const text = createCompletionMessage(t, showTomorrow, currentMeal, nextMeal, nextMealTime);

    setMessages([createChatMessage(`msg_${timestampId}`, 'completion', { text }, timestamp)]);
    setCurrentSession(session);
  };

  // Simulate conversation on load
  useEffect(() => {
    const { timestamp, timestampId, now } = getTimestampData();

    // 🔹 Case 1: No meal selected — show next/tomorrow message
    if (!mealType) {
      createAndSetCompletionMessage(null, null);
      return;
    }

    // 🔹 Case 2: Existing completed session
    const existingSession = getSessionForMealToday(mealType);
    if (existingSession?.status === 'completed') {
      const completedMealKey = getMealKeyFromType(existingSession.mealType);
      createAndSetCompletionMessage(completedMealKey, existingSession);
      return;
    }

    // 🔹 Case 3: No session or session is not completed — start normal flow
    const sessionId = generateSessionId();

    const greeting = createChatMessage(
      `msg_${timestampId}`,
      'system',
      {
        text: t('greetingFull', {
          greeting: getDynamicGreeting(t),
          help: t('greetingHelp'),
        }),
      },
      timestamp
    );

    const menuCard = createChatMessage(
      `msg_${timestampId}_menu_card`,
      'menu_card',
      {
        menu: todaysMenu,
        mealType,
        time: now,
      },
      timestamp
    );

    const aiPrompt = createChatMessage(`msg_${timestampId}_2`, 'system', { text: t('aiPhotoPrompt') }, timestamp);

    setMessages([greeting]);

    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, menuCard]);
    }, 2500);
    setTimeout(() => setIsTyping(true), 3000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, aiPrompt]);
    }, 4500);

    const newSession: ChatSession = {
      id: sessionId,
      messages: [],
      mealType: mealType || 'breakfast',
      date: timestamp.toISOString().split('T')[0],
      status: 'pending',
      createdAt: timestamp,
    };

    setCurrentSession(newSession);
    saveChatSession(newSession);
  }, [mealType, t, todaysMenu]);

  // Camera capture handler
  const handleTakePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      handleImageUpload(imageSrc);
      setShowCamera(false);
    }
  };

  const handleImageUpload = async (imageData: string) => {
    setIsUploading(true);
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
      const result = await HttpService.post(API_CONFIG.uploadFoodPhoto, formData);

      // Check if the result has valid data
      const hasValidData =
        result &&
        ((result.items_food && result.items_food.length > 0) ||
          (result.nutritions && Object.keys(result.nutritions).length > 0));

      if (!hasValidData) {
        throw new Error('No valid data received from analysis');
      }

      setIsTyping(false);
      setIsUploading(false);
      setImageUploaded(true);

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

      // Show message if no nutrition details found
      const hasNutritionDetails = result.nutritions && Object.keys(result.nutritions).length > 0;
      if (!hasNutritionDetails) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const nutritionMissingMessage: ChatMessage = {
              id: `msg_${Date.now()}_nutrition_missing`,
              type: 'system',
              content: {
                text: t('noNutritionDetailsFound'),
                showRecaptureButton: true,
              },
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, nutritionMissingMessage]);
            setImageUploaded(false); // Reset to allow recapture
          }, 1200);
        }, 800);
      } else {
        // Normal flow - start feedback
        await getSurveyQuestion();
        setTimeout(() => {
          setIsTyping(false);
          startFeedbackFlow();
        }, 1000);
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      setIsTyping(false);
      setIsUploading(false);

      // Add error message with recapture option
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        type: 'system',
        content: {
          text: t('imageAnalysisFailed'),
          showRecaptureButton: true,
        },
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast.error(t('imageAnalysisFailed'));
    }
  };

  // Camera permission — run when user clicks capture
  const handleOpenCamera = async () => {
    setActiveUploadButton('main');
    if (isUploading || imageUploaded) return;

    try {
      const hasPermission = await requestCameraPermission();
      setCameraPermission(hasPermission);

      if (hasPermission) {
        setShowCamera(true); // Show camera modal or PWA file input
      } else {
        toast.error(
          t('cameraPermissionRequired') // Or plain text string
        );
      }
    } catch (error) {
      console.error('Camera open error:', error);
      toast.error(t('cameraOpenFailed'));
    }
  };

  const handleRecapture = async () => {
    setActiveUploadButton('recapture');
    setImageUploaded(false);
    setIsUploading(false);
    await handleOpenCamera();
  };

  const getSurveyQuestion = async () => {
    const response = await HttpService.get(`${API_CONFIG.feedbackQuestionnaire}/${i18n.language}`);
    setFeedbackQuestions(response.questions);
  };

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
            questionKey: question.id,
            text: question.text,
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

      setTimeout(() => {
        onNavigateToHistory?.();
      }, 2000);
    }, 1000);
  };

  useEffect(() => {
    // Remove the upper bound check so askNextQuestion runs when feedbackStep > feedbackQuestions.length
    if (feedbackStep > 0) {
      askNextQuestion();
    }
  }, [feedbackStep]);

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex mb-4">
      <div className="typing-indicator">
        <div className="flex items-center space-x-1">
          <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
          <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
          <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* WhatsApp-style Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          {/* Logo - Matching the reference image style */}
          <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-primary/20">
            <span className="text-lg">🌱</span>
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
            {!cameraPermission && <p className="text-xs text-red-600 mb-2">{t('cameraPermissionDenied')}</p>}
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              className="rounded-lg"
            />
            <div>
              <Button className="mt-4" onClick={handleTakePhoto} disabled={isUploading || imageUploaded}>
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('uploading')}
                  </>
                ) : imageUploaded ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('photoUploaded')}
                  </>
                ) : (
                  t('capturePhoto')
                )}
              </Button>
              <Button className="ml-2" variant="outline" onClick={() => setShowCamera(false)}>
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-gradient-to-b from-background to-muted/20">
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
                    <p className="text-xs opacity-75">📸</p>
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
                  <div className="mb-4 font-semibold">
                    <h4 className="font-semibold mb-2">
                      📋 {t('todaysMenu', { meal: t(getMealKeyFromType(mealType)) })}
                    </h4>
                  </div>
                  <div className="mb-4 text-sm">
                    <p>
                      <span className="font-bold">📅 {t('date')} :</span> <span>{new Date().toLocaleDateString()}</span>
                    </p>
                    <p>
                      <span className="font-bold">📍 {t('location')} :</span>{' '}
                      <span>{locationName || 'Detecting...'}</span>
                    </p>
                    <p>
                      <span className="font-bold">🍽️ {t('mealType')} :</span> <span>{t(mealType)}</span>
                    </p>
                  </div>
                  <div className="">
                    <p className="mb-1 font-bold">{t('menu')} :</p>
                    {message?.content?.menu.map((item: MenuItem, idx: number) => (
                      <div key={idx} className="flex items-center text-[16px]">
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
                      disabled={isUploading && activeUploadButton === 'main'}
                    >
                      {activeUploadButton === 'main' && isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t('uploading')}</span>
                        </>
                      ) : imageUploaded ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>{t('photoUploaded')}</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span>{t('capturePhoto')}</span>
                        </>
                      )}
                    </Button>
                  )}

                  {/* Show recapture button for error messages */}
                  {message?.content?.showRecaptureButton && (
                    <Button
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg mt-3"
                      onClick={handleRecapture}
                      disabled={isUploading && activeUploadButton === 'main'}
                    >
                      {activeUploadButton === 'recapture' && isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t('uploading')}</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span>{t('recapturePhoto')}</span>
                        </>
                      )}
                    </Button>
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
                    {message?.content?.items_food.length > 0 ? (
                      <>
                        <p className="font-semibold text-success">✅ {t('analysisComplete')}!</p>
                        <div className="bg-success/10 p-3 rounded-lg">
                          <p className="text-sm font-medium text-success mb-2">{t('itemsFound')}:</p>
                          <div className="flex flex-wrap gap-1">
                            {message?.content?.items_food?.map((item: string, idx: number) => (
                              <span key={idx} className="bg-success text-white text-xs px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-success/10 p-3 rounded-lg">
                        <p className="text-sm font-medium text-success mb-2">{t('itemsFound')}:</p>
                        <div className="flex flex-wrap gap-1">
                          {message?.content?.items_food?.map((item: string, idx: number) => (
                            <span key={idx} className="bg-success text-white text-xs px-2 py-1 rounded-full">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {message?.content?.nutritions && Object.keys(message?.content?.nutritions).length > 0 && (
                      <div className="bg-primary/10 p-3 rounded-lg space-y-2 text-xs">
                        <p className="text-sm font-medium text-primary mb-2">📊 {t('nutritionInfo')}:</p>
                        {Object.entries(message?.content?.nutritions).map(([food, nutrition], idx) => {
                          return (
                            <div key={idx} className="bg-background/80 p-3 rounded-lg">
                              <div className="font-medium text-sm mb-2 capitalize">{food}</div>
                              {nutrition && typeof nutrition === 'object' && (
                                <div className="space-y-1">
                                  {Object.entries(nutrition).map(([nutrient, value], nutrientIdx) => (
                                    <div key={nutrientIdx} className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground capitalize">{nutrient}:</span>
                                      <span className="font-medium">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                      const questionIndex = feedbackQuestions.findIndex((q) => q.id === message?.content?.questionKey);
                      const isAnswered = answeredQuestions.has(questionIndex);

                      return (
                        <Button
                          key={option}
                          size="sm"
                          variant="outline"
                          disabled={isAnswered}
                          className={`flex-1 flex items-center justify-start gap-1 px-2 py-1 ${
                            isAnswered
                              ? 'opacity-50 cursor-not-allowed bg-muted'
                              : 'bg-background/80 hover:bg-primary hover:text-primary-foreground'
                          }`}
                          onClick={() => handleFeedbackAnswer(message?.content?.questionKey, option)}
                        >
                          {option.icon && <span>{option.icon}</span>}
                          <span>{option}</span>
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
        ))}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatInterface;
