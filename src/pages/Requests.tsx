import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, X, Clock } from 'lucide-react';

export default function Requests() {
  const { studentRequests, faculties, users, updateStudentRequestStatus } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Student Admission Requests</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {studentRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-900">No requests yet</p>
            <p>New student applications will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {studentRequests.slice().reverse().map((req) => (
              <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{req.fullName}</h3>
                        <p className="text-sm text-gray-500">NIC: {req.nic} • {req.referenceEmail} • Applied on {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="font-semibold text-gray-900 block mb-1">Target Program</span>
                        <p>Faculty: {faculties.find(f => f.id === req.facultyId)?.name || 'Unknown'}</p>
                        <p>Degree: {req.degreeName}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="font-semibold text-gray-900 block mb-1">A/L Examination</span>
                        <p>Stream: {req.advancedLevel.stream} | Index: {req.advancedLevel.indexNumber}</p>
                        <p>Result: {req.advancedLevel.result} | Year: {req.advancedLevel.year}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 md:col-span-2">
                        <span className="font-semibold text-gray-900 block mb-1">O/L Examination</span>
                        <p className="mb-1">Index: {req.ordinaryLevel.indexNumber} | Year: {req.ordinaryLevel.year}</p>
                        <p className="text-xs font-medium text-gray-700 bg-white inline-block px-2 py-1 rounded border border-gray-200">
                          Grades: {req.ordinaryLevel.grades.A}A, {req.ordinaryLevel.grades.B}B, {req.ordinaryLevel.grades.C}C, {req.ordinaryLevel.grades.S}S, {req.ordinaryLevel.grades.F}F
                        </p>
                      </div>

                      {/* Show generated credentials for approved requests */}
                      {req.status === 'Approved' && (() => {
                        const student = users.find(u => u.role === 'Student' && u.email === req.referenceEmail && u.facultyId === req.facultyId);
                        return student?.studentId ? (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200 md:col-span-2">
                            <span className="font-semibold text-green-800 block mb-1">Generated University Credentials</span>
                            <p className="text-green-700">Student ID: <span className="font-mono font-bold">{student.studentId}</span></p>
                            <p className="text-green-700">University Email: <span className="font-mono font-bold">{student.universityEmail}</span></p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex md:flex-col gap-3 items-end justify-center min-w-[120px]">
                      <button
                        onClick={() => updateStudentRequestStatus(req.id, 'Approved')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <Check className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => updateStudentRequestStatus(req.id, 'Rejected')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
