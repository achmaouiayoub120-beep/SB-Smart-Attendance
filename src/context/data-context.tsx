/**
 * Global Data Context
 * 
 * Provides centralized state management for all application data:
 * - Students, Professors, Modules (CRUD operations)
 * - Sessions (start, end, QR code management)
 * - Attendance records
 * - Notifications
 * - Statistics
 * 
 * Data is persisted locally using AsyncStorage.
 * In a production environment, this would connect to a REST API or Firebase.
 * 
 * Usage:
 *   Wrap your app with <DataProvider> in _layout.tsx
 *   Access data with: const { students, sessions, ... } = useData();
 * 
 * @module context/data-context
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Student, Professor, Module, Session, AttendanceRecord,
  AttendanceStats, Notification,
} from '@/src/types';
import {
  MOCK_STUDENTS, MOCK_PROFESSORS, MOCK_MODULES, MOCK_SESSIONS,
  MOCK_ATTENDANCE, MOCK_STATS, MOCK_NOTIFICATIONS, generateQRCode,
} from '@/src/services/mock-data';

// ─────────────────────────────────────────────
// AsyncStorage keys for data persistence
// ─────────────────────────────────────────────
const STORAGE_KEYS = {
  STUDENTS: 'estsb_students',
  PROFESSORS: 'estsb_professors',
  MODULES: 'estsb_modules',
  SESSIONS: 'estsb_sessions',
  ATTENDANCE: 'estsb_attendance',
  NOTIFICATIONS: 'estsb_notifications',
  STATS: 'estsb_stats',
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface DataState {
  students: Student[];
  professors: Professor[];
  modules: Module[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  notifications: Notification[];
  stats: AttendanceStats;
  isLoading: boolean;
}

interface DataContextType extends DataState {
  // Student CRUD
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Professor CRUD
  addProfessor: (professor: Omit<Professor, 'id' | 'createdAt'>) => Promise<void>;
  updateProfessor: (id: string, data: Partial<Professor>) => Promise<void>;
  deleteProfessor: (id: string) => Promise<void>;

  // Module CRUD
  addModule: (module: Omit<Module, 'id'>) => Promise<void>;
  updateModule: (id: string, data: Partial<Module>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;

  // Session management
  startSession: (moduleId: string, professorId: string) => Promise<Session>;
  endSession: (sessionId: string) => Promise<void>;
  regenerateQRCode: (sessionId: string) => Promise<string>;

  // Attendance
  markAttendance: (sessionId: string, studentId: string, status: AttendanceRecord['status']) => Promise<void>;
  getStudentAttendance: (studentId: string) => AttendanceRecord[];
  getSessionAttendance: (sessionId: string) => AttendanceRecord[];

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  getUnreadCount: (userId: string) => number;

  // Stats
  refreshStats: () => Promise<void>;

  // Reset data
  resetToMockData: () => Promise<void>;
}

// ─────────────────────────────────────────────
// Serialization helpers for date fields
// ─────────────────────────────────────────────
const serializeData = (data: unknown): string => JSON.stringify(data);

const deserializeData = <T,>(data: string): T => JSON.parse(data, (key, value) => {
  // Automatically convert date strings back to Date objects
  if (key === 'date' || key === 'createdAt' || key === 'qrCodeExpiresAt' || key === 'expiresAt') {
    return new Date(value);
  }
  return value;
});

// ─────────────────────────────────────────────
// Context + Provider
// ─────────────────────────────────────────────
const DataContext = createContext<DataContextType | null>(null);

/**
 * Custom hook to access the global data context.
 * Must be used within a DataProvider.
 */
export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

