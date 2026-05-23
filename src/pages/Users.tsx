import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Role, User } from '../types';
import { Plus, Trash2, Users as UsersIcon } from 'lucide-react';

export default function Users() {
  const { users, faculties, addUser, deleteUser } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('All');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Student');
  const [facultyId, setFacultyId] = useState<string>('');
  const [facultyIds, setFacultyIds] = useState<string[]>([]);

  const roles: Role[] = ['Admin', 'Faculty Dean', 'Lecturer', 'Assistant Lecturer', 'Instructor', 'Student'];
  const tabs = ['All', ...roles];

  const filteredUsers = activeTab === 'All' ? users : users.filter(u => u.role === activeTab);

  const isMultiFacultyRole = role === 'Lecturer' || role === 'Assistant Lecturer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && role) {
      addUser({ 
        name, 
        email, 
        role, 
        facultyId: isMultiFacultyRole ? null : (facultyId || null),
        facultyIds: isMultiFacultyRole ? facultyIds : undefined
      });
      setIsAdding(false);
      setName('');
      setEmail('');
      setRole('Student');
      setFacultyId('');
      setFacultyIds([]);
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setFacultyId('');
    setFacultyIds([]);
  };

  const renderTableHeaders = () => {
    return (
      <tr>
        <th className="px-6 py-4 font-medium">Name</th>
        <th className="px-6 py-4 font-medium">University Email</th>
        <th className="px-6 py-4 font-medium">Role</th>
        
        {(activeTab === 'Lecturer' || activeTab === 'Assistant Lecturer') && (
          <th className="px-6 py-4 font-medium">Faculties</th>
        )}
        
        {(activeTab === 'Faculty Dean' || activeTab === 'Instructor' || activeTab === 'Student' || activeTab === 'Admin') && (
          <th className="px-6 py-4 font-medium">Faculty</th>
        )}

        {activeTab === 'Student' && (
          <th className="px-6 py-4 font-medium">Student ID</th>
        )}
        
        <th className="px-6 py-4 font-medium text-right">Actions</th>
      </tr>
    );
  };

  const renderRow = (user: User) => {
    return (
      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
        <td className="px-6 py-4 text-gray-500">{user.universityEmail || user.email || '-'}</td>
        <td className="px-6 py-4">
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
            {user.role}
          </span>
        </td>

        {(activeTab === 'Lecturer' || activeTab === 'Assistant Lecturer') && (
          <td className="px-6 py-4 text-gray-500">
            {user.facultyIds && user.facultyIds.length > 0 
              ? user.facultyIds.map(id => faculties.find(f => f.id === id)?.name).filter(Boolean).join(', ')
              : '-'}
          </td>
        )}

        {(activeTab === 'Faculty Dean' || activeTab === 'Instructor' || activeTab === 'Student' || activeTab === 'Admin') && (
          <td className="px-6 py-4 text-gray-500">
            {faculties.find(f => f.id === user.facultyId)?.name || '-'}
          </td>
        )}

        {activeTab === 'Student' && (
          <td className="px-6 py-4">
            {user.studentId ? (
              <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold">{user.studentId}</span>
            ) : '-'}
          </td>
        )}

        <td className="px-6 py-4 text-right">
          <button
            onClick={() => deleteUser(user.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete User"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New User</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as Role)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            
            {isMultiFacultyRole ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Assignments</label>
                <div className="space-y-2 border border-gray-300 p-3 rounded-md bg-white max-h-40 overflow-y-auto">
                  {faculties.map(f => (
                    <label key={f.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={facultyIds.includes(f.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFacultyIds([...facultyIds, f.id]);
                          } else {
                            setFacultyIds(facultyIds.filter(id => id !== f.id));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{f.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Assignment</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- No Faculty --</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            )}

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Save User
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'All' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div 
              key={r} 
              onClick={() => setActiveTab(r)}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                 <UsersIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{r}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  {users.filter(u => u.role === r).length} Users
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                {renderTableHeaders()}
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map(renderRow)}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No users found for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
