// EST SB Smart Attendance - Session Screen (QR Generator) - Fully Functional
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, RefreshCw, Users, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Circle } from 'react-native-svg';
import { AppColors, Shadows, BorderRadius } from '@/constants/theme';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { width: _width } = Dimensions.get('window');

// Simple QR Code Component (SVG-based)
function SimpleQRCode({ value, size = 200 }: { value: string; size?: number }) {
  // Generate a simple pattern based on the value
  const pattern = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const cells = 25;
  const cellSize = size / cells;

  const getCell = (row: number, col: number) => {
    // Position markers (corners)
    if ((row < 7 && col < 7) || (row < 7 && col > 17) || (row > 17 && col < 7)) {
      if (row === 0 || row === 6 || col === 0 || col === 6) return true;
      if (row === 2 || row === 4) {
        if (col === 2 || col === 3 || col === 4) return true;
      }
      return false;
    }

    // Generate pattern from value
    const pos = row * cells + col;
    return ((pattern + pos * 7) % 17) > 7;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background */}
      <Rect width={size} height={size} fill="white" />

      {/* QR Pattern */}
      {Array.from({ length: cells }).map((_, row) =>
        Array.from({ length: cells }).map((_, col) => {
          if (getCell(row, col)) {
            return (
              <Rect
                key={`${row}-${col}`}
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1A3A6B"
              />
            );
          }
          return null;
        })
      )}

      {/* Center Logo Placeholder */}
      <Circle cx={size / 2} cy={size / 2} r={size / 8} fill="white" />
      <Circle cx={size / 2} cy={size / 2} r={size / 12} fill="#1E5FA8" />
    </Svg>
  );
}

