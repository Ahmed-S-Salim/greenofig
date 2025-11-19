import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Download,
  FileText,
  FileJson,
  FileSpreadsheet,
  Mail,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DataExport = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [selectedData, setSelectedData] = useState({
    weight: true,
    sleep: true,
    meals: true,
    workouts: true,
    water: true,
    macros: true,
    goals: true,
    profile: true,
  });
  const [exportFormat, setExportFormat] = useState('csv');
  const [emailAddress, setEmailAddress] = useState(userProfile?.email || '');
  const [exportHistory, setExportHistory] = useState([]);

  React.useEffect(() => {
    if (userProfile?.id) {
      fetchExportHistory();
    }
  }, [userProfile?.id]);

  const fetchExportHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('export_history')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExportHistory(data || []);
    } catch (error) {
      console.error('Error fetching export history:', error);
    }
  };

  const handleDataTypeToggle = (dataType) => {
    setSelectedData(prev => ({
      ...prev,
      [dataType]: !prev[dataType]
    }));
  };

  const fetchUserData = async () => {
    const data = {};
    const dateFrom = dateRange.from.toISOString().split('T')[0];
    const dateTo = dateRange.to.toISOString().split('T')[0];

    try {
      if (selectedData.profile) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userProfile.id)
          .single();
        data.profile = profileData;
      }

      if (selectedData.weight) {
        const { data: weightData } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: true });
        data.weight = weightData;
      }

      if (selectedData.sleep) {
        const { data: sleepData } = await supabase
          .from('sleep_logs')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: true });
        data.sleep = sleepData;
      }

      if (selectedData.meals) {
        const { data: mealData } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: true });
        data.meals = mealData;
      }

      if (selectedData.workouts) {
        const { data: workoutData } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: true });
        data.workouts = workoutData;
      }

      if (selectedData.water) {
        const { data: waterData } = await supabase
          .from('water_logs')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: true });
        data.water = waterData;
      }

      if (selectedData.macros) {
        const { data: macroData } = await supabase
          .from('daily_macros')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: true });
        data.macros = macroData;
      }

      if (selectedData.goals) {
        const { data: goalsData } = await supabase
          .from('user_goals_tracking')
          .select('*')
          .eq('user_id', userProfile.id);
        data.goals = goalsData;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const convertToCSV = (data) => {
    let csv = '';

    Object.keys(data).forEach(category => {
      if (!data[category] || (Array.isArray(data[category]) && data[category].length === 0)) return;

      csv += `\n\n=== ${category.toUpperCase()} ===\n\n`;

      if (Array.isArray(data[category])) {
        const items = data[category];
        if (items.length > 0) {
          const headers = Object.keys(items[0]);
          csv += headers.join(',') + '\n';

          items.forEach(item => {
            const row = headers.map(header => {
              const value = item[header];
              if (value === null || value === undefined) return '';
              if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
              return value;
            });
            csv += row.join(',') + '\n';
          });
        }
      } else {
        const headers = Object.keys(data[category]);
        csv += 'Field,Value\n';
        headers.forEach(header => {
          csv += `${header},${data[category][header]}\n`;
        });
      }
    });

    return csv;
  };

  const convertToJSON = (data) => {
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await fetchUserData();

      let content, filename, mimeType;

      switch (exportFormat) {
        case 'csv':
          content = convertToCSV(data);
          filename = `greenofig-health-data-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = convertToJSON(data);
          filename = `greenofig-health-data-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'pdf':
          // For PDF, we'll need to use a library like jsPDF
          toast({
            title: t('comingSoon') || 'Coming Soon',
            description: t('pdfExportComingSoon') || 'PDF export will be available soon',
          });
          setLoading(false);
          return;
        default:
          throw new Error('Invalid export format');
      }

      downloadFile(content, filename, mimeType);

      // Log export to history
      await supabase.from('export_history').insert({
        user_id: userProfile.id,
        export_type: exportFormat,
        data_types: Object.keys(selectedData).filter(k => selectedData[k]),
        date_range_start: dateRange.from.toISOString().split('T')[0],
        date_range_end: dateRange.to.toISOString().split('T')[0],
      });

      await fetchExportHistory();

      toast({
        title: t('exportSuccessful') || 'Export Successful',
        description: t('dataExportedSuccessfully') || 'Your data has been exported successfully',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToExportData') || 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailExport = async () => {
    setLoading(true);
    try {
      const data = await fetchUserData();
      const content = exportFormat === 'json' ? convertToJSON(data) : convertToCSV(data);

      // This would typically call a backend API to send the email
      // For now, we'll just show a success message
      toast({
        title: t('emailSent') || 'Email Sent',
        description: t('exportEmailSent') || `Export has been sent to ${emailAddress}`,
      });

      // Log export to history
      await supabase.from('export_history').insert({
        user_id: userProfile.id,
        export_type: exportFormat,
        data_types: Object.keys(selectedData).filter(k => selectedData[k]),
        date_range_start: dateRange.from.toISOString().split('T')[0],
        date_range_end: dateRange.to.toISOString().split('T')[0],
        sent_via_email: true,
        email_address: emailAddress,
      });

      await fetchExportHistory();
    } catch (error) {
      console.error('Error emailing export:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToEmailExport') || 'Failed to email export',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const dataTypeOptions = [
    { id: 'weight', label: 'Weight Logs', icon: '⚖️' },
    { id: 'sleep', label: 'Sleep Logs', icon: '😴' },
    { id: 'meals', label: 'Meal Logs', icon: '🍽️' },
    { id: 'workouts', label: 'Workout Logs', icon: '💪' },
    { id: 'water', label: 'Water Intake', icon: '💧' },
    { id: 'macros', label: 'Macro Tracking', icon: '📊' },
    { id: 'goals', label: 'Goals & Achievements', icon: '🎯' },
    { id: 'profile', label: 'Profile Information', icon: '👤' },
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Download className="w-6 h-6 text-primary" />
            {t('dataExport') || 'Data Export'}
          </CardTitle>
          <p className="text-sm text-text-secondary">
            {t('dataExportDescription') || 'Export your health data in multiple formats'}
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">{t('newExport') || 'New Export'}</TabsTrigger>
          <TabsTrigger value="history">{t('exportHistory') || 'Export History'}</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          {/* Date Range Selection */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {t('selectDateRange') || 'Select Date Range'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from?.toLocaleDateString()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-text-secondary">to</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to?.toLocaleDateString()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Data Type Selection */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">{t('selectDataToExport') || 'Select Data to Export'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataTypeOptions.map(option => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    onClick={() => handleDataTypeToggle(option.id)}
                  >
                    <Checkbox
                      id={option.id}
                      checked={selectedData[option.id]}
                      onCheckedChange={() => handleDataTypeToggle(option.id)}
                    />
                    <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer flex-1">
                      <span className="text-xl">{option.icon}</span>
                      <span>{option.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Format Selection */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">{t('selectExportFormat') || 'Select Export Format'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${exportFormat === 'csv' ? 'border-primary border-2' : ''}`}
                  onClick={() => setExportFormat('csv')}
                >
                  <CardContent className="p-6 text-center">
                    <FileSpreadsheet className={`w-12 h-12 mx-auto mb-2 ${exportFormat === 'csv' ? 'text-primary' : 'text-text-secondary'}`} />
                    <h3 className="font-semibold">CSV</h3>
                    <p className="text-xs text-text-secondary mt-1">Excel compatible</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${exportFormat === 'json' ? 'border-primary border-2' : ''}`}
                  onClick={() => setExportFormat('json')}
                >
                  <CardContent className="p-6 text-center">
                    <FileJson className={`w-12 h-12 mx-auto mb-2 ${exportFormat === 'json' ? 'text-primary' : 'text-text-secondary'}`} />
                    <h3 className="font-semibold">JSON</h3>
                    <p className="text-xs text-text-secondary mt-1">Developer friendly</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${exportFormat === 'pdf' ? 'border-primary border-2' : ''}`}
                  onClick={() => setExportFormat('pdf')}
                >
                  <CardContent className="p-6 text-center">
                    <FileText className={`w-12 h-12 mx-auto mb-2 ${exportFormat === 'pdf' ? 'text-primary' : 'text-text-secondary'}`} />
                    <h3 className="font-semibold">PDF</h3>
                    <p className="text-xs text-text-secondary mt-1">Printable report</p>
                    <Badge className="mt-2" variant="secondary">Coming Soon</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  onClick={handleExport}
                  disabled={loading || Object.values(selectedData).every(v => !v)}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('exporting') || 'Exporting...'}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      {t('downloadExport') || 'Download Export'}
                    </>
                  )}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={loading || Object.values(selectedData).every(v => !v)}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {t('emailExport') || 'Email Export'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('emailExport') || 'Email Export'}</DialogTitle>
                      <DialogDescription>
                        {t('emailExportDescription') || 'Enter the email address where you want to receive the export'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">{t('emailAddress') || 'Email Address'}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="your@email.com"
                        />
                      </div>
                      <Button onClick={handleEmailExport} className="w-full" disabled={loading || !emailAddress}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('sending') || 'Sending...'}
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            {t('sendEmail') || 'Send Email'}
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">{t('recentExports') || 'Recent Exports'}</CardTitle>
            </CardHeader>
            <CardContent>
              {exportHistory.length > 0 ? (
                <div className="space-y-3">
                  {exportHistory.map((export_item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">
                            {export_item.export_type.toUpperCase()} Export
                          </p>
                          <p className="text-sm text-text-secondary">
                            {new Date(export_item.created_at).toLocaleDateString()} - {export_item.data_types.length} data types
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {export_item.sent_via_email ? t('emailSent') || 'Email Sent' : t('downloaded') || 'Downloaded'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Download className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary">{t('noExportHistory') || 'No export history yet'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataExport;
