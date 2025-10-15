import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:google_fonts/google_fonts.dart';

/// Enhanced theme with mobile browser optimizations and accessibility improvements
class AppTheme {
  AppTheme._();

  // Enhanced color palette with better mobile browser compatibility
  static const Color primaryDark =
      Color(0xFF00FF41); // Brighter neon green for mobile
  static const Color primaryVariantDark =
      Color(0xFF32FF64); // Enhanced visibility
  static const Color secondaryDark = Color(0xFF00E639); // Optimized secondary
  static const Color secondaryVariantDark =
      Color(0xFF00CC33); // Better contrast
  static const Color backgroundDark =
      Color(0xFF0D0D0D); // Slightly lighter for mobile
  static const Color surfaceDark = Color(0xFF1F1F1F); // Enhanced surface color
  static const Color errorDark = Color(0xFFFF5252); // Better error visibility
  static const Color warningDark = Color(0xFFFFB74D); // Enhanced warning
  static const Color successDark = Color(0xFF69F0AE); // Better success color
  static const Color onPrimaryDark = Color(0xFF000000);
  static const Color onSecondaryDark = Color(0xFF000000);
  static const Color onBackgroundDark =
      Color(0xFFEEEEEE); // Higher contrast text
  static const Color onSurfaceDark = Color(0xFFEEEEEE);
  static const Color onErrorDark = Color(0xFF000000);

  // Enhanced card and surface colors for mobile
  static const Color cardDark = Color(0xFF1F1F1F);
  static const Color dialogDark = Color(0xFF1F1F1F);
  static const Color shadowDark =
      Color(0x6000FF41); // Enhanced shadow visibility
  static const Color dividerDark =
      Color(0xFF454545); // Better divider visibility

  // Enhanced text colors for mobile readability
  static const Color textPrimaryDark = Color(0xFFEEEEEE);
  static const Color textSecondaryDark = Color(0xFFBDBDBD);
  static const Color textDisabledDark = Color(0xFF757575);

  /// Enhanced dark theme optimized for mobile browsers
  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.dark,
    colorScheme: ColorScheme(
      brightness: Brightness.dark,
      primary: primaryDark,
      onPrimary: onPrimaryDark,
      primaryContainer: primaryVariantDark,
      onPrimaryContainer: onPrimaryDark,
      secondary: secondaryDark,
      onSecondary: onSecondaryDark,
      secondaryContainer: secondaryVariantDark,
      onSecondaryContainer: onSecondaryDark,
      tertiary: successDark,
      onTertiary: onPrimaryDark,
      tertiaryContainer: successDark,
      onTertiaryContainer: onPrimaryDark,
      error: errorDark,
      onError: onErrorDark,
      surface: surfaceDark,
      onSurface: onSurfaceDark,
      onSurfaceVariant: textSecondaryDark,
      outline: dividerDark,
      outlineVariant: dividerDark,
      shadow: shadowDark,
      scrim: shadowDark,
      inverseSurface: const Color(0xFFFFFFFF),
      onInverseSurface: const Color(0xFF000000),
      inversePrimary: primaryDark,
      // Add surface container colors for Material 3
      surfaceContainerHighest: const Color(0xFF2A2A2A),
      surfaceContainer: surfaceDark,
    ),
    scaffoldBackgroundColor: backgroundDark,
    cardColor: cardDark,
    dividerColor: dividerDark,

    // Enhanced AppBar theme for mobile browsers
    appBarTheme: AppBarTheme(
      backgroundColor: surfaceDark,
      foregroundColor: textPrimaryDark,
      elevation: 0,
      shadowColor: shadowDark,
      surfaceTintColor: Colors.transparent,
      // Increased title size for mobile readability
      titleTextStyle: GoogleFonts.inter(
        fontSize: kIsWeb ? 20 : 22, // Larger on mobile browsers
        fontWeight: FontWeight.w600,
        color: textPrimaryDark,
        height: 1.2, // Better line height for mobile
      ),
      toolbarTextStyle: GoogleFonts.inter(
        fontSize: kIsWeb ? 16 : 18, // Larger on mobile browsers
        fontWeight: FontWeight.w400,
        color: textPrimaryDark,
        height: 1.3,
      ),
      iconTheme: IconThemeData(
        color: textPrimaryDark,
        size: kIsWeb ? 28 : 32, // Significantly larger icons
      ),
      // Enhanced toolbar height for mobile touch targets
      toolbarHeight: kIsWeb ? 56 : 64,
    ),

