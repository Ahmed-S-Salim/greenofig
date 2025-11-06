import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Bot, Plus, Edit, Trash2, Save, X, CheckCircle, XCircle, Loader2, Sparkles, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AiCoachSettingsAdvanced from './AiCoachSettingsAdvanced';

const AiCoachSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [formState, setFormState] = useState({
    provider: 'gemini',
    api_key: '',
    model_name: '',
    temperature: 0.7,
    max_tokens: 500,
    display_name: '',
    description: '',
    system_prompt: '',
    api_endpoint: '',
    is_active: false,
  });

  // Provider presets
  const providerPresets = {
    gemini: {
      models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-pro-latest'],
      default_model: 'gemini-2.5-flash',
      default_system_prompt: 'You are a friendly and knowledgeable health and wellness AI coach for GreeonFig. Provide personalized health advice, meal suggestions, workout tips, and motivation. Keep responses concise, friendly, and actionable. Use emojis occasionally to be engaging.',
    },
    openai: {
      models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
      default_model: 'gpt-3.5-turbo',
      default_system_prompt: 'You are a professional health and wellness coach specializing in nutrition, fitness, and holistic well-being. Provide evidence-based, personalized guidance while being warm and supportive.',
    },
    claude: {
      models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      default_model: 'claude-3-haiku-20240307',
      default_system_prompt: 'You are an empathetic health coach with expertise in nutrition, exercise, and mental wellness. Offer practical, science-backed advice in a friendly, conversational tone.',
    },
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_coach_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load AI settings',
        variant: 'destructive',
      });
    } else {
      setSettings(data || []);
    }
    setLoading(false);
  };

  const handleProviderChange = (provider) => {
    const preset = providerPresets[provider];
    setFormState(prev => ({
      ...prev,
      provider,
      model_name: preset?.default_model || '',
      system_prompt: preset?.default_system_prompt || prev.system_prompt,
      display_name: provider === 'custom' ? '' : `${provider.charAt(0).toUpperCase() + provider.slice(1)} AI Coach`,
      description: provider === 'custom' ? '' : `Powered by ${provider.charAt(0).toUpperCase() + provider.slice(1)} API`,
    }));
  };

  const handleSave = async () => {
    if (!formState.api_key || !formState.display_name) {
      toast({
        title: 'Validation Error',
        description: 'API Key and Display Name are required',
        variant: 'destructive',
      });
      return;
    }

    // If setting as active, deactivate all others first
    if (formState.is_active) {
      await supabase
        .from('ai_coach_settings')
        .update({ is_active: false })
        .neq('id', editingItem?.id || '');
    }

    const dataToSave = { ...formState };

    let error;
    if (editingItem) {
      const result = await supabase
        .from('ai_coach_settings')
        .update(dataToSave)
        .eq('id', editingItem.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('ai_coach_settings')
        .insert(dataToSave);
      error = result.error;
    }

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `AI provider ${editingItem ? 'updated' : 'added'} successfully`,
      });
      setIsDialogOpen(false);
      resetForm();
      fetchSettings();
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormState({
      provider: item.provider,
      api_key: item.api_key,
      model_name: item.model_name || '',
      temperature: item.temperature || 0.7,
      max_tokens: item.max_tokens || 500,
      display_name: item.display_name,
      description: item.description || '',
      system_prompt: item.system_prompt || '',
      api_endpoint: item.api_endpoint || '',
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this AI provider?')) return;

    const { error } = await supabase
      .from('ai_coach_settings')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'AI provider removed successfully',
      });
      fetchSettings();
    }
  };

  const handleActivate = async (id, currentStatus) => {
    // Deactivate all first
    if (!currentStatus) {
      await supabase
        .from('ai_coach_settings')
        .update({ is_active: false })
        .neq('id', id);
    }

    // Toggle the selected one
    const { error } = await supabase
      .from('ai_coach_settings')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `AI provider ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      fetchSettings();
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormState({
      provider: 'gemini',
      api_key: '',
      model_name: '',
      temperature: 0.7,
      max_tokens: 500,
      display_name: '',
      description: '',
      system_prompt: '',
      api_endpoint: '',
      is_active: false,
    });
  };

  const getProviderIcon = (provider) => {
    const icons = {
      gemini: '🔮',
      openai: '🤖',
      claude: '🧠',
      custom: '⚙️',
    };
    return icons[provider] || '🤖';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Coach Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure AI providers for the health coaching chatbot
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add AI Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit AI Provider' : 'Add AI Provider'}
              </DialogTitle>
              <DialogDescription>
                Configure an AI provider for the health coaching feature
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Select
                    value={formState.provider}
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-effect">
                      <SelectItem value="gemini">🔮 Google Gemini</SelectItem>
                      <SelectItem value="openai">🤖 OpenAI (GPT)</SelectItem>
                      <SelectItem value="claude">🧠 Anthropic Claude</SelectItem>
                      <SelectItem value="custom">⚙️ Custom API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_name">Model</Label>
                  {formState.provider !== 'custom' && providerPresets[formState.provider] ? (
                    <Select
                      value={formState.model_name}
                      onValueChange={(value) => setFormState(prev => ({ ...prev, model_name: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providerPresets[formState.provider].models.map(model => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="model_name"
                      value={formState.model_name}
                      onChange={(e) => setFormState(prev => ({ ...prev, model_name: e.target.value }))}
                      placeholder="e.g., custom-model-v1"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={formState.display_name}
                  onChange={(e) => setFormState(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="e.g., Gemini Health Coach"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this AI provider"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">API Key *</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={formState.api_key}
                  onChange={(e) => setFormState(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Enter your API key"
                />
              </div>

              {formState.provider === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="api_endpoint">API Endpoint *</Label>
                  <Input
                    id="api_endpoint"
                    value={formState.api_endpoint}
                    onChange={(e) => setFormState(prev => ({ ...prev, api_endpoint: e.target.value }))}
                    placeholder="https://api.example.com/v1/chat"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={formState.temperature}
                    onChange={(e) => setFormState(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">0.0 = Focused, 1.0 = Balanced, 2.0 = Creative</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={formState.max_tokens}
                    onChange={(e) => setFormState(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">Max response length (~4 chars/token)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={formState.system_prompt}
                  onChange={(e) => setFormState(prev => ({ ...prev, system_prompt: e.target.value }))}
                  placeholder="Instructions for the AI coach's personality and behavior..."
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4 bg-muted/30">
                <Switch
                  id="is_active"
                  checked={formState.is_active}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Set as active provider (only one can be active)
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Provider
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured AI Providers</CardTitle>
          <CardDescription>
            Manage AI providers for the health coaching chatbot. Only one can be active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI providers configured yet.</p>
              <p className="text-sm">Click "Add AI Provider" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Max Tokens</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {settings.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-b"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getProviderIcon(item.provider)}</span>
                            <div>
                              <p className="font-medium">{item.display_name}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {item.model_name || 'default'}
                          </code>
                        </TableCell>
                        <TableCell>{item.temperature}</TableCell>
                        <TableCell>{item.max_tokens}</TableCell>
                        <TableCell>
                          <Badge
                            variant={item.is_active ? 'default' : 'secondary'}
                            className="gap-1"
                          >
                            {item.is_active ? (
                              <><CheckCircle className="h-3 w-3" /> Active</>
                            ) : (
                              <><XCircle className="h-3 w-3" /> Inactive</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant={item.is_active ? 'secondary' : 'default'}
                              onClick={() => handleActivate(item.id, item.is_active)}
                            >
                              {item.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedProvider(item)}
                              title="Advanced Settings"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings Section */}
      {selectedProvider && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Advanced Configuration</h2>
            <Button variant="outline" onClick={() => setSelectedProvider(null)}>
              <X className="h-4 w-4 mr-2" />
              Close Advanced Settings
            </Button>
          </div>
          <AiCoachSettingsAdvanced provider={selectedProvider} />
        </div>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">💡 Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• <strong>Gemini:</strong> Fast, free tier available (60 req/min), great for development</p>
          <p>• <strong>OpenAI:</strong> GPT-4 for best quality, GPT-3.5-turbo for cost-effectiveness</p>
          <p>• <strong>Claude:</strong> Excellent for empathetic responses, good context handling</p>
          <p>• <strong>Temperature:</strong> Lower (0.3-0.5) for consistent advice, higher (0.7-1.0) for varied responses</p>
          <p>• <strong>Max Tokens:</strong> 500 = ~200 words, 1000 = ~400 words</p>
          <p>• <strong>System Prompt:</strong> Customize the AI's personality and expertise area</p>
          <p>• <strong>Advanced Settings:</strong> Click the ⚙️ Settings button to configure rate limits, safety, and more</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiCoachSettings;
