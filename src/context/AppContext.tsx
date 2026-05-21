import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Faculty, Role, StudentRequest, Degree } from '../types';

interface AppContextType {
  users: User[];
  faculties: Faculty[];
  degrees: Degree[];
  studentRequests: StudentRequest[];
  addFaculty: (faculty: Omit<Faculty, 'id' | 'createdAt'>) => void;
  addDegree: (degree: Omit<Degree, 'id'>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addStudentRequest: (req: Omit<StudentRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateStudentRequestStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'Admin',
    facultyId: null,
    createdAt: new Date().toISOString()
  }
];

const initialFaculties: Faculty[] = [
  {
    id: 'f1',
    name: 'Faculty of Science',
    description: 'Sciences and mathematics departments',
    createdAt: new Date().toISOString()
  },
  {
    id: 'f2',
    name: 'Faculty of Engineering',
    description: 'Engineering and technology departments',
    createdAt: new Date().toISOString()
  }
];

const initialDegrees: Degree[] = [
  { id: 'd1', facultyId: 'f1', name: 'BSc in Computer Science' },
  { id: 'd2', facultyId: 'f1', name: 'BSc in Mathematics' },
  { id: 'd3', facultyId: 'f2', name: 'BSc in Software Engineering' },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [faculties, setFaculties] = useState<Faculty[]>(initialFaculties);
  const [degrees, setDegrees] = useState<Degree[]>(initialDegrees);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);

  const addFaculty = (faculty: Omit<Faculty, 'id' | 'createdAt'>) => {
    const newFaculty: Faculty = {
      ...faculty,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setFaculties([...faculties, newFaculty]);
  };

  const addDegree = (degree: Omit<Degree, 'id'>) => {
    const newDegree: Degree = {
      ...degree,
      id: Math.random().toString(36).substr(2, 9),
    };
    setDegrees([...degrees, newDegree]);
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => (u.id === id ? { ...u, ...updates } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const addStudentRequest = (req: Omit<StudentRequest, 'id' | 'status' | 'createdAt'>) => {
    const newReq: StudentRequest = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setStudentRequests([...studentRequests, newReq]);
  };

  const updateStudentRequestStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setStudentRequests(studentRequests.map(r => r.id === id ? { ...r, status } : r));
    if (status === 'Approved') {
      const req = studentRequests.find(r => r.id === id);
      if (req) {
        addUser({
          name: req.fullName,
          email: req.referenceEmail,
          role: 'Student',
          facultyId: req.facultyId
        });
      }
    }
  };

  return (
    <AppContext.Provider value={{ users, faculties, degrees, studentRequests, addFaculty, addDegree, addUser, updateUser, deleteUser, addStudentRequest, updateStudentRequestStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
