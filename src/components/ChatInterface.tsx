import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Camera, Image, Upload, Paperclip, Smile, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCamera } from '@/hooks/useCamera';
import {
  saveChatSession,
  updateChatSession,
  generateSessionId,
  getMealTypeFromTime,
  type ChatSession,
  type ChatMessage,
} from '@/utils/chatStorage';

interface MenuItemType {
  name: string;
  quantity: string;
  emoji: string;
}

interface AnalysisResult {
  items_food: string[];
  input_menu: string[];
  found_items: string[];
  missing_items: string[];
  nutritions: Record<
    string,
    {
      calories?: string;
      protein?: string;
      fat?: string;
      carbs?: string;
    }
  >;
}

interface ChatInterfaceProps {
  onNavigateToHistory?: () => void;
}

const useMealQuestionnaireQuestions = () => {
  const { t } = useTranslation();
  return [
    {
      key: 'mealFresh',
      text: t('mealFreshQuestion'),
      icon: '🥗',
      type: 'single',
      options: [
        { value: 'yes', label: t('yes'), icon: '👍' },
        { value: 'no', label: t('no'), icon: '👎' },
        { value: 'not_sure', label: t('notSure', 'Not sure'), icon: '🤔' },
      ],
    },
    {
      key: 'mealTasty',
      text: t('mealTastyQuestion'),
      icon: '😋',
      type: 'single',
      options: [
        { value: 'very_tasty', label: t('veryTasty', 'Very tasty'), icon: '😍' },
        { value: 'okay', label: t('okay', 'Okay'), icon: '🙂' },
        { value: 'not_tasty', label: t('notTasty', 'Not tasty'), icon: '😐' },
      ],
    },
    {
      key: 'mealQuantity',
      text: t('mealQuantityQuestion'),
      icon: '🍽️',
      type: 'single',
      options: [
        { value: 'yes', label: t('yes'), icon: '👌' },
        { value: 'no', label: t('no'), icon: '🙁' },
        { value: 'too_much', label: t('tooMuch', 'Too much'), icon: '😅' },
      ],
    },
  ];
};

