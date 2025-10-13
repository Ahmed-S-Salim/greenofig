import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/chat_input_widget.dart';
import './widgets/chat_message_widget.dart';
import './widgets/message_actions_widget.dart';
import './widgets/quick_reply_widget.dart';
import './widgets/typing_indicator_widget.dart';

class AiHealthCoachChat extends StatefulWidget {
  const AiHealthCoachChat({Key? key}) : super(key: key);

  @override
  State<AiHealthCoachChat> createState() => _AiHealthCoachChatState();
}

class _AiHealthCoachChatState extends State<AiHealthCoachChat> {
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  final List<String> _quickReplies = [
    "Meal suggestions",
    "Workout plan",
    "Sleep tips",
    "Calorie tracking",
    "Stress management",
    "Water reminder"
  ];

  bool _isTyping = false;
  OverlayEntry? _overlayEntry;
  Map<String, dynamic>? _selectedMessage;

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _removeOverlay();
    super.dispose();
  }

  void _initializeChat() {
    // Initialize with welcome message
    final welcomeMessage = {
      'id': 'welcome_${DateTime.now().millisecondsSinceEpoch}',
      'content':
          'Hello! I\'m your AI Health Coach. I\'m here to help you with nutrition, fitness, wellness tracking, and sleep optimization. How can I assist you today?',
      'timestamp': _formatTimestamp(DateTime.now()),
      'isUser': false,
      'mediaType': null,
      'mediaUrl': null,
      'mediaDescription': null,
    };

    setState(() {
      _messages.add(welcomeMessage);
    });
  }

  void _sendMessage(String content) {
    if (content.trim().isEmpty) return;

    final userMessage = {
      'id': 'user_${DateTime.now().millisecondsSinceEpoch}',
      'content': content,
      'timestamp': _formatTimestamp(DateTime.now()),
      'isUser': true,
      'mediaType': null,
      'mediaUrl': null,
      'mediaDescription': null,
    };

    setState(() {
      _messages.add(userMessage);
      _isTyping = true;
    });

    _scrollToBottom();
    _generateAIResponse(content);
  }

  void _generateAIResponse(String userInput) {
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;

      final aiResponse = _getAIResponse(userInput);

      setState(() {
        _messages.add(aiResponse);
        _isTyping = false;
      });

      _scrollToBottom();
    });
  }

  Map<String, dynamic> _getAIResponse(String userInput) {
    final responses = _getHealthCoachResponses();
    final lowerInput = userInput.toLowerCase();

    Map<String, dynamic> selectedResponse;

    if (lowerInput.contains('meal') ||
        lowerInput.contains('food') ||
        lowerInput.contains('eat')) {
      selectedResponse = responses['nutrition']!;
    } else if (lowerInput.contains('workout') ||
        lowerInput.contains('exercise') ||
        lowerInput.contains('fitness')) {
      selectedResponse = responses['fitness']!;
    } else if (lowerInput.contains('sleep') ||
        lowerInput.contains('rest') ||
        lowerInput.contains('tired')) {
      selectedResponse = responses['sleep']!;
    } else if (lowerInput.contains('stress') ||
        lowerInput.contains('anxiety') ||
        lowerInput.contains('relax')) {
      selectedResponse = responses['stress']!;
    } else if (lowerInput.contains('water') ||
        lowerInput.contains('hydration') ||
        lowerInput.contains('drink')) {
      selectedResponse = responses['hydration']!;
    } else if (lowerInput.contains('calorie') ||
        lowerInput.contains('weight') ||
        lowerInput.contains('track')) {
      selectedResponse = responses['tracking']!;
    } else {
      selectedResponse = responses['general']!;
    }

    return {
      'id': 'ai_${DateTime.now().millisecondsSinceEpoch}',
      'content': selectedResponse['content'],
      'timestamp': _formatTimestamp(DateTime.now()),
      'isUser': false,
      'mediaType': selectedResponse['mediaType'],
      'mediaUrl': selectedResponse['mediaUrl'],
      'mediaDescription': selectedResponse['mediaDescription'],
    };
  }

  Map<String, Map<String, dynamic>> _getHealthCoachResponses() {
    return {
      'nutrition': {
        'content':
            'Based on your profile, I recommend starting your day with a balanced breakfast. Here\'s a personalized meal suggestion that fits your dietary preferences and calorie goals.',
        'mediaType': 'image',
        'mediaUrl':
            'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'mediaDescription':
            'Healthy breakfast bowl with oatmeal, fresh berries, sliced banana, and nuts on a wooden table',
      },
      'fitness': {
        'content':
            'Great question! I\'ve created a personalized workout plan based on your fitness level and available equipment. This 20-minute routine will help you build strength and improve cardiovascular health.',
        'mediaType': 'chart',
        'mediaUrl': null,
        'mediaDescription':
            'Workout progress chart showing weekly exercise completion',
      },
      'sleep': {
        'content':
            'Quality sleep is crucial for your health goals. Based on your sleep patterns, I recommend establishing a consistent bedtime routine. Here are some personalized tips to improve your sleep quality and duration.',
        'mediaType': null,
        'mediaUrl': null,
        'mediaDescription': null,
      },
      'stress': {
        'content':
            'I understand stress can impact your health journey. Let me guide you through some effective stress management techniques. I\'ve prepared a 5-minute breathing exercise that you can do right now.',
        'mediaType': null,
        'mediaUrl': null,
        'mediaDescription': null,
      },
      'hydration': {
        'content':
            'Staying hydrated is essential for optimal health! Based on your activity level and climate, I recommend drinking 8-10 glasses of water daily. I can set up personalized hydration reminders for you.',
        'mediaType': null,
        'mediaUrl': null,
        'mediaDescription': null,
      },
      'tracking': {
        'content':
            'Excellent! Tracking your progress is key to achieving your health goals. Here\'s your current progress overview with personalized insights and recommendations for the week ahead.',
        'mediaType': 'chart',
        'mediaUrl': null,
        'mediaDescription':
            'Health progress tracking chart with calorie intake and exercise data',
      },
      'general': {
        'content':
            'I\'m here to help you with all aspects of your health and wellness journey. Whether you need nutrition advice, workout plans, sleep optimization, or stress management - just ask! What specific area would you like to focus on today?',
        'mediaType': null,
        'mediaUrl': null,
        'mediaDescription': null,
      },
    };
  }

  void _handleQuickReply(String reply) {
    _sendMessage(reply);
  }

  void _handleVoiceInput(String transcribedText) {
    _sendMessage(transcribedText);
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _formatTimestamp(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }

  void _showMessageActions(Map<String, dynamic> message, Offset position) {
    _removeOverlay();

    _selectedMessage = message;
    _overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        left: position.dx - 40.w,
        top: position.dy - 20.h,
        child: Material(
          color: Colors.transparent,
          child: MessageActionsWidget(
            message: message,
            onSaveToFavorites: () {
              _removeOverlay();
              _showSnackBar('Saved to favorites');
            },
            onAddToCalendar: () {
              _removeOverlay();
              _showSnackBar('Added to calendar');
            },
            onShareWithTrainer: () {
              _removeOverlay();
              _showSnackBar('Shared with trainer');
            },
          ),
        ),
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightTheme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.lightTheme.colorScheme.surface,
        elevation: 1,
        shadowColor: AppTheme.shadowDark,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: CustomIconWidget(
            iconName: 'arrow_back',
            color: AppTheme.textPrimaryDark,
            size: 6.w,
          ),
        ),
        title: Row(
          children: [
            Container(
              width: 10.w,
              height: 10.w,
              decoration: BoxDecoration(
                color: AppTheme.lightTheme.primaryColor,
                shape: BoxShape.circle,
              ),
              child: CustomIconWidget(
                iconName: 'psychology',
                color: Colors.white,
                size: 5.w,
              ),
            ),
            SizedBox(width: 3.w),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AI Health Coach',
                  style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                    color: AppTheme.textPrimaryDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Online • Always available',
                  style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                    color: AppTheme.lightTheme.primaryColor,
                    fontSize: 10.sp,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {
              Navigator.pushNamed(context, '/profile-settings');
            },
            icon: CustomIconWidget(
              iconName: 'settings',
              color: AppTheme.textSecondaryDark,
              size: 6.w,
            ),
          ),
          IconButton(
            onPressed: () {
              _showSearchDialog();
            },
            icon: CustomIconWidget(
              iconName: 'search',
              color: AppTheme.textSecondaryDark,
              size: 6.w,
            ),
          ),
        ],
      ),
      body: GestureDetector(
        onTap: _removeOverlay,
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: EdgeInsets.symmetric(vertical: 2.h),
                itemCount: _messages.length + (_isTyping ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == _messages.length && _isTyping) {
                    return const TypingIndicatorWidget();
                  }

                  final message = _messages[index];
                  return GestureDetector(
                    onLongPress: !message['isUser']
                        ? () {
                            final RenderBox renderBox =
                                context.findRenderObject() as RenderBox;
                            final position =
                                renderBox.localToGlobal(Offset.zero);
                            _showMessageActions(message, position);
                          }
                        : null,
                    child: ChatMessageWidget(
                      message: message,
                      isUser: message['isUser'],
                    ),
                  );
                },
              ),
            ),
            if (_quickReplies.isNotEmpty && !_isTyping)
              QuickReplyWidget(
                quickReplies: _quickReplies,
                onQuickReply: _handleQuickReply,
              ),
            ChatInputWidget(
              onSendMessage: _sendMessage,
              onVoiceInput: _handleVoiceInput,
            ),
          ],
        ),
      ),
    );
  }

  void _showSearchDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            'Search Messages',
            style: AppTheme.lightTheme.textTheme.titleMedium,
          ),
          content: TextField(
            decoration: InputDecoration(
              hintText: 'Search for recommendations...',
              hintStyle: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                color: AppTheme.textSecondaryDark,
              ),
              prefixIcon: CustomIconWidget(
                iconName: 'search',
                color: AppTheme.textSecondaryDark,
                size: 5.w,
              ),
            ),
            style: AppTheme.lightTheme.textTheme.bodyMedium,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Cancel',
                style: TextStyle(color: AppTheme.textSecondaryDark),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _showSnackBar('Search functionality coming soon');
              },
              child: Text(
                'Search',
                style: TextStyle(color: AppTheme.lightTheme.primaryColor),
              ),
            ),
          ],
        );
      },
    );
  }
}