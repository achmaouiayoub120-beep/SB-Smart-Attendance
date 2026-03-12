// Student Dashboard - Premium Design with Glassmorphism
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  QrCode,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  MapPin,
  Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AppColors, Shadows, BorderRadius } from '@/src/constants/theme';
import { useData } from '@/src/context/data-context';
import { useAuth } from '@/src/context/auth-context';

const { width } = Dimensions.get('window');

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  gradient: readonly [string, string, ...string[]];
  delay?: number;
  highlight?: boolean;
  onPress?: () => void;
}

function StatCard({ icon: Icon, label, value, subtext, gradient, delay = 0, highlight = false, onPress }: StatCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, fadeAnim, slideAnim, scaleAnim]);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onPress?.();
  }, [onPress, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.statCardTouchable}
      >
        <LinearGradient
          colors={gradient}
          style={styles.statCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {highlight && (
            <View style={styles.highlightBadge}>
              <Zap size={12} color={AppColors.white} fill={AppColors.white} />
            </View>
          )}
          <View style={styles.statIconContainer}>
            <Icon size={22} color={AppColors.white} strokeWidth={2.5} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
          {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface ClassCardProps {
  moduleName: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'active' | 'upcoming' | 'completed';
  index: number;
  onPress?: () => void;
}

function ClassCard({ moduleName, startTime, endTime, room, status, index, onPress }: ClassCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

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
      ]).start();
    }, 600 + index * 100);

    return () => clearTimeout(timer);
  }, [index, fadeAnim, slideAnim]);

  const statusConfig = {
    active: { color: AppColors.emerald, bgColor: 'rgba(16,185,129,0.15)', label: 'En cours' },
    upcoming: { color: AppColors.amber, bgColor: 'rgba(245,158,11,0.15)', label: 'À venir' },
    completed: { color: AppColors.textTertiary, bgColor: 'rgba(119,141,169,0.15)', label: 'Terminé' },
  };

  const config = statusConfig[status];

  return (
    <Animated.View
      style={[
        styles.classCard,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <BlurView intensity={20} tint="light" style={styles.classCardBlur}>
          <View style={styles.classCardContent}>
            <View style={styles.classHeader}>
              <View style={[styles.classIconContainer, { backgroundColor: config.bgColor }]}>
                <BookOpen size={18} color={config.color} strokeWidth={2} />
              </View>
              <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
                <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
              </View>
            </View>

            <Text style={styles.className}>{moduleName}</Text>

            <View style={styles.classDetails}>
              <View style={styles.classDetail}>
                <Clock size={14} color={AppColors.textTertiary} />
                <Text style={styles.classDetailText}>
                  {startTime} - {endTime}
                </Text>
              </View>
              <View style={styles.classDetail}>
                <MapPin size={14} color={AppColors.primaryBlue} />
                <Text style={[styles.classDetailText, styles.roomText]}>{room}</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface AttendanceItemProps {
  moduleName: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  index: number;
}

function AttendanceItem({ moduleName, date, status, index }: AttendanceItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800 + index * 80);

    return () => clearTimeout(timer);
  }, [index, fadeAnim, slideAnim]);

  const statusConfig = {
    present: { color: AppColors.emerald, icon: CheckCircle2, label: 'Présent' },
    absent: { color: AppColors.error, icon: AlertCircle, label: 'Absent' },
    late: { color: AppColors.warning, icon: Clock, label: 'Retard' },
    excused: { color: AppColors.primaryBlue, icon: CheckCircle2, label: 'Excusé' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Animated.View
      style={[
        styles.attendanceItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.attendanceIcon, { backgroundColor: config.color + '15' }]}>
        <Icon size={18} color={config.color} strokeWidth={2.5} />
      </View>
      <View style={styles.attendanceInfo}>
        <Text style={styles.attendanceModule}>{moduleName}</Text>
        <Text style={styles.attendanceDate}>
          {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>
      <View style={[styles.attendanceBadge, { backgroundColor: config.color }]}>
        <Text style={styles.attendanceBadgeText}>{config.label}</Text>
      </View>
    </Animated.View>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessions, attendance, stats } = useData();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Get today's sessions
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString() &&
      (s.status === 'active' || s.status === 'upcoming');
  }).slice(0, 3);

  // Get recent attendance for current user
  const recentAttendance = attendance
    .filter(a => a.studentId === user?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate stats
  const userAttendance = attendance.filter(a => a.studentId === user?.id);
  const totalSessions = userAttendance.length;
  const presentCount = userAttendance.filter(a => a.status === 'present').length;
  const absentCount = userAttendance.filter(a => a.status === 'absent').length;
  const lateCount = userAttendance.filter(a => a.status === 'late').length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

  // Header animation based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header Background */}
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={AppColors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Welcome Section */}
        <Animated.View style={[styles.welcomeSection, { opacity: headerOpacity }]}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeGreeting}>Bonjour, 👋</Text>
            <Text style={styles.welcomeName}>{user?.firstName} {user?.lastName}</Text>
          </View>
          <View style={styles.welcomeBadge}>
            <Text style={styles.welcomeBadgeText}>Étudiant</Text>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/scan')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[AppColors.primaryBlue, AppColors.accentBlue]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionIconContainer}>
                <QrCode size={28} color={AppColors.white} strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Scanner QR</Text>
              <ChevronRight size={16} color={AppColors.white} style={styles.actionArrow} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/history')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionGradient, styles.actionSecondary]}>
              <View style={[styles.actionIconContainer, styles.actionIconSecondary]}>
                <Calendar size={28} color={AppColors.primaryBlue} strokeWidth={2} />
              </View>
              <Text style={[styles.actionText, styles.actionTextSecondary]}>Historique</Text>
              <ChevronRight size={16} color={AppColors.textTertiary} style={styles.actionArrow} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/analytics')}>
              <Text style={styles.sectionLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon={TrendingUp}
              label="Taux présence"
              value={`${attendanceRate}%`}
              subtext="Année en cours"
              gradient={['#0F2744', '#1E5FA8', '#2B7FD4']}
              delay={200}
              highlight
              onPress={() => router.push('/analytics')}
            />
            <StatCard
              icon={AlertCircle}
              label="Absences"
              value={absentCount.toString()}
              subtext={`sur ${totalSessions} séances`}
              gradient={['#DC2626', '#EF4444', '#F87171']}
              delay={300}
              onPress={() => router.push('/history')}
            />
            <StatCard
              icon={CheckCircle2}
              label="Présences"
              value={presentCount.toString()}
              subtext="Confirmées"
              gradient={['#065F46', '#10B981', '#34D399']}
              delay={400}
              onPress={() => router.push('/history')}
            />
            <StatCard
              icon={Clock}
              label="Retards"
              value={lateCount.toString()}
              subtext="Cette semaine"
              gradient={['#D97706', '#F59E0B', '#FBBF24']}
              delay={500}
              onPress={() => router.push('/history')}
            />
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cours d'aujourd'hui</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{todaySessions.length}</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classesScroll}
          >
            {todaySessions.map((session, index) => (
              <ClassCard
                key={session.id}
                moduleName={session.moduleName}
                startTime={session.startTime}
                endTime={session.endTime || '--:--'}
                room={session.room}
                status={session.status as 'active' | 'upcoming'}
                index={index}
                onPress={() => session.status === 'active' && router.push('/scan')}
              />
            ))}

            {todaySessions.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Aucun cours aujourd'hui</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Présences récentes</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/history')}>
              <Text style={styles.sectionLink}>Historique complet</Text>
            </TouchableOpacity>
          </View>

          <BlurView intensity={10} tint="light" style={styles.attendanceContainer}>
            <View style={styles.attendanceList}>
              {recentAttendance.length > 0 ? (
                recentAttendance.map((record, index) => (
                  <AttendanceItem
                    key={record.id}
                    moduleName={record.moduleName}
                    date={new Date(record.date)}
                    status={record.status}
                    index={index}
                  />
                ))
              ) : (
                <View style={styles.emptyListItem}>
                  <Text style={styles.emptyListText}>Aucune présence enregistrée</Text>
                </View>
              )}
            </View>
          </BlurView>
        </View>

        {/* Weekly Activity Chart */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activité hebdomadaire</Text>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {stats.weeklyData.map((day) => {
                const totalHeight = 120;
                const presentHeight = (day.present / day.total) * totalHeight;
                const absentHeight = (day.absent / day.total) * totalHeight;

                return (
                  <View key={day.day} style={styles.barContainer}>
                    <View style={styles.barStack}>
                      <View style={[styles.barPresent, { height: presentHeight }]} />
                      <View style={[styles.barAbsent, { height: absentHeight }]} />
                    </View>
                    <Text style={styles.barLabel}>{day.day}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: AppColors.emerald }]} />
                <Text style={styles.legendText}>Présent</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: AppColors.error }]} />
                <Text style={styles.legendText}>Absent</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.white,
  },
  welcomeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
  },
  welcomeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.white,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  actionButton: {
    flex: 1,
    height: 110,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  actionGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  actionSecondary: {
    backgroundColor: AppColors.white,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconSecondary: {
    backgroundColor: 'rgba(30,95,168,0.1)',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.white,
  },
  actionTextSecondary: {
    color: AppColors.textPrimary,
  },
  actionArrow: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 28,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primaryBlue,
  },
  sectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    height: 130,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  statCardTouchable: {
    flex: 1,
  },
  statCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  highlightBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    marginTop: 'auto',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.white,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  classesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  classCard: {
    width: width * 0.75,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  classCardBlur: {
    backgroundColor: AppColors.white,
  },
  classCardContent: {
    padding: 20,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  classIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  className: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  classDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  classDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classDetailText: {
    fontSize: 13,
    color: AppColors.textTertiary,
    fontWeight: '500',
  },
  roomText: {
    color: AppColors.primaryBlue,
    fontWeight: '600',
  },
  emptyCard: {
    width: width * 0.75,
    height: 120,
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textTertiary,
    fontWeight: '500',
  },
  attendanceContainer: {
    marginHorizontal: 20,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: AppColors.white,
    ...Shadows.md,
  },
  attendanceList: {
    padding: 16,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  attendanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  attendanceModule: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  attendanceDate: {
    fontSize: 13,
    color: AppColors.textTertiary,
    marginTop: 2,
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  attendanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.white,
  },
  emptyListItem: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    color: AppColors.textTertiary,
  },
  chartCard: {
    marginHorizontal: 20,
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.xl,
    padding: 24,
    ...Shadows.md,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
  },
  barStack: {
    width: 28,
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  barPresent: {
    backgroundColor: AppColors.emerald,
  },
  barAbsent: {
    backgroundColor: AppColors.error,
  },
  barLabel: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginTop: 8,
    fontWeight: '500',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
});
