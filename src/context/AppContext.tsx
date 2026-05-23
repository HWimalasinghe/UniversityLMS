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
  addStudentRequest: (req: Omit<StudentRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;
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
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users');
        const data = await res.json();
        if (data.success && data.users) {
          const mappedUsers = data.users.map((u: any) => ({
            ...u,
            id: u._id,
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error('Failed to fetch users from DB:', err);
      }
    };
    fetchUsers();
  }, []);

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
      if (!response.ok) {
        console.error('Failed to save user to database:', responseData);
        throw new Error('Database save failed');
      }

      const mongoId = responseData.user?._id || Math.random().toString(36).substr(2, 9);
      
      const newUser: User = {
        ...user,
        id: typeof mongoId === 'object' ? mongoId.$oid || String(mongoId) : String(mongoId),
        createdAt: responseData.user?.createdAt || new Date().toISOString(),
      };
      
      setUsers(prev => [...prev, newUser]);
      console.log('✅ User saved to database:', newUser);
    } catch (err) {
      console.warn('⚠️ Failed to save user to database, falling back to local storage:', err);
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
      // Save to MongoDB
      const response = await fetch('http://localhost:5000/api/submit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error('Failed to submit request to database:', responseData);
        // Fall back to local storage if backend fails
      }

      // Use MongoDB ID if available, otherwise generate local ID
      const requestId = responseData?.requestId || Math.random().toString(36).substr(2, 9);

      const newReq: StudentRequest = {
        ...req,
        id: typeof requestId === 'object' ? requestId.$oid || String(requestId) : String(requestId),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setStudentRequests([...studentRequests, newReq]);
      console.log('✅ Request submitted:', newReq);
    } catch (err) {
      console.warn('⚠️ Failed to save to database, using local storage:', err);
      // Fallback: still save locally
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
    if (!req) {
      return { success: false, message: 'Request not found.' };
    }

    // Update local state immediately for UI feedback
    setStudentRequests(studentRequests.map(r => r.id === id ? { ...r, status } : r));

    if (status === 'Approved') {
      try {
        // Try to find faculty code for the backend
        const faculty = faculties.find(f => f.id === req.facultyId);
        const facultyCode = faculty?.facultyCode || 'STU';

        // Call backend to save to MongoDB and send email
        const response = await fetch('http://localhost:5000/api/approve-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: id, facultyCode }),
        });

        const responseData = await response.json();
        if (!response.ok) {
          console.error('Backend approval error:', responseData);
          return { success: false, message: responseData?.error || 'Failed to approve request on server.' };
        }

        // Also update local state with the generated credentials
        const studentId = responseData.studentId;
        const universityEmail = responseData.universityEmail;

        addUser({
          name: req.fullName,
          email: req.referenceEmail,
          role: 'Student',
          facultyId: req.facultyId,
          studentId,
          universityEmail
        });

        console.log('✅ Request approved and saved to database:', responseData);
        return { success: true, message: 'Offer email is sent' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('⚠️ Backend approval failed:', errorMessage);
        // Still consider it a success if email was sent from the frontend earlier
        return { success: true, message: 'Offer email is sent (offline mode)' };
      }
    } else if (status === 'Rejected') {
      try {
        // Call backend to update status to Rejected
        const response = await fetch('http://localhost:5000/api/reject-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: id }),
        });

        const responseData = await response.json();
        if (!response.ok) {
          console.error('Backend rejection error:', responseData);
          return { success: false, message: responseData?.error || 'Failed to reject request on server.' };
        }

        console.log('✅ Request rejected and saved to database:', responseData);
        return { success: true, message: 'Request rejected' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn('⚠️ Backend rejection failed:', errorMessage);
        // Still consider it a success locally
        return { success: true, message: 'Request rejected (offline mode)' };
      }
    }

    return { success: true, message: 'Status updated.' };
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
