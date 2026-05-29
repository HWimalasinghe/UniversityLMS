export type Role = 'Admin' | 'Faculty Dean' | 'Lecturer' | 'Assistant Lecturer' | 'Instructor' | 'Student';

export interface Faculty {
  id: string;
  name: string;
  facultyCode: string; // e.g. 'it', 'cs', 'eng' — used as prefix in student IDs
  description: string;
  createdAt: string;
}

export interface Degree {
  id: string;
  facultyId: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  facultyId: string | null; // null for admin or unassigned users
  facultyIds?: string[];    // for roles that span multiple faculties (e.g. Lecturer)
  studentId?: string;       // e.g. IT2425001 — only for students
  universityEmail?: string; // e.g. IT2425001@university.edu
  academicYear?: number;    // 1 to 4
  enrolledModules?: string[]; // Array of module IDs
  createdAt: string;
}

export interface ExamDetails {
  stream?: string; // e.g., Math, Bio, Commerce (for A/L)
  result: string;
  indexNumber: string;
  year: string;
}

export interface OLExamDetails {
  grades: {
    A: number;
    B: number;
    C: number;
    S: number;
    F: number;
  };
  indexNumber: string;
  year: string;
}

export interface StudentRequest {
  id: string;
  facultyId: string;
  degreeName: string;
  fullName: string;
  nic: string;
  referenceEmail: string;
  advancedLevel: ExamDetails;
  ordinaryLevel: OLExamDetails;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  facultyId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ModuleContent {
  _id?: string;
  title: string;
  body: string;
  fileUrl?: string;
  fileName?: string;
  createdAt?: string;
}

export interface Module {
  _id: string;
  title: string;
  code: string;
  degreeName: string;
  facultyId: string;
  academicYear: number;
  assignedLecturers: string[];
  content: ModuleContent[];
  createdAt: string;
}
