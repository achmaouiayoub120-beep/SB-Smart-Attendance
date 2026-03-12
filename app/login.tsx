// EST SB Smart Attendance - Premium Login Screen
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Check } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/src/context/auth-context';
import { AppColors, Shadows, BorderRadius } from '@/src/constants/theme';
import * as Haptics from 'expo-haptics';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

interface AnimatedInputProps {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  delay?: number;
}

function AnimatedInput({
  icon: Icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  isPassword = false,
  showPassword,
  onTogglePassword,
  delay = 0,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, fadeAnim, slideAnim, scaleAnim]);

  React.useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.2)', AppColors.accentBlue],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.inputOuterContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            shadowOpacity: shadowOpacity as unknown as number,
          },
        ]}
      >
        <View style={styles.inputIconContainer}>
          <Icon size={20} color={isFocused ? AppColors.accentBlue : AppColors.textTertiary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={AppColors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => {
            setIsFocused(true);
            if (Platform.OS !== 'web') {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={20} color={AppColors.textTertiary} />
            ) : (
              <Eye size={20} color={AppColors.textTertiary} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const cardSlide = useRef(new Animated.Value(50)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const bgCircle1 = useRef(new Animated.Value(0)).current;
  const bgCircle2 = useRef(new Animated.Value(0)).current;
  const bgCircle3 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Staggered entry animation
    Animated.sequence([
      // Background circles
      Animated.parallel([
        Animated.timing(bgCircle1, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bgCircle2, {
          toValue: 1,
          duration: 1200,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bgCircle3, {
          toValue: 1,
          duration: 1400,
          delay: 400,
          useNativeDriver: true,
        }),
      ]),
      // Header
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Card
      Animated.parallel([
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [bgCircle1, bgCircle2, bgCircle3, headerFade, headerSlide, cardSlide, cardScale]);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    const result = await login(email, password, rememberMe);

    setIsLoading(false);

    if (result.success) {
      router.replace('/dashboard');
    } else {
      Alert.alert('Erreur de connexion', result.error || 'Une erreur est survenue');
    }
  }, [email, password, rememberMe, login, router, buttonScale]);

  const handleButtonPressIn = useCallback(() => {
    Animated.timing(buttonScale, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const handleButtonPressOut = useCallback(() => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={AppColors.gradientSplash}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Animated background elements */}
          <Animated.View
            style={[
              styles.bgOrb,
              styles.bgOrb1,
              { opacity: bgCircle1 },
            ]}
          />
          <Animated.View
            style={[
              styles.bgOrb,
              styles.bgOrb2,
              { opacity: bgCircle2 },
            ]}
          />
          <Animated.View
            style={[
              styles.bgOrb,
              styles.bgOrb3,
              { opacity: bgCircle3 },
            ]}
          />

          {/* Header with logo */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerFade,
                transform: [{ translateY: headerSlide }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoFrame}>
                <Image
                  source={require('../assets/images/logo-est-sb.png')}
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
              <View style={styles.logoTextContainer}>
                <Text style={styles.logoTitle}>EST SB</Text>
                <Text style={styles.logoSubtitle}>Smart Attendance</Text>
              </View>
            </View>
          </Animated.View>

          {/* Glass card with form */}
          <Animated.View
            style={[
              styles.cardContainer,
              {
                opacity: cardSlide.interpolate({
                  inputRange: [0, 50],
                  outputRange: [1, 0],
                }),
                transform: [
                  { translateY: cardSlide },
                  { scale: cardScale },
                ],
              },
            ]}
          >
            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
              <View style={styles.cardContent}>
                <Text style={styles.welcomeTitle}>Bienvenue</Text>
                <Text style={styles.welcomeSubtitle}>
                  Connectez-vous pour continuer
                </Text>

                <AnimatedInput
                  icon={Mail}
                  placeholder="exemple@estsb.ma"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  delay={400}
                />

                <AnimatedInput
                  icon={Lock}
                  placeholder="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  isPassword
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  delay={500}
                />

                {/* Remember me & Forgot password */}
                <Animated.View
                  style={{
                    opacity: cardSlide.interpolate({
                      inputRange: [0, 50],
                      outputRange: [1, 0],
                    }),
                  }}
                >
                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      style={styles.rememberMeContainer}
                      onPress={() => {
                        setRememberMe(!rememberMe);
                        if (Platform.OS !== 'web') {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        rememberMe && styles.checkboxChecked,
                      ]}>
                        {rememberMe && (
                          <Check size={14} color={AppColors.white} strokeWidth={3} />
                        )}
                      </View>
                      <Text style={styles.rememberMeText}>Se souvenir de moi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7}>
                      <Text style={styles.forgotPassword}>Mot de passe oublié?</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                {/* Login button */}
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleLogin}
                  onPressIn={handleButtonPressIn}
                  onPressOut={handleButtonPressOut}
                  disabled={isLoading}
                  activeOpacity={1}
                >
                  <Animated.View
                    style={[
                      styles.button,
                      { transform: [{ scale: buttonScale }] },
                    ]}
                  >
                    <LinearGradient
                      colors={AppColors.gradientAccent}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                      </Text>
                      {!isLoading && (
                        <ArrowRight size={20} color={AppColors.white} style={styles.buttonIcon} />
                      )}
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>

                {/* Test accounts hint */}
                <View style={styles.testAccounts}>
                  <Text style={styles.testAccountsTitle}>Comptes de démonstration</Text>
                  <View style={styles.testAccountsGrid}>
                    <View style={styles.testAccountItem}>
                      <View style={[styles.testAccountDot, { backgroundColor: AppColors.accentBlue }]} />
                      <Text style={styles.testAccountText}>student@estsb.ma</Text>
                    </View>
                    <View style={styles.testAccountItem}>
                      <View style={[styles.testAccountDot, { backgroundColor: AppColors.emerald }]} />
                      <Text style={styles.testAccountText}>prof@estsb.ma</Text>
                    </View>
                    <View style={styles.testAccountItem}>
                      <View style={[styles.testAccountDot, { backgroundColor: AppColors.sunset }]} />
                      <Text style={styles.testAccountText}>admin@estsb.ma</Text>
                    </View>
                  </View>
                  <Text style={styles.testAccountPassword}>Mot de passe: password</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              École Supérieure de Technologie Sidi Bennour
            </Text>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  bgOrb: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(41,182,246,0.1)',
  },
  bgOrb1: {
    width: 350,
    height: 350,
    top: -100,
    right: -100,
  },
  bgOrb2: {
    width: 250,
    height: 250,
    bottom: 200,
    left: -80,
    backgroundColor: 'rgba(30,95,168,0.15)',
  },
  bgOrb3: {
    width: 180,
    height: 180,
    bottom: -40,
    right: 40,
    backgroundColor: 'rgba(105,240,174,0.08)',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.xl,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  logoTextContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.white,
    letterSpacing: 2,
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.glowBlue,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  blurContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardContent: {
    padding: 28,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.white,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },
  inputOuterContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    ...Shadows.sm,
  },
  inputIconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: AppColors.white,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: AppColors.accentBlue,
    borderColor: AppColors.accentBlue,
  },
  rememberMeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  forgotPassword: {
    fontSize: 14,
    color: AppColors.glowBlue,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.white,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  testAccounts: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  testAccountsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  testAccountsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  testAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testAccountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  testAccountText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  testAccountPassword: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
