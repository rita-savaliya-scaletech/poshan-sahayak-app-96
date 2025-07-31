import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, Utensils, Users, MessageCircle, AlertTriangle, XCircle, Send } from 'lucide-react';

interface QuestionnaireData {
  freshness: string;
  quantity: string;
  satisfaction: string;
  comments: string;
}

interface MealQuestionnaireProps {
  onComplete: (data: QuestionnaireData) => void;
}

const MealQuestionnaire = ({ onComplete }: MealQuestionnaireProps) => {
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireData>({
    freshness: '',
    quantity: '',
    satisfaction: '',
    comments: ''
  });
  const [chatMessages, setChatMessages] = useState<Array<{
    type: 'question' | 'answer';
    content: string;
    timestamp: string;
    icon?: React.ReactNode;
    options?: any[];
    questionId?: string;
  }>>([]);
  const [showTyping, setShowTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [pendingAnswer, setPendingAnswer] = useState('');

  const questions = [
    {
      id: 'freshness',
      icon: <Clock className="w-5 h-5 text-primary" />,
      question: t('wasMealFresh', 'Was the meal fresh?'),
      options: [
        { value: 'fresh', label: t('yesFresh', 'Yes, fresh'), icon: '✅', color: 'text-success' },
        { value: 'somewhat', label: t('somewhatFresh', 'Somewhat fresh'), icon: '⚠️', color: 'text-warning' },
        { value: 'not_fresh', label: t('notFresh', 'Not fresh'), icon: '❌', color: 'text-destructive' }
      ]
    },
    {
      id: 'quantity',
      icon: <Utensils className="w-5 h-5 text-primary" />,
      question: t('wasQuantitySufficient', 'Was the quantity of food sufficient?'),
      options: [
        { value: 'sufficient', label: t('sufficientForAll', 'Sufficient for all students'), icon: '✅', color: 'text-success' },
        { value: 'slightly_less', label: t('slightlyLess', 'Slightly less'), icon: '⚠️', color: 'text-warning' },
        { value: 'not_enough', label: t('notEnoughAtAll', 'Not enough at all'), icon: '❌', color: 'text-destructive' }
      ]
    },
    {
      id: 'satisfaction',
      icon: <Users className="w-5 h-5 text-primary" />,
      question: t('wereStudentsSatisfied', 'Were the students satisfied with the meal?'),
      options: [
        { value: 'happy', label: t('studentsHappy', 'Yes, students were happy'), icon: '😊', color: 'text-success' },
        { value: 'neutral', label: t('neutralReaction', 'Neutral / Mixed reaction'), icon: '😐', color: 'text-warning' },
        { value: 'unhappy', label: t('studentsUnhappy', 'No, students were unhappy'), icon: '🙁', color: 'text-destructive' }
      ]
    },
    {
      id: 'comments',
      icon: <MessageCircle className="w-5 h-5 text-primary" />,
      question: t('additionalComments', 'Do you have any additional comments or observations?'),
      type: 'textarea'
    }
  ];

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Add initial greeting message
    if (chatMessages.length === 0) {
      setTimeout(() => {
        setChatMessages([{
          type: 'question',
          content: t('mealFeedbackGreeting', 'Hi! I need to collect some feedback about today\'s meal. This will take just a few minutes.'),
          timestamp: formatTime(),
          icon: <MessageCircle className="w-4 h-4" />
        }]);
        
        // Add first question after greeting
        setTimeout(() => {
          setShowTyping(true);
          setTimeout(() => {
            setShowTyping(false);
            setChatMessages(prev => [...prev, {
              type: 'question',
              content: questions[0].question,
              timestamp: formatTime(),
              icon: questions[0].icon,
              options: questions[0].options,
              questionId: questions[0].id
            }]);
          }, 1500);
        }, 2000);
      }, 500);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, showTyping]);

  const handleAnswerSelect = (value: string, label: string) => {
    const currentQ = questions[currentQuestion];
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    
    // Add user's answer to chat
    setChatMessages(prev => [...prev, {
      type: 'answer',
      content: label,
      timestamp: formatTime()
    }]);

    // Show typing and next question after delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const nextQ = questions[currentQuestion + 1];
          setChatMessages(prev => [...prev, {
            type: 'question',
            content: nextQ.question,
            timestamp: formatTime(),
            icon: nextQ.icon,
            options: nextQ.options,
            questionId: nextQ.id
          }]);
          setCurrentQuestion(prev => prev + 1);
        }, 1500);
      } else {
        // End of questionnaire
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          setChatMessages(prev => [...prev, {
            type: 'question',
            content: t('thankYouMessage', 'Thank you for your feedback! Your responses have been recorded.'),
            timestamp: formatTime(),
            icon: <CheckCircle className="w-4 h-4 text-success" />
          }]);
          setTimeout(() => onComplete(answers), 2000);
        }, 1000);
      }
    }, 1000);
  };

  const handleTextSubmit = () => {
    if (pendingAnswer.trim()) {
      handleAnswerSelect(pendingAnswer, pendingAnswer);
      setPendingAnswer('');
    }
  };

  const getCurrentQuestionOptions = () => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    return lastMessage?.options || [];
  };

  const isTextAreaQuestion = () => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    return lastMessage?.questionId === 'comments';
  };

  return (
    <Card className="h-[600px] md:h-[700px] lg:h-[600px] bg-background border border-border/50 shadow-lg flex flex-col max-w-4xl mx-auto w-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border/30 bg-muted/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('mealFeedback', 'Meal Feedback')}</h3>
            <p className="text-sm text-muted-foreground">{t('onlineNow', 'Online now')}</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                  message.type === 'answer'
                    ? 'bg-primary text-primary-foreground ml-8'
                    : 'bg-muted/50 text-foreground mr-8'
                }`}
              >
                {message.type === 'question' && message.icon && (
                  <div className="flex items-center space-x-2 mb-2">
                    {message.icon}
                    <span className="text-xs font-medium opacity-70">System</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className={`text-xs mt-2 opacity-60 ${message.type === 'answer' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {showTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted/50 rounded-2xl p-3 mr-8">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">{t('typing', 'typing...')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Answer Options / Input Area */}
      {chatMessages.length > 1 && !showTyping && (
        <div className="p-4 border-t border-border/30 bg-muted/20">
          {isTextAreaQuestion() ? (
            <div className="flex space-x-2">
              <Textarea
                placeholder={t('commentsPlaceholder', 'Type here if you noticed anything important about the meal or service…')}
                value={pendingAnswer}
                onChange={(e) => setPendingAnswer(e.target.value)}
                className="flex-1 min-h-[60px] bg-background resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextSubmit();
                  }
                }}
              />
              <Button
                onClick={handleTextSubmit}
                disabled={!pendingAnswer.trim()}
                size="sm"
                className="self-end bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">{t('selectAnswer', 'Choose your answer:')}</p>
              <div className="grid gap-2">
                {getCurrentQuestionOptions().map((option: any) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    onClick={() => handleAnswerSelect(option.value, option.label)}
                    className="justify-start h-auto p-3 bg-background hover:bg-muted/50 border-border/50"
                  >
                    <span className="text-base mr-3">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default MealQuestionnaire;