import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { LogOut, BookOpen, Building, User as UserIcon, Calendar, Bell, ShieldCheck } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function StaffDashboard() {
  const { currentUser, logout } = useAuth();
  const { faculties, degrees, notices, modules, users, addNotice, updateNotice, deleteNotice, addDegree, addModule, assignLecturers, addModuleContent, updateModuleContent, deleteModuleContent } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Courses' | 'Exams' | 'Notices' | 'Profile'>('Profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Notice form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeFacultyId, setNoticeFacultyId] = useState('');
  const [noticeExpiresAt, setNoticeExpiresAt] = useState('');

  // Notice editing state
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [editNoticeTitle, setEditNoticeTitle] = useState('');
  const [editNoticeContent, setEditNoticeContent] = useState('');
  const [editNoticeExpiresAt, setEditNoticeExpiresAt] = useState('');

  // Degree form state
  const [degreeName, setDegreeName] = useState('');

  // Module form state
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [moduleDegreeName, setModuleDegreeName] = useState('');
  const [moduleAcademicYear, setModuleAcademicYear] = useState(1);

  // Module actions state
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [selectedLecturers, setSelectedLecturers] = useState<string[]>([]);

  // Content editing state
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editContentTitle, setEditContentTitle] = useState('');
  const [editContentBody, setEditContentBody] = useState('');
  const [editContentFile, setEditContentFile] = useState<File | null>(null);
  const [removeExistingDoc, setRemoveExistingDoc] = useState(false);

  if (!currentUser) return null;

  // Find the staff's specific faculty and degree programs
  const staffFaculty = faculties.find(f => f.id === currentUser.facultyId);
  const staffFaculties = currentUser.facultyIds?.map(id => faculties.find(f => f.id === id)).filter(Boolean) || [];
  
  const facultyDegrees = degrees.filter(d => d.facultyId === currentUser.facultyId);
  const facultyLecturers = users.filter(u => 
    (u.facultyId === currentUser.facultyId || u.facultyIds?.includes(currentUser.facultyId as string)) && 
    (u.role === 'Lecturer' || u.role === 'Assistant Lecturer')
  );

  // Get modules related to the user
  const myModules = modules.filter(m => {
    if (currentUser.role === 'Faculty Dean') return m.facultyId === currentUser.facultyId;
    return m.assignedLecturers.includes(currentUser.id);
  });

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
      authorRole: currentUser.role,
      expiresAt: noticeExpiresAt ? new Date(noticeExpiresAt).toISOString() : undefined
    });

    setNoticeTitle('');
    setNoticeContent('');
    setNoticeFacultyId('');
    setNoticeExpiresAt('');
  };

  const handleUpdateNotice = async (id: string) => {
    await updateNotice(id, {
      title: editNoticeTitle,
      content: editNoticeContent,
      expiresAt: editNoticeExpiresAt ? new Date(editNoticeExpiresAt).toISOString() : null as any
    });
    setEditingNoticeId(null);
  };

  const handleDeleteNotice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      await deleteNotice(id);
    }
  };

  const startEditingNotice = (notice: any) => {
    setEditingNoticeId(notice._id);
    setEditNoticeTitle(notice.title);
    setEditNoticeContent(notice.content);
    
    if (notice.expiresAt) {
      const d = new Date(notice.expiresAt);
      // Format as YYYY-MM-DDTHH:mm
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setEditNoticeExpiresAt(d.toISOString().slice(0,16));
    } else {
      setEditNoticeExpiresAt('');
    }
  };

  const handleCreateDegree = (e: React.FormEvent) => {
    e.preventDefault();
    if (!degreeName || !currentUser.facultyId) return;
    addDegree({ name: degreeName, facultyId: currentUser.facultyId });
    setDegreeName('');
    alert('Degree created successfully!');
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle || !moduleCode || !moduleDegreeName || !currentUser.facultyId) return;
    await addModule({
      title: moduleTitle,
      code: moduleCode,
      degreeName: moduleDegreeName,
      facultyId: currentUser.facultyId,
      academicYear: moduleAcademicYear,
    });
    setModuleTitle('');
    setModuleCode('');
    setModuleDegreeName('');
    setModuleAcademicYear(1);
    alert('Module created successfully!');
  };

  const handleAddContent = async (moduleId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTitle || !contentBody) return;
    
    let submitData: any;
    if (contentFile) {
      submitData = new FormData();
      submitData.append('title', contentTitle);
      submitData.append('body', contentBody);
      submitData.append('document', contentFile);
    } else {
      submitData = { title: contentTitle, body: contentBody };
    }

    await addModuleContent(moduleId, submitData);
    setContentTitle('');
    setContentBody('');
    setContentFile(null);
    setSelectedModuleId(null);
    alert('Content added successfully!');
  };

  const handleAssignLecturers = async (moduleId: string) => {
    await assignLecturers(moduleId, selectedLecturers);
    setSelectedLecturers([]);
    setSelectedModuleId(null);
    alert('Lecturers assigned successfully!');
  };

  const startEditContent = (c: any) => {
    setEditingContentId(c._id);
    setEditContentTitle(c.title);
    setEditContentBody(c.body);
    setEditContentFile(null);
    setRemoveExistingDoc(false);
  };

  const handleUpdateContent = async (moduleId: string, contentId: string) => {
    if (!editContentTitle || !editContentBody) return;
    let data: FormData | object;
    if (editContentFile || removeExistingDoc) {
      const fd = new FormData();
      fd.append('title', editContentTitle);
      fd.append('body', editContentBody);
      if (removeExistingDoc) fd.append('removeDocument', 'true');
      if (editContentFile) fd.append('document', editContentFile);
      data = fd;
    } else {
      data = { title: editContentTitle, body: editContentBody };
    }
    await updateModuleContent(moduleId, contentId, data);
    setEditingContentId(null);
  };

  const handleDeleteContent = async (moduleId: string, contentId: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    await deleteModuleContent(moduleId, contentId);
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
                    Welcome to your Blue Sky Aviation Academy Staff Dashboard. Here you can manage your profile, courses, and department communications.
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
          <div className="space-y-8">
            
            {/* FACULTY DEAN ONLY: Create Degree & Module */}
            {currentUser.role === 'Faculty Dean' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Create Degree */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Create Degree Program</h3>
                  <form onSubmit={handleCreateDegree} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree Name</label>
                      <input
                        type="text"
                        required
                        value={degreeName}
                        onChange={e => setDegreeName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. BSc in Software Engineering"
                      />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                      Add Degree
                    </button>
                  </form>
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Existing Degrees in Faculty:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      {facultyDegrees.map(d => <li key={d.id}>• {d.name}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Create Module */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Create Module</h3>
                  <form onSubmit={handleCreateModule} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                        <input
                          type="text" required value={moduleTitle} onChange={e => setModuleTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Module Code</label>
                        <input
                          type="text" required value={moduleCode} onChange={e => setModuleCode(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Degree Program</label>
                        <select
                          required value={moduleDegreeName} onChange={e => setModuleDegreeName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">-- Select Degree --</option>
                          {facultyDegrees.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Academic Year</label>
                        <select
                          required value={moduleAcademicYear} onChange={e => setModuleAcademicYear(Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={1}>Year 1</option>
                          <option value={2}>Year 2</option>
                          <option value={3}>Year 3</option>
                          <option value={4}>Year 4</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                      Add Module
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* View / Manage My Modules */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                {currentUser.role === 'Faculty Dean' ? 'All Faculty Modules' : 'My Assigned Modules'}
              </h3>
              
              {myModules.length > 0 ? (
                <div className="space-y-6">
                  {myModules.map(mod => (
                    <div key={mod._id} className="border border-gray-200 rounded-lg p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{mod.title} <span className="text-sm font-normal text-gray-500">({mod.code})</span></h4>
                          <div className="text-sm text-indigo-600 font-medium">{mod.degreeName} - Year {mod.academicYear}</div>
                        </div>
                        <div className="space-x-2">
                          {currentUser.role === 'Faculty Dean' && (
                            <button onClick={() => { setSelectedModuleId(mod._id); setSelectedLecturers(mod.assignedLecturers); }} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded">
                              Assign Staff
                            </button>
                          )}
                          <button onClick={() => setSelectedModuleId(mod._id + '_content')} className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded">
                            Add Content
                          </button>
                        </div>
                      </div>

                      {/* Display assigned staff */}
                      {mod.assignedLecturers.length > 0 && (
                        <div className="mb-4 text-sm">
                          <span className="font-semibold text-gray-700">Assigned: </span>
                          <span className="text-gray-600">
                            {mod.assignedLecturers.map(id => users.find(u => u.id === id)?.name).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Content specific assignment UI */}
                      {selectedModuleId === mod._id && currentUser.role === 'Faculty Dean' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h5 className="font-bold text-sm mb-2">Assign Lecturers / Assistant Lecturers</h5>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {facultyLecturers.length > 0 ? facultyLecturers.map(lecturer => (
                              <label key={lecturer.id} className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedLecturers.includes(lecturer.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedLecturers([...selectedLecturers, lecturer.id]);
                                    else setSelectedLecturers(selectedLecturers.filter(id => id !== lecturer.id));
                                  }}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{lecturer.name} ({lecturer.role})</span>
                              </label>
                            )) : (
                              <div className="text-sm text-gray-500 col-span-2">
                                No lecturers or assistant lecturers found in this faculty. Please create them first.
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleAssignLecturers(mod._id)} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm">Save Assignments</button>
                            <button onClick={() => setSelectedModuleId(null)} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm">Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* Content Upload UI */}
                      {selectedModuleId === mod._id + '_content' && (
                        <form onSubmit={(e) => handleAddContent(mod._id, e)} className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-4">
                          <h5 className="font-bold text-sm text-indigo-900">Add New Lesson / Material</h5>
                          <div>
                            <input type="text" required placeholder="Lesson Title" value={contentTitle} onChange={e => setContentTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 text-sm" />
                          </div>
                          <div>
                            <textarea required placeholder="Lesson Content / Links" rows={3} value={contentBody} onChange={e => setContentBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 text-sm"></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Document (Optional)</label>
                            <input type="file" onChange={e => setContentFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                          </div>
                          <div className="flex space-x-2">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm">Add Content</button>
                            <button type="button" onClick={() => setSelectedModuleId(null)} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm">Cancel</button>
                          </div>
                        </form>
                      )}

                      {/* Display Existing Content */}
                      {mod.content.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h5 className="font-bold text-gray-700 text-sm border-b pb-1">Module Content</h5>
                          {mod.content.map((c, i) => (
                            <div key={c._id || i} className="bg-gray-50 rounded border border-gray-100 overflow-hidden">
                              {editingContentId === c._id ? (
                                /* ── Inline Edit Form ── */
                                <div className="p-3 bg-yellow-50 border border-yellow-200 space-y-3">
                                  <h6 className="font-bold text-sm text-yellow-900">Editing Lesson</h6>
                                  <input
                                    type="text"
                                    value={editContentTitle}
                                    onChange={e => setEditContentTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Lesson Title"
                                  />
                                  <textarea
                                    rows={3}
                                    value={editContentBody}
                                    onChange={e => setEditContentBody(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Lesson Content"
                                  />
                                  {c.fileUrl && (
                                    <div className="flex items-center space-x-3 text-sm">
                                      <span className="text-gray-600">📄 Current: {c.fileName}</span>
                                      <label className="flex items-center space-x-1 text-red-600 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={removeExistingDoc}
                                          onChange={e => setRemoveExistingDoc(e.target.checked)}
                                          className="rounded"
                                        />
                                        <span>Remove document</span>
                                      </label>
                                    </div>
                                  )}
                                  {!removeExistingDoc && (
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {c.fileUrl ? 'Replace Document (Optional)' : 'Attach Document (Optional)'}
                                      </label>
                                      <input
                                        type="file"
                                        onChange={e => setEditContentFile(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                      />
                                    </div>
                                  )}
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleUpdateContent(mod._id, c._id!)}
                                      className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700"
                                    >
                                      Save Changes
                                    </button>
                                    <button
                                      onClick={() => setEditingContentId(null)}
                                      className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-300"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* ── Display View ── */
                                <div className="p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="font-bold text-gray-900 text-sm">{c.title}</div>
                                    <div className="flex space-x-2 ml-2 flex-shrink-0">
                                      <button
                                        onClick={() => startEditContent(c)}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(mod._id, c._id!)}
                                        className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-gray-600 text-sm whitespace-pre-wrap mt-1 mb-2">{c.body}</div>
                                  {c.fileUrl && (
                                    <a href={`http://localhost:5000${c.fileUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded">
                                      📄 {c.fileName || 'Attached Document'}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No modules found.
                </div>
              )}
            </div>
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

                  {currentUser.role === 'Faculty Dean' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Expire At (Optional)</label>
                      <input
                        type="datetime-local"
                        value={noticeExpiresAt}
                        onChange={e => setNoticeExpiresAt(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">If set, the notice will automatically be deleted at this time.</p>
                    </div>
                  )}

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
                    
                    if (editingNoticeId === notice._id) {
                      return (
                        <div key={notice._id} className="border border-indigo-200 rounded-lg p-4 bg-indigo-50 shadow-inner">
                          <h4 className="font-bold text-indigo-900 mb-4">Edit Notice</h4>
                          <div className="space-y-3">
                            <input type="text" value={editNoticeTitle} onChange={e => setEditNoticeTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded" />
                            <textarea value={editNoticeContent} onChange={e => setEditNoticeContent(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded"></textarea>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Auto-Expire At (Optional)</label>
                              <input type="datetime-local" value={editNoticeExpiresAt} onChange={e => setEditNoticeExpiresAt(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-sm" />
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <button onClick={() => handleUpdateNotice(notice._id)} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700">Save</button>
                              <button onClick={() => setEditingNoticeId(null)} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-300">Cancel</button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={notice._id} className="border border-gray-100 rounded-lg p-4 bg-gray-50 relative group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 pr-16">{notice.title}</h4>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                            {targetFac?.name || 'Unknown Faculty'}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{notice.content}</p>
                        <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
                          <div>
                            Published on {new Date(notice.createdAt).toLocaleString()}
                            {notice.expiresAt && (
                              <span className="ml-2 text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                Expires: {new Date(notice.expiresAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions for Dean */}
                        {currentUser.role === 'Faculty Dean' && (
                          <div className="absolute top-4 right-4 flex space-x-2 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                            <button onClick={() => startEditingNotice(notice)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => handleDeleteNotice(notice._id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                          </div>
                        )}
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
