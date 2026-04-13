import { useState, useContext } from 'react';
import { Employee } from '../types';
import { AppContext } from '../Context';

const PRESET_REQUIREMENTS = [
  'BLS/CPR', 'HIPAA', 'OSHA Bloodborne Pathogens',
  'Background Check', 'Drug Screening',
  'TB Screening', 'Physical Exam', 'Government ID'
];

type Status = 'Approved' | 'Pending Review' | 'Rejected' | 'Not Uploaded';

const Credentials: React.FC = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    return <div>Loading...</div>;
  }
  
  const { employees } = context;
  
  // For now, we'll use a default employee or the first one if available
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  
  const selectedEmployee = selectedEmployeeId 
    ? employees.find(emp => emp.id === selectedEmployeeId)
    : employees.length > 0 ? employees[0] : null;
  const [docs, setDocs] = useState<Record<string, { status: Status; file?: string }>>({});

  const setStatus = (name: string, status: Status) => {
    setDocs(prev => ({ ...prev, [name]: { ...(prev[name] || {}), status } }));
  };

  const setFile = (name: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setDocs(prev => ({ ...prev, [name]: { ...(prev[name] || {}), file: reader.result as string } }));
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!selectedEmployee) {
      alert('Select an employee to manage credentials');
      return;
    }
    const certs = Object.entries(docs).filter(([_, v]) => v.status === 'Approved').map(([name]) => name);
    // In a real app, we would call context.updateEmployee({...selectedEmployee, certifications: certs})
    alert('Credentials saved');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Credentials</h2>
      {employees.length === 0 ? (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded">No employees found. Add an employee first.</div>
      ) : (
        <div className="space-y-4">
          {PRESET_REQUIREMENTS.map((req) => {
            const current = docs[req]?.status || 'Not Uploaded';
            return (
              <div key={req} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{req}</div>
                    <div className="text-sm text-gray-500">Status: {current}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setStatus(req, 'Pending Review')}>Pending</button>
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => setStatus(req, 'Approved')}>Approve</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => setStatus(req, 'Rejected')}>Reject</button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <label className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
                    Upload Document
                    <input type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => e.target.files && setFile(req, e.target.files[0])} />
                  </label>
                  {docs[req]?.file && <span className="text-sm text-gray-600">Document attached</span>}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end">
            <button onClick={save} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credentials;
