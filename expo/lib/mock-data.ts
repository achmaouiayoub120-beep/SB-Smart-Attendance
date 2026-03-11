import type { Module, Session, AttendanceRecord, AttendanceStats, Notification, Student, Professor } from '@/types';

export const MOCK_MODULES: Module[] = [
  {
    id: 'mod1',
    name: 'Développement Mobile',
    code: 'DEV401',
    professorId: '2',
    professorName: 'Dr. Fatima Benali',
    description: 'Développement d\'applications mobiles avec Flutter et React Native',
    schedule: [
      { id: 's1', day: 'Lundi', startTime: '08:30', endTime: '10:30', room: 'Salle A101' },
      { id: 's2', day: 'Mercredi', startTime: '14:00', endTime: '16:00', room: 'Salle B203' },
    ],
  },
  {
    id: 'mod2',
    name: 'Intelligence Artificielle',
    code: 'IA402',
    professorId: '2',
    professorName: 'Dr. Fatima Benali',
    description: 'Introduction aux algorithmes d\'apprentissage automatique',
    schedule: [
      { id: 's3', day: 'Mardi', startTime: '10:30', endTime: '12:30', room: 'Salle C305' },
      { id: 's4', day: 'Jeudi', startTime: '08:30', endTime: '10:30', room: 'Salle A102' },
    ],
  },
  {
    id: 'mod3',
    name: 'Base de Données Avancées',
    code: 'BD301',
    professorId: '2',
    professorName: 'Dr. Fatima Benali',
    description: 'Modélisation et optimisation des bases de données',
    schedule: [
      { id: 's5', day: 'Lundi', startTime: '14:00', endTime: '16:00', room: 'Salle B201' },
    ],
  },
  {
    id: 'mod4',
    name: 'Sécurité Informatique',
    code: 'SEC405',
    professorId: '2',
    professorName: 'Dr. Fatima Benali',
    description: 'Principes de sécurité et cryptographie',
    schedule: [
      { id: 's6', day: 'Vendredi', startTime: '08:30', endTime: '11:30', room: 'Salle D401' },
    ],
  },
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess1',
    moduleId: 'mod1',
    moduleName: 'Développement Mobile',
    professorId: '2',
    date: new Date('2024-03-11'),
    startTime: '08:30',
    endTime: '10:30',
    room: 'Salle A101',
    qrCode: 'QR1234567890',
    qrCodeExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
    status: 'active',
    totalStudents: 35,
    presentCount: 28,
    absentCount: 7,
  },
  {
    id: 'sess2',
    moduleId: 'mod2',
    moduleName: 'Intelligence Artificielle',
    professorId: '2',
    date: new Date('2024-03-11'),
    startTime: '10:30',
    endTime: '12:30',
    room: 'Salle C305',
    qrCode: 'QR0987654321',
    qrCodeExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
    status: 'upcoming',
    totalStudents: 32,
    presentCount: 0,
    absentCount: 0,
  },
  {
    id: 'sess3',
    moduleId: 'mod1',
    moduleName: 'Développement Mobile',
    professorId: '2',
    date: new Date('2024-03-09'),
    startTime: '14:00',
    endTime: '16:00',
    room: 'Salle B203',
    qrCode: 'QR5556667778',
    qrCodeExpiresAt: new Date('2024-03-09T16:00:00'),
    status: 'completed',
    totalStudents: 35,
    presentCount: 33,
    absentCount: 2,
  },
  {
    id: 'sess4',
    moduleId: 'mod3',
    moduleName: 'Base de Données Avancées',
    professorId: '2',
    date: new Date('2024-03-08'),
    startTime: '14:00',
    endTime: '16:00',
    room: 'Salle B201',
    qrCode: 'QR9998887776',
    qrCodeExpiresAt: new Date('2024-03-08T16:00:00'),
    status: 'completed',
    totalStudents: 38,
    presentCount: 35,
    absentCount: 3,
  },
  {
    id: 'sess5',
    moduleId: 'mod4',
    moduleName: 'Sécurité Informatique',
    professorId: '2',
    date: new Date('2024-03-07'),
    startTime: '08:30',
    endTime: '11:30',
    room: 'Salle D401',
    qrCode: 'QR1112223334',
    qrCodeExpiresAt: new Date('2024-03-07T11:30:00'),
    status: 'completed',
    totalStudents: 30,
    presentCount: 29,
    absentCount: 1,
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', sessionId: 'sess3', studentId: '1', moduleId: 'mod1', moduleName: 'Développement Mobile', date: new Date('2024-03-09'), status: 'present' },
  { id: 'att2', sessionId: 'sess4', studentId: '1', moduleId: 'mod3', moduleName: 'Base de Données Avancées', date: new Date('2024-03-08'), status: 'present' },
  { id: 'att3', sessionId: 'sess5', studentId: '1', moduleId: 'mod4', moduleName: 'Sécurité Informatique', date: new Date('2024-03-07'), status: 'absent' },
  { id: 'att4', sessionId: 'sess6', studentId: '1', moduleId: 'mod2', moduleName: 'Intelligence Artificielle', date: new Date('2024-03-06'), status: 'present' },
  { id: 'att5', sessionId: 'sess7', studentId: '1', moduleId: 'mod1', moduleName: 'Développement Mobile', date: new Date('2024-03-04'), status: 'present' },
  { id: 'att6', sessionId: 'sess8', studentId: '1', moduleId: 'mod3', moduleName: 'Base de Données Avancées', date: new Date('2024-03-03'), status: 'late' },
];

