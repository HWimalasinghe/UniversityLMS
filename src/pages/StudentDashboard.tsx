import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { LogOut, GraduationCap, BookOpen, Clock, Building, User as UserIcon, Calendar, Bell } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function StudentDashboard() {
  const { currentUser, logout } = useAuth();
  const { faculties, degrees, notices } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Courses' | 'Exams' | 'Notices' | 'Profile'>('Profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!currentUser) return null;

  // Find the student's specific faculty and degree programs
  const studentFaculty = faculties.find(f => f.id === currentUser.facultyId);
  const studentDegrees = degrees.filter(d => d.facultyId === currentUser.facultyId);
  
  // Get notices for the student's faculty
  const facultyNotices = notices.filter(n => n.facultyId === currentUser.facultyId);

  const tabs = [
    { id: 'Courses', label: 'Courses', icon: BookOpen },
    { id: 'Exams', label: 'Exams', icon: Calendar },
    { id: 'Notices', label: 'Notices', icon: Bell },
    { id: 'Profile', label: 'Profile', icon: UserIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Welcome, {currentUser.name.split(' ')[0]}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
          
          {/* Navigation Bar */}
          <nav className="flex space-x-8 mt-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {activeTab === 'Profile' && (
          <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Hello, {currentUser.name}!</h2>
                  <p className="text-indigo-100 text-lg max-w-2xl">
                    Welcome to your UniLMS student dashboard. Here you can find all the details regarding your enrolled degree program and faculty information.
                  </p>
                </div>
                <div>
                  <button 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30"
                  >
                    Change Password
                  </button>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                <GraduationCap className="w-64 h-64" />
              </div>
            </div>

            {/* Credentials & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Identity Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                   <UserIcon className="w-5 h-5 mr-2 text-indigo-500" />
                   Your Details
                </h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Full Name</span>
                    <span className="font-medium text-gray-900">{currentUser.name}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Student ID</span>
                    <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-sm">
                      {currentUser.studentId || '-'}
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">University Email</span>
                    <span className="font-medium text-gray-900">{currentUser.universityEmail || '-'}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Role</span>
                    <span className="font-medium text-gray-900">{currentUser.role}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Joined</span>
                    <span className="font-medium text-gray-900">
                      {new Date(currentUser.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Academic Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-indigo-500" />
                  Academic Profile
                </h3>
                
                {studentFaculty ? (
                  <div className="space-y-6">
                    <div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Faculty</span>
                      <div className="text-gray-900 font-medium text-lg">
                        {studentFaculty.name}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{studentFaculty.description}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Available Degree Programs</span>
                      {studentDegrees.length > 0 ? (
                        <ul className="space-y-2">
                          {studentDegrees.map(degree => (
                            <li key={degree.id} className="flex items-center text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <GraduationCap className="w-4 h-4 mr-2 text-indigo-400" />
                              <span className="font-medium">{degree.name}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                          No specific degree programs listed for this faculty yet.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <Clock className="w-12 h-12 mb-3 text-gray-300" />
                    <p>Pending faculty assignment</p>
                  </div>
                )}
                
              </div>
              
            </div>
          </>
        )}

        {activeTab === 'Courses' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Courses</h3>
            <p className="text-gray-500">Your enrolled courses will appear here shortly.</p>
          </div>
        )}

        {activeTab === 'Exams' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Exams & Assignments</h3>
            <p className="text-gray-500">Your upcoming exams and grading details will be listed here.</p>
          </div>
        )}

        {activeTab === 'Notices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-indigo-500" />
                Notice Board
              </h3>
              
              {facultyNotices.length > 0 ? (
                <div className="space-y-4">
                  {facultyNotices.map(notice => (
                    <div key={notice._id} className="border border-gray-100 rounded-lg p-5 bg-gray-50 hover:bg-white transition-colors hover:shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900 text-lg">{notice.title}</h4>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                      <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500 flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        Posted by <span className="font-medium text-gray-700 ml-1">{notice.authorName}</span> 
                        <span className="mx-2">•</span> 
                        <span className="italic">{notice.authorRole}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>There are no announcements for your faculty at this time.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}