/**
 * Data provider component.
 * Loads data from AsyncStorage on mount and persists changes automatically.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>({
    students: MOCK_STUDENTS,
    professors: MOCK_PROFESSORS,
    modules: MOCK_MODULES,
    sessions: MOCK_SESSIONS,
    attendance: MOCK_ATTENDANCE,
    notifications: MOCK_NOTIFICATIONS,
    stats: MOCK_STATS,
    isLoading: true,
  });

  // ── Load persisted data on app startup ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          studentsData,
          professorsData,
          modulesData,
          sessionsData,
          attendanceData,
          notificationsData,
          statsData,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.STUDENTS),
          AsyncStorage.getItem(STORAGE_KEYS.PROFESSORS),
          AsyncStorage.getItem(STORAGE_KEYS.MODULES),
          AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
          AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.STATS),
        ]);

        setState({
          students: studentsData ? deserializeData<Student[]>(studentsData) : MOCK_STUDENTS,
          professors: professorsData ? deserializeData<Professor[]>(professorsData) : MOCK_PROFESSORS,
          modules: modulesData ? deserializeData<Module[]>(modulesData) : MOCK_MODULES,
          sessions: sessionsData ? deserializeData<Session[]>(sessionsData) : MOCK_SESSIONS,
          attendance: attendanceData ? deserializeData<AttendanceRecord[]>(attendanceData) : MOCK_ATTENDANCE,
          notifications: notificationsData ? deserializeData<Notification[]>(notificationsData) : MOCK_NOTIFICATIONS,
          stats: statsData ? deserializeData<AttendanceStats>(statsData) : MOCK_STATS,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    void loadData();
  }, []);

  // ── Helper: persist a single data key to AsyncStorage ──
  const persistData = useCallback(async (key: string, data: unknown) => {
    try {
      await AsyncStorage.setItem(key, serializeData(data));
    } catch (error) {
      console.error(`Error persisting ${key}:`, error);
    }
  }, []);

  // ─────────────────────────────────────────
  // Student CRUD Operations
  // ─────────────────────────────────────────
  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `s${Date.now()}`,
      createdAt: new Date(),
    };
    const updated = [...state.students, newStudent];
    setState(prev => ({ ...prev, students: updated }));
    await persistData(STORAGE_KEYS.STUDENTS, updated);
  }, [state.students, persistData]);

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    const updated = state.students.map(s => s.id === id ? { ...s, ...data } : s);
    setState(prev => ({ ...prev, students: updated }));
    await persistData(STORAGE_KEYS.STUDENTS, updated);
  }, [state.students, persistData]);

  const deleteStudent = useCallback(async (id: string) => {
    const updated = state.students.filter(s => s.id !== id);
    setState(prev => ({ ...prev, students: updated }));
    await persistData(STORAGE_KEYS.STUDENTS, updated);
  }, [state.students, persistData]);

  // ─────────────────────────────────────────
  // Professor CRUD Operations
  // ─────────────────────────────────────────
  const addProfessor = useCallback(async (profData: Omit<Professor, 'id' | 'createdAt'>) => {
    const newProfessor: Professor = {
      ...profData,
      id: `p${Date.now()}`,
      createdAt: new Date(),
    };
    const updated = [...state.professors, newProfessor];
    setState(prev => ({ ...prev, professors: updated }));
    await persistData(STORAGE_KEYS.PROFESSORS, updated);
  }, [state.professors, persistData]);

  const updateProfessor = useCallback(async (id: string, data: Partial<Professor>) => {
    const updated = state.professors.map(p => p.id === id ? { ...p, ...data } : p);
    setState(prev => ({ ...prev, professors: updated }));
    await persistData(STORAGE_KEYS.PROFESSORS, updated);
  }, [state.professors, persistData]);

  const deleteProfessor = useCallback(async (id: string) => {
    const updated = state.professors.filter(p => p.id !== id);
    setState(prev => ({ ...prev, professors: updated }));
    await persistData(STORAGE_KEYS.PROFESSORS, updated);
  }, [state.professors, persistData]);

  // ─────────────────────────────────────────
  // Module CRUD Operations
  // ─────────────────────────────────────────
  const addModule = useCallback(async (moduleData: Omit<Module, 'id'>) => {
    const newModule: Module = {
      ...moduleData,
      id: `mod${Date.now()}`,
    };
    const updated = [...state.modules, newModule];
    setState(prev => ({ ...prev, modules: updated }));
    await persistData(STORAGE_KEYS.MODULES, updated);
  }, [state.modules, persistData]);

  const updateModule = useCallback(async (id: string, data: Partial<Module>) => {
    const updated = state.modules.map(m => m.id === id ? { ...m, ...data } : m);
    setState(prev => ({ ...prev, modules: updated }));
    await persistData(STORAGE_KEYS.MODULES, updated);
  }, [state.modules, persistData]);

  const deleteModule = useCallback(async (id: string) => {
    const updated = state.modules.filter(m => m.id !== id);
    setState(prev => ({ ...prev, modules: updated }));
    await persistData(STORAGE_KEYS.MODULES, updated);
  }, [state.modules, persistData]);

  // ─────────────────────────────────────────
  // Session Management
  // ─────────────────────────────────────────

  /**
   * Start a new attendance session for a given module.
   * Generates a temporary QR code valid for 2 minutes.
   */
  const startSession = useCallback(async (moduleId: string, professorId: string): Promise<Session> => {
    const module = state.modules.find(m => m.id === moduleId);
    if (!module) throw new Error('Module not found');

    const sessionId = `sess${Date.now()}`;
    const newSession: Session = {
      id: sessionId,
      moduleId,
      moduleName: module.name,
      professorId,
      date: new Date(),
      startTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      endTime: '',
      room: module.schedule?.[0]?.room || 'Salle non définie',
      qrCode: generateQRCode(sessionId, professorId, moduleId),
      qrCodeExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes validity
      status: 'active',
      totalStudents: state.students.length,
      presentCount: 0,
      absentCount: 0,
    };

    const updated = [...state.sessions, newSession];
    setState(prev => ({ ...prev, sessions: updated }));
    await persistData(STORAGE_KEYS.SESSIONS, updated);

    return newSession;
  }, [state.modules, state.students.length, state.sessions, persistData]);

  /**
   * End an active session, marking it as completed with a timestamp.
   */
  const endSession = useCallback(async (sessionId: string) => {
    const updated = state.sessions.map(s =>
      s.id === sessionId
        ? {
            ...s,
            status: 'completed' as const,
            endTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          }
        : s
    );
    setState(prev => ({ ...prev, sessions: updated }));
    await persistData(STORAGE_KEYS.SESSIONS, updated);
  }, [state.sessions, persistData]);

  /**
   * Regenerate the QR code for a session (extends validity by 2 minutes).
   */
  const regenerateQRCode = useCallback(async (sessionId: string): Promise<string> => {
    const newQR = generateQRCode(sessionId, 'prof2', 'mod1');
    const updated = state.sessions.map(s =>
      s.id === sessionId
        ? { ...s, qrCode: newQR, qrCodeExpiresAt: new Date(Date.now() + 2 * 60 * 1000) }
        : s
    );
    setState(prev => ({ ...prev, sessions: updated }));
    await persistData(STORAGE_KEYS.SESSIONS, updated);
    return newQR;
  }, [state.sessions, persistData]);

  // ─────────────────────────────────────────
  // Attendance
  // ─────────────────────────────────────────

  /**
   * Mark a student's attendance for a session.
   * If the student already has a record, it updates; otherwise creates new.
   * Automatically sends an absence notification when status is 'absent'.
   */
  const markAttendance = useCallback(async (
    sessionId: string,
    studentId: string,
    status: AttendanceRecord['status'],
  ) => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Check if student already has a record for this session
    const existingIndex = state.attendance.findIndex(
      a => a.sessionId === sessionId && a.studentId === studentId
    );

    let updatedAttendance: AttendanceRecord[];

    if (existingIndex >= 0) {
      // Update existing record
      updatedAttendance = state.attendance.map((a, i) =>
        i === existingIndex ? { ...a, status } : a
      );
    } else {
      // Create new attendance record
      const newRecord: AttendanceRecord = {
        id: `att${Date.now()}`,
        sessionId,
        studentId,
        moduleId: session.moduleId,
        moduleName: session.moduleName,
        date: new Date(),
        status,
      };
      updatedAttendance = [...state.attendance, newRecord];
    }

    // Update session present/absent counts
    const updatedSessions = state.sessions.map(s => {
      if (s.id !== sessionId) return s;
      const presentCount = updatedAttendance.filter(a => a.sessionId === sessionId && a.status === 'present').length;
      const absentCount = updatedAttendance.filter(a => a.sessionId === sessionId && a.status === 'absent').length;
      return { ...s, presentCount, absentCount };
    });

    setState(prev => ({ ...prev, attendance: updatedAttendance, sessions: updatedSessions }));
    await persistData(STORAGE_KEYS.ATTENDANCE, updatedAttendance);
    await persistData(STORAGE_KEYS.SESSIONS, updatedSessions);

    // Send notification for absences
    if (status === 'absent') {
      const notification: Omit<Notification, 'id' | 'createdAt'> = {
        userId: studentId,
        title: 'Absence enregistrée',
        message: `Vous avez été marqué absent au cours de ${session.moduleName}`,
        type: 'absence',
        read: false,
      };
      await addNotification(notification);
    }
  }, [state.sessions, state.attendance, persistData]);

  const getStudentAttendance = useCallback((studentId: string) => {
    return state.attendance.filter(a => a.studentId === studentId);
  }, [state.attendance]);

  const getSessionAttendance = useCallback((sessionId: string) => {
    return state.attendance.filter(a => a.sessionId === sessionId);
  }, [state.attendance]);

  // ─────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────
  const addNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif${Date.now()}`,
      createdAt: new Date(),
    };
    const updated = [...state.notifications, newNotification];
    setState(prev => ({ ...prev, notifications: updated }));
    await persistData(STORAGE_KEYS.NOTIFICATIONS, updated);
  }, [state.notifications, persistData]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    const updated = state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setState(prev => ({ ...prev, notifications: updated }));
    await persistData(STORAGE_KEYS.NOTIFICATIONS, updated);
  }, [state.notifications, persistData]);

  const deleteNotification = useCallback(async (id: string) => {
    const updated = state.notifications.filter(n => n.id !== id);
    setState(prev => ({ ...prev, notifications: updated }));
    await persistData(STORAGE_KEYS.NOTIFICATIONS, updated);
  }, [state.notifications, persistData]);

  const getUnreadCount = useCallback((userId: string) => {
    return state.notifications.filter(n => n.userId === userId && !n.read).length;
  }, [state.notifications]);

  // ─────────────────────────────────────────
  // Statistics
  // ─────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    const totalSessions = state.sessions.filter(s => s.status === 'completed').length;
    const presentCount = state.attendance.filter(a => a.status === 'present').length;
    const absentCount = state.attendance.filter(a => a.status === 'absent').length;
    const lateCount = state.attendance.filter(a => a.status === 'late').length;
    const total = presentCount + absentCount + lateCount;
    const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100 * 10) / 10 : 0;

    const newStats: AttendanceStats = {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate,
      byModule: state.modules.map(m => {
        const moduleAttendance = state.attendance.filter(a => a.moduleId === m.id);
        const moduleTotal = moduleAttendance.length;
        const modulePresent = moduleAttendance.filter(a => a.status === 'present').length;
        return {
          moduleId: m.id,
          moduleName: m.name,
          totalSessions: moduleTotal,
          presentCount: modulePresent,
          absentCount: moduleTotal - modulePresent,
          attendanceRate: moduleTotal > 0 ? Math.round((modulePresent / moduleTotal) * 100) : 0,
        };
      }),
      weeklyData: state.stats.weeklyData,
    };

    setState(prev => ({ ...prev, stats: newStats }));
    await persistData(STORAGE_KEYS.STATS, newStats);
  }, [state.sessions, state.attendance, state.modules, state.stats.weeklyData, persistData]);

  // ─────────────────────────────────────────
  // Reset to default mock data
  // ─────────────────────────────────────────
  const resetToMockData = useCallback(async () => {
    setState({
      students: MOCK_STUDENTS,
      professors: MOCK_PROFESSORS,
      modules: MOCK_MODULES,
      sessions: MOCK_SESSIONS,
      attendance: MOCK_ATTENDANCE,
      notifications: MOCK_NOTIFICATIONS,
      stats: MOCK_STATS,
      isLoading: false,
    });
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.STUDENTS),
      AsyncStorage.removeItem(STORAGE_KEYS.PROFESSORS),
      AsyncStorage.removeItem(STORAGE_KEYS.MODULES),
      AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS),
      AsyncStorage.removeItem(STORAGE_KEYS.ATTENDANCE),
      AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS),
      AsyncStorage.removeItem(STORAGE_KEYS.STATS),
    ]);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...state,
    addStudent,
    updateStudent,
    deleteStudent,
    addProfessor,
    updateProfessor,
    deleteProfessor,
    addModule,
    updateModule,
    deleteModule,
    startSession,
    endSession,
    regenerateQRCode,
    markAttendance,
    getStudentAttendance,
    getSessionAttendance,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    getUnreadCount,
    refreshStats,
    resetToMockData,
  }), [
    state,
    addStudent, updateStudent, deleteStudent,
    addProfessor, updateProfessor, deleteProfessor,
    addModule, updateModule, deleteModule,
    startSession, endSession, regenerateQRCode,
    markAttendance, getStudentAttendance, getSessionAttendance,
    addNotification, markNotificationAsRead, deleteNotification,
    getUnreadCount, refreshStats, resetToMockData,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
