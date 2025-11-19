/**
 * Language Detection Utility
 * Detects if text is in Arabic or English and provides language-specific instructions for AI
 */

/**
 * Detect if text contains Arabic characters
 */
export const containsArabic = (text) => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

/**
 * Detect if text contains English characters
 */
export const containsEnglish = (text) => {
  const englishRegex = /[a-zA-Z]/;
  return englishRegex.test(text);
};

/**
 * Detect language of text
 * Returns 'ar' for Arabic, 'en' for English
 */
export const detectLanguage = (text) => {
  if (!text || text.trim().length === 0) {
    return 'en'; // Default to English
  }

  const hasArabic = containsArabic(text);
  const hasEnglish = containsEnglish(text);

  // If text has Arabic characters, consider it Arabic
  if (hasArabic && !hasEnglish) {
    return 'ar';
  }

  // If text has both Arabic and English, count which is more prevalent
  if (hasArabic && hasEnglish) {
    const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;

    return arabicChars > englishChars ? 'ar' : 'en';
  }

  // Default to English
  return 'en';
};

/**
 * Get language-specific AI instructions
 */
export const getLanguageInstructions = (language, messageHistory = []) => {
  // Detect language from recent message history if not provided
  if (!language && messageHistory.length > 0) {
    const recentMessages = messageHistory.slice(-3); // Last 3 messages
    const combinedText = recentMessages
      .filter(msg => msg.sender === 'user' || msg.role === 'user')
      .map(msg => msg.text || msg.content)
      .join(' ');

    language = detectLanguage(combinedText);
  }

  language = language || 'en';

  const instructions = {
    ar: {
      language: 'ar',
      languageName: 'Arabic',
      systemPrompt: `أنت مساعد صحي ذكي تابع لتطبيق GreenoFig. دورك هو مساعدة المستخدمين في رحلتهم الصحية.

قواعد مهمة:
- **أجب دائماً باللغة العربية** - المستخدم يتحدث بالعربية، لذا يجب أن تجيب بالعربية فقط
- كن ودوداً ومشجعاً ومحترفاً
- قدم نصائح غذائية ورياضية مبنية على الأدلة العلمية
- إذا سُئلت عن معلومات طبية، نبّه المستخدم بضرورة استشارة الطبيب
- لا تعطي وصفات طبية أو توصيات علاجية محددة

مهاراتك:
- التخطيط للوجبات
- اقتراح التمارين الرياضية
- تتبع السعرات الحرارية والمغذيات
- تحفيز وتشجيع المستخدمين
- الإجابة على الأسئلة الصحية العامة`,

      responseFormat: 'يجب أن تكون جميع الإجابات باللغة العربية',
      greeting: 'مرحباً! كيف يمكنني مساعدتك اليوم في رحلتك الصحية؟',
    },
    en: {
      language: 'en',
      languageName: 'English',
      systemPrompt: `You are GreenoFig AI Health Coach, a friendly and knowledgeable wellness assistant.

Important Rules:
- **Always respond in English** - The user is speaking English, so your responses must be in English only
- Be friendly, encouraging, and professional
- Provide evidence-based nutrition and fitness advice
- If asked about medical information, remind users to consult healthcare professionals
- Never provide medical diagnoses or specific treatment recommendations

Your capabilities:
- Meal planning
- Workout suggestions
- Calorie and nutrition tracking
- Motivating and encouraging users
- Answering general health questions`,

      responseFormat: 'All responses must be in English',
      greeting: 'Hello! How can I help you with your health journey today?',
    },
  };

  return instructions[language] || instructions.en;
};

/**
 * Get localized error messages
 */
export const getLocalizedError = (language) => {
  const errors = {
    ar: {
      networkError: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
      serverError: 'عذراً، حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
      invalidInput: 'يرجى إدخال رسالة صالحة.',
    },
    en: {
      networkError: 'Sorry, there was a connection error. Please try again.',
      serverError: 'Sorry, there was a server error. Please try again later.',
      invalidInput: 'Please enter a valid message.',
    },
  };

  return errors[language] || errors.en;
};

/**
 * Format AI response to ensure proper language
 */
export const formatAIResponse = (response, expectedLanguage) => {
  // Check if response language matches expected language
  const detectedLang = detectLanguage(response);

  // If languages don't match, add a note (but still return the response)
  if (detectedLang !== expectedLanguage) {
    console.warn(`Expected ${expectedLanguage} but detected ${detectedLang} in AI response`);
  }

  return response;
};
