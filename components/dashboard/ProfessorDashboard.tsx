// Professor Dashboard Component - Fully Functional
import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Alert,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Users,
    Clock,
    Play,
    Square,
    ChevronRight,
    CheckCircle2,
    XCircle,
    BookOpen,
    Plus,
    QrCode,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Shadows, BorderRadius } from '@/constants/theme';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import type { Session, Module } from '@/types';

const { width } = Dimensions.get('window');

interface SessionCardProps {
    session: Session;
    onStart: (session: Session) => void;
    delay?: number;
}

function SessionCard({ session, onStart, delay = 0 }: SessionCardProps) {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return AppColors.lightGreen;
            case 'upcoming':
                return AppColors.warning;
            case 'completed':
                return AppColors.textGrey;
            default:
                return AppColors.textGrey;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'En cours';
            case 'upcoming':
                return 'À venir';
            case 'completed':
                return 'Terminée';
            default:
                return status;
        }
    };

    return (
        <Animated.View
            style={[
                styles.sessionCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.sessionHeader}>
                <View style={styles.sessionIconContainer}>
                    <BookOpen size={20} color={AppColors.primaryBlue} />
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(session.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
                        {getStatusText(session.status)}
                    </Text>
                </View>
            </View>

            <Text style={styles.sessionName}>{session.moduleName}</Text>

            <View style={styles.sessionInfo}>
                <View style={styles.infoItem}>
                    <Clock size={14} color={AppColors.textGrey} />
                    <Text style={styles.infoText}>{session.startTime} - {session.endTime || '--:--'}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.roomText}>{session.room}</Text>
                </View>
            </View>

            {session.status === 'completed' && (
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <CheckCircle2 size={14} color={AppColors.lightGreen} />
                        <Text style={styles.statText}>{session.presentCount} présents</Text>
                    </View>
                    <View style={styles.statItem}>
                        <XCircle size={14} color={AppColors.error} />
                        <Text style={styles.statText}>{session.absentCount} absents</Text>
                    </View>
                </View>
            )}

            {(session.status === 'upcoming' || session.status === 'active') && (
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => onStart(session)}
                >
                    <LinearGradient
                        colors={session.status === 'active' ? ['#E53935', '#EF5350'] : AppColors.gradientSuccess}
                        style={styles.startButtonGradient}
                    >
                        {session.status === 'active' ? (
                            <>
                                <Square size={16} color={AppColors.white} />
                                <Text style={styles.startButtonText}>Arrêter</Text>
                            </>
                        ) : (
                            <>
                                <Play size={16} color={AppColors.white} fill={AppColors.white} />
                                <Text style={styles.startButtonText}>Démarrer</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

export default function ProfessorDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { sessions, students, startSession, endSession, modules } = useData();

    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState<string>('');

    // Get professor's modules
    const professorModules = modules.filter(m => m.professorId === user?.id);

    // Get today's sessions
    const todaySessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        const today = new Date();
        return sessionDate.toDateString() === today.toDateString();
    });

    const pastSessions = sessions.filter(s => s.status === 'completed').slice(0, 3);

    const handleStartSession = useCallback(async (session: Session) => {
        if (session.status === 'active') {
            // Stop session
            await endSession(session.id);
            setActiveSession(null);
            Alert.alert('Session terminée', 'La session a été arrêtée avec succès');
        } else {
            // Show module selection modal for new session
            setShowStartModal(true);
        }
    }, [endSession]);

    const handleCreateSession = useCallback(async () => {
        if (!selectedModule) {
            Alert.alert('Erreur', 'Veuillez sélectionner un module');
            return;
        }

        try {
            const newSession = await startSession(selectedModule, user?.id || '');
            setActiveSession(newSession);
            setShowStartModal(false);
            setSelectedModule('');

            // Navigate to session screen
            router.push({
                pathname: '/session',
                params: {
                    sessionId: newSession.id,
                    qrCode: newSession.qrCode,
                    moduleName: newSession.moduleName,
                }
            });
        } catch {
            Alert.alert('Erreur', 'Impossible de démarrer la session');
        }
    }, [selectedModule, startSession, user?.id, router]);

    const getAttendanceRate = (session: Session) => {
        if (session.totalStudents === 0) return 0;
        return Math.round((session.presentCount / session.totalStudents) * 100);
    };

    return (
        <View style={styles.container}>
            {/* Quick Stats */}
            <View style={styles.quickStats}>
                <View style={styles.quickStatCard}>
                    <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(30,95,168,0.1)' }]}>
                        <BookOpen size={24} color={AppColors.primaryBlue} />
                    </View>
                    <View>
                        <Text style={styles.quickStatValue}>{professorModules.length}</Text>
                        <Text style={styles.quickStatLabel}>Modules</Text>
                    </View>
                </View>
                <View style={styles.quickStatCard}>
                    <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(76,175,80,0.1)' }]}>
                        <Users size={24} color={AppColors.lightGreen} />
                    </View>
                    <View>
                        <Text style={styles.quickStatValue}>{students.length}</Text>
                        <Text style={styles.quickStatLabel}>Étudiants</Text>
                    </View>
                </View>
            </View>

            {/* Active Session Alert */}
            {activeSession && (
                <View style={styles.activeAlert}>
                    <View style={styles.activeAlertContent}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeAlertText}>
                            Session active: {activeSession.moduleName}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.viewQrButton}
                        onPress={() => router.push({
                            pathname: '/session',
                            params: {
                                sessionId: activeSession.id,
                                qrCode: activeSession.qrCode,
                                moduleName: activeSession.moduleName,
                            }
                        })}
                    >
                        <Text style={styles.viewQrText}>Voir QR</Text>
                        <ChevronRight size={16} color={AppColors.primaryBlue} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Actions Rapides</Text>
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => setShowStartModal(true)}
                >
                    <LinearGradient
                        colors={AppColors.gradientSuccess}
                        style={styles.quickActionGradient}
                    >
                        <Play size={32} color={AppColors.white} />
                        <Text style={styles.quickActionText}>Nouvelle Session</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => router.push('/analytics')}
                >
                    <View style={[styles.quickActionGradient, { backgroundColor: AppColors.white }]}>
                        <Users size={32} color={AppColors.primaryBlue} />
                        <Text style={[styles.quickActionText, { color: AppColors.textDark }]}>Statistiques</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Today's Sessions */}
            <Text style={styles.sectionTitle}>Séances d'aujourd'hui</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sessionsScroll}
            >
                {todaySessions.length > 0 ? (
                    todaySessions.map((session, index) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onStart={handleStartSession}
                            delay={index * 100}
                        />
                    ))
                ) : (
                    <TouchableOpacity
                        style={styles.emptyCard}
                        onPress={() => setShowStartModal(true)}
                    >
                        <Plus size={32} color={AppColors.primaryBlue} />
                        <Text style={styles.emptyText}>Démarrer une session</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Student List Preview */}
            <Text style={styles.sectionTitle}>Mes étudiants</Text>
            <View style={styles.studentsCard}>
                {students.slice(0, 5).map((student) => (
                    <View key={student.id} style={styles.studentItem}>
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
                        <View style={styles.studentStats}>
                            <Text style={[
                                styles.studentRate,
                                { color: student.attendanceRate >= 80 ? AppColors.lightGreen : AppColors.warning }
                            ]}>
                                {student.attendanceRate}%
                            </Text>
                            <Text style={styles.studentRateLabel}>Présence</Text>
                        </View>
                    </View>
                ))}
                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push('/analytics')}
                >
                    <Text style={styles.viewAllText}>Voir tous les étudiants</Text>
                    <ChevronRight size={16} color={AppColors.primaryBlue} />
                </TouchableOpacity>
            </View>

            {/* Past Sessions */}
            <Text style={styles.sectionTitle}>Séances récentes</Text>
            <View style={styles.pastSessionsCard}>
                {pastSessions.map((session) => (
                    <View key={session.id} style={styles.pastSessionItem}>
                        <View style={styles.pastSessionInfo}>
                            <Text style={styles.pastSessionName}>{session.moduleName}</Text>
                            <Text style={styles.pastSessionDate}>
                                {new Date(session.date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View style={styles.pastSessionStats}>
                            <View style={styles.pastStat}>
                                <CheckCircle2 size={14} color={AppColors.lightGreen} />
                                <Text style={styles.pastStatText}>{session.presentCount}</Text>
                            </View>
                            <View style={styles.pastStat}>
                                <XCircle size={14} color={AppColors.error} />
                                <Text style={styles.pastStatText}>{session.absentCount}</Text>
                            </View>
                            <View style={styles.attendanceRateBadge}>
                                <Text style={styles.attendanceRateText}>{getAttendanceRate(session)}%</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Start Session Modal */}
            <Modal
                visible={showStartModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowStartModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Démarrer une session</Text>
                        <Text style={styles.modalSubtitle}>Sélectionnez un module</Text>

                        <ScrollView style={styles.moduleList}>
                            {professorModules.length > 0 ? (
                                professorModules.map((module) => (
                                    <TouchableOpacity
                                        key={module.id}
                                        style={[
                                            styles.moduleItem,
                                            selectedModule === module.id && styles.moduleItemSelected
                                        ]}
                                        onPress={() => setSelectedModule(module.id)}
                                    >
                                        <View style={styles.moduleItemIcon}>
                                            <BookOpen size={20} color={selectedModule === module.id ? AppColors.white : AppColors.primaryBlue} />
                                        </View>
                                        <View style={styles.moduleItemInfo}>
                                            <Text style={[
                                                styles.moduleItemName,
                                                selectedModule === module.id && styles.moduleItemTextSelected
                                            ]}>
                                                {module.name}
                                            </Text>
                                            <Text style={styles.moduleItemCode}>{module.code}</Text>
                                        </View>
                                        {selectedModule === module.id && (
                                            <CheckCircle2 size={24} color={AppColors.white} />
                                        )}
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.noModules}>
                                    <BookOpen size={48} color={AppColors.textGrey} />
                                    <Text style={styles.noModulesText}>Aucun module assigné</Text>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowStartModal(false);
                                    setSelectedModule('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.startSessionButton, !selectedModule && styles.startSessionButtonDisabled]}
                                onPress={handleCreateSession}
                                disabled={!selectedModule}
                            >
                                <LinearGradient
                                    colors={AppColors.gradientSuccess}
                                    style={styles.startSessionGradient}
                                >
                                    <QrCode size={20} color={AppColors.white} />
                                    <Text style={styles.startSessionButtonText}>Générer QR</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    quickStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    quickStatCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        padding: 16,
        ...Shadows.medium,
    },
    quickStatIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    quickStatValue: {
        fontSize: 24,
        fontWeight: '800',
        color: AppColors.textDark,
    },
    quickStatLabel: {
        fontSize: 13,
        color: AppColors.textGrey,
    },
    activeAlert: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(76,175,80,0.1)',
        borderRadius: BorderRadius.lg,
        padding: 16,
        marginBottom: 24,
    },
    activeAlertContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: AppColors.lightGreen,
        marginRight: 10,
    },
    activeAlertText: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textDark,
    },
    viewQrButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewQrText: {
        fontSize: 13,
        fontWeight: '600',
        color: AppColors.primaryBlue,
        marginRight: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.textDark,
        marginBottom: 16,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    quickActionCard: {
        flex: 1,
        height: 120,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.medium,
    },
    quickActionGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.white,
    },
    sessionsScroll: {
        paddingRight: 20,
        marginBottom: 24,
    },
    sessionCard: {
        width: width - 80,
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        padding: 20,
        marginRight: 12,
        ...Shadows.medium,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sessionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(30,95,168,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sessionName: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.textDark,
        marginBottom: 12,
    },
    sessionInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 13,
        color: AppColors.textGrey,
        marginLeft: 6,
    },
    roomText: {
        fontSize: 13,
        fontWeight: '600',
        color: AppColors.primaryBlue,
        backgroundColor: 'rgba(30,95,168,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 13,
        color: AppColors.textDark,
        marginLeft: 6,
    },
    startButton: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    startButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    startButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.white,
    },
    emptyCard: {
        width: width - 80,
        height: 200,
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.medium,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: AppColors.textGrey,
    },
    studentsCard: {
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        padding: 16,
        marginBottom: 24,
        ...Shadows.medium,
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    studentAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: AppColors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    studentAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    studentInfo: {
        flex: 1,
        marginLeft: 12,
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
    studentStats: {
        alignItems: 'flex-end',
    },
    studentRate: {
        fontSize: 16,
        fontWeight: '700',
    },
    studentRateLabel: {
        fontSize: 11,
        color: AppColors.textGrey,
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
    pastSessionsCard: {
        backgroundColor: AppColors.white,
        borderRadius: BorderRadius.lg,
        padding: 16,
        marginBottom: 24,
        ...Shadows.medium,
    },
    pastSessionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    pastSessionInfo: {
        flex: 1,
    },
    pastSessionName: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textDark,
    },
    pastSessionDate: {
        fontSize: 12,
        color: AppColors.textGrey,
        marginTop: 2,
    },
    pastSessionStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    pastStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pastStatText: {
        fontSize: 13,
        fontWeight: '600',
        color: AppColors.textDark,
    },
    attendanceRateBadge: {
        backgroundColor: 'rgba(30,95,168,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    attendanceRateText: {
        fontSize: 12,
        fontWeight: '700',
        color: AppColors.primaryBlue,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: AppColors.white,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: 24,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: AppColors.textDark,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: AppColors.textGrey,
        marginBottom: 20,
    },
    moduleList: {
        maxHeight: 300,
        marginBottom: 20,
    },
    moduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: AppColors.background,
        borderRadius: BorderRadius.lg,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moduleItemSelected: {
        backgroundColor: AppColors.primaryBlue,
        borderColor: AppColors.primaryBlue,
    },
    moduleItemIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moduleItemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    moduleItemName: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.textDark,
    },
    moduleItemTextSelected: {
        color: AppColors.white,
    },
    moduleItemCode: {
        fontSize: 13,
        color: AppColors.textGrey,
        marginTop: 2,
    },
    noModules: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noModulesText: {
        fontSize: 16,
        color: AppColors.textGrey,
        marginTop: 12,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: AppColors.background,
        borderRadius: BorderRadius.lg,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.textGrey,
    },
    startSessionButton: {
        flex: 1,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    startSessionButtonDisabled: {
        opacity: 0.5,
    },
    startSessionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    startSessionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
});
