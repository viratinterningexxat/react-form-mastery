import { useState, useContext } from 'react';
import { Employee } from '../types';
import { AppContext } from '../Context';

const Profile: React.FC = () => {
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
  
  const [form, setForm] = useState<Employee>(selectedEmployee || {
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    experience: 0,
    skills: [],
  });


  const setField = (key: keyof Employee, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePhoto = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setField('photo', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.id) {
      alert('No employee selected');
      return;
    }
    // In a real app, we would call context.updateEmployee(form)
    alert('Profile saved successfully!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>
      {employees.length === 0 ? (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded">No employees found. Add an employee first.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden mb-4">
                {form.photo ? <img src={form.photo} alt="Profile" className="w-full h-full object-cover" /> : null}
              </div>
              <label className="cursor-pointer text-blue-600 underline">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handlePhoto(e.target.files[0])} />
              </label>
            </div>
            <div className="mt-6">
              <div className="text-sm text-gray-500">Completeness</div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-green-500 rounded" style={{ width: `${Math.min(100, (['name','email','phone','department','role'].filter((k) => (form as any)[k]).length + (form.skills?.length?1:0)) / 6 * 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={(e) => setField('name', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Department" value={form.department} onChange={(e) => setField('department', e.target.value)} />
              <input className="border p-2 rounded" placeholder="Role" value={form.role} onChange={(e) => setField('role', e.target.value)} />
              <input className="border p-2 rounded" type="number" placeholder="Experience (years)" value={form.experience} onChange={(e) => setField('experience', Number(e.target.value))} />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Bio</label>
              <textarea className="border p-2 rounded w-full" rows={4} value={form.bio || ''} onChange={(e) => setField('bio', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input className="border p-2 rounded" placeholder="Add interest" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (!val) return;
                  setField('interests', [...(form.interests || []), val]);
                  (e.target as HTMLInputElement).value = '';
                }
              }} />
              <input className="border p-2 rounded" placeholder="Add language" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (!val) return;
                  setField('languages', [...(form.languages || []), val]);
                  (e.target as HTMLInputElement).value = '';
                }
              }} />
              <input className="border p-2 rounded" placeholder="Add certification" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (!val) return;
                  setField('certifications', [...(form.certifications || []), val]);
                  (e.target as HTMLInputElement).value = '';
                }
              }} />
            </div>

            <div className="flex gap-2 flex-wrap text-sm">
              {(form.interests || []).map((t, i) => <span key={`i-${i}`} className="px-2 py-1 bg-gray-200 rounded">{t}</span>)}
              {(form.languages || []).map((t, i) => <span key={`l-${i}`} className="px-2 py-1 bg-gray-200 rounded">{t}</span>)}
              {(form.certifications || []).map((t, i) => <span key={`c-${i}`} className="px-2 py-1 bg-gray-200 rounded">{t}</span>)}
            </div>

            <div className="flex justify-end">
              <button onClick={save} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
