import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Faculty, StudentRequest, Degree } from '../types';

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
  updateStudentRequestStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<{ success: boolean; message: string }>;
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
    facultyCode: 'sc',
    description: 'Sciences and mathematics departments',
    createdAt: new Date().toISOString()
  },
  {
    id: 'f2',
    name: 'Faculty of Engineering',
    facultyCode: 'eng',
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
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lms_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });
  const [faculties, setFaculties] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem('lms_faculties');
    return saved ? JSON.parse(saved) : initialFaculties;
  });
  const [degrees, setDegrees] = useState<Degree[]>(() => {
    const saved = localStorage.getItem('lms_degrees');
    return saved ? JSON.parse(saved) : initialDegrees;
  });
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>(() => {
    const saved = localStorage.getItem('lms_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lms_faculties', JSON.stringify(faculties));
  }, [faculties]);

  useEffect(() => {
    localStorage.setItem('lms_degrees', JSON.stringify(degrees));
  }, [degrees]);

  useEffect(() => {
    localStorage.setItem('lms_requests', JSON.stringify(studentRequests));
  }, [studentRequests]);

  // Generate the next sequential student ID for a given faculty
  const generateStudentId = (facultyId: string): string => {
    const faculty = faculties.find(f => f.id === facultyId);
    const prefix = faculty?.facultyCode?.toUpperCase() || 'STU'; // Fallback prefix
    const yearSuffix = new Date().getFullYear().toString().slice(-2); // e.g. "24"
    const pattern = `${prefix}${yearSuffix}`;

    // Find all existing student IDs matching this prefix+year
    const existingNumbers = users
      .filter(u => u.studentId && u.studentId.toUpperCase().startsWith(pattern))
      .map(u => {
        const numPart = u.studentId!.slice(pattern.length);
        return parseInt(numPart, 10);
      })
      .filter(n => !isNaN(n));

    const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${prefix}${yearSuffix}${nextNum.toString().padStart(3, '0')}`;
  };

  // Send welcome email via Express server
  const sendWelcomeEmail = async (
    to: string,
    studentName: string,
    studentId: string,
    universityEmail: string,
    password: string,
    faculty: string,
    degree: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Sending welcome email request to backend', { to, studentId, universityEmail, faculty, degree });
      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, studentName, studentId, universityEmail, password, faculty, degree }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error('Email request failed', response.status, responseData);
        return { success: false, message: responseData?.error || responseData?.message || 'Failed to send email.' };
      }

      console.log('Email request succeeded', responseData);
      return { success: true, message: responseData?.message || 'Offer email is sent' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('⚠️ Email service unavailable. Student created, but welcome email was not sent.', errorMessage);
      return { success: false, message: `Email send failed: ${errorMessage}` };
    }
  };

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

  const updateStudentRequestStatus = async (id: string, status: 'Approved' | 'Rejected'): Promise<{ success: boolean; message: string }> => {
    const req = studentRequests.find(r => r.id === id);
    if (!req) {
      return { success: false, message: 'Request not found.' };
    }

    setStudentRequests(studentRequests.map(r => r.id === id ? { ...r, status } : r));

    if (status === 'Approved') {
      const studentId = generateStudentId(req.facultyId);
      const universityEmail = `${studentId}@unilms.lk`;
      
      // Try to find faculty, use fallback if not found
      const faculty = faculties.find(f => f.id === req.facultyId);
      const facultyName = faculty?.name || `Applied Program: ${req.degreeName}`;

      addUser({
        name: req.fullName,
        email: req.referenceEmail,
        role: 'Student',
        facultyId: req.facultyId,
        studentId,
        universityEmail
      });

      const result = await sendWelcomeEmail(
        req.referenceEmail,
        req.fullName,
        studentId,
        universityEmail,
        req.nic,           // NIC is the initial password
        facultyName,
        req.degreeName
      );

      return result.success
        ? { success: true, message: 'Offer email is sent' }
        : { success: false, message: result.message };
    }

    return { success: true, message: 'Request rejected.' };
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
