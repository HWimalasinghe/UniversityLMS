import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface StudentStatusViewProps {
  facultyId?: string | null;
}

export default function StudentStatusView({ facultyId }: StudentStatusViewProps) {
  const { users, modules, degrees, faculties } = useAppContext();

  // Get all students
  let students = users.filter(u => u.role === 'Student');
  
  // Filter by faculty if provided
  if (facultyId) {
    students = students.filter(s => s.facultyId === facultyId);
  }

  // Calculate missing modules for each student
  const studentsWithStatus = students.map(student => {
    const studentYear = student.academicYear || 1;
    
    // Modules they SHOULD be enrolled in (for their degree and current year)
    const requiredModules = modules.filter(m => 
      m.degreeName === student.degreeName && 
      m.academicYear === studentYear
    );

    const enrolled = student.enrolledModules || [];
    const missingModules = requiredModules.filter(m => !enrolled.includes(m._id));

    return {
      ...student,
      requiredModules,
      missingModules
    };
  });

  // Filter only those with missing modules (or we can show all, but the prompt says "who are the students are not enrolled his modules")
  const incompleteStudents = studentsWithStatus.filter(s => s.missingModules.length > 0);

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <p>No students found in the selected faculty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Student Enrollment Status</h3>
          <div className="text-sm font-medium text-gray-500">
            {incompleteStudents.length} student(s) with incomplete enrollments
          </div>
        </div>

        {incompleteStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">ID / Email</th>
                  <th className="px-6 py-4 font-medium">Degree & Year</th>
                  <th className="px-6 py-4 font-medium">Missing Modules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {incompleteStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-indigo-700 font-bold">{student.studentId || '-'}</div>
                      <div className="text-xs text-gray-500">{student.universityEmail || student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{student.degreeName || 'Not Assigned'}</div>
                      <div className="text-xs text-gray-500 mt-1">Year {student.academicYear || 1}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {student.missingModules.map(m => (
                          <span key={m._id} className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 w-fit">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {m.code} - {m.title}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            <h4 className="text-lg font-bold text-gray-900 mb-1">All Students Enrolled</h4>
            <p>Every student is fully enrolled in their required modules for the current academic year.</p>
          </div>
        )}
      </div>
    </div>
  );
}
