import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';
import { getChatHistory, type ChatSession } from '@/utils/chatStorage';

const HistoryDashboard = () => {
  const { t } = useTranslation();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ChatSession[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [mealFilter, setMealFilter] = useState<string>('all');

  useEffect(() => {
    const history = getChatHistory();
    setChatHistory(history);
    setFilteredHistory(history);
  }, []);

  useEffect(() => {
    let filtered = chatHistory;
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date(today);
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(session => 
            session.date === today.toISOString().split('T')[0]
          );
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(session => 
            new Date(session.date) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(session => 
            new Date(session.date) >= filterDate
          );
          break;
      }
    }
    
    // Apply meal filter
    if (mealFilter !== 'all') {
      filtered = filtered.filter(session => session.mealType === mealFilter);
    }
    
    setFilteredHistory(filtered);
  }, [chatHistory, dateFilter, mealFilter]);

  // Calculate stats from real data
  const stats = {
    totalReports: chatHistory.length,
    thisWeek: chatHistory.filter(session => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(session.date) >= weekAgo;
    }).length,
    completionRate: chatHistory.length > 0 
      ? Math.round((chatHistory.filter(s => s.status === 'completed').length / chatHistory.length) * 100)
      : 0,
    studentsServed: chatHistory.reduce((total, session) => {
      // Estimate based on meal type - this would come from actual data in real app
      const estimates = { breakfast: 80, lunch: 120, dinner: 90 };
      return total + (estimates[session.mealType] || 0);
    }, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/15">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/20 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('history')}</h2>
          <p className="text-muted-foreground">{t('trackProgress', 'Track your meal reporting progress')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Filters */}
        <Card className="p-4 md:p-6 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-primary/20">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">{t('filters', 'Filters')}</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('selectDate', 'Select date range')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTime', 'All time')}</SelectItem>
                  <SelectItem value="today">{t('today', 'Today')}</SelectItem>
                  <SelectItem value="week">{t('thisWeek', 'This week')}</SelectItem>
                  <SelectItem value="month">{t('thisMonth', 'This month')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={mealFilter} onValueChange={setMealFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('selectMeal', 'Select meal type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allMeals', 'All meals')}</SelectItem>
                  <SelectItem value="breakfast">{t('breakfast', 'Breakfast')}</SelectItem>
                  <SelectItem value="lunch">{t('lunch', 'Lunch')}</SelectItem>
                  <SelectItem value="dinner">{t('dinner', 'Dinner')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stats.totalReports}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">{stats.thisWeek}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{stats.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-health-green/5 to-health-green/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-green/10 rounded-lg">
                <Users className="w-5 h-5 text-health-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-health-green">{stats.studentsServed}</p>
                <p className="text-sm text-muted-foreground">Students Served</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Session History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-semibold text-foreground">{t('sessionHistory', 'Session History')}</h3>
            <Badge variant="outline" className="text-sm">
              {filteredHistory.length} {t('sessions', 'sessions')}
            </Badge>
          </div>
          
          {filteredHistory.length === 0 ? (
            <Card className="p-8 text-center bg-white/95 backdrop-blur-sm">
              <div className="space-y-3">
                <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                <h4 className="font-medium text-muted-foreground">{t('noSessionsFound', 'No sessions found')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('noSessionsDescription', 'Try adjusting your filters or start a new meal report.')}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredHistory.map((session) => (
                <Card key={session.id} className="p-4 md:p-6 bg-white/95 backdrop-blur-sm shadow-lg border border-border/50 hover:shadow-xl transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                          <span className="text-lg">
                            {session.mealType === 'breakfast' ? '🌅' : 
                             session.mealType === 'lunch' ? '🌞' : '🌙'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground capitalize">
                            {t(session.mealType)}
                          </h4>
                          <p className="text-sm text-muted-foreground">{session.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(session.status)}>
                          {t(session.status)}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{session.createdAt.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Results */}
                    {session.analysisResult && (
                      <div className="grid sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-border/30">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm">
                            <span className="font-medium">{session.analysisResult.found_items?.length || 0}</span> {t('itemsFound', 'items found')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm">
                            <span className="font-medium">{session.analysisResult.missing_items?.length || 0}</span> {t('missingItems', 'missing')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Questionnaire Summary */}
                    {session.questionnaireData && (
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-3 rounded-lg border border-primary/20">
                          <span className="font-medium text-primary">{t('freshness')}: </span>
                          <span className="capitalize">{session.questionnaireData.freshness}</span>
                        </div>
                        <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 p-3 rounded-lg border border-secondary/20">
                          <span className="font-medium text-secondary">{t('quantity')}: </span>
                          <span className="capitalize">{session.questionnaireData.quantity}</span>
                        </div>
                        <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-3 rounded-lg border border-accent/20">
                          <span className="font-medium text-accent">{t('satisfaction')}: </span>
                          <span className="capitalize">{session.questionnaireData.satisfaction}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDashboard;