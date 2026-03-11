// EST SB Smart Attendance - Profile Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Mail,
  Building2,
  GraduationCap,
  Shield,
  LogOut,
  Edit3,
  Save,
  Lock,
  ChevronRight,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Shadows, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, changePassword } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    await updateProfile({ firstName, lastName });
    setIsEditing(false);
    Alert.alert('Succès', 'Profil mis à jour');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    const result = await changePassword(oldPassword, newPassword);
    if (result.success) {
      Alert.alert('Succès', 'Mot de passe modifié');
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        },
      ]
    );
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

  const menuItems = [
    { icon: Lock, label: 'Changer le mot de passe', onPress: () => setShowChangePassword(true) },
    { icon: Shield, label: 'Confidentialité', onPress: () => { } },
    { icon: Mail, label: 'Notifications', onPress: () => { } },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={AppColors.gradientSplash} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={AppColors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image
              source={require('../assets/images/logo-est-sb.png')}
              style={styles.headerLogo}
              contentFit="contain"
            />
            <Text style={styles.headerTitle}>Profil</Text>
          </View>
          <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.editButton}>
            {isEditing ? (
              <Save size={22} color={AppColors.white} />
            ) : (
              <Edit3 size={22} color={AppColors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || 'student') }]}>
              <Text style={styles.roleText}>{getRoleLabel(user?.role || 'student')}</Text>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor={AppColors.textGrey}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor={AppColors.textGrey}
                />
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              {user?.studentId && (
                <Text style={styles.profileId}>{user.studentId}</Text>
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Mail size={20} color={AppColors.primaryBlue} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Building2 size={20} color={AppColors.primaryBlue} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Département</Text>
                <Text style={styles.infoValue}>{user?.department || 'Informatique'}</Text>
              </View>
            </View>
            {user?.role === 'student' && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <GraduationCap size={20} color={AppColors.primaryBlue} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>ID Étudiant</Text>
                    <Text style={styles.infoValue}>{user?.studentId || 'N/A'}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <View style={styles.card}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuIcon}>
                  <item.icon size={20} color={AppColors.primaryBlue} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={20} color={AppColors.textGrey} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Change Password Section */}
        {showChangePassword && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ancien mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={AppColors.textGrey}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={AppColors.textGrey}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={AppColors.textGrey}
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                <LinearGradient
                  colors={AppColors.gradientPrimary}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowChangePassword(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={AppColors.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
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
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginHorizontal: 20,
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.xl,
    padding: 24,
    alignItems: 'center',
    ...Shadows.large,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.gradientPrimary[0],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: AppColors.white,
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.textDark,
  },
  profileEmail: {
    fontSize: 14,
    color: AppColors.textGrey,
    marginTop: 4,
  },
  profileId: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primaryBlue,
    marginTop: 4,
  },
  editForm: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.textDark,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(30,95,168,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: AppColors.textGrey,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textDark,
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(30,95,168,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: AppColors.textDark,
    marginLeft: 12,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: AppColors.textGrey,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.error,
    marginLeft: 10,
  },
  version: {
    fontSize: 12,
    color: AppColors.textGrey,
    textAlign: 'center',
    marginTop: 24,
  },
});
