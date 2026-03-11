// EST SB Smart Attendance - Admin Panel with full CRUD
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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Users,
  GraduationCap,
  BookOpen,
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Mail,
  Building2,
  Hash,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, Shadows, BorderRadius } from '@/constants/theme';
import { useData } from '@/lib/data-context';
import type { Student, Professor, Module } from '@/types';

const TABS = [
  { id: 'students', label: 'Étudiants', icon: Users },
  { id: 'professors', label: 'Professeurs', icon: GraduationCap },
  { id: 'modules', label: 'Modules', icon: BookOpen },
];

const DEPARTMENTS = ['Informatique', 'Mathématiques', 'Réseaux', 'Gestion', 'Électronique'];

export default function AdminScreen() {
  const router = useRouter();
  const { students, professors, modules, addStudent, updateStudent, deleteStudent, addProfessor, updateProfessor, deleteProfessor, addModule, updateModule, deleteModule } = useData();
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Student | Professor | Module | null>(null);
  const [modalType, setModalType] = useState<'student' | 'professor' | 'module'>('student');

  // Form states
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDepartment, setFormDepartment] = useState('Informatique');
  const [formStudentId, setFormStudentId] = useState('');
  const [formModuleName, setFormModuleName] = useState('');
  const [formModuleCode, setFormModuleCode] = useState('');
  const [formModuleProfessor, setFormModuleProfessor] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setModalType(activeTab === 'students' ? 'student' : activeTab === 'professors' ? 'professor' : 'module');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: Student | Professor | Module) => {
    setEditingItem(item);
    setModalType(activeTab === 'students' ? 'student' : activeTab === 'professors' ? 'professor' : 'module');

    if ('studentId' in item) {
      // Student
      setFormFirstName(item.firstName);
      setFormLastName(item.lastName);
      setFormEmail(item.email);
      setFormDepartment(item.department);
      setFormStudentId(item.studentId);
    } else if ('totalSessions' in item && !('code' in item)) {
      // Professor
      setFormFirstName(item.firstName);
      setFormLastName(item.lastName);
      setFormEmail(item.email);
      setFormDepartment(item.department);
    } else if ('code' in item) {
      // Module
      setFormModuleName(item.name);
      setFormModuleCode(item.code);
      setFormModuleProfessor(item.professorId);
    }

    setShowModal(true);
  };

  const resetForm = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormDepartment('Informatique');
    setFormStudentId('');
    setFormModuleName('');
    setFormModuleCode('');
    setFormModuleProfessor('');
  };

  const handleSave = async () => {
    try {
      if (modalType === 'student') {
        if (!formFirstName || !formLastName || !formEmail || !formStudentId) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
          return;
        }

        if (editingItem && 'studentId' in editingItem) {
          await updateStudent(editingItem.id, {
            firstName: formFirstName,
            lastName: formLastName,
            email: formEmail,
            department: formDepartment,
            studentId: formStudentId,
          });
        } else {
          await addStudent({
            firstName: formFirstName,
            lastName: formLastName,
            email: formEmail,
            department: formDepartment,
            studentId: formStudentId,
            role: 'student',
            class: '2ème Année',
            attendanceRate: 100,
            totalAbsences: 0,
            totalSessions: 0,
          });
        }
      } else if (modalType === 'professor') {
        if (!formFirstName || !formLastName || !formEmail) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
          return;
        }

        if (editingItem && 'totalSessions' in editingItem && !('code' in editingItem)) {
          await updateProfessor(editingItem.id, {
            firstName: formFirstName,
            lastName: formLastName,
            email: formEmail,
            department: formDepartment,
          });
        } else {
          await addProfessor({
            firstName: formFirstName,
            lastName: formLastName,
            email: formEmail,
            department: formDepartment,
            role: 'professor',
            totalSessions: 0,
            modules: [],
          });
        }
      } else if (modalType === 'module') {
        if (!formModuleName || !formModuleCode) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
          return;
        }

        const professor = professors.find(p => p.id === formModuleProfessor);

        if (editingItem && 'code' in editingItem) {
          await updateModule(editingItem.id, {
            name: formModuleName,
            code: formModuleCode,
            professorId: formModuleProfessor || undefined,
            professorName: professor ? `${professor.firstName} ${professor.lastName}` : undefined,
          });
        } else {
          await addModule({
            name: formModuleName,
            code: formModuleCode,
            professorId: formModuleProfessor || undefined,
            professorName: professor ? `${professor.firstName} ${professor.lastName}` : undefined,
            description: '',
            schedule: [],
          });
        }
      }

      setShowModal(false);
      resetForm();
      Alert.alert('Succès', editingItem ? 'Modifications enregistrées' : 'Élément ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    }
  };

  const handleDelete = (item: Student | Professor | Module) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet élément ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if ('studentId' in item) {
                await deleteStudent(item.id);
              } else if ('totalSessions' in item && !('code' in item)) {
                await deleteProfessor(item.id);
              } else if ('code' in item) {
                await deleteModule(item.id);
              }
              Alert.alert('Succès', 'Élément supprimé avec succès');
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer cet élément');
            }
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <View style={styles.tabContent}>
            {students.filter(s =>
              s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((student) => (
              <View key={student.id} style={styles.listItem}>
                <View style={styles.itemAvatar}>
                  <Text style={styles.itemAvatarText}>
                    {student.firstName[0]}{student.lastName[0]}
                  </Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{student.firstName} {student.lastName}</Text>
                  <Text style={styles.itemSubtext}>{student.studentId} • {student.department}</Text>
                </View>
                <View style={styles.itemActions}>
                  <Text style={[styles.itemRate, {
                    color: student.attendanceRate >= 75 ? AppColors.lightGreen : AppColors.error
                  }]}>
                    {student.attendanceRate}%
                  </Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(student)}>
                    <Edit3 size={18} color={AppColors.primaryBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(student)}>
                    <Trash2 size={18} color={AppColors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'professors':
        return (
          <View style={styles.tabContent}>
            {professors.filter(p =>
              p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.lastName.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((professor) => (
              <View key={professor.id} style={styles.listItem}>
                <View style={[styles.itemAvatar, { backgroundColor: AppColors.darkGreen }]}>
                  <Text style={styles.itemAvatarText}>
                    {professor.firstName[0]}{professor.lastName[0]}
                  </Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{professor.firstName} {professor.lastName}</Text>
                  <Text style={styles.itemSubtext}>{professor.department}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(professor)}>
                    <Edit3 size={18} color={AppColors.primaryBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(professor)}>
                    <Trash2 size={18} color={AppColors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'modules':
        return (
          <View style={styles.tabContent}>
            {modules.filter(m =>
              m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.code.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((module) => (
              <View key={module.id} style={styles.listItem}>
                <View style={[styles.itemAvatar, { backgroundColor: AppColors.warning }]}>
                  <BookOpen size={20} color={AppColors.white} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{module.name}</Text>
                  <Text style={styles.itemSubtext}>{module.code} • {module.professorName || 'Sans professeur'}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(module)}>
                    <Edit3 size={18} color={AppColors.primaryBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(module)}>
                    <Trash2 size={18} color={AppColors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  const renderModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Modifier' : 'Ajouter'} {modalType === 'student' ? 'un étudiant' : modalType === 'professor' ? 'un professeur' : 'un module'}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X size={24} color={AppColors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            {modalType === 'module' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nom du module</Text>
                  <TextInput
                    style={styles.input}
                    value={formModuleName}
                    onChangeText={setFormModuleName}
                    placeholder="Ex: Développement Mobile"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Code</Text>
                  <TextInput
                    style={styles.input}
                    value={formModuleCode}
                    onChangeText={setFormModuleCode}
                    placeholder="Ex: DEV401"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Professeur</Text>
                  <View style={styles.selectContainer}>
                    {professors.map(prof => (
                      <TouchableOpacity
                        key={prof.id}
                        style={[styles.selectOption, formModuleProfessor === prof.id && styles.selectOptionActive]}
                        onPress={() => setFormModuleProfessor(prof.id)}
                      >
                        <Text style={[styles.selectOptionText, formModuleProfessor === prof.id && styles.selectOptionTextActive]}>
                          {prof.firstName} {prof.lastName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prénom</Text>
                  <View style={styles.inputWithIcon}>
                    <Users size={18} color={AppColors.textGrey} />
                    <TextInput
                      style={styles.inputFlex}
                      value={formFirstName}
                      onChangeText={setFormFirstName}
                      placeholder="Prénom"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nom</Text>
                  <View style={styles.inputWithIcon}>
                    <Users size={18} color={AppColors.textGrey} />
                    <TextInput
                      style={styles.inputFlex}
                      value={formLastName}
                      onChangeText={setFormLastName}
                      placeholder="Nom"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputWithIcon}>
                    <Mail size={18} color={AppColors.textGrey} />
                    <TextInput
                      style={styles.inputFlex}
                      value={formEmail}
                      onChangeText={setFormEmail}
                      placeholder="email@estsb.ma"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Département</Text>
                  <View style={styles.selectContainer}>
                    {DEPARTMENTS.map(dept => (
                      <TouchableOpacity
                        key={dept}
                        style={[styles.selectOption, formDepartment === dept && styles.selectOptionActive]}
                        onPress={() => setFormDepartment(dept)}
                      >
                        <Text style={[styles.selectOptionText, formDepartment === dept && styles.selectOptionTextActive]}>
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {modalType === 'student' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ID Étudiant</Text>
                    <View style={styles.inputWithIcon}>
                      <Hash size={18} color={AppColors.textGrey} />
                      <TextInput
                        style={styles.inputFlex}
                        value={formStudentId}
                        onChangeText={setFormStudentId}
                        placeholder="Ex: S2023001"
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <LinearGradient colors={AppColors.gradientPrimary} style={styles.saveBtnGradient}>
                <Check size={20} color={AppColors.white} />
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
            <Text style={styles.headerTitle}>Administration</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Users size={24} color={AppColors.white} />
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>Étudiants</Text>
          </View>
          <View style={styles.statCard}>
            <GraduationCap size={24} color={AppColors.white} />
            <Text style={styles.statValue}>{professors.length}</Text>
            <Text style={styles.statLabel}>Professeurs</Text>
          </View>
          <View style={styles.statCard}>
            <BookOpen size={24} color={AppColors.white} />
            <Text style={styles.statValue}>{modules.length}</Text>
            <Text style={styles.statLabel}>Modules</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={AppColors.textGrey} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Rechercher ${activeTab}...`}
              placeholderTextColor={AppColors.textGrey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Plus size={24} color={AppColors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => { setActiveTab(tab.id); setSearchQuery(''); }}
            >
              <Icon size={18} color={isActive ? AppColors.primaryBlue : AppColors.textGrey} />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {renderTabContent()}
      </ScrollView>

      {renderModal()}
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
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
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
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
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
  addButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: AppColors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(30,95,168,0.1)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textGrey,
  },
  tabTextActive: {
    color: AppColors.primaryBlue,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.small,
  },
  itemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textDark,
  },
  itemSubtext: {
    fontSize: 13,
    color: AppColors.textGrey,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemRate: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textDark,
  },
  modalForm: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.textDark,
    marginLeft: 12,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectOptionActive: {
    backgroundColor: 'rgba(30,95,168,0.1)',
    borderColor: AppColors.primaryBlue,
  },
  selectOptionText: {
    fontSize: 14,
    color: AppColors.textGrey,
  },
  selectOptionTextActive: {
    color: AppColors.primaryBlue,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: AppColors.background,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textGrey,
  },
  saveBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
  },
});
