export type Role = 'Admin' | 'Faculty Dean' | 'Lecturer' | 'Assistant Lecturer' | 'Instructor' | 'Student';

export interface Faculty {
  id: string;
  name: string;
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
  createdAt: string;
}

export interface ExamDetails {
  stream?: string; // e.g., Math, Bio, Commerce (for A/L)
  result: string;
  indexNumber: string;
  year: string;
}

export interface StudentRequest {
  id: string;
  facultyId: string;
  degreeName: string;
  fullName: string;
  referenceEmail: string;
  advancedLevel: ExamDetails;
  ordinaryLevel: ExamDetails;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}
