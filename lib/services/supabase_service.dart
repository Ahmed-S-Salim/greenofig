import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static SupabaseService? _instance;
  static SupabaseClient get instance {
    if (_instance == null) {
      throw Exception(
          'SupabaseService not initialized. Call initialize() first.');
    }
    return _instance!.client;
  }

  late final SupabaseClient client;

  SupabaseService._internal();

  static Future<void> initialize() async {
    if (_instance != null) return; // Already initialized

    const String supabaseUrl =
        String.fromEnvironment('SUPABASE_URL', defaultValue: '');
    const String supabaseAnonKey =
        String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      throw Exception(
          'SUPABASE_URL and SUPABASE_ANON_KEY must be provided via --dart-define');
    }

    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );

    _instance = SupabaseService._internal();
    _instance!.client = Supabase.instance.client;
  }
}