export const MOCK_STATS: AttendanceStats = {
  totalSessions: 45,
  presentCount: 38,
  absentCount: 5,
  lateCount: 2,
  attendanceRate: 84.4,
  byModule: [
    { moduleId: 'mod1', moduleName: 'Développement Mobile', totalSessions: 12, presentCount: 11, absentCount: 1, attendanceRate: 91.7 },
    { moduleId: 'mod2', moduleName: 'Intelligence Artificielle', totalSessions: 10, presentCount: 8, absentCount: 2, attendanceRate: 80 },
    { moduleId: 'mod3', moduleName: 'Base de Données Avancées', totalSessions: 11, presentCount: 9, absentCount: 1, attendanceRate: 81.8 },
    { moduleId: 'mod4', moduleName: 'Sécurité Informatique', totalSessions: 12, presentCount: 10, absentCount: 1, attendanceRate: 83.3 },
  ],
  weeklyData: [
    { day: 'Lun', present: 4, absent: 0, total: 4 },
    { day: 'Mar', present: 3, absent: 1, total: 4 },
    { day: 'Mer', present: 4, absent: 0, total: 4 },
    { day: 'Jeu', present: 2, absent: 2, total: 4 },
    { day: 'Ven', present: 3, absent: 1, total: 4 },
  ],
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    userId: '1',
    title: 'Absence enregistrée',
    message: 'Vous avez été marqué absent au cours de Sécurité Informatique du 07/03/2024',
    type: 'absence',
    read: false,
    createdAt: new Date('2024-03-07T11:45:00'),
    metadata: { module: 'Sécurité Informatique', date: '2024-03-07' },
  },
  {
    id: 'notif2',
    userId: '1',
    title: 'Attention seuil d\'absences',
    message: 'Vous avez atteint 5 absences. Votre taux de présence est de 84%',
    type: 'warning',
    read: false,
    createdAt: new Date('2024-03-06T18:00:00'),
  },
  {
    id: 'notif3',
    userId: '1',
    title: 'Rappel de cours',
    message: 'Cours de Développement Mobile dans 15 minutes - Salle A101',
    type: 'reminder',
    read: true,
    createdAt: new Date('2024-03-11T08:15:00'),
  },
  {
    id: 'notif4',
    userId: '1',
    title: 'Présence confirmée',
    message: 'Votre présence a été enregistrée pour le cours de Base de Données',
    type: 'success',
    read: true,
    createdAt: new Date('2024-03-08T14:05:00'),
  },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', email: 'ahmed@estsb.ma', firstName: 'Ahmed', lastName: 'El Amrani', role: 'student', studentId: 'S2023001', department: 'Informatique', class: '2ème Année', attendanceRate: 91.7, totalAbsences: 1, totalSessions: 45, createdAt: new Date('2023-09-01') },
  { id: 's2', email: 'sara@estsb.ma', firstName: 'Sara', lastName: 'Benmoussa', role: 'student', studentId: 'S2023002', department: 'Informatique', class: '2ème Année', attendanceRate: 95.6, totalAbsences: 2, totalSessions: 45, createdAt: new Date('2023-09-01') },
  { id: 's3', email: 'youssef@estsb.ma', firstName: 'Youssef', lastName: 'El Idrissi', role: 'student', studentId: 'S2023003', department: 'Informatique', class: '2ème Année', attendanceRate: 73.3, totalAbsences: 12, totalSessions: 45, createdAt: new Date('2023-09-01') },
  { id: 's4', email: 'layla@estsb.ma', firstName: 'Layla', lastName: 'Chakir', role: 'student', studentId: 'S2023004', department: 'Informatique', class: '2ème Année', attendanceRate: 88.9, totalAbsences: 5, totalSessions: 45, createdAt: new Date('2023-09-01') },
  { id: 's5', email: 'omar@estsb.ma', firstName: 'Omar', lastName: 'Fassi', role: 'student', studentId: 'S2023005', department: 'Informatique', class: '2ème Année', attendanceRate: 68.9, totalAbsences: 14, totalSessions: 45, createdAt: new Date('2023-09-01') },
];

export const MOCK_PROFESSORS: Professor[] = [
  { id: 'p1', email: 'fatima.benali@estsb.ma', firstName: 'Dr. Fatima', lastName: 'Benali', role: 'professor', department: 'Informatique', totalSessions: 120, modules: [], createdAt: new Date('2020-09-01') },
  { id: 'p2', email: 'karim.idrissi@estsb.ma', firstName: 'Dr. Karim', lastName: 'Idrissi', role: 'professor', department: 'Mathématiques', totalSessions: 95, modules: [], createdAt: new Date('2019-09-01') },
  { id: 'p3', email: 'amina.fassi@estsb.ma', firstName: 'Prof. Amina', lastName: 'Fassi', role: 'professor', department: 'Réseaux', totalSessions: 80, modules: [], createdAt: new Date('2021-09-01') },
];

export const generateQRCode = (sessionId: string, professorId: string, moduleId: string): string => {
  const data = {
    sessionId,
    professorId,
    moduleId,
    timestamp: Date.now(),
    expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes
  };
  return btoa(JSON.stringify(data));
};

export const parseQRCode = (qrData: string) => {
  try {
    return JSON.parse(atob(qrData));
  } catch {
    return null;
  }
};
