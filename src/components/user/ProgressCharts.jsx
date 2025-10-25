import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ProgressCharts = () => {
  const { userProfile } = useAuth();
  const [weightData, setWeightData] = useState([]);
  const [caloriesData, setCaloriesData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // 7, 30, 90 days

  useEffect(() => {
    if (userProfile?.id) {
      fetchProgressData();
    }
  }, [userProfile?.id, timeRange]);

  const fetchProgressData = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
      const startDate = daysAgo.toISOString().split('T')[0];

      const { data } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (data) {
        setWeightData(data.filter(d => d.weight_kg).map(d => ({
          date: d.date,
          value: d.weight_kg
        })));

        setCaloriesData(data.map(d => ({
          date: d.date,
          burned: d.calories_burned || 0,
          consumed: d.calories_consumed || 0
        })));

        setSleepData(data.filter(d => d.sleep_hours).map(d => ({
          date: d.date,
          value: d.sleep_hours,
          quality: d.sleep_quality
        })));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setLoading(false);
    }
  };

  const calculateTrend = (data) => {
    if (data.length < 2) return { trend: 'neutral', percent: 0 };

    const recent = data.slice(-Math.min(3, data.length));
    const earlier = data.slice(0, Math.min(3, data.length));

    const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + item.value, 0) / earlier.length;

    const diff = ((recentAvg - earlierAvg) / earlierAvg) * 100;

    return {
      trend: diff > 2 ? 'up' : diff < -2 ? 'down' : 'neutral',
      percent: Math.abs(diff).toFixed(1)
    };
  };

  const renderSimpleChart = (data, label, unit = '', color = 'primary') => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No data yet for the selected period</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d.value || 0));
    const minValue = Math.min(...data.map(d => d.value || 0));
    const range = maxValue - minValue;

    const trend = calculateTrend(data);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">
              {data[data.length - 1]?.value?.toFixed(1) || 'N/A'}
              {data[data.length - 1]?.value && unit}
            </div>
            <div className="text-sm text-muted-foreground">Latest {label}</div>
          </div>
          <div className={`flex items-center gap-2 ${
            trend.trend === 'up' ? 'text-green-500' :
            trend.trend === 'down' ? 'text-red-500' :
            'text-muted-foreground'
          }`}>
            {trend.trend === 'up' && <TrendingUp className="w-5 h-5" />}
            {trend.trend === 'down' && <TrendingDown className="w-5 h-5" />}
            {trend.trend === 'neutral' && <Minus className="w-5 h-5" />}
            <span className="text-sm font-semibold">{trend.percent}%</span>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-2">
          {data.map((item, index) => {
            const height = range > 0 ? ((item.value - minValue) / range) * 100 : 50;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground w-20">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className={`h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.max(height, 5)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end pr-3">
                    <span className="text-xs font-medium">
                      {item.value?.toFixed(1)}{unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {data.length > 1 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm font-semibold">{maxValue.toFixed(1)}{unit}</div>
              <div className="text-xs text-muted-foreground">Highest</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold">
                {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}{unit}
              </div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold">{minValue.toFixed(1)}{unit}</div>
              <div className="text-xs text-muted-foreground">Lowest</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCaloriesChart = () => {
    if (caloriesData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No calorie data yet for the selected period</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-red-500">
              {Math.round(caloriesData.reduce((sum, d) => sum + d.consumed, 0) / caloriesData.length)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Consumed</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-500">
              {Math.round(caloriesData.reduce((sum, d) => sum + d.burned, 0) / caloriesData.length)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Burned</div>
          </div>
        </div>

        <div className="space-y-2">
          {caloriesData.map((item, index) => {
            const maxCal = Math.max(item.consumed, item.burned, 2000);
            return (
              <div key={index} className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">Consumed</span>
                      <span className="text-xs font-semibold">{item.consumed}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(item.consumed / maxCal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">Burned</span>
                      <span className="text-xs font-semibold">{item.burned}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(item.burned / maxCal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading progress data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Progress Tracking</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-3 py-1 rounded text-sm ${timeRange === '7' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-3 py-1 rounded text-sm ${timeRange === '30' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('90')}
              className={`px-3 py-1 rounded text-sm ${timeRange === '90' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              90D
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weight">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="calories">Calories</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
          </TabsList>
          <TabsContent value="weight" className="mt-6">
            {renderSimpleChart(weightData, 'weight', ' kg')}
          </TabsContent>
          <TabsContent value="calories" className="mt-6">
            {renderCaloriesChart()}
          </TabsContent>
          <TabsContent value="sleep" className="mt-6">
            {renderSimpleChart(sleepData, 'sleep', ' hrs')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgressCharts;