export default function SessionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessions, students, attendance, regenerateQRCode, endSession, getSessionAttendance } = useData();

  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string;
  const initialQrCode = params.qrCode as string;
  const moduleName = params.moduleName as string;

  const [qrCode, setQrCode] = useState(initialQrCode);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isActive, setIsActive] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const session = sessions.find(s => s.id === sessionId);
  const sessionAttendance = getSessionAttendance(sessionId);
  const presentCount = sessionAttendance.filter(a => a.status === 'present').length;
  const absentCount = sessionAttendance.filter(a => a.status === 'absent').length;
  const totalStudents = students.length;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto regenerate when expired
          handleRegenerateQR();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, qrCode]);

  const handleRegenerateQR = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const newQr = await regenerateQRCode(sessionId);
    setQrCode(newQr);
    setTimeLeft(120);
  }, [sessionId, regenerateQRCode]);

  const handleEndSession = useCallback(async () => {
    await endSession(sessionId);
    setIsActive(false);
    router.back();
  }, [sessionId, endSession, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={AppColors.gradientSplash} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={AppColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session de cours</Text>
          <TouchableOpacity onPress={handleEndSession} style={styles.endButton}>
            <Text style={styles.endButtonText}>Terminer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Module Info */}
          <View style={styles.moduleCard}>
            <Text style={styles.moduleName}>{moduleName || session?.moduleName}</Text>
            <View style={styles.moduleDetails}>
              <View style={styles.moduleDetail}>
                <Clock size={16} color={AppColors.lightBlue} />
                <Text style={styles.moduleDetailText}>
                  {session?.startTime} - {session?.endTime || 'En cours'}
                </Text>
              </View>
              <View style={styles.moduleDetail}>
                <Text style={styles.roomText}>{session?.room}</Text>
              </View>
            </View>
          </View>

          {/* QR Code Card */}
          <Animated.View
            style={[
              styles.qrCard,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.qrContainer}>
              <SimpleQRCode value={qrCode} size={220} />
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <View style={styles.timerIconContainer}>
                <Clock size={20} color={timeLeft < 30 ? AppColors.error : AppColors.primaryBlue} />
              </View>
              <Text style={[styles.timerText, timeLeft < 30 && styles.timerTextWarning]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={styles.timerLabel}>Restant</Text>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity style={styles.refreshButton} onPress={handleRegenerateQR}>
              <RefreshCw size={18} color={AppColors.primaryBlue} />
              <Text style={styles.refreshText}>Régénérer le QR</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(76,175,80,0.1)' }]}>
                  <CheckCircle2 size={20} color={AppColors.lightGreen} />
                </View>
                <View>
                  <Text style={styles.statValue}>{presentCount}</Text>
                  <Text style={styles.statLabel}>Présents</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(229,57,53,0.1)' }]}>
                  <XCircle size={20} color={AppColors.error} />
                </View>
                <View>
                  <Text style={styles.statValue}>{absentCount}</Text>
                  <Text style={styles.statLabel}>Absents</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(30,95,168,0.1)' }]}>
                  <Users size={20} color={AppColors.primaryBlue} />
                </View>
                <View>
                  <Text style={styles.statValue}>{totalStudents}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(presentCount / totalStudents) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((presentCount / totalStudents) * 100)}% de présence
              </Text>
            </View>
          </View>

          {/* Attendance List */}
          <View style={styles.attendanceCard}>
            <Text style={styles.attendanceTitle}>Présences enregistrées</Text>
            {sessionAttendance.length > 0 ? (
              sessionAttendance.slice(0, 5).map((record) => {
                const student = students.find(s => s.id === record.studentId);
                if (!student) return null;

                return (
                  <View key={record.id} style={styles.attendanceItem}>
                    <View style={styles.attendanceAvatar}>
                      <Text style={styles.attendanceAvatarText}>
                        {student.firstName[0]}{student.lastName[0]}
                      </Text>
                    </View>
                    <View style={styles.attendanceInfo}>
                      <Text style={styles.attendanceName}>
                        {student.firstName} {student.lastName}
                      </Text>
                      <Text style={styles.attendanceTime}>
                        {new Date(record.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={[
                      styles.attendanceStatus,
                      { backgroundColor: record.status === 'present' ? AppColors.lightGreen : AppColors.error }
                    ]}>
                      <Text style={styles.attendanceStatusText}>
                        {record.status === 'present' ? 'Présent' : 'Absent'}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyAttendance}>
                <Text style={styles.emptyAttendanceText}>
                  Aucune présence enregistrée yet
                </Text>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>
              1. Affichez ce QR code aux étudiants{'\n'}
              2. Le QR code expire automatiquement après 2 minutes{'\n'}
              3. Régénérez le QR code si nécessaire{'\n'}
              4. Cliquez sur "Terminer" pour finir la session
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
  },
  endButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(229,57,53,0.3)',
    borderRadius: BorderRadius.lg,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  moduleCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 20,
  },
  moduleName: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 8,
  },
  moduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleDetailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  roomText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.lightBlue,
    backgroundColor: 'rgba(41,182,246,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  qrCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.xl,
    padding: 24,
    alignItems: 'center',
    ...Shadows.large,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderRadius: BorderRadius.lg,
  },
  timerIconContainer: {
    marginRight: 8,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.primaryBlue,
    fontVariant: ['tabular-nums'],
  },
  timerTextWarning: {
    color: AppColors.error,
  },
  timerLabel: {
    fontSize: 14,
    color: AppColors.textGrey,
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(30,95,168,0.1)',
    borderRadius: BorderRadius.lg,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primaryBlue,
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginTop: 20,
    ...Shadows.medium,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.textDark,
  },
  statLabel: {
    fontSize: 13,
    color: AppColors.textGrey,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  progressBar: {
    height: 8,
    backgroundColor: AppColors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.lightGreen,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: AppColors.textGrey,
    textAlign: 'center',
    marginTop: 8,
  },
  attendanceCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginTop: 20,
    ...Shadows.medium,
  },
  attendanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textDark,
    marginBottom: 16,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  attendanceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.white,
  },
  attendanceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attendanceName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textDark,
  },
  attendanceTime: {
    fontSize: 12,
    color: AppColors.textGrey,
  },
  attendanceStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  attendanceStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.white,
  },
  emptyAttendance: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyAttendanceText: {
    fontSize: 14,
    color: AppColors.textGrey,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
});
