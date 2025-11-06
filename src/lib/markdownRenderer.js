import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  pedantic: false,
});

/**
 * Render markdown content to safe HTML
 * @param {string} markdown - The markdown content to render
 * @returns {string} - Safe HTML string
 */
export const renderMarkdown = (markdown) => {
  if (!markdown) return '';

  try {
    // Convert markdown to HTML
    const rawHTML = marked.parse(markdown);

    // Sanitize HTML to prevent XSS attacks
    const cleanHTML = DOMPurify.sanitize(rawHTML, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
      ALLOW_DATA_ATTR: false
    });

    return cleanHTML;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Fallback: return text with basic line break conversion
    return markdown.replace(/\n/g, '<br />');
  }
};

/**
 * Extract plain text from markdown (for excerpts)
 * @param {string} markdown - The markdown content
 * @param {number} maxLength - Maximum length of output
 * @returns {string} - Plain text excerpt
 */
export const extractPlainText = (markdown, maxLength = 200) => {
  if (!markdown) return '';

  try {
    // Remove markdown syntax
    let text = markdown
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
      .replace(/`{1,3}[^`]+`{1,3}/g, '') // Remove code blocks
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }

    return text;
  } catch (error) {
    console.error('Error extracting plain text:', error);
    return markdown.substring(0, maxLength) + '...';
  }
};
