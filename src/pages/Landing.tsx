import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, GraduationCap, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Landing() {
  const { faculties, addStudentRequest, degrees } = useAppContext();
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [facultyId, setFacultyId] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [referenceEmail, setReferenceEmail] = useState('');
  
  // A/L State
  const [alStream, setAlStream] = useState('');
  const [alResult, setAlResult] = useState('');
  const [alIndex, setAlIndex] = useState('');
  const [alYear, setAlYear] = useState('');

  // O/L State
  const [olA, setOlA] = useState(0);
  const [olB, setOlB] = useState(0);
  const [olC, setOlC] = useState(0);
  const [olS, setOlS] = useState(0);
  const [olF, setOlF] = useState(0);
  const [olIndex, setOlIndex] = useState('');
  const [olYear, setOlYear] = useState('');

  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyId || !degreeName || !fullName || !nic || !referenceEmail) return;

    const totalSubjects = olA + olB + olC + olS + olF;
    if (totalSubjects !== 9) {
      setFormError('The total number of O/L grades must exactly equal 9 subjects.');
      return;
    }
    setFormError('');

    addStudentRequest({
      facultyId,
      degreeName,
      fullName,
      nic,
      referenceEmail,
      advancedLevel: {
        stream: alStream,
        result: alResult,
        indexNumber: alIndex,
        year: alYear
      },
      ordinaryLevel: {
        grades: { A: olA, B: olB, C: olC, S: olS, F: olF },
        indexNumber: olIndex,
        year: olYear
      }
    });

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 text-indigo-600">
          <Building2 className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight">UniLMS</span>
        </div>
        <Link 
          to="/login"
          className="flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Portal Login <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 px-8 py-10 text-white text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold mb-2">Student Registration Application</h1>
            <p className="text-indigo-100 max-w-xl mx-auto">
              Please fill out all requirements including your Advanced Level and Ordinary Level exam results to request admission to your desired faculty.
            </p>
          </div>

          <div className="p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-500 mb-8">
                  Your request has been forwarded to the university administration for review. 
                  You will be contacted via {referenceEmail} regarding the decision.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-indigo-600 font-medium hover:text-indigo-800"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Personal & Faculty Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Application Details</h3>
                  {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{formError}</div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                      <input required type="text" value={nic} onChange={e => setNic(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Email</label>
                      <input required type="email" value={referenceEmail} onChange={e => setReferenceEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Faculty</label>
                      <select required value={facultyId} onChange={e => { setFacultyId(e.target.value); setDegreeName(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">-- Select Faculty --</option>
                        {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Desired Degree Name</label>
                      <select 
                        required 
                        value={degreeName} 
                        onChange={e => setDegreeName(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={!facultyId}
                      >
                        <option value="">-- Select Degree --</option>
                        {facultyId && degrees.filter(d => d.facultyId === facultyId).map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Advanced Level Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Advanced Level (A/L) Examination</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
                      <select required value={alStream} onChange={e => setAlStream(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">-- Select Stream --</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Bio">Bio</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Technology">Technology</option>
                        <option value="Arts">Arts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Result (Z-Score/Grades)</label>
                      <input required type="text" value={alResult} onChange={e => setAlResult(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Index Number</label>
                      <input required type="text" value={alIndex} onChange={e => setAlIndex(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input required type="text" value={alYear} onChange={e => setAlYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="YYYY" />
                    </div>
                  </div>
                </div>

                {/* Ordinary Level Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Ordinary Level (O/L) Examination</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Index Number</label>
                      <input required type="text" value={olIndex} onChange={e => setOlIndex(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input required type="text" value={olYear} onChange={e => setOlYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="YYYY" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Result Summary (Total 9 Subjects)</label>
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs text-center text-gray-500 mb-1">A Grades</label>
                        <input required type="number" min="0" max="9" value={olA} onChange={e => setOlA(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center" />
                      </div>
                      <div>
                        <label className="block text-xs text-center text-gray-500 mb-1">B Grades</label>
                        <input required type="number" min="0" max="9" value={olB} onChange={e => setOlB(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center" />
                      </div>
                      <div>
                        <label className="block text-xs text-center text-gray-500 mb-1">C Grades</label>
                        <input required type="number" min="0" max="9" value={olC} onChange={e => setOlC(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center" />
                      </div>
                      <div>
                        <label className="block text-xs text-center text-gray-500 mb-1">S Grades</label>
                        <input required type="number" min="0" max="9" value={olS} onChange={e => setOlS(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center" />
                      </div>
                      <div>
                        <label className="block text-xs text-center text-gray-500 mb-1">F Grades</label>
                        <input required type="number" min="0" max="9" value={olF} onChange={e => setOlF(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
