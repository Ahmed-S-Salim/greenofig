import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, Calendar } from 'lucide-react';
import EnhancedBlogManager from './EnhancedBlogManager';
import AIBlogGenerator from './AIBlogGenerator';
import AutoBlogScheduler from './AutoBlogScheduler';

const BlogManagementHub = ({ user }) => {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <p className="text-text-secondary mt-1">
          Manage blog posts, generate AI content, and automate publishing
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="ai-writer" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Writer
          </TabsTrigger>
          <TabsTrigger value="auto-scheduler" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Auto Scheduler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <EnhancedBlogManager user={user} />
        </TabsContent>

        <TabsContent value="ai-writer" className="mt-0">
          <AIBlogGenerator user={user} />
        </TabsContent>

        <TabsContent value="auto-scheduler" className="mt-0">
          <AutoBlogScheduler user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogManagementHub;
