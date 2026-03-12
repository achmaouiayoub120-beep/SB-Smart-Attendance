// EST SB Smart Attendance - Analytics Dashboard
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  TrendingUp,
  BookOpen,
  Calendar,
  Award,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Shadows, BorderRadius } from '@/src/constants/theme';
import { MOCK_STATS, MOCK_STUDENTS } from '@/src/services/mock-data';

const { width: _width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const router = useRouter();

  // Sort students by attendance rate for top performers
  const topStudents = [...MOCK_STUDENTS]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 5);

  // Students at risk
  const atRiskStudents = MOCK_STUDENTS
    .filter(s => s.attendanceRate < 75)
    .sort((a, b) => a.attendanceRate - b.attendanceRate);

  const moduleStats = MOCK_STATS.byModule;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={AppColors.gradientSplash} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={AppColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistiques</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: 'rgba(76,175,80,0.2)' }]}>
              <TrendingUp size={24} color={AppColors.lightGreen} />
            </View>
            <View>
              <Text style={styles.summaryValue}>{MOCK_STATS.attendanceRate}%</Text>
              <Text style={styles.summaryLabel}>Taux global</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: 'rgba(30,95,168,0.2)' }]}>
              <Calendar size={24} color={AppColors.lightBlue} />
            </View>
            <View>
              <Text style={styles.summaryValue}>{MOCK_STATS.totalSessions}</Text>
              <Text style={styles.summaryLabel}>Séances</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Attendance by Module */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Par module</Text>
          <View style={styles.card}>
            {moduleStats.map((module) => (
              <View key={module.moduleId} style={styles.moduleRow}>
                <View style={styles.moduleInfo}>
                  <View style={styles.moduleIcon}>
                    <BookOpen size={18} color={AppColors.primaryBlue} />
                  </View>
                  <View>
                    <Text style={styles.moduleName}>{module.moduleName}</Text>
                    <Text style={styles.moduleDetail}>
                      {module.presentCount}/{module.totalSessions} présences
                    </Text>
                  </View>
                </View>
                <View style={styles.moduleStat}>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${module.attendanceRate}%`,
                          backgroundColor: module.attendanceRate >= 80
                            ? AppColors.lightGreen
                            : module.attendanceRate >= 60
                              ? AppColors.warning
                              : AppColors.error
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageText}>{module.attendanceRate}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendance hebdomadaire</Text>
          <View style={styles.card}>
            <View style={styles.chartContainer}>
              {MOCK_STATS.weeklyData.map((day) => {
                const totalHeight = 120;
                const presentHeight = (day.present / day.total) * totalHeight;
                const absentHeight = (day.absent / day.total) * totalHeight;

                return (
                  <View key={day.day} style={styles.chartBar}>
                    <View style={styles.barStack}>
                      <View style={[styles.barSegment, { height: presentHeight, backgroundColor: AppColors.lightGreen }]} />
                      <View style={[styles.barSegment, { height: absentHeight, backgroundColor: AppColors.error }]} />
                    </View>
                    <Text style={styles.barLabel}>{day.day}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: AppColors.lightGreen }]} />
                <Text style={styles.legendText}>Présent</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: AppColors.error }]} />
                <Text style={styles.legendText}>Absent</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top étudiants</Text>
          <View style={styles.card}>
            {topStudents.map((student, index) => (
              <View key={student.id} style={styles.studentRow}>
                <View style={styles.rankContainer}>
                  {index < 3 ? (
                    <View style={[styles.rankBadge, {
                      backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                    }]}>
                      <Award size={14} color={AppColors.white} />
                    </View>
                  ) : (
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  )}
                </View>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentAvatarText}>
                    {student.firstName[0]}{student.lastName[0]}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text style={styles.studentId}>{student.studentId}</Text>
                </View>
                <View style={styles.studentStat}>
                  <Text style={[styles.studentRate, { color: AppColors.lightGreen }]}>
                    {student.attendanceRate}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* At Risk Students */}
        {atRiskStudents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: AppColors.error }]}>
              Étudiants à risque
            </Text>
            <View style={styles.card}>
              {atRiskStudents.map((student) => (
                <View key={student.id} style={styles.studentRow}>
                  <View style={[styles.studentAvatar, { backgroundColor: AppColors.error }]}>
                    <Text style={styles.studentAvatarText}>
                      {student.firstName[0]}{student.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>
                      {student.firstName} {student.lastName}
                    </Text>
                    <Text style={styles.studentId}>{student.studentId}</Text>
                  </View>
                  <View style={styles.studentStat}>
                    <Text style={[styles.studentRate, { color: AppColors.error }]}>
                      {student.attendanceRate}%
                    </Text>
                    <Text style={styles.studentRisk}>À risque</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  gradient: {
    paddingBottom: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.medium,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.textDark,
  },
  summaryLabel: {
    fontSize: 13,
    color: AppColors.textGrey,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textDark,
    marginBottom: 12,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.medium,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  moduleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(30,95,168,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textDark,
  },
  moduleDetail: {
    fontSize: 12,
    color: AppColors.textGrey,
    marginTop: 2,
  },
  moduleStat: {
    alignItems: 'flex-end',
    width: 80,
  },
  progressBarContainer: {
    width: 60,
    height: 6,
    backgroundColor: AppColors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textDark,
    marginTop: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 16,
  },
  chartBar: {
    alignItems: 'center',
  },
  barStack: {
    width: 28,
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  barSegment: {
    width: '100%',
  },
  barLabel: {
    fontSize: 12,
    color: AppColors.textGrey,
    marginTop: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: AppColors.textGrey,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textGrey,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  studentAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.white,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textDark,
  },
  studentId: {
    fontSize: 12,
    color: AppColors.textGrey,
    marginTop: 2,
  },
  studentStat: {
    alignItems: 'flex-end',
  },
  studentRate: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentRisk: {
    fontSize: 11,
    color: AppColors.error,
    marginTop: 2,
  },
});
