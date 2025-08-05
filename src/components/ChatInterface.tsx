import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';
import { Camera, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  generateSessionId,
  getMealTypeFromTime,
  getSessionForMealToday,
  saveChatSession,
  updateChatSession,
  type ChatMessage,
  type ChatSession,
} from '@/utils/chatStorage';
import { getPWAContext, requestLocationPermission, showPermissionInstructions } from '@/utils/pwaUtils';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { API_CONFIG } from '@/shared/api';
import HttpService from '@/shared/services/Http.service';
import { ChatInterfaceProps, MenuItem } from './interface';

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
  const [feedbackQuestions, setFeedbackQuestions] = useState([]);
  // Feedback flow state
  const [feedbackStep, setFeedbackStep] = useState(0);
  const [feedbackData, setFeedbackData] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [activeUploadButton, setActiveUploadButton] = useState<'main' | 'recapture' | null>(null);

  const askForLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await res.json();
          setLocationName(data.display_name || '');
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
          setLocationName(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        }
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    askForLocation();
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

    const greeting: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'system',
      content: {
        text: t('greetingFull', {
          greeting: getDynamicGreeting(),
          help: t('greetingHelp'),
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

  const handleOpenCamera = async () => {
    setActiveUploadButton('main');
    if (isUploading || imageUploaded) {
      return; // Prevent opening camera if already uploading or image already uploaded
    }

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
        toast.error(
          'Camera permission is required. Please allow camera access in your device settings or browser permissions.'
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
    setUploadError(false);
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
    setUploadError(false);
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
        ((result.found_items && result.found_items.length > 0) ||
          (result.items_food && result.items_food.length > 0) ||
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
      setUploadError(true);

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
                      {message?.content?.found_items.length > 0 ? (
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
                                      <div key={nutrientIdx} className="flex justify-between items-center text-xs">
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
                        const questionIndex = feedbackQuestions.findIndex(
                          (q) => q.id === message?.content?.questionKey
                        );
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
