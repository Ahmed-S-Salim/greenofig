import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Bot,
  Save,
  Shield,
  Zap,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Clock,
  TrendingUp
} from 'lucide-react';

const AiCoachSettingsAdvanced = ({ provider }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Rate Limiting
    max_requests_per_user_per_day: 50,
    max_requests_per_user_per_hour: 10,
    enable_rate_limiting: true,

    // Response Quality
    response_style: 'balanced',
    response_length: 'medium',
    enable_emojis: true,
    language: 'en',

    // Safety
    enable_content_filter: true,
    prohibited_topics: [],
    medical_disclaimer: true,
    require_user_consent: false,

    // UX
    welcome_message: "Hi! I'm your AI Health Coach. How can I help you today?",
    suggested_questions: [
      "Give me a healthy breakfast idea",
      "Suggest a quick 15-minute workout",
      "How can I increase my energy levels?",
      "What's a good way to de-stress?"
    ],
    enable_typing_indicator: true,
    enable_message_history: true,

    // Integration
    webhook_url: '',
    enable_webhooks: false,
    data_retention_days: 90,
    enable_analytics: true,
    fallback_response: "I'm having trouble responding right now. Please try again in a moment!",

    // Performance
    max_response_time_ms: 10000,
    enable_caching: false,
    cache_duration_minutes: 60,

    // Conversation
    max_conversation_length: 10,
    enable_context_memory: true,
    conversation_timeout_minutes: 30,
  });

  const [newTopic, setNewTopic] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    if (provider?.id) {
      loadAdvancedSettings();
    }
  }, [provider]);

  const loadAdvancedSettings = async () => {
    if (!provider?.id) return;

    const { data, error } = await supabase
      .from('ai_coach_settings')
      .select('*')
      .eq('id', provider.id)
      .single();

    if (data && !error) {
      setSettings(prev => ({
        ...prev,
        ...data,
        prohibited_topics: data.prohibited_topics || [],
        suggested_questions: data.suggested_questions || prev.suggested_questions
      }));
    }
  };

  const handleSave = async () => {
    if (!provider?.id) {
      toast({
        title: 'Error',
        description: 'No provider selected',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('ai_coach_settings')
      .update(settings)
      .eq('id', provider.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Advanced settings saved successfully',
      });
    }

    setLoading(false);
  };

  const addProhibitedTopic = () => {
    if (newTopic.trim()) {
      setSettings(prev => ({
        ...prev,
        prohibited_topics: [...prev.prohibited_topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const removeProhibitedTopic = (index) => {
    setSettings(prev => ({
      ...prev,
      prohibited_topics: prev.prohibited_topics.filter((_, i) => i !== index)
    }));
  };

  const addSuggestedQuestion = () => {
    if (newQuestion.trim()) {
      setSettings(prev => ({
        ...prev,
        suggested_questions: [...prev.suggested_questions, newQuestion.trim()]
      }));
      setNewQuestion('');
    }
  };

  const removeSuggestedQuestion = (index) => {
    setSettings(prev => ({
      ...prev,
      suggested_questions: prev.suggested_questions.filter((_, i) => i !== index)
    }));
  };

  if (!provider) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a provider to configure advanced settings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Advanced Settings
          </h3>
          <p className="text-muted-foreground mt-1">
            Configure {provider.display_name} behavior and limits
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Sparkles className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="rate-limiting" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="rate-limiting" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Rate Limits
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="ux" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            User Experience
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Integration
          </TabsTrigger>
        </TabsList>

        {/* Rate Limiting Tab */}
        <TabsContent value="rate-limiting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Rate Limiting & Usage Controls
              </CardTitle>
              <CardDescription>
                Prevent abuse and control API costs by limiting requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <Switch
                  id="enable_rate_limiting"
                  checked={settings.enable_rate_limiting}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_rate_limiting: checked }))}
                />
                <Label htmlFor="enable_rate_limiting" className="cursor-pointer">
                  Enable rate limiting (recommended for production)
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_per_day">Max Requests Per User/Day</Label>
                  <Input
                    id="max_per_day"
                    type="number"
                    value={settings.max_requests_per_user_per_day}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_requests_per_user_per_day: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 50-100 for regular users
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_per_hour">Max Requests Per User/Hour</Label>
                  <Input
                    id="max_per_hour"
                    type="number"
                    value={settings.max_requests_per_user_per_hour}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_requests_per_user_per_hour: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 10-20 to prevent spam
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">Rate Limiting Best Practices</p>
                    <ul className="mt-2 space-y-1 text-yellow-800 dark:text-yellow-200">
                      <li>• Start conservative (50/day) and increase based on usage</li>
                      <li>• Monitor API costs regularly</li>
                      <li>• Consider premium users with higher limits</li>
                      <li>• Track and alert on unusual spikes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Quality Tab */}
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Response Quality & Style
              </CardTitle>
              <CardDescription>
                Control how the AI responds to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response_style">Response Style</Label>
                  <Select
                    value={settings.response_style}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, response_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">😊 Casual & Friendly</SelectItem>
                      <SelectItem value="balanced">⚖️ Balanced (Recommended)</SelectItem>
                      <SelectItem value="professional">👔 Professional</SelectItem>
                      <SelectItem value="technical">🔬 Technical & Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How formal or casual the AI should be
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response_length">Response Length</Label>
                  <Select
                    value={settings.response_length}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, response_length: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">📝 Short (50-100 words)</SelectItem>
                      <SelectItem value="medium">📄 Medium (100-200 words)</SelectItem>
                      <SelectItem value="long">📖 Long (200-400 words)</SelectItem>
                      <SelectItem value="comprehensive">📚 Comprehensive (400+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Preferred response length
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                      <SelectItem value="de">🇩🇪 German</SelectItem>
                      <SelectItem value="ar">🇸🇦 Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Switch
                    id="enable_emojis"
                    checked={settings.enable_emojis}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_emojis: checked }))}
                  />
                  <Label htmlFor="enable_emojis" className="cursor-pointer">
                    Use emojis in responses 😊
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety & Moderation Tab */}
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety & Moderation
              </CardTitle>
              <CardDescription>
                Control what topics the AI can discuss
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Switch
                    id="enable_content_filter"
                    checked={settings.enable_content_filter}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_content_filter: checked }))}
                  />
                  <Label htmlFor="enable_content_filter" className="cursor-pointer">
                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                    Enable content filtering
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Switch
                    id="medical_disclaimer"
                    checked={settings.medical_disclaimer}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, medical_disclaimer: checked }))}
                  />
                  <Label htmlFor="medical_disclaimer" className="cursor-pointer">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Show medical disclaimer
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prohibited Topics</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., prescription drugs, surgery, etc."
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addProhibitedTopic()}
                  />
                  <Button onClick={addProhibitedTopic} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.prohibited_topics.map((topic, index) => (
                    <Badge key={index} variant="destructive" className="cursor-pointer" onClick={() => removeProhibitedTopic(index)}>
                      {topic} ×
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Topics the AI should refuse to discuss (e.g., prescribing medication, diagnosing conditions)
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex gap-2">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900 dark:text-red-100">Safety Recommendations</p>
                    <ul className="mt-2 space-y-1 text-red-800 dark:text-red-200">
                      <li>• Always keep content filtering enabled</li>
                      <li>• Add prohibited topics for medical advice beyond general wellness</li>
                      <li>• Include disclaimer about consulting healthcare professionals</li>
                      <li>• Regularly review AI responses for quality and safety</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Experience Tab */}
        <TabsContent value="ux">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Experience
              </CardTitle>
              <CardDescription>
                Customize the conversation experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  value={settings.welcome_message}
                  onChange={(e) => setSettings(prev => ({ ...prev, welcome_message: e.target.value }))}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  First message users see when opening the AI Coach
                </p>
              </div>

              <div className="space-y-2">
                <Label>Suggested Questions</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a suggested question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSuggestedQuestion()}
                  />
                  <Button onClick={addSuggestedQuestion} variant="outline">Add</Button>
                </div>
                <div className="space-y-2 mt-2">
                  {settings.suggested_questions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1 text-sm">{question}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeSuggestedQuestion(index)}>×</Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Switch
                    id="enable_typing_indicator"
                    checked={settings.enable_typing_indicator}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_typing_indicator: checked }))}
                  />
                  <Label htmlFor="enable_typing_indicator" className="cursor-pointer">
                    Show typing indicator
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Switch
                    id="enable_message_history"
                    checked={settings.enable_message_history}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_message_history: checked }))}
                  />
                  <Label htmlFor="enable_message_history" className="cursor-pointer">
                    Enable message history
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance & Optimization
              </CardTitle>
              <CardDescription>
                Optimize AI response speed and reliability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_response_time">Max Response Time (ms)</Label>
                  <Input
                    id="max_response_time"
                    type="number"
                    value={settings.max_response_time_ms}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_response_time_ms: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Timeout if AI takes longer than this
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conversation_length">Max Conversation Length</Label>
                  <Input
                    id="conversation_length"
                    type="number"
                    value={settings.max_conversation_length}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_conversation_length: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of messages to remember (context)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conversation_timeout">Conversation Timeout (minutes)</Label>
                  <Input
                    id="conversation_timeout"
                    type="number"
                    value={settings.conversation_timeout_minutes}
                    onChange={(e) => setSettings(prev => ({ ...prev, conversation_timeout_minutes: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Reset context after this period of inactivity
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Switch
                    id="enable_caching"
                    checked={settings.enable_caching}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_caching: checked }))}
                  />
                  <Label htmlFor="enable_caching" className="cursor-pointer flex-1">
                    Enable response caching (faster, cheaper)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Switch
                    id="enable_context_memory"
                    checked={settings.enable_context_memory}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_context_memory: checked }))}
                  />
                  <Label htmlFor="enable_context_memory" className="cursor-pointer flex-1">
                    Remember conversation context
                  </Label>
                </div>
              </div>

              {settings.enable_caching && (
                <div className="space-y-2">
                  <Label htmlFor="cache_duration">Cache Duration (minutes)</Label>
                  <Input
                    id="cache_duration"
                    type="number"
                    value={settings.cache_duration_minutes}
                    onChange={(e) => setSettings(prev => ({ ...prev, cache_duration_minutes: parseInt(e.target.value) }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integration & Data
              </CardTitle>
              <CardDescription>
                Connect with external services and manage data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fallback_response">Fallback Response (Error Message)</Label>
                <Textarea
                  id="fallback_response"
                  value={settings.fallback_response}
                  onChange={(e) => setSettings(prev => ({ ...prev, fallback_response: e.target.value }))}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Shown when AI fails to respond
                </p>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <Switch
                  id="enable_webhooks"
                  checked={settings.enable_webhooks}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_webhooks: checked }))}
                />
                <Label htmlFor="enable_webhooks" className="cursor-pointer">
                  Enable webhooks for external integrations
                </Label>
              </div>

              {settings.enable_webhooks && (
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    type="url"
                    placeholder="https://example.com/webhook"
                    value={settings.webhook_url}
                    onChange={(e) => setSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Receive notifications when users interact with AI
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_retention">Data Retention (days)</Label>
                  <Input
                    id="data_retention"
                    type="number"
                    value={settings.data_retention_days}
                    onChange={(e) => setSettings(prev => ({ ...prev, data_retention_days: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to keep conversation history
                  </p>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <Switch
                    id="enable_analytics"
                    checked={settings.enable_analytics}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_analytics: checked }))}
                  />
                  <Label htmlFor="enable_analytics" className="cursor-pointer">
                    Track usage analytics
                  </Label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Analytics & Insights</p>
                    <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
                      <li>• Track user engagement and satisfaction</li>
                      <li>• Monitor AI performance and response quality</li>
                      <li>• Identify popular questions and topics</li>
                      <li>• Optimize based on usage patterns</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? <Sparkles className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Advanced Settings
        </Button>
      </div>
    </div>
  );
};

export default AiCoachSettingsAdvanced;
