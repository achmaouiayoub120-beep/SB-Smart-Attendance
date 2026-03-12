// Admin Dashboard Component - Fully Functional
import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Users,
    GraduationCap,
    BookOpen,
    ChevronRight,
    UserPlus,
    FileText,
    Settings,
    AlertTriangle,
    Bell,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Shadows, BorderRadius } from '@/src/constants/theme';
import { useData } from '@/src/context/data-context';

const { width } = Dimensions.get('window');

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    subtext?: string;
    gradient: readonly [string, string, ...string[]];
    delay?: number;
    onPress?: () => void;
}

function StatCard({ icon: Icon, label, value, subtext, gradient, delay = 0, onPress }: StatCardProps) {
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
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, fadeAnim, slideAnim]);

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <Animated.View
                style={[
                    styles.statCard,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <LinearGradient
                    colors={gradient}
                    style={styles.statCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Icon size={28} color={AppColors.white} style={styles.statIcon} />
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                    {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
}

interface QuickActionProps {
    icon: React.ElementType;
    label: string;
    color: string;
    onPress: () => void;
}

function QuickAction({ icon: Icon, label, color, onPress }: QuickActionProps) {
    return (
        <TouchableOpacity style={styles.quickAction} onPress={onPress}>
            <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
                <Icon size={24} color={color} />
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const { students, professors, modules, attendance, resetToMockData } = useData();

    // Calculate stats
    const totalStudents = students.length;
    const totalProfessors = professors.length;
    const totalModules = modules.length;
    const atRiskStudents = students.filter(s => s.attendanceRate < 75).length;

    // Calculate global attendance rate
    const totalAttendance = attendance.length;
    const totalPresent = attendance.filter(a => a.status === 'present').length;
    const globalAttendanceRate = totalAttendance > 0
        ? Math.round((totalPresent / totalAttendance) * 100)
        : 0;

    const quickActions = [
        { icon: UserPlus, label: 'Ajouter Utilisateur', color: AppColors.primaryBlue, onPress: () => router.push('/admin') },
        { icon: BookOpen, label: 'Gérer Modules', color: AppColors.lightGreen, onPress: () => router.push('/admin') },
        { icon: FileText, label: 'Rapports', color: AppColors.warning, onPress: () => router.push('/analytics') },
        { icon: Bell, label: 'Notifications', color: AppColors.textGrey, onPress: () => router.push('/notifications') },
    ];

    const handleReset = () => {
        Alert.alert(
            'Réinitialiser les données',
            'Êtes-vous sûr de vouloir réinitialiser toutes les données aux valeurs par défaut ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Réinitialiser',
                    style: 'destructive',
                    onPress: async () => {
                        await resetToMockData();
                        Alert.alert('Succès', 'Données réinitialisées');
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    icon={Users}
                    label="Total Étudiants"
                    value={totalStudents.toString()}
                    subtext="+12 ce mois"
                    gradient={[AppColors.primaryDarkBlue, AppColors.primaryBlue]}
                    delay={0}
                    onPress={() => router.push('/admin')}
                />
                <StatCard
                    icon={GraduationCap}
                    label="Professeurs"
                    value={totalProfessors.toString()}
                    subtext="Actifs"
                    gradient={[AppColors.darkGreen, AppColors.lightGreen]}
                    delay={100}
                    onPress={() => router.push('/admin')}
                />
                <StatCard
                    icon={BookOpen}
                    label="Modules"
                    value={totalModules.toString()}
                    subtext="En cours"
                    gradient={[AppColors.warning, '#FFB74D']}
                    delay={200}
                    onPress={() => router.push('/admin')}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Étudiants à risque"
                    value={atRiskStudents.toString()}
                    subtext="< 75% présence"
                    gradient={['#E53935', '#EF5350']}
                    delay={300}
                    onPress={() => router.push('/analytics')}
                />
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Actions Rapides</Text>
            <View style={styles.quickActionsGrid}>
                {quickActions.map((action, index) => (
                    <QuickAction
                        key={index}
                        icon={action.icon}
                        label={action.label}
                        color={action.color}
                        onPress={action.onPress}
                    />
                ))}
            </View>

            {/* Global Attendance Rate */}
            <Text style={styles.sectionTitle}>Taux de Présence Global</Text>
            <View style={styles.globalStatsCard}>
                <View style={styles.globalStatMain}>
                    <View style={styles.globalStatCircle}>
                        <LinearGradient
                            colors={AppColors.gradientSuccess}
                            style={styles.globalStatCircleInner}
                        >
                            <Text style={styles.globalStatValue}>{globalAttendanceRate}%</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.globalStatInfo}>
                        <Text style={styles.globalStatLabel}>Moyenne générale</Text>
                        <Text style={styles.globalStatSubtext}>
                            {totalPresent} présences sur {totalAttendance} séances
                        </Text>
                    </View>
                </View>
                <View style={styles.globalStatBars}>
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day, index) => {
                        const rate = [85, 90, 88, 82, 79][index];
                        return (
                            <View key={day} style={styles.globalBarItem}>
                                <Text style={styles.globalBarLabel}>{day}</Text>
                                <View style={styles.globalBarContainer}>
                                    <View style={[styles.globalBar, { width: `${rate}%`, backgroundColor: rate >= 80 ? AppColors.lightGreen : AppColors.warning }]} />
                                </View>
                                <Text style={styles.globalBarValue}>{rate}%</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Recent Users */}
            <Text style={styles.sectionTitle}>Utilisateurs récents</Text>
            <View style={styles.usersCard}>
                {/* Recent Students */}
                <View style={styles.userSection}>
                    <Text style={styles.userSectionTitle}>Nouveaux étudiants</Text>
                    {students.slice(0, 3).map((student) => (
                        <TouchableOpacity
                            key={student.id}
                            style={styles.userItem}
                            onPress={() => router.push('/admin')}
                        >
                            <View style={styles.userAvatar}>
                                <Text style={styles.userAvatarText}>
                                    {student.firstName[0]}{student.lastName[0]}
                                </Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>
                                    {student.firstName} {student.lastName}
                                </Text>
                                <Text style={styles.userEmail}>{student.email}</Text>
                            </View>
                            <TouchableOpacity style={styles.userAction}>
                                <ChevronRight size={20} color={AppColors.textGrey} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Professors */}
                <View style={[styles.userSection, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }]}>
                    <Text style={styles.userSectionTitle}>Professeurs</Text>
                    {professors.slice(0, 2).map((professor) => (
                        <TouchableOpacity
                            key={professor.id}
                            style={styles.userItem}
                            onPress={() => router.push('/admin')}
                        >
                            <View style={[styles.userAvatar, { backgroundColor: AppColors.darkGreen }]}>
                                <Text style={styles.userAvatarText}>
                                    {professor.firstName[0]}{professor.lastName[0]}
                                </Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>
                                    {professor.firstName} {professor.lastName}
                                </Text>
                                <Text style={styles.userEmail}>{professor.email}</Text>
                            </View>
                            <TouchableOpacity style={styles.userAction}>
                                <ChevronRight size={20} color={AppColors.textGrey} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push('/admin')}
                >
                    <Text style={styles.viewAllText}>Gérer tous les utilisateurs</Text>
                    <ChevronRight size={16} color={AppColors.primaryBlue} />
                </TouchableOpacity>
            </View>

            {/* Module List */}
            <Text style={styles.sectionTitle}>Modules actifs</Text>
            <View style={styles.modulesCard}>
                {modules.slice(0, 4).map((module) => (
                    <TouchableOpacity
                        key={module.id}
                        style={styles.moduleItem}
                        onPress={() => router.push('/admin')}
                    >
                        <View style={styles.moduleIcon}>
                            <BookOpen size={20} color={AppColors.primaryBlue} />
                        </View>
                        <View style={styles.moduleInfo}>
                            <Text style={styles.moduleName}>{module.name}</Text>
                            <Text style={styles.moduleCode}>{module.code}</Text>
                        </View>
                        <View style={styles.moduleStats}>
                            <Text style={styles.moduleStudentCount}>35</Text>
                            <Text style={styles.moduleStatsLabel}>étudiants</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push('/admin')}
                >
                    <Text style={styles.viewAllText}>Gérer tous les modules</Text>
                    <ChevronRight size={16} color={AppColors.primaryBlue} />
                </TouchableOpacity>
            </View>

            {/* Reset Data */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Settings size={18} color={AppColors.textGrey} />
                <Text style={styles.resetText}>Réinitialiser les données</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 52) / 2,
        height: 150,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.medium,
    },
    statCardGradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    statIcon: {
        opacity: 0.9,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        color: AppColors.white,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    statSubtext: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.textDark,
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    quickAction: {
        width: (width - 72) / 2,
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        padding: 16,
        alignItems: 'center',
        ...Shadows.medium,
    },
    quickActionIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickActionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: AppColors.textDark,
        textAlign: 'center',
    },
    globalStatsCard: {
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        padding: 20,
        marginBottom: 24,
        ...Shadows.medium,
    },
    globalStatMain: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    globalStatCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 4,
        backgroundColor: 'rgba(76,175,80,0.1)',
    },
    globalStatCircleInner: {
        flex: 1,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    globalStatValue: {
        fontSize: 24,
        fontWeight: '800',
        color: AppColors.white,
    },
    globalStatInfo: {
        marginLeft: 20,
        flex: 1,
    },
    globalStatLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.textDark,
    },
    globalStatSubtext: {
        fontSize: 14,
        color: AppColors.lightGreen,
        marginTop: 4,
    },
    globalStatBars: {
        gap: 12,
    },
    globalBarItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    globalBarLabel: {
        width: 70,
        fontSize: 13,
        color: AppColors.textGrey,
    },
    globalBarContainer: {
        flex: 1,
        height: 10,
        backgroundColor: AppColors.background,
        borderRadius: 5,
        overflow: 'hidden',
        marginHorizontal: 12,
    },
    globalBar: {
        height: '100%',
        borderRadius: 5,
    },
    globalBarValue: {
        width: 40,
        fontSize: 13,
        fontWeight: '600',
        color: AppColors.textDark,
        textAlign: 'right',
    },
    usersCard: {
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        padding: 16,
        marginBottom: 24,
        ...Shadows.medium,
    },
    userSection: {
    },
    userSectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.textDark,
        marginBottom: 12,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    userAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: AppColors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textDark,
    },
    userEmail: {
        fontSize: 12,
        color: AppColors.textGrey,
        marginTop: 2,
    },
    userAction: {
        padding: 8,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 16,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.primaryBlue,
        marginRight: 4,
    },
    modulesCard: {
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        padding: 16,
        marginBottom: 24,
        ...Shadows.medium,
    },
    moduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    moduleIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(30,95,168,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moduleInfo: {
        flex: 1,
        marginLeft: 12,
    },
    moduleName: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textDark,
    },
    moduleCode: {
        fontSize: 12,
        color: AppColors.textGrey,
        marginTop: 2,
    },
    moduleStats: {
        alignItems: 'flex-end',
    },
    moduleStudentCount: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.primaryBlue,
    },
    moduleStatsLabel: {
        fontSize: 11,
        color: AppColors.textGrey,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: AppColors.background,
        paddingVertical: 14,
        borderRadius: BorderRadius.lg,
        gap: 8,
    },
    resetText: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textGrey,
    },
});
