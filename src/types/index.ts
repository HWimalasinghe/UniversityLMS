export type Role = 'Admin' | 'Faculty Dean' | 'Lecturer' | 'Assistant Lecturer' | 'Instructor' | 'Student';

export interface Faculty {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  facultyId: string | null; // null for admin or unassigned users
  createdAt: string;
}
