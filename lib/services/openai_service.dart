import 'package:dio/dio.dart';

class OpenAIService {
  static final OpenAIService _instance = OpenAIService._internal();
  late final Dio _dio;
  static const String apiKey = String.fromEnvironment('OPENAI_API_KEY');

  // Factory constructor to return the singleton instance
  factory OpenAIService() {
    return _instance;
  }

  // Private constructor for singleton pattern
  OpenAIService._internal() {
    _initializeService();
  }

  void _initializeService() {
    // Load API key from environment variables
    if (apiKey.isEmpty) {
      throw Exception('OPENAI_API_KEY must be provided via --dart-define');
    }

    // Configure Dio with base URL and headers
    _dio = Dio(
      BaseOptions(
        baseUrl: 'https://api.openai.com/v1',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $apiKey',
        },
      ),
    );
  }

  Dio get dio => _dio;
}

class OpenAIClient {
  final Dio dio;

  OpenAIClient(this.dio);

  /// Generate health recommendations using AI
  Future<String> generateHealthRecommendations({
    required Map<String, dynamic> healthData,
    String model = 'gpt-5-mini',
  }) async {
    try {
      final messages = [
        {
          'role': 'system',
          'content':
              'You are a professional health and wellness coach. Provide personalized health recommendations based on the user data provided. Keep responses practical, safe, and encouraging.'
        },
        {
          'role': 'user',
          'content':
              'Based on my health data: ${healthData.toString()}, please provide 3-5 specific health recommendations to improve my wellness.'
        }
      ];

      final requestData = {
        'model': model,
        'messages': messages,
        'reasoning_effort':
            'minimal', // Fast responses for health recommendations
        'max_completion_tokens': 500,
      };

      final response = await dio.post('/chat/completions', data: requestData);

      final text = response.data['choices'][0]['message']['content'];
      return text;
    } on DioException catch (e) {
      throw OpenAIException(
        statusCode: e.response?.statusCode ?? 500,
        message: e.response?.data['error']['message'] ?? e.message,
      );
    }
  }

  /// Analyze food image and provide nutritional insights
  Future<String> analyzeFoodImage({
    required String base64Image,
    String model = 'gpt-5',
  }) async {
    try {
      final messages = [
        {
          'role': 'system',
          'content':
              'You are a nutritionist. Analyze food images and provide detailed nutritional information including calories, macros, and health benefits.'
        },
        {
          'role': 'user',
          'content': [
            {
              'type': 'text',
              'text':
                  'Analyze this food image and provide nutritional information including estimated calories, macronutrients, and health benefits.'
            },
            {
              'type': 'image_url',
              'image_url': {'url': 'data:image/jpeg;base64,$base64Image'}
            }
          ]
        }
      ];

      final requestData = {
        'model': model,
        'messages': messages,
        'reasoning_effort': 'medium',
        'max_completion_tokens': 400,
      };

      final response = await dio.post('/chat/completions', data: requestData);

      final text = response.data['choices'][0]['message']['content'];
      return text;
    } on DioException catch (e) {
      throw OpenAIException(
        statusCode: e.response?.statusCode ?? 500,
        message: e.response?.data['error']['message'] ?? e.message,
      );
    }
  }

  /// Generate personalized workout plan
  Future<String> generateWorkoutPlan({
    required String fitnessLevel,
    required List<String> goals,
    required int availableTimeMinutes,
    String model = 'gpt-5-mini',
  }) async {
    try {
      final messages = [
        {
          'role': 'system',
          'content':
              'You are a certified fitness trainer. Create safe, effective workout plans based on user preferences and fitness level.'
        },
        {
          'role': 'user',
          'content':
              'Create a workout plan for someone with ${fitnessLevel} fitness level, goals: ${goals.join(", ")}, and ${availableTimeMinutes} minutes available. Include exercises, sets, reps, and safety tips.'
        }
      ];

      final requestData = {
        'model': model,
        'messages': messages,
        'reasoning_effort': 'low',
        'max_completion_tokens': 600,
      };

      final response = await dio.post('/chat/completions', data: requestData);

      final text = response.data['choices'][0]['message']['content'];
      return text;
    } on DioException catch (e) {
      throw OpenAIException(
        statusCode: e.response?.statusCode ?? 500,
        message: e.response?.data['error']['message'] ?? e.message,
      );
    }
  }
}

class OpenAIException implements Exception {
  final int statusCode;
  final String message;

  OpenAIException({required this.statusCode, required this.message});

  @override
  String toString() => 'OpenAIException: $statusCode - $message';
}
