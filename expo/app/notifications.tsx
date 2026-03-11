// EST SB Smart Attendance - Notifications Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Check,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Shadows, BorderRadius } from '@/constants/theme';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import type { Notification } from '@/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, markNotificationAsRead, deleteNotification } = useData();

  const userNotifications = notifications.filter(n => n.userId === user?.id).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle2, color: AppColors.lightGreen };
      case 'absence':
        return { icon: XCircle, color: AppColors.error };
      case 'warning':
        return { icon: AlertTriangle, color: AppColors.warning };
      case 'reminder':
        return { icon: Clock, color: AppColors.primaryBlue };
      default:
        return { icon: Bell, color: AppColors.textGrey };
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInHours = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heures`;
    } else {
      return notifDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={AppColors.gradientSplash} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={AppColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userNotifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: AppColors.error }]}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Non lues</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: AppColors.lightGreen }]}>
              {userNotifications.filter(n => n.read).length}
            </Text>
            <Text style={styles.statLabel}>Lues</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Notifications List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {userNotifications.length > 0 ? (
          userNotifications.map((notification) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type);

            return (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationCard, !notification.read && styles.notificationCardUnread]}
                onPress={() => !notification.read && markNotificationAsRead(notification.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                  <Icon size={22} color={color} />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>{formatDate(notification.createdAt)}</Text>
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  {!notification.read && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>Non lu</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteNotification(notification.id)}
                >
                  <Trash2 size={18} color={AppColors.textGrey} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Bell size={48} color={AppColors.textGrey} />
            </View>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore de notifications
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => {
              userNotifications.filter(n => !n.read).forEach(n => {
                markNotificationAsRead(n.id);
              });
            }}
          >
            <Check size={20} color={AppColors.white} />
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      )}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.white,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...Shadows.small,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primaryBlue,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textDark,
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: AppColors.textGrey,
  },
  notificationMessage: {
    fontSize: 14,
    color: AppColors.textGrey,
    lineHeight: 20,
  },
  unreadBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(30,95,168,0.1)',
    borderRadius: BorderRadius.full,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.primaryBlue,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primaryBlue,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  markAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
  },
});
