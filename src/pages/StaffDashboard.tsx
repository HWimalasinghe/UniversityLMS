import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { LogOut, BookOpen, Building, User as UserIcon, Calendar, Bell, ShieldCheck } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function StaffDashboard() {
  const { currentUser, logout } = useAuth();
  const { faculties, degrees, notices, addNotice } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Courses' | 'Exams' | 'Notices' | 'Profile'>('Profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Notice form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeFacultyId, setNoticeFacultyId] = useState('');

  if (!currentUser) return null;

  // Find the staff's specific faculty and degree programs
  const staffFaculty = faculties.find(f => f.id === currentUser.facultyId);
  const staffFaculties = currentUser.facultyIds?.map(id => faculties.find(f => f.id === id)).filter(Boolean) || [];
  
  // Get notices authored by this staff member
  const myNotices = notices.filter(n => n.authorId === currentUser.id);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    // Determine target faculty
    let targetFacultyId = noticeFacultyId;
    if (currentUser.role === 'Faculty Dean' && currentUser.facultyId) {
      targetFacultyId = currentUser.facultyId;
    }

    if (!targetFacultyId) {
      alert('Please select a faculty for this notice.');
      return;
    }

    await addNotice({
      title: noticeTitle,
      content: noticeContent,
      facultyId: targetFacultyId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role
    });

    setNoticeTitle('');
    setNoticeContent('');
    setNoticeFacultyId('');
  };
  
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
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Staff Portal</h1>
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
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Hello, {currentUser.name}!</h2>
                  <p className="text-indigo-100 text-lg max-w-2xl">
                    Welcome to your UniLMS Staff Dashboard. Here you can manage your profile, courses, and department communications.
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
                <ShieldCheck className="w-64 h-64" />
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
                    <span className="text-gray-500 text-sm">Official Email</span>
                    <span className="font-medium text-gray-900">{currentUser.email || '-'}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Role</span>
                    <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md text-xs">{currentUser.role}</span>
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
                  Department / Faculty Assignment
                </h3>
                
                <div className="space-y-6">
                  {currentUser.facultyId ? (
                    <div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Primary Faculty</span>
                      <div className="text-gray-900 font-medium text-lg">
                        {staffFaculty?.name || 'Unknown Faculty'}
                      </div>
                    </div>
                  ) : staffFaculties.length > 0 ? (
                    <div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Assigned Faculties</span>
                      <ul className="space-y-2">
                        {staffFaculties.map((f: any) => (
                          <li key={f.id} className="flex items-center text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <Building className="w-4 h-4 mr-2 text-indigo-400" />
                            <span className="font-medium">{f.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                      No specific faculty assignments listed.
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </>
        )}

        {activeTab === 'Courses' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Modules</h3>
            <p className="text-gray-500">Modules you are assigned to teach or manage will appear here.</p>
          </div>
        )}

        {activeTab === 'Exams' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Exam Management</h3>
            <p className="text-gray-500">Access to grading and exam schedules will be available here.</p>
          </div>
        )}

        {activeTab === 'Notices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-indigo-500" />
                Post a New Notice
              </h3>
              
              {currentUser.role === 'Instructor' ? (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm">
                  Instructors do not have permission to post faculty-wide notices.
                </div>
              ) : (
                <form onSubmit={handlePostNotice} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title</label>
                    <input
                      type="text"
                      required
                      value={noticeTitle}
                      onChange={e => setNoticeTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. Midterm Exam Schedule Update"
                    />
                  </div>

                  {(currentUser.role === 'Lecturer' || currentUser.role === 'Assistant Lecturer') && staffFaculties.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Faculty</label>
                      <select
                        required
                        value={noticeFacultyId}
                        onChange={e => setNoticeFacultyId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">-- Select Faculty --</option>
                        {staffFaculties.map((f: any) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {currentUser.role === 'Faculty Dean' && staffFaculty && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      Posting to: <strong>{staffFaculty.name}</strong>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notice Content</label>
                    <textarea
                      required
                      rows={4}
                      value={noticeContent}
                      onChange={e => setNoticeContent(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Type the notice details here..."
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Publish Notice
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* List of my notices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Published Notices</h3>
              {myNotices.length > 0 ? (
                <div className="space-y-4">
                  {myNotices.map(notice => {
                    const targetFac = faculties.find(f => f.id === notice.facultyId);
                    return (
                      <div key={notice._id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">{notice.title}</h4>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                            {targetFac?.name || 'Unknown Faculty'}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{notice.content}</p>
                        <div className="mt-3 text-xs text-gray-400">
                          Published on {new Date(notice.createdAt).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  You haven't published any notices yet.
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
