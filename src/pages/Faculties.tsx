import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, BookOpen } from 'lucide-react';

export default function Faculties() {
  const { faculties, addFaculty, degrees, addDegree } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [facultyCode, setFacultyCode] = useState('');
  const [description, setDescription] = useState('');
  const [newDegreeNames, setNewDegreeNames] = useState<Record<string, string>>({});

  const handleAddDegree = (facultyId: string) => {
    const dName = newDegreeNames[facultyId];
    if (dName) {
      addDegree({ facultyId, name: dName });
      setNewDegreeNames({ ...newDegreeNames, [facultyId]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && facultyCode && description) {
      addFaculty({ name, facultyCode: facultyCode.toLowerCase(), description });
      setIsAdding(false);
      setName('');
      setFacultyCode('');
      setDescription('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Faculties</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Faculty
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Faculty</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Faculty of Computing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Identification Code</label>
              <input
                required
                type="text"
                value={facultyCode}
                onChange={(e) => setFacultyCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. it, eng, sc"
              />
              <p className="text-xs text-gray-400 mt-1">This code becomes the prefix for student IDs (e.g. "it" → IT26001)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Brief description..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Save
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculties.map((faculty) => {
          const facultyDegrees = degrees.filter(d => d.facultyId === faculty.id);
          return (
          <div key={faculty.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{faculty.name}</h3>
              {faculty.facultyCode && (
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-mono font-bold uppercase border border-indigo-100">
                  {faculty.facultyCode}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-2 mb-4">{faculty.description}</p>
            
            <div className="flex-1 mt-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Degrees ({facultyDegrees.length})
              </h4>
              <ul className="space-y-1 mb-4">
                {facultyDegrees.map(d => (
                  <li key={d.id} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {d.name}
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New degree name..."
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={newDegreeNames[faculty.id] || ''}
                  onChange={e => setNewDegreeNames({ ...newDegreeNames, [faculty.id]: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddDegree(faculty.id); }}
                />
                <button
                  onClick={() => handleAddDegree(faculty.id)}
                  className="px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Created {new Date(faculty.createdAt).toLocaleDateString()}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
