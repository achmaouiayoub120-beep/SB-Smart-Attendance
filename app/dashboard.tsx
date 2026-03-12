// EST SB Smart Attendance - Main Dashboard (Role-based)
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    QrCode,
    History,
    User,
    BarChart3,
    LogOut,
    Bell,
    Settings,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/context/auth-context';
import { useData } from '@/src/context/data-context';
import { AppColors, Shadows, BorderRadius } from '@/src/constants/theme';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import ProfessorDashboard from '@/components/dashboard/ProfessorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import type { UserRole } from '@/src/types';

const { width: _width } = Dimensions.get('window');

interface NavItem {
    icon: React.ElementType;
    label: string;
    route: '/scan' | '/history' | '/analytics' | '/profile' | '/admin' | '/notifications';
    roles: UserRole[];
}

const navItems: NavItem[] = [
    { icon: QrCode, label: 'Scanner', route: '/scan', roles: ['student'] },
    { icon: History, label: 'Historique', route: '/history', roles: ['student', 'professor'] },
    { icon: BarChart3, label: 'Stats', route: '/analytics', roles: ['student', 'professor', 'admin'] },
    { icon: User, label: 'Profil', route: '/profile', roles: ['student', 'professor', 'admin'] },
    { icon: Settings, label: 'Admin', route: '/admin', roles: ['admin'] },
];

export default function DashboardScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { getUnreadCount } = useData();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const unreadCount = user ? getUnreadCount(user.id) : 0;

    useEffect(() => {
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
    }, [fadeAnim, slideAnim]);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const renderDashboard = () => {
        if (!user) return null;

        switch (user.role) {
            case 'student':
                return <StudentDashboard />;
            case 'professor':
                return <ProfessorDashboard />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <StudentDashboard />;
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case 'student':
                return 'Étudiant';
            case 'professor':
                return 'Professeur';
            case 'admin':
                return 'Administrateur';
            default:
                return role;
        }
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case 'student':
                return AppColors.lightBlue;
            case 'professor':
                return AppColors.lightGreen;
            case 'admin':
                return AppColors.warning;
            default:
                return AppColors.primaryBlue;
        }
    };

    const filteredNavItems = navItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={AppColors.gradientPrimary}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/images/logo-est-sb.png')}
                                style={styles.logoImage}
                                contentFit="contain"
                            />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>EST SB</Text>
                            <Text style={styles.headerSubtitle}>Smart Attendance</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('/notifications')}
                        >
                            <Bell size={22} color={AppColors.white} />
                            {unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                            <LogOut size={22} color={AppColors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || 'student') }]}>
                            <Text style={styles.roleText}>{getRoleLabel(user?.role || 'student')}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Main Content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {renderDashboard()}
                </ScrollView>
            </Animated.View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                {filteredNavItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.navItem}
                        onPress={() => router.push(item.route)}
                    >
                        <item.icon size={24} color={AppColors.textGrey} />
                        <Text style={styles.navLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    header: {
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.xl,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    logoImage: {
        width: 36,
        height: 36,
    },
    headerText: {
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: AppColors.white,
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: AppColors.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: AppColors.white,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: BorderRadius.lg,
        padding: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: AppColors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: AppColors.primaryBlue,
    },
    userInfo: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.white,
    },
    userEmail: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        marginTop: 6,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '600',
        color: AppColors.white,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: AppColors.white,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        ...Shadows.small,
    },
    navItem: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    navLabel: {
        fontSize: 11,
        color: AppColors.textGrey,
        marginTop: 4,
        fontWeight: '500',
    },
});
