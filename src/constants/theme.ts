/**
 * EST SB Smart Attendance - Design System
 * 
 * Centralized theme configuration for the entire application.
 * Contains color palette, shadows, typography, spacing, border radius,
 * and animation presets following an 8-point grid system.
 * 
 * @module constants/theme
 */

export const AppColors = {
    // Primary EST SB Colors - Refined for premium feel
    primaryDark: '#0F2744',
    primaryDarkBlue: '#1A3A6B',
    primaryBlue: '#1E5FA8',
    primaryLight: '#2B7FD4',
    accentBlue: '#29B6F6',
    glowBlue: '#4FC3F7',

    // Green Ecosystem
    darkGreen: '#1B5E20',
    forestGreen: '#2E7D32',
    emerald: '#4CAF50',
    mint: '#69F0AE',

    // Warm Accents
    coral: '#FF6B6B',
    sunset: '#FF8E53',
    amber: '#FFB300',

    // Neutral Palette - Premium grays
    white: '#FFFFFF',
    snow: '#FAFBFC',
    background: '#F0F4F8',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Text Hierarchy
    textPrimary: '#0D1B2A',
    textSecondary: '#415A77',
    textTertiary: '#778DA9',
    textMuted: '#9DB4C0',

    // Semantic Colors
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Legacy aliases (used across dashboard and screen components)
    lightBlue: '#29B6F6',
    lightGreen: '#4CAF50',
    textDark: '#0D1B2A',
    textGrey: '#778DA9',

    // Glassmorphism
    glassWhite: 'rgba(255,255,255,0.85)',
    glassLight: 'rgba(255,255,255,0.5)',
    glassDark: 'rgba(15,39,68,0.8)',

    // Gradients as arrays
    gradientPrimary: ['#0F2744', '#1A3A6B', '#1E5FA8'] as const,
    gradientSplash: ['#071221', '#0F2744', '#1A3A6B'] as const,
    gradientAccent: ['#1E5FA8', '#2B7FD4', '#29B6F6'] as const,
    gradientSuccess: ['#1B5E20', '#2E7D32', '#4CAF50'] as const,
    gradientWarm: ['#FF6B6B', '#FF8E53'] as const,
    gradientCard: ['#FFFFFF', '#FAFBFC'] as const,
    gradientGlow: ['rgba(41,182,246,0.3)', 'rgba(41,182,246,0)'] as const,
} as const;

/**
 * Shadow system with multi-layered depth.
 * Uses both short (xs, sm, md, lg) and readable (small, medium, large) aliases.
 */
export const Shadows = {
    xs: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    sm: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    xl: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
        elevation: 12,
    },
    glow: {
        shadowColor: '#29B6F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    inner: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 0,
    },

    // Readable aliases used across screen components
    small: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#0F2744',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
} as const;

// Typography System - Premium hierarchy
export const Typography = {
    display: {
        fontSize: 40,
        fontWeight: '800' as const,
        lineHeight: 48,
        color: AppColors.textPrimary,
        letterSpacing: -0.5,
    },
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
        color: AppColors.textPrimary,
        letterSpacing: -0.3,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700' as const,
        lineHeight: 32,
        color: AppColors.textPrimary,
        letterSpacing: -0.2,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
        color: AppColors.textPrimary,
        letterSpacing: -0.1,
    },
    h4: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 26,
        color: AppColors.textPrimary,
    },
    bodyLarge: {
        fontSize: 17,
        fontWeight: '400' as const,
        lineHeight: 26,
        color: AppColors.textSecondary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
        color: AppColors.textSecondary,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
        color: AppColors.textTertiary,
    },
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
        lineHeight: 16,
        color: AppColors.textMuted,
        letterSpacing: 0.2,
    },
    overline: {
        fontSize: 11,
        fontWeight: '600' as const,
        lineHeight: 16,
        color: AppColors.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
        color: AppColors.white,
        letterSpacing: 0.3,
    },
    buttonSmall: {
        fontSize: 14,
        fontWeight: '600' as const,
        lineHeight: 20,
        color: AppColors.white,
        letterSpacing: 0.2,
    },
} as const;

// Border radius - Premium rounding
export const BorderRadius = {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
} as const;

// Spacing - 8-point grid system
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 48,
} as const;

// Animation presets
export const Animations = {
    spring: {
        friction: 8,
        tension: 40,
    },
    easeOut: {
        duration: 300,
        easing: (x: number) => 1 - Math.pow(1 - x, 3),
    },
    easeInOut: {
        duration: 400,
        easing: (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    },
    bounce: {
        duration: 600,
    },
} as const;