const ChatInterface = ({ onNavigateToHistory }: ChatInterfaceProps) => {
  const { t } = useTranslation();
  const { takePicture, selectFromGallery, requestPermissions } = useCamera();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [photoAnalyzed, setPhotoAnalyzed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Sample menu data (translate name and quantity)
  const todaysMenu: MenuItemType[] = [
    { name: t('poha', 'Poha'), quantity: t('oneBowl', '1 bowl'), emoji: '🍚' },
    { name: t('banana', 'Banana'), quantity: t('onePiece', '1 piece'), emoji: '🍌' },
    { name: t('milk', 'Milk'), quantity: t('oneGlass', '1 glass'), emoji: '🥛' },
    { name: t('jalebi', 'Jalebi'), quantity: t('twoPieces', '2 pieces'), emoji: '🟡' },
  ];

  // Simulate WhatsApp-style conversation on load
  useEffect(() => {
    const sessionId = generateSessionId();
    const mealType = getMealTypeFromTime();

    const simulateConversation = async () => {
      // AI greeting message
      const greeting: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: {
          text: `${t('goodMorning', 'Hello')}! 👋 ${t('greetingHelp', "I'm here to help track your meals today.")} ${t(
            'whatDidYouHave',
            'What did you have for'
          )} ${t(mealType, mealType)}?`,
        },
        timestamp: new Date(),
      };

      setMessages([greeting]);

      // Show typing indicator
      setTimeout(() => {
        setIsTyping(true);
      }, 1000);

      // User response
      setTimeout(() => {
        setIsTyping(false);
        const userResponse: ChatMessage = {
          id: `msg_${Date.now()}_1`,
          type: 'system',
          content: {
            text: t('sampleUserMenu', 'Today’s menu includes poha, some jalebi, and a glass of milk.'),
          },
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userResponse]);
      }, 2500);

      // AI follow-up
      setTimeout(() => {
        setIsTyping(true);
      }, 3000);

      setTimeout(() => {
        setIsTyping(false);
        const aiResponse: ChatMessage = {
          id: `msg_${Date.now()}_2`,
          type: 'system',
          content: {
            text: t('aiPhotoPrompt', 'Can you take a photo of your meal so I can analyze the nutritional content? 📸'),
          },
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 4500);
    };

    const newSession: ChatSession = {
      id: sessionId,
      messages: [],
      mealType,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date(),
    };

    setCurrentSession(newSession);
    saveChatSession(newSession);
    simulateConversation();
  }, []);

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
      items_food: ['Poha', 'Banana', 'Milk', 'jalebi'],
      input_menu: ['jalebi'],
      found_items: ['jalebi'],
      missing_items: [],
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
    setIsAnalyzing(true);
    setImagePreview(imageData);
    setShowImageOptions(false);

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

      // Add AI meal menu prompt after analysis
      setTimeout(() => {
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);

          const menuPrompt: ChatMessage = {
            id: `msg_${Date.now()}_menu_prompt`,
            type: 'system',
            content: {
              text: t('menuRecommendation', "Here's today's recommended meal menu based on your analysis:"),
              showMenu: true,
              menu: todaysMenu,
            },
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, menuPrompt]);

          // Start feedback flow in chat instead of questionnaire
          setTimeout(() => {
            startFeedbackFlow();
          }, 2000);
        }, 1500);
      }, 1000);

      toast.success('Image analysis completed!');
      setPhotoAnalyzed(true);
    } catch (error) {
      setIsTyping(false);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleImageUpload(imageUrl);
    }
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      toast.error('Camera permission required');
      return;
    }

    const result = await takePicture();
    if (result?.dataUrl) {
      handleImageUpload(result.dataUrl);
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

  const handleFeedbackAnswer = (questionKey: string, answer: string) => {
    const updatedFeedbackData = { ...feedbackData, [questionKey]: answer };
    setFeedbackData(updatedFeedbackData);

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
          text: t('feedbackSaved', 'Thank you! Your feedback has been saved successfully. 🙏'),
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
    <div className="flex flex-col h-full bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/15 max-w-4xl mx-auto">
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

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/20">
        {messages.map((message, index) => (
          <div key={index}>
            {message.type === 'user' && (
              <div className="flex justify-end mb-3">
                {message.content.image ? (
                  <div className="message-bubble-user">
                    <img
                      src={message.content.image}
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
                    <p>{message.content.text}</p>
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

            {(message.type === 'system' || message.type === 'completion') && (
              <div className="flex justify-start mb-3">
                <div className="message-bubble-ai">
                  <p>{message.content.text || message.content.greeting}</p>

                  {/* Show Menu */}
                  {message.content.showMenu && message.content.menu && (
                    <div className="mt-3 bg-background/80 rounded-lg p-3 border border-border/50">
                      <h4 className="font-semibold text-sm mb-2">📋 {t('todaysMenu', "Today's Meal Menu:")}</h4>
                      <div className="space-y-2">
                        {message.content.menu.map((item: MenuItemType, idx: number) => (
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
                        {message.content.found_items.map((item: string, idx: number) => (
                          <span key={idx} className="bg-success text-white text-xs px-2 py-1 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {message.content.missing_items.length > 0 && (
                      <div className="bg-destructive/10 p-3 rounded-lg">
                        <p className="text-sm font-medium text-destructive mb-2">
                          {t('missingItems', 'Missing Items')}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message.content.missing_items.map((item: string, idx: number) => (
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
                        {Object.entries(message.content.nutritions).map(([food, nutrition], idx) => (
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
                    {message.content.icon && <span className="mr-2">{message.content.icon}</span>}
                    {message.content.text}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {message.content.options?.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-background/80 hover:bg-primary hover:text-primary-foreground flex items-center justify-center gap-1"
                        onClick={() => handleFeedbackAnswer(message.content.questionKey, option.label)}
                      >
                        {option.icon && <span>{option.icon}</span>}
                        <span>{option.label}</span>
                      </Button>
                    ))}
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
                      <p>Freshness: {message.content.freshness}</p>
                      <p>Quantity: {message.content.quantity}</p>
                      <p>Satisfaction: {message.content.satisfaction}</p>
                      {message.content.comments && <p>Comments: {message.content.comments}</p>}
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

      {/* WhatsApp-style Input Area */}
      {!photoAnalyzed && (
        <div className="bg-background border-t border-border p-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleGallerySelect}
              variant="outline"
              size="sm"
              className="flex flex-col items-center p-3 h-auto"
            >
              <Image className="w-5 h-5 mb-1" />
              <span className="text-xs">{t('gallery', 'Gallery')}</span>
            </Button>

            <div className="flex-1 bg-muted rounded-full px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {isAnalyzing
                  ? t('analyzing', 'Analyzing image...')
                  : t('selectPhotoPrompt', 'Select a photo to continue...')}
              </p>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" disabled>
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
