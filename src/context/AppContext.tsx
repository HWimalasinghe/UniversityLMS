import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Faculty, Role } from '../types';

interface AppContextType {
  users: User[];
  faculties: Faculty[];
  addFaculty: (faculty: Omit<Faculty, 'id' | 'createdAt'>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [faculties, setFaculties] = useState<Faculty[]>(initialFaculties);

  const addFaculty = (faculty: Omit<Faculty, 'id' | 'createdAt'>) => {
    const newFaculty: Faculty = {
      ...faculty,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setFaculties([...faculties, newFaculty]);
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

  return (
    <AppContext.Provider value={{ users, faculties, addFaculty, addUser, updateUser, deleteUser }}>
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
