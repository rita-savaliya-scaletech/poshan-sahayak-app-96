import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Image, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import MealQuestionnaire from './MealQuestionnaire';
import { useCamera } from '@/hooks/useCamera';
import { saveChatSession, updateChatSession, generateSessionId, getMealTypeFromTime, type ChatSession, type ChatMessage } from '@/utils/chatStorage';

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
  nutritions: Record<string, {
    calories?: string;
    protein?: string;
    fat?: string;
    carbs?: string;
  }>;
}

interface ChatInterfaceProps {
  onNavigateToHistory?: () => void;
}

const ChatInterface = ({ onNavigateToHistory }: ChatInterfaceProps) => {
  const { t } = useTranslation();
  const { takePicture, selectFromGallery, requestPermissions } = useCamera();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  // Sample menu data (in real app, this would come from backend)
  const todaysMenu: MenuItemType[] = [
    { name: 'Poha', quantity: '1 bowl', emoji: '🍚' },
    { name: 'Banana', quantity: '1 piece', emoji: '🍌' },
    { name: 'Milk', quantity: '1 glass', emoji: '🥛' },
    { name: 'Jalebi', quantity: '2 pieces', emoji: '🟡' }
  ];

  // Initialize chat with greeting and menu
  useEffect(() => {
    const sessionId = generateSessionId();
    const mealType = getMealTypeFromTime();
    const mealName = mealType === 'breakfast' ? t('breakfast') : 
                   mealType === 'lunch' ? t('lunch') : t('dinner');
    
    const initialMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'system' as const,
      content: {
        greeting: getGreeting(),
        menu: todaysMenu,
        meal: mealName
      },
      timestamp: new Date()
    };
    
    const newSession: ChatSession = {
      id: sessionId,
      messages: [initialMessage],
      mealType,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date()
    };
    
    setMessages([initialMessage]);
    setCurrentSession(newSession);
    saveChatSession(newSession);
  }, [t]);

  // Mock AI analysis function
  const analyzeImage = async (imageFile: File): Promise<AnalysisResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis result
    return {
      items_food: ["poha", "banana", "milk", "jalebi", "green chili"],
      input_menu: ["poha", "banana", "milk", "jalebi"],
      found_items: ["poha", "banana", "jalebi"],
      missing_items: ["milk"],
      nutritions: {
        "poha": {
          calories: "approximately 250 kcal per bowl",
          protein: "6g",
          fat: "8g",
          carbs: "40g"
        },
        "banana": {
          calories: "approximately 105 kcal per piece",
          protein: "1.3g",
          fat: "0.4g",
          carbs: "27g"
        },
        "jalebi": {
          calories: "approximately 150 kcal per piece",
          protein: "2g",
          fat: "5g",
          carbs: "25g"
        }
      }
    };
  };

  const handleImageUpload = async (imageData: string) => {
    setIsAnalyzing(true);
    setImagePreview(imageData);
    
    // Add user message with image preview
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user' as const,
      content: { image: imageData, fileName: 'food-image.jpg' },
      timestamp: new Date()
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Update session with new message
    if (currentSession) {
      const updatedSession = { ...currentSession, messages: updatedMessages };
      setCurrentSession(updatedSession);
      saveChatSession(updatedSession);
    }

    try {
      // Convert data URL to File for analysis
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'food-image.jpg', { type: 'image/jpeg' });
      
      const result = await analyzeImage(file);
      
      // Add analysis result
      const analysisMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'analysis' as const,
        content: result,
        timestamp: new Date()
      };
      const updatedMessages = [...messages, analysisMessage];
      setMessages(updatedMessages);
      
      // Update session with analysis
      if (currentSession) {
        const updatedSession = { 
          ...currentSession, 
          messages: updatedMessages,
          analysisResult: result
        };
        setCurrentSession(updatedSession);
        saveChatSession(updatedSession);
      }
      
      // Show questionnaire after analysis
      setTimeout(() => {
        setShowQuestionnaire(true);
      }, 1000);
      
      toast.success('Image analysis completed!');
    } catch (error) {
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
      // Fallback to file input on web
      fileInputRef.current?.click();
      return;
    }

    const result = await selectFromGallery();
    if (result?.dataUrl) {
      handleImageUpload(result.dataUrl);
    }
  };

  const handleQuestionnaireComplete = (data: any) => {
    // Add questionnaire response to messages
    const questionnaireMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'questionnaire' as const,
      content: data,
      timestamp: new Date()
    };
    const updatedMessages = [...messages, questionnaireMessage];
    setMessages(updatedMessages);
    
    // Add completion message and navigate to history
    setTimeout(() => {
      const completionMessage: ChatMessage = {
        id: `msg_${Date.now()}_completion`,
        type: 'completion' as const,
        content: { message: t('feedbackSaved', 'Thank you! Your feedback has been saved successfully.') },
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, completionMessage];
      setMessages(finalMessages);
      setShowQuestionnaire(false);
      
      // Complete the session
      if (currentSession) {
        const completedSession = {
          ...currentSession,
          messages: finalMessages,
          questionnaireData: data,
          status: 'completed' as const,
          completedAt: new Date()
        };
        setCurrentSession(completedSession);
        saveChatSession(completedSession);
      }
      
      toast.success('Feedback submitted successfully!');
      
      // Navigate to history after completion
      setTimeout(() => {
        onNavigateToHistory?.();
        toast.success(t('redirectingToHistory', 'Redirecting to history dashboard...'));
      }, 2000);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/15">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message, index) => (
          <div key={index} className="space-y-3">
            {message.type === 'system' && (
              <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-primary/20 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="text-2xl">👋</div>
                    </div>
                    <h3 className="text-xl font-bold text-primary">
                      {message.content.greeting}!
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary text-lg flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-food-orange to-food-yellow rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm">🥘</span>
                      </div>
                      {t('todaysMenu', { meal: message.content.meal })}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {message.content.menu.map((item: MenuItemType, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-lg">{item.emoji}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.quantity}</div>
                            </div>
                          </div>
                          <Badge className="bg-primary text-white px-3 py-1 rounded-full">
                            ✓
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {message.type === 'user' && (
              <div className="flex justify-end">
                <Card className="p-4 bg-primary text-primary-foreground max-w-xs rounded-2xl shadow-lg">
                  <div className="space-y-3">
                    <img 
                      src={message.content.image} 
                      alt="Uploaded food"
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <p className="text-sm flex items-center">
                      <span className="mr-2">📸</span>
                      {message.content.fileName}
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {message.type === 'analysis' && (
              <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-success/30 rounded-2xl">
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <h4 className="font-bold text-success text-lg">Analysis Complete</h4>
                  </div>

                  {/* Found Items */}
                  <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20">
                    <h5 className="font-semibold text-success flex items-center space-x-2 mb-3">
                      <span className="text-lg">✅</span>
                      <span>{t('itemsFound')}</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {message.content.found_items.map((item: string, idx: number) => (
                        <Badge key={idx} className="bg-success text-white px-3 py-1 rounded-full">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Missing Items */}
                  {message.content.missing_items.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl border border-destructive/20">
                      <h5 className="font-semibold text-destructive flex items-center space-x-2 mb-3">
                        <span className="text-lg">❌</span>
                        <span>{t('missingItems')}</span>
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {message.content.missing_items.map((item: string, idx: number) => (
                          <Badge key={idx} className="bg-destructive text-white px-3 py-1 rounded-full">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nutrition Info */}
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                    <h5 className="font-semibold text-primary flex items-center space-x-2 mb-3">
                      <span className="text-lg">🥗</span>
                      <span>{t('nutritionInfo')}</span>
                    </h5>
                    <div className="space-y-3">
                      {Object.entries(message.content.nutritions).map(([food, nutrition], idx) => (
                        <div key={idx} className="p-3 bg-white/80 rounded-lg border border-primary/10">
                          <h6 className="font-semibold capitalize mb-2 text-primary">{food}</h6>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {nutrition && typeof nutrition === 'object' && 'calories' in nutrition && nutrition.calories && (
                              <div>
                                <span className="text-muted-foreground font-medium">{t('calories')}: </span>
                                <span className="text-foreground">{String(nutrition.calories)}</span>
                              </div>
                            )}
                            {nutrition && typeof nutrition === 'object' && 'protein' in nutrition && nutrition.protein && (
                              <div>
                                <span className="text-muted-foreground font-medium">{t('protein')}: </span>
                                <span className="text-foreground">{String(nutrition.protein)}</span>
                              </div>
                            )}
                            {nutrition && typeof nutrition === 'object' && 'fat' in nutrition && nutrition.fat && (
                              <div>
                                <span className="text-muted-foreground font-medium">{t('fat')}: </span>
                                <span className="text-foreground">{String(nutrition.fat)}</span>
                              </div>
                            )}
                            {nutrition && typeof nutrition === 'object' && 'carbs' in nutrition && nutrition.carbs && (
                              <div>
                                <span className="text-muted-foreground font-medium">{t('carbs')}: </span>
                                <span className="text-foreground">{String(nutrition.carbs)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {message.type === 'questionnaire' && (
              <Card className="p-4 bg-muted/50 border-success/20">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h4 className="font-semibold text-success">{t('feedbackRecorded', 'Feedback Recorded')}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">{t('freshness', 'Freshness')}: </span>
                      <span className="capitalize">{message.content.freshness}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t('quantity', 'Quantity')}: </span>
                      <span className="capitalize">{message.content.quantity}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t('satisfaction', 'Satisfaction')}: </span>
                      <span className="capitalize">{message.content.satisfaction}</span>
                    </div>
                  </div>
                  {message.content.comments && (
                    <div>
                      <span className="font-medium">{t('comments', 'Comments')}: </span>
                      <p className="text-muted-foreground mt-1">{message.content.comments}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {message.type === 'completion' && (
              <Card className="p-4 bg-success/10 border-success/20 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-success" />
                  <h4 className="font-semibold text-success">{message.content.message}</h4>
                </div>
              </Card>
            )}

            {/* Timestamp */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{message.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Analyzing Indicator */}
        {isAnalyzing && (
          <Card className="p-4 bg-warning/5 border-warning/20">
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-5 h-5 border-2 border-warning border-t-transparent rounded-full"></div>
              <span className="text-warning font-medium">{t('analyzing')}</span>
            </div>
          </Card>
        )}

        {/* Questionnaire */}
        {showQuestionnaire && (
          <MealQuestionnaire onComplete={handleQuestionnaireComplete} />
        )}
      </div>

      {/* Upload Controls - Enhanced style */}
      {!showQuestionnaire && !isAnalyzing && (
        <div className="p-4 md:p-6 bg-white/95 backdrop-blur-sm border-t border-border/20 max-w-4xl mx-auto w-full">
          <div className="flex flex-col space-y-3">
            <p className="text-center text-sm font-medium text-muted-foreground">
              {t('captureInstructions', 'Take a photo of the meal served today')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={handleCameraCapture}
                className="bg-primary text-primary-foreground hover:bg-primary/90 py-3 md:py-4"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                {t('takePhoto')}
              </Button>
              <Button
                onClick={handleGallerySelect}
                variant="outline"
                className="border-2 border-primary/20 hover:bg-primary/5 py-3 md:py-4"
                size="lg"
              >
                <Image className="w-5 h-5 mr-2" />
                {t('selectFromGallery')}
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-2 border-primary/20 hover:bg-primary/5 py-3 md:py-4"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                {t('uploadFile')}
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;