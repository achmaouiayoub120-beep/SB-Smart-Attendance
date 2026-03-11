// EST SB Smart Attendance - Attendance History Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  BookOpen,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Shadows, BorderRadius } from '@/constants/theme';
import { MOCK_ATTENDANCE } from '@/lib/mock-data';
import type { AttendanceRecord } from '@/types';

export default function HistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'present', label: 'Présents' },
    { id: 'absent', label: 'Absents' },
    { id: 'late', label: 'Retards' },
  ];

  const filteredAttendance = MOCK_ATTENDANCE.filter(record => {
    // Filter by status
    if (selectedFilter && selectedFilter !== 'all') {
      if (record.status !== selectedFilter) return false;
    }

    // Filter by search query
    if (searchQuery) {
      return record.moduleName.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const getStatusConfig = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return {
          icon: CheckCircle2,
          color: AppColors.lightGreen,
          bgColor: 'rgba(76,175,80,0.1)',
          label: 'Présent',
        };
      case 'absent':
        return {
          icon: XCircle,
          color: AppColors.error,
          bgColor: 'rgba(229,57,53,0.1)',
          label: 'Absent',
        };
      case 'late':
        return {
          icon: Clock,
          color: AppColors.warning,
          bgColor: 'rgba(255,152,0,0.1)',
          label: 'Retard',
        };
      case 'excused':
        return {
          icon: CheckCircle2,
          color: AppColors.primaryBlue,
          bgColor: 'rgba(30,95,168,0.1)',
          label: 'Excusé',
        };
    }
  };

  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(r => r.status === 'present').length,
    absent: filteredAttendance.filter(r => r.status === 'absent').length,
    rate: filteredAttendance.length > 0
      ? Math.round((filteredAttendance.filter(r => r.status === 'present').length / filteredAttendance.length) * 100)
      : 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={AppColors.gradientSplash} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={AppColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historique</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={AppColors.textGrey} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un cours..."
              placeholderTextColor={AppColors.textGrey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={AppColors.primaryBlue} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.id === selectedFilter ? null : filter.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Séances</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: AppColors.lightGreen }]}>{stats.present}</Text>
            <Text style={styles.statLabel}>Présences</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: AppColors.error }]}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absences</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: AppColors.primaryBlue }]}>{stats.rate}%</Text>
            <Text style={styles.statLabel}>Taux</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Attendance List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {filteredAttendance.length > 0 ? (
          filteredAttendance.map((record, _index) => {
            const config = getStatusConfig(record.status);
            const Icon = config.icon;

            return (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={[styles.moduleIcon, { backgroundColor: 'rgba(30,95,168,0.1)' }]}>
                    <BookOpen size={20} color={AppColors.primaryBlue} />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.moduleName}>{record.moduleName}</Text>
                    <View style={styles.recordMeta}>
                      <Calendar size={14} color={AppColors.textGrey} />
                      <Text style={styles.recordDate}>
                        {record.date.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
                    <Icon size={16} color={config.color} />
                    <Text style={[styles.statusText, { color: config.color }]}>
                      {config.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Calendar size={48} color={AppColors.textGrey} />
            </View>
            <Text style={styles.emptyTitle}>Aucun enregistrement</Text>
            <Text style={styles.emptyText}>
              Aucune présence trouvée pour les critères sélectionnés
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    height: 50,
    ...Shadows.small,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: AppColors.textDark,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
  },
  filterChipActive: {
    backgroundColor: AppColors.white,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  filterChipTextActive: {
    color: AppColors.primaryBlue,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    justifyContent: 'space-around',
    ...Shadows.small,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textDark,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textGrey,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  recordCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...Shadows.small,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textDark,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recordDate: {
    fontSize: 13,
    color: AppColors.textGrey,
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textDark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textGrey,
    textAlign: 'center',
  },
});
