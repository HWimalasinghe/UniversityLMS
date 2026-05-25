import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Faculty, StudentRequest, Degree, Notice, Module, ModuleContent } from '../types';

interface AppContextType {
  users: User[];
  faculties: Faculty[];
  degrees: Degree[];
  studentRequests: StudentRequest[];
  notices: Notice[];
  modules: Module[];
  addFaculty: (faculty: Omit<Faculty, 'id' | 'createdAt'>) => void;
  addDegree: (degree: Omit<Degree, 'id'>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addStudentRequest: (req: Omit<StudentRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateStudentRequestStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<{ success: boolean; message: string }>;
  addNotice: (notice: Omit<Notice, '_id' | 'createdAt'>) => Promise<void>;
  addModule: (mod: Omit<Module, '_id' | 'createdAt' | 'assignedLecturers' | 'content'>) => Promise<void>;
  assignLecturers: (moduleId: string, lecturers: string[]) => Promise<void>;
  addModuleContent: (moduleId: string, content: ModuleContent) => Promise<void>;
  fetchData: () => Promise<void>;
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
  const [notices, setNotices] = useState<Notice[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    localStorage.setItem('lms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersRes = await fetch('http://localhost:5000/api/users');
      const usersData = await usersRes.json();
      if (usersData.success && usersData.users) {
        setUsers(usersData.users.map((u: any) => ({ ...u, id: u._id })));
      }

      const reqsRes = await fetch('http://localhost:5000/api/requests');
      const reqsData = await reqsRes.json();
      if (reqsData.requests) setStudentRequests(reqsData.requests);

      const noticesRes = await fetch('http://localhost:5000/api/notices');
      const noticesData = await noticesRes.json();
      if (noticesData.notices) setNotices(noticesData.notices);

      const modulesRes = await fetch('http://localhost:5000/api/modules');
      const modulesData = await modulesRes.json();
      if (modulesData.modules) setModules(modulesData.modules);
    } catch (err) {
      console.error('Failed to fetch data from DB:', err);
    }
  };

  useEffect(() => {
    localStorage.setItem('lms_faculties', JSON.stringify(faculties));
  }, [faculties]);

  useEffect(() => {
    localStorage.setItem('lms_degrees', JSON.stringify(degrees));
  }, [degrees]);

  useEffect(() => {
    localStorage.setItem('lms_requests', JSON.stringify(studentRequests));
  }, [studentRequests]);

  
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

  const addUser = async (user: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error('Database save failed');

      const mongoId = responseData.user?._id || Math.random().toString(36).substr(2, 9);
      
      const newUser: User = {
        ...user,
        id: typeof mongoId === 'object' ? mongoId.$oid || String(mongoId) : String(mongoId),
        createdAt: responseData.user?.createdAt || new Date().toISOString(),
      };
      
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      console.warn('⚠️ Failed to save user, using fallback:', err);
      const newUser: User = {
        ...user,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => (u.id === id ? { ...u, ...updates } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const addStudentRequest = async (req: Omit<StudentRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/submit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      const responseData = await response.json();
      const requestId = responseData?.requestId || Math.random().toString(36).substr(2, 9);

      const newReq: StudentRequest = {
        ...req,
        id: typeof requestId === 'object' ? requestId.$oid || String(requestId) : String(requestId),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setStudentRequests([...studentRequests, newReq]);
    } catch (err) {
      const newReq: StudentRequest = {
        ...req,
        id: Math.random().toString(36).substr(2, 9),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setStudentRequests([...studentRequests, newReq]);
    }
  };

  const updateStudentRequestStatus = async (id: string, status: 'Approved' | 'Rejected'): Promise<{ success: boolean; message: string }> => {
    const req = studentRequests.find(r => r.id === id);
    if (!req) return { success: false, message: 'Request not found.' };

    setStudentRequests(studentRequests.map(r => r.id === id ? { ...r, status } : r));

    try {
      const endpoint = status === 'Approved' ? 'approve-request' : 'reject-request';
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, facultyCode: faculties.find(f => f.id === req.facultyId)?.facultyCode || 'STU' }),
      });
      const responseData = await response.json();
      if (status === 'Approved' && response.ok) {
        addUser({
          name: req.fullName,
          email: req.referenceEmail,
          role: 'Student',
          facultyId: req.facultyId,
          studentId: responseData.studentId,
          universityEmail: responseData.universityEmail
        });
      }
      return { success: response.ok, message: response.ok ? 'Status updated' : 'Error updating on server' };
    } catch (err) {
      return { success: true, message: 'Status updated (offline mode)' };
    }
  };

  const addNotice = async (notice: Omit<Notice, '_id' | 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice),
      });
      if (response.ok) {
        const data = await response.json();
        setNotices(prev => [data.notice, ...prev]);
      }
    } catch (err) {
      console.error('Error creating notice:', err);
    }
  };

  const addModule = async (mod: Omit<Module, '_id' | 'createdAt' | 'assignedLecturers' | 'content'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mod),
      });
      if (response.ok) {
        const data = await response.json();
        setModules(prev => [data.module, ...prev]);
      }
    } catch (err) {
      console.error('Error creating module:', err);
    }
  };

  const assignLecturers = async (moduleId: string, lecturers: string[]) => {
    try {
      const response = await fetch(`http://localhost:5000/api/modules/${moduleId}/lecturers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecturers }),
      });
      if (response.ok) {
        const data = await response.json();
        setModules(prev => prev.map(m => m._id === moduleId ? data.module : m));
      }
    } catch (err) {
      console.error('Error assigning lecturers:', err);
    }
  };

  const addModuleContent = async (moduleId: string, content: ModuleContent) => {
    try {
      const response = await fetch(`http://localhost:5000/api/modules/${moduleId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (response.ok) {
        const data = await response.json();
        setModules(prev => prev.map(m => m._id === moduleId ? data.module : m));
      }
    } catch (err) {
      console.error('Error adding module content:', err);
    }
  };

  return (
    <AppContext.Provider value={{ 
      users, faculties, degrees, studentRequests, notices, modules, 
      addFaculty, addDegree, addUser, updateUser, deleteUser, 
      addStudentRequest, updateStudentRequestStatus, addNotice, 
      addModule, assignLecturers, addModuleContent, fetchData 
    }}>
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
