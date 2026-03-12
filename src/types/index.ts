// EST SB Smart Attendance - Type Definitions

export type UserRole = 'student' | 'professor' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  department?: string;
  createdAt: Date;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  class?: string;
  attendanceRate: number;
  totalAbsences: number;
  totalSessions: number;
}

export interface Professor extends User {
  role: 'professor';
  modules?: Module[];
  totalSessions: number;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Module {
  id: string;
  name: string;
  code: string;
  professorId: string;
  professorName: string;
  description?: string;
  schedule?: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Session {
  id: string;
  moduleId: string;
  moduleName: string;
  professorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  room: string;
  qrCode: string;
  qrCodeExpiresAt: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  moduleId: string;
  moduleName: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  scannedAt?: Date;
  verifiedBy?: string;
}

export interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  byModule: ModuleStats[];
  weeklyData: WeeklyData[];
}

export interface ModuleStats {
  moduleId: string;
  moduleName: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface WeeklyData {
  day: string;
  present: number;
  absent: number;
  total: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'absence' | 'warning' | 'reminder' | 'success' | 'info';
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: Date;
}

export interface QrData {
  sessionId: string;
  professorId: string;
  moduleId: string;
  timestamp: number;
  expiresAt: number;
}
