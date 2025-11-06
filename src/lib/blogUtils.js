/**
 * Blog utility functions for table of contents, related posts, and image generation
 */

/**
 * Generate table of contents from markdown or HTML content
 * @param {string} content - The blog post content
 * @param {string} contentFormat - 'html' or 'markdown'
 * @returns {Array} Array of {id, text, level} objects
 */
export const generateTableOfContents = (content, contentFormat = 'markdown') => {
  if (!content) return [];

  const toc = [];
  let headingCounter = 0;

  // Clean content first - remove any JSON wrappers if present
  let cleanContent = content;
  if (cleanContent.includes('```json')) {
    // Try to extract content field from JSON
    try {
      const jsonMatch = cleanContent.match(/\{[\s\S]*"content":\s*"([\s\S]*?)"\s*[,}]/);
      if (jsonMatch && jsonMatch[1]) {
        cleanContent = jsonMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    } catch (e) {
      // If extraction fails, try to remove the wrapper
      cleanContent = cleanContent.replace(/^```json[\s\S]*?"content":\s*"/m, '');
      cleanContent = cleanContent.replace(/"[\s\S]*?```$/m, '');
    }
  }

  if (contentFormat === 'markdown') {
    // Parse markdown headers - more flexible regex
    const headerRegex = /^(#{1,6})\s+(.+?)$/gm;
    let match;

    while ((match = headerRegex.exec(cleanContent)) !== null) {
      const level = match[1].length; // Count # symbols
      let text = match[2].trim();
      // Remove markdown formatting from text
      text = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
      const id = `heading-${headingCounter++}`;

      toc.push({ id, text, level });
    }
  } else {
    // Parse HTML headers
    const headerRegex = /<h([1-6])[^>]*>(.+?)<\/h\1>/gi;
    let match;

    while ((match = headerRegex.exec(cleanContent)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]+>/g, '').trim(); // Remove any nested tags
      const id = `heading-${headingCounter++}`;

      toc.push({ id, text, level });
    }
  }

  return toc;
};

/**
 * Add IDs to headers in rendered HTML for table of contents navigation
 * @param {string} html - The rendered HTML content
 * @param {Array} toc - Table of contents array from generateTableOfContents
 * @returns {string} HTML with IDs added to headers
 */
export const addHeaderIds = (html, toc) => {
  if (!html || !toc || toc.length === 0) return html;

  let modifiedHtml = html;
  let tocIndex = 0;

  // Add ID to each header tag
  modifiedHtml = modifiedHtml.replace(/<h([1-6])[^>]*>(.+?)<\/h\1>/gi, (match, level, content) => {
    if (tocIndex < toc.length) {
      const id = toc[tocIndex].id;
      tocIndex++;
      return `<h${level} id="${id}">${content}</h${level}>`;
    }
    return match;
  });

  return modifiedHtml;
};

/**
 * Extract keywords from blog post content for finding related posts
 * @param {string} title - Blog post title
 * @param {string} content - Blog post content
 * @returns {Array} Array of keywords
 */
export const extractKeywords = (title, content) => {
  // Common stop words to exclude
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
    'your', 'you', 'we', 'our', 'can', 'this', 'have', 'but', 'not', 'what', 'how'
  ]);

  // Combine title (weighted more) and content
  const text = `${title} ${title} ${title} ${content}`.toLowerCase();

  // Extract words (alphanumeric only)
  const words = text.match(/\b[a-z]{3,}\b/g) || [];

  // Count frequency
  const frequency = {};
  words.forEach(word => {
    if (!stopWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

/**
 * Calculate relevance score between two posts based on keywords
 * @param {Array} keywords1 - Keywords from post 1
 * @param {Array} keywords2 - Keywords from post 2
 * @returns {number} Relevance score (0-100)
 */
export const calculateRelevance = (keywords1, keywords2) => {
  if (!keywords1 || !keywords2 || keywords1.length === 0 || keywords2.length === 0) {
    return 0;
  }

  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  // Count common keywords
  const common = [...set1].filter(k => set2.has(k)).length;

  // Calculate Jaccard similarity
  const union = new Set([...set1, ...set2]).size;
  const score = (common / union) * 100;

  return Math.round(score);
};

/**
 * Get Unsplash image URL for blog post
 * @param {string} query - Search query (blog title or topic)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Unsplash image URL
 */
export const getRelevantImage = (query, width = 1200, height = 675) => {
  // Extract keywords from query
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim()
    .split(' ')
    .filter(word => word.length > 3) // Only words longer than 3 chars
    .slice(0, 3) // First 3 keywords
    .join(',');

  // Fallback to generic health image if no keywords
  const searchTerm = keywords || 'health,wellness,fitness';

  // Use Unsplash Source API - simpler format
  return `https://source.unsplash.com/${width}x${height}/?${searchTerm}`;
};

/**
 * Get featured image from content or generate relevant one
 * @param {string} content - Blog post content
 * @param {string} title - Blog post title
 * @param {string} existingImageUrl - Existing featured image URL
 * @returns {string} Image URL
 */
export const getFeaturedImage = (content, title, existingImageUrl) => {
  // If existing image URL exists and looks valid, use it
  if (existingImageUrl && existingImageUrl.startsWith('http')) {
    return existingImageUrl;
  }

  // Extract first image from content if exists
  const imgMatch = content?.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  // Generate relevant image based on title
  return getRelevantImage(title);
};

/**
 * Generate reading time estimate
 * @param {string} content - Blog post content
 * @returns {number} Reading time in minutes
 */
export const calculateReadingTime = (content) => {
  if (!content) return 1;

  // Strip HTML tags and markdown syntax
  const plainText = content
    .replace(/<[^>]+>/g, '')
    .replace(/[#*`_\[\]()]/g, '');

  // Average reading speed: 200 words per minute
  const words = plainText.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);

  return Math.max(1, minutes); // At least 1 minute
};