    // Enhanced card theme for mobile interaction
    cardTheme: CardThemeData(
      color: cardDark,
      elevation: kIsWeb ? 4.0 : 6.0, // Higher elevation on mobile
      shadowColor: shadowDark,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(
            kIsWeb ? 12.0 : 16.0), // Larger radius on mobile
      ),
      margin: EdgeInsets.symmetric(
        horizontal: kIsWeb ? 16 : 12,
        vertical: kIsWeb ? 8 : 12, // More vertical spacing on mobile
      ),
    ),

    // Enhanced bottom navigation for mobile touch
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: surfaceDark,
      selectedItemColor: primaryDark,
      unselectedItemColor: textSecondaryDark,
      elevation: kIsWeb ? 8.0 : 12.0, // Higher elevation on mobile
      type: BottomNavigationBarType.fixed,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      selectedLabelStyle: GoogleFonts.inter(
        fontSize: kIsWeb ? 12 : 14, // Larger labels on mobile
        fontWeight: FontWeight.w600,
        height: 1.2,
      ),
      unselectedLabelStyle: GoogleFonts.inter(
        fontSize: kIsWeb ? 12 : 14, // Larger labels on mobile
        fontWeight: FontWeight.w500,
        height: 1.2,
      ),
      // Enhanced icon size for mobile
      selectedIconTheme: IconThemeData(
        size: kIsWeb ? 28 : 32,
      ),
      unselectedIconTheme: IconThemeData(
        size: kIsWeb ? 28 : 32,
      ),
    ),

    // Enhanced floating action button for mobile
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: primaryDark,
      foregroundColor: onPrimaryDark,
      elevation: kIsWeb ? 6.0 : 8.0,
      // Larger size on mobile browsers
      sizeConstraints: BoxConstraints(
        minWidth: kIsWeb ? 56 : 64,
        minHeight: kIsWeb ? 56 : 64,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(kIsWeb ? 16.0 : 20.0),
      ),
    ),

    // Enhanced button themes for mobile touch targets
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: onPrimaryDark,
        backgroundColor: primaryDark,
        elevation: kIsWeb ? 2.0 : 4.0,
        shadowColor: shadowDark,
        // Larger padding for mobile touch targets
        padding: EdgeInsets.symmetric(
          horizontal: kIsWeb ? 24 : 32,
          vertical: kIsWeb ? 16 : 20,
        ),
        // Larger minimum size for mobile
        minimumSize: Size(kIsWeb ? 64 : 88, kIsWeb ? 40 : 48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(kIsWeb ? 12.0 : 16.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: kIsWeb ? 16 : 18, // Larger text on mobile
          fontWeight: FontWeight.w600,
          height: 1.2,
        ),
      ),
    ),

    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryDark,
        padding: EdgeInsets.symmetric(
          horizontal: kIsWeb ? 24 : 32,
          vertical: kIsWeb ? 16 : 20,
        ),
        minimumSize: Size(kIsWeb ? 64 : 88, kIsWeb ? 40 : 48),
        side: BorderSide(
          color: primaryDark,
          width: kIsWeb ? 2.0 : 2.5, // Thicker border on mobile
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(kIsWeb ? 12.0 : 16.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: kIsWeb ? 16 : 18,
          fontWeight: FontWeight.w600,
          height: 1.2,
        ),
      ),
    ),

    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryDark,
        padding: EdgeInsets.symmetric(
          horizontal: kIsWeb ? 16 : 24,
          vertical: kIsWeb ? 12 : 16,
        ),
        minimumSize: Size(kIsWeb ? 64 : 88, kIsWeb ? 36 : 44),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(kIsWeb ? 8.0 : 12.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: kIsWeb ? 16 : 18,
          fontWeight: FontWeight.w500,
          height: 1.2,
        ),
      ),
    ),

    // Enhanced typography for mobile readability
    textTheme: _buildEnhancedTextTheme(),

    // Enhanced input decoration for mobile interaction
    inputDecorationTheme: InputDecorationTheme(
      fillColor: surfaceDark,
      filled: true,
      // Larger padding for mobile touch interaction
      contentPadding: EdgeInsets.symmetric(
        horizontal: kIsWeb ? 16 : 20,
        vertical: kIsWeb ? 16 : 20,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(kIsWeb ? 12.0 : 16.0),
        borderSide: BorderSide(color: dividerDark, width: kIsWeb ? 1.0 : 1.5),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(kIsWeb ? 12.0 : 16.0),
        borderSide: BorderSide(color: dividerDark, width: kIsWeb ? 1.0 : 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(kIsWeb ? 12.0 : 16.0),
        borderSide: BorderSide(color: primaryDark, width: kIsWeb ? 2.0 : 2.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(kIsWeb ? 12.0 : 16.0),
        borderSide: BorderSide(color: errorDark, width: kIsWeb ? 1.0 : 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(kIsWeb ? 12.0 : 16.0),
        borderSide: BorderSide(color: errorDark, width: kIsWeb ? 2.0 : 2.5),
      ),
      labelStyle: GoogleFonts.inter(
        color: textSecondaryDark,
        fontSize: kIsWeb ? 16 : 18, // Larger labels on mobile
        fontWeight: FontWeight.w400,
        height: 1.2,
      ),
      hintStyle: GoogleFonts.inter(
        color: textDisabledDark,
        fontSize: kIsWeb ? 16 : 18, // Larger hints on mobile
        fontWeight: FontWeight.w400,
        height: 1.2,
      ),
      errorStyle: GoogleFonts.inter(
        color: errorDark,
        fontSize: kIsWeb ? 12 : 14, // Larger error text on mobile
        fontWeight: FontWeight.w400,
        height: 1.2,
      ),
    ),

    // Switch theme for enhanced neon dark theme
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return primaryDark;
        }
        return Colors.grey[600];
      }),
      trackColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return primaryDark.withAlpha(128);
        }
        return Colors.grey[700];
      }),
    ),

    // Checkbox theme for enhanced neon dark theme
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return primaryDark;
        }
        return Colors.transparent;
      }),
      checkColor: WidgetStateProperty.all(onPrimaryDark),
      side: BorderSide(color: dividerDark, width: 2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(4.0),
      ),
    ),

    // Radio theme for enhanced neon dark theme
    radioTheme: RadioThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return primaryDark;
        }
        return textSecondaryDark;
      }),
    ),

    // Progress indicators for enhanced neon theme
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: primaryDark,
      linearTrackColor: dividerDark,
      circularTrackColor: dividerDark,
    ),

    // Slider theme for enhanced neon theme
    sliderTheme: SliderThemeData(
      activeTrackColor: primaryDark,
      thumbColor: primaryDark,
      overlayColor: primaryDark.withAlpha(51),
      inactiveTrackColor: dividerDark,
      trackHeight: 4.0,
      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8.0),
    ),

    // Tab bar theme for enhanced neon theme
    tabBarTheme: TabBarThemeData(
      labelColor: primaryDark,
      unselectedLabelColor: textSecondaryDark,
      indicatorColor: primaryDark,
      indicatorSize: TabBarIndicatorSize.label,
      labelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      unselectedLabelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
      ),
    ),

    // Tooltip theme for enhanced neon theme
    tooltipTheme: TooltipThemeData(
      decoration: BoxDecoration(
        color: textPrimaryDark.withAlpha(230),
        borderRadius: BorderRadius.circular(8.0),
      ),
      textStyle: GoogleFonts.inter(
        color: backgroundDark,
        fontSize: 12,
        fontWeight: FontWeight.w400,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    ),

    // SnackBar theme for enhanced neon theme
    snackBarTheme: SnackBarThemeData(
      backgroundColor: surfaceDark,
      contentTextStyle: GoogleFonts.inter(
        color: textPrimaryDark,
        fontSize: 14,
        fontWeight: FontWeight.w400,
      ),
      actionTextColor: secondaryDark,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
    ),

    // List tile theme for enhanced neon theme
    listTileTheme: ListTileThemeData(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
      titleTextStyle: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: textPrimaryDark,
      ),
      subtitleTextStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: textSecondaryDark,
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: dialogDark,
      elevation: kIsWeb ? 6.0 : 8.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(kIsWeb ? 12.0 : 16.0),
      ),
    ),

    // Enhanced interaction feedback for mobile
    splashFactory: InkRipple.splashFactory,
    highlightColor: primaryDark.withAlpha(51),
    splashColor: primaryDark.withAlpha(77),

    // Enhanced visual density for mobile touch targets
    visualDensity: kIsWeb
        ? VisualDensity.compact
        : VisualDensity.standard, // More space on mobile
  );

  /// Enhanced dark theme (same as light for consistency)
  static ThemeData darkTheme = lightTheme;

  /// Enhanced text theme with mobile browser optimizations
  static TextTheme _buildEnhancedTextTheme() {
    final Color textPrimary = textPrimaryDark;
    final Color textSecondary = textSecondaryDark;
    final Color textDisabled = textDisabledDark;

    // Calculate base font size multiplier for mobile browsers
    final double fontMultiplier =
        kIsWeb ? 1.3 : 1.2; // Significantly larger for better readability

    return TextTheme(
      // Enhanced display styles with better mobile readability
      displayLarge: GoogleFonts.inter(
        fontSize: (57 * fontMultiplier),
        fontWeight: FontWeight.w400,
        color: textPrimary,
        letterSpacing: -0.25,
        height: kIsWeb ? 1.1 : 1.2, // Better line height on mobile
      ),
      displayMedium: GoogleFonts.inter(
        fontSize: (45 * fontMultiplier),
        fontWeight: FontWeight.w400,
        color: textPrimary,
        height: kIsWeb ? 1.1 : 1.2,
      ),
      displaySmall: GoogleFonts.inter(
        fontSize: (36 * fontMultiplier),
        fontWeight: FontWeight.w400,
        color: textPrimary,
        height: kIsWeb ? 1.1 : 1.2,
      ),

      // Enhanced headline styles for mobile
      headlineLarge: GoogleFonts.inter(
        fontSize: (32 * fontMultiplier),
        fontWeight: FontWeight.w600,
        color: textPrimary,
        height: 1.2,
      ),
      headlineMedium: GoogleFonts.inter(
        fontSize: (28 * fontMultiplier),
        fontWeight: FontWeight.w600,
        color: textPrimary,
        height: 1.2,
      ),
      headlineSmall: GoogleFonts.inter(
        fontSize: (24 * fontMultiplier),
        fontWeight: FontWeight.w600,
        color: textPrimary,
        height: 1.3,
      ),

      // Enhanced title styles with better mobile spacing
      titleLarge: GoogleFonts.inter(
        fontSize: (22 * fontMultiplier),
        fontWeight: FontWeight.w600,
        color: textPrimary,
        letterSpacing: 0,
        height: 1.3,
      ),
      titleMedium: GoogleFonts.inter(
        fontSize: (16 * fontMultiplier),
        fontWeight: FontWeight.w600,
        color: textPrimary,
        letterSpacing: 0.15,
        height: 1.3,
      ),
      titleSmall: GoogleFonts.inter(
        fontSize: (14 * fontMultiplier),
        fontWeight: FontWeight.w600,
        color: textPrimary,
        letterSpacing: 0.1,
        height: 1.3,
      ),

      // Enhanced body styles for mobile readability
      bodyLarge: GoogleFonts.inter(
        fontSize: (16 * fontMultiplier),
        fontWeight: FontWeight.w400,
        color: textPrimary,
        letterSpacing: 0.5,
        height: kIsWeb ? 1.4 : 1.5, // Better line height on mobile
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: (14 * fontMultiplier),
        fontWeight: FontWeight.w400,
        color: textPrimary,
        letterSpacing: 0.25,
        height: kIsWeb ? 1.4 : 1.5,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: (12 * fontMultiplier),
        fontWeight: FontWeight.w400,
        color: textSecondary,
        letterSpacing: 0.4,
        height: 1.4,
      ),

      // Enhanced label styles for mobile interaction
      labelLarge: GoogleFonts.inter(
        fontSize: (14 * fontMultiplier),
        fontWeight: FontWeight.w500,
        color: textPrimary,
        letterSpacing: 0.1,
        height: 1.3,
      ),
      labelMedium: GoogleFonts.inter(
        fontSize: (12 * fontMultiplier),
        fontWeight: FontWeight.w500,
        color: textPrimary,
        letterSpacing: 0.5,
        height: 1.3,
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: (11 * fontMultiplier),
        fontWeight: FontWeight.w500,
        color: textDisabled,
        letterSpacing: 0.5,
        height: 1.3,
      ),
    );
  }
}
