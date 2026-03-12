// EST SB Smart Attendance - Ultra Premium Splash Screen
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/auth-context';
import { AppColors, BorderRadius } from '@/src/constants/theme';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

// Animated values type
interface AnimationValues {
  logoScale: Animated.Value;
  logoOpacity: Animated.Value;
  logoRotate: Animated.Value;
  textOpacity: Animated.Value;
  textTranslateY: Animated.Value;
  taglineOpacity: Animated.Value;
  taglineScale: Animated.Value;
  ring1: Animated.Value;
  ring2: Animated.Value;
  ring3: Animated.Value;
  pulse: Animated.Value;
  bgCircle1: Animated.Value;
  bgCircle2: Animated.Value;
}

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Animation refs
  const anim = useRef<AnimationValues>({
    logoScale: new Animated.Value(0.3),
    logoOpacity: new Animated.Value(0),
    logoRotate: new Animated.Value(0),
    textOpacity: new Animated.Value(0),
    textTranslateY: new Animated.Value(30),
    taglineOpacity: new Animated.Value(0),
    taglineScale: new Animated.Value(0.8),
    ring1: new Animated.Value(0),
    ring2: new Animated.Value(0),
    ring3: new Animated.Value(0),
    pulse: new Animated.Value(1),
    bgCircle1: new Animated.Value(0),
    bgCircle2: new Animated.Value(0),
  }).current;

  useEffect(() => {
    // Create sophisticated animation sequence
    const entrySequence = Animated.sequence([
      // Background circles fade in
      Animated.parallel([
        Animated.timing(anim.bgCircle1, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(anim.bgCircle2, {
          toValue: 1,
          duration: 1000,
          delay: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),

      // Logo entry with bounce
      Animated.parallel([
        Animated.timing(anim.logoScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.7)),
        }),
        Animated.timing(anim.logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(anim.logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),

      // Concentric rings expansion
      Animated.stagger(150, [
        Animated.timing(anim.ring1, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(anim.ring2, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(anim.ring3, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),

      // Text reveal
      Animated.parallel([
        Animated.timing(anim.textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(anim.textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),

      // Tagline with scale
      Animated.parallel([
        Animated.timing(anim.taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim.taglineScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),
    ]);

    entrySequence.start();

    // Continuous pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim.pulse, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(anim.pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    pulseAnimation.start();

    // Navigation timer
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      }
    }, 3200);

    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
    };
  }, [anim, router, isAuthenticated, isLoading]);

  // Interpolations
  const logoRotate = anim.logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  const ring1Scale = anim.ring1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2.2],
  });
  const ring1Opacity = anim.ring1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0],
  });

  const ring2Scale = anim.ring2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.8],
  });
  const ring2Opacity = anim.ring2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.2, 0],
  });

  const ring3Scale = anim.ring3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.4],
  });
  const ring3Opacity = anim.ring3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.15, 0],
  });

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={AppColors.gradientSplash}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Animated background circles */}
        <Animated.View
          style={[
            styles.bgCircle,
            styles.bgCircle1,
            { opacity: anim.bgCircle1 },
          ]}
        />
        <Animated.View
          style={[
            styles.bgCircle,
            styles.bgCircle2,
            { opacity: anim.bgCircle2 },
          ]}
        />

        {/* Expanding rings behind logo */}
        <Animated.View
          style={[
            styles.expandingRing,
            {
              transform: [{ scale: ring1Scale }],
              opacity: ring1Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.expandingRing,
            {
              transform: [{ scale: ring2Scale }],
              opacity: ring2Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.expandingRing,
            {
              transform: [{ scale: ring3Scale }],
              opacity: ring3Opacity,
            },
          ]}
        />

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo container with glow effect */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: anim.logoOpacity,
                transform: [
                  { scale: anim.logoScale },
                  { rotate: logoRotate },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoGlow,
                { transform: [{ scale: anim.pulse }] },
              ]}
            />
            <View style={styles.logoFrame}>
              <Image
                source={require('../assets/images/logo-est-sb.png')}
                style={styles.logoImage}
                contentFit="contain"
                transition={300}
              />
            </View>
          </Animated.View>

          {/* Brand text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: anim.textOpacity,
                transform: [{ translateY: anim.textTranslateY }],
              },
            ]}
          >
            <Text style={styles.brandName}>EST SB</Text>
            <Text style={styles.brandSubtitle}>Smart Attendance</Text>
          </Animated.View>

          {/* Tagline pill */}
          <Animated.View
            style={{
              opacity: anim.taglineOpacity,
              transform: [{ scale: anim.taglineScale }],
            }}
          >
            <View style={styles.taglineContainer}>
              <View style={styles.taglineDot} />
              <Text style={styles.taglineText}>Smart Attendance System</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom section */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>École Supérieure de Technologie</Text>
          <Text style={styles.footerSubtext}>Sidi Bennour</Text>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(41,182,246,0.08)',
  },
  bgCircle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: height * 0.1,
    left: -width * 0.2,
  },
  bgCircle2: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: height * 0.15,
    right: -width * 0.1,
  },
  expandingRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: AppColors.accentBlue,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(41,182,246,0.15)',
  },
  logoFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.primaryDarkBlue,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: AppColors.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  brandSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.glowBlue,
    marginTop: 4,
    letterSpacing: 1,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  taglineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.mint,
    marginRight: 10,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  footerLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.3,
  },
  footerSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontWeight: '500',
  },
});
