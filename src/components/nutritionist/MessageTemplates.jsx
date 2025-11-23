import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Star,
  Clock,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATE_CATEGORIES = [
  { id: 'welcome', name: 'Welcome Messages', icon: MessageSquare, color: 'bg-blue-100 text-blue-700' },
  { id: 'check-in', name: 'Check-ins', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  { id: 'motivation', name: 'Motivation', icon: Award, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'reminder', name: 'Reminders', icon: Clock, color: 'bg-orange-100 text-orange-700' },
  { id: 'feedback', name: 'Feedback', icon: TrendingUp, color: 'bg-purple-100 text-purple-700' },
  { id: 'follow-up', name: 'Follow-ups', icon: Calendar, color: 'bg-pink-100 text-pink-700' },
  { id: 'concern', name: 'Concerns', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  { id: 'custom', name: 'Custom', icon: FileText, color: 'bg-gray-100 text-gray-700' }
];

const PRESET_TEMPLATES = [
  {
    id: 'welcome-new',
    category: 'welcome',
    title: 'Welcome New Client',
    subject: 'Welcome to Your Nutrition Journey!',
    content: `Hi {{client_name}},

Welcome! I'm excited to work with you on your nutrition journey. I've reviewed your goals and created a personalized plan to help you achieve them.

Here's what you can expect:
- Weekly check-ins to track your progress
- Customized meal plans based on your preferences
- 24/7 support via messaging

Let's schedule our first call to discuss your plan in detail. When works best for you?

Looking forward to working together!

Best regards,
{{nutritionist_name}}`,
    variables: ['client_name', 'nutritionist_name'],
    useCount: 0
  },
  {
    id: 'checkin-weekly',
    category: 'check-in',
    title: 'Weekly Check-in',
    subject: 'Your Weekly Progress Check-in',
    content: `Hi {{client_name}},

Hope you're having a great week! Time for our weekly check-in.

Please share:
1. How did you feel this week (energy levels, mood, etc.)?
2. Any challenges you faced?
3. What victories can we celebrate?
4. Your current weight (if tracking)

I'll review your food logs and provide feedback by tomorrow.

Keep up the great work!

{{nutritionist_name}}`,
    variables: ['client_name', 'nutritionist_name'],
    useCount: 0
  },
  {
    id: 'motivation-plateau',
    category: 'motivation',
    title: 'Plateau Motivation',
    subject: 'Breaking Through Plateaus',
    content: `Hi {{client_name}},

I noticed your progress has slowed this week - this is completely normal and happens to everyone!

Remember:
- Plateaus are temporary and part of the journey
- Your body is adapting to new healthy habits
- Non-scale victories matter (energy, sleep, how clothes fit)

Let's adjust your plan slightly to kickstart progress again. I'm here to support you every step of the way!

You've got this! 💪

{{nutritionist_name}}`,
    variables: ['client_name', 'nutritionist_name'],
    useCount: 0
  },
  {
    id: 'reminder-log',
    category: 'reminder',
    title: 'Meal Logging Reminder',
    subject: 'Don\'t Forget to Log Your Meals!',
    content: `Hi {{client_name}},

Just a friendly reminder to log your meals today! Consistent tracking is key to understanding your patterns and making progress.

Quick tips:
- Log meals right after eating (takes 2 minutes)
- Don't forget snacks and drinks
- Be honest - there are no "bad" foods

Your logs help me provide better guidance. Let me know if you need help with anything!

{{nutritionist_name}}`,
    variables: ['client_name', 'nutritionist_name'],
    useCount: 0
  },
  {
    id: 'feedback-positive',
    category: 'feedback',
    title: 'Positive Progress Feedback',
    subject: 'Amazing Progress This Week!',
    content: `Hi {{client_name}},

I just reviewed your logs and I'm incredibly proud of you! 🌟

What you did well:
- Consistent meal logging
- Great macro balance
- Hydration on point
- {{custom_achievement}}

Keep doing what you're doing - it's working! Small consistent actions lead to big results.

Celebrate this win!

{{nutritionist_name}}`,
    variables: ['client_name', 'nutritionist_name', 'custom_achievement'],
    useCount: 0
  },
  {
    id: 'followup-missed',
    category: 'follow-up',
    title: 'Follow-up: Missed Check-in',
    subject: 'Just Checking In',
    content: `Hi {{client_name}},

I noticed we haven't connected in a few days. Just wanted to make sure everything's okay!

Life gets busy - no judgment at all. If you need:
- A plan adjustment
- More support
- Just to talk through challenges

I'm here for you. Reply when you get a chance and let me know how I can help.

{{nutritionist_name}}`,
    variables: ['client_name', 'nutritionist_name'],
    useCount: 0
  },
  {
    id: 'concern-inactive',
    category: 'concern',
    title: 'Client Inactive',
    subject: 'We Miss You!',
    content: `Hi {{client_name}},

I noticed you haven't logged in for {{days_inactive}} days. I wanted to reach out and see if there's anything I can do to support you.

Common reasons for breaks:
- Feeling overwhelmed with tracking
- Not seeing results fast enough
- Life got busy

Whatever it is, we can work through it together. No pressure - just want you to know I'm here when you're ready.

Would love to hear from you!

{{nutritionist_name}}`,
    variables: ['client_name', 'nutritionist_name', 'days_inactive'],
    useCount: 0
  }
];

const MessageTemplates = ({ nutritionistId, compact = false, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    category: 'custom',
    title: '',
    subject: '',
    content: '',
    variables: []
  });
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState(null);
  const [variableValues, setVariableValues] = useState({});

  useEffect(() => {
    if (nutritionistId) {
      fetchTemplates();
    }
  }, [nutritionistId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('nutritionist_id', nutritionistId)
        .order('use_count', { ascending: false });

      if (error) throw error;

      // Combine preset templates with custom templates
      const allTemplates = [...PRESET_TEMPLATES, ...(data || [])];
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // If error, just show preset templates
      setTemplates(PRESET_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    try {
      // Extract variables from content (words wrapped in {{  }})
      const variableRegex = /\{\{(\w+)\}\}/g;
      const foundVariables = [...newTemplate.content.matchAll(variableRegex)].map(match => match[1]);
      const uniqueVariables = [...new Set(foundVariables)];

      const { error } = await supabase
        .from('message_templates')
        .insert({
          nutritionist_id: nutritionistId,
          category: newTemplate.category,
          title: newTemplate.title,
          subject: newTemplate.subject,
          content: newTemplate.content,
          variables: uniqueVariables,
          use_count: 0
        });

      if (error) throw error;

      // Reset form and refresh
      setNewTemplate({
        category: 'custom',
        title: '',
        subject: '',
        content: '',
        variables: []
      });
      setShowCreateDialog(false);
      await fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const updateTemplate = async (templateId, updates) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', templateId);

      if (error) throw error;

      setEditingTemplate(null);
      await fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const incrementUseCount = async (templateId) => {
    if (!templateId || typeof templateId === 'string') return; // Skip preset templates

    try {
      const { error } = await supabase.rpc('increment_template_use_count', {
        template_id: templateId
      });

      if (error) throw error;

      await fetchTemplates();
    } catch (error) {
      console.error('Error incrementing use count:', error);
    }
  };

  const duplicateTemplate = async (template) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .insert({
          nutritionist_id: nutritionistId,
          category: template.category,
          title: `${template.title} (Copy)`,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          use_count: 0
        });

      if (error) throw error;

      await fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const fillTemplate = (template, values) => {
    let filledContent = template.content;
    let filledSubject = template.subject;

    Object.keys(values).forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      filledContent = filledContent.replace(regex, values[variable]);
      filledSubject = filledSubject.replace(regex, values[variable]);
    });

    return { subject: filledSubject, content: filledContent };
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplateForUse(template);
    // Initialize variable values
    const initialValues = {};
    template.variables.forEach(variable => {
      initialValues[variable] = '';
    });
    setVariableValues(initialValues);
  };

  const handleSendTemplate = () => {
    const filled = fillTemplate(selectedTemplateForUse, variableValues);

    // Increment use count
    incrementUseCount(selectedTemplateForUse.id);

    // Call parent callback if provided
    if (onSelectTemplate) {
      onSelectTemplate(filled);
    }

    // Close dialog
    setSelectedTemplateForUse(null);
    setVariableValues({});
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryStats = () => {
    const stats = {};
    TEMPLATE_CATEGORIES.forEach(cat => {
      stats[cat.id] = templates.filter(t => t.category === cat.id).length;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Quick Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PRESET_TEMPLATES.slice(0, 3).map(template => (
              <Button
                key={template.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleUseTemplate(template)}
              >
                <FileText className="w-4 h-4 mr-2" />
                {template.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Message Templates
              </CardTitle>
              <CardDescription>
                Create and manage reusable message templates for client communication
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Template Title</label>
                    <Input
                      placeholder="e.g., Weekly Check-in"
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject Line</label>
                    <Input
                      placeholder="e.g., Your Weekly Progress Update"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message Content</label>
                    <Textarea
                      placeholder="Write your message here. Use {{variable_name}} for dynamic content like {{client_name}}"
                      rows={10}
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use double curly braces for variables: {"{{client_name}}, {{nutritionist_name}}"}, etc.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTemplate} disabled={!newTemplate.title || !newTemplate.content}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All Templates ({templates.length})
            </Button>
            {TEMPLATE_CATEGORIES.map(category => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={selectedCategory === category.id ? '' : category.color}
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="w-4 h-4 mr-1" />
                {category.name} ({categoryStats[category.id] || 0})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredTemplates.map((template, index) => {
            const category = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
            const isPreset = typeof template.id === 'string';

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={category.color}>
                        <category.icon className="w-3 h-3 mr-1" />
                        {category.name}
                      </Badge>
                      {isPreset && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Preset
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Subject: {template.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 line-clamp-4 mb-4">
                        {template.content}
                      </p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.variables.map(variable => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {template.use_count > 0 && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Used {template.use_count} times
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                      {!isPreset && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateTemplate(template)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Use Template Dialog */}
      {selectedTemplateForUse && (
        <Dialog open={!!selectedTemplateForUse} onOpenChange={() => setSelectedTemplateForUse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fill Template: {selectedTemplateForUse.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTemplateForUse.variables.map(variable => (
                <div key={variable}>
                  <label className="text-sm font-medium mb-2 block capitalize">
                    {variable.replace(/_/g, ' ')}
                  </label>
                  <Input
                    placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                    value={variableValues[variable] || ''}
                    onChange={(e) => setVariableValues({
                      ...variableValues,
                      [variable]: e.target.value
                    })}
                  />
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Subject: {fillTemplate(selectedTemplateForUse, variableValues).subject}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {fillTemplate(selectedTemplateForUse, variableValues).content}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplateForUse(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendTemplate}
                disabled={selectedTemplateForUse.variables.some(v => !variableValues[v])}
              >
                <Send className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MessageTemplates;
