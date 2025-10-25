import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Search } from 'lucide-react';

const SEOPreview = ({ title, metaDescription, slug, excerpt }) => {
  const displayTitle = title || 'Your Blog Post Title';
  const displayDescription = metaDescription || excerpt || 'Your blog post description will appear here...';
  const displayUrl = `greenofig.com/blog/${slug || 'your-post-slug'}`;

  // Truncate to Google's display limits
  const truncatedTitle = displayTitle.length > 60
    ? displayTitle.substring(0, 57) + '...'
    : displayTitle;

  const truncatedDescription = displayDescription.length > 160
    ? displayDescription.substring(0, 157) + '...'
    : displayDescription;

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="w-5 h-5" />
          SEO Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Search Preview */}
        <div>
          <p className="text-xs text-text-secondary mb-2 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Google Search Result
          </p>
          <div className="bg-background/50 p-4 rounded-lg border border-white/10">
            <div className="text-sm text-blue-400 mb-1">{displayUrl}</div>
            <div className="text-xl text-blue-500 hover:underline cursor-pointer mb-2">
              {truncatedTitle}
            </div>
            <div className="text-sm text-text-secondary leading-relaxed">
              {truncatedDescription}
            </div>
          </div>
        </div>

        {/* Character counts */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-text-secondary">Title: </span>
            <span className={displayTitle.length > 60 ? 'text-red-400' : 'text-green-400'}>
              {displayTitle.length}/60
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Description: </span>
            <span className={displayDescription.length > 160 ? 'text-red-400' : 'text-green-400'}>
              {displayDescription.length}/160
            </span>
          </div>
        </div>

        {/* SEO Tips */}
        <div className="text-xs text-text-secondary space-y-1">
          {displayTitle.length > 60 && (
            <p className="text-yellow-400">⚠ Title is too long (max 60 characters)</p>
          )}
          {displayDescription.length > 160 && (
            <p className="text-yellow-400">⚠ Description is too long (max 160 characters)</p>
          )}
          {displayTitle.length < 30 && title && (
            <p className="text-yellow-400">⚠ Title might be too short (recommended 30-60 characters)</p>
          )}
          {displayDescription.length < 120 && metaDescription && (
            <p className="text-yellow-400">⚠ Description might be too short (recommended 120-160 characters)</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOPreview;
