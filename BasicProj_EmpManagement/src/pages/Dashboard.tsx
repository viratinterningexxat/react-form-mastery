import { useMemo, useContext, useState, useEffect } from 'react';
import { Employee } from '../types';
import { AppContext } from '../Context';
import { useLocalStorage } from '../hooks/useLocalStorage';

const completenessFor = (e: Employee) => {
  const fields = [e.name, e.email, e.phone, e.department, e.role];
  const filled = fields.filter(Boolean).length + (e.skills?.length ? 1 : 0);
  return Math.round((filled / (fields.length + 1)) * 100);
};

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    return <div>Loading...</div>;
  }
  
  const { employees, handleFetchExternal, handleGenerateMockData, setView } = context;
  const stats = useMemo(() => {
    const total = employees.length;
    let approved = 0, pending = 0, needUpload = 0;
    employees.forEach((e: Employee) => {
      const c = completenessFor(e);
      if (c >= 80) approved++;
      else if (c >= 50) pending++;
      else needUpload++;
    });
    const expiringSoon = employees.filter((e: Employee) => (e.skills?.length || 0) < 1).length;
    return { total, approved, pending, expiringSoon, needUpload };
  }, [employees]);
  
  const overall = useMemo(() => {
    if (employees.length === 0) return 0;
    const sum = employees.reduce((acc: number, e: Employee) => acc + completenessFor(e), 0);
    return Math.round(sum / employees.length);
  }, [employees]);

  const [profile] = useLocalStorage<any>('profile', {} as any);
  
  // Calculate profile completeness
  const profileFields = ['firstName', 'lastName', 'email', 'phone', 'bio'];
  const filled = profileFields.reduce((acc, f) => acc + (profile && profile[f] ? 1 : 0), 0);
  const completeness = Math.round((filled / profileFields.length) * 100);

  return (
    <div>
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
          <p className="text-gray-600 mb-4">Here's an overview of your employee management dashboard.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Approved</div>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Pending Review</div>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Expiring Soon</div>
              <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Need Upload</div>
              <div className="text-2xl font-bold">{stats.needUpload}</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Alerts</h3>
            <div className="p-4 bg-gray-50 rounded border border-dashed text-gray-600">All clear — no employee alerts.</div>
          </div>
        </div>

        <aside className="w-72">
          <div className="p-4 bg-white rounded shadow mb-4">
            <div className="text-sm text-gray-500">Profile Completion</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-full bg-gray-200 rounded h-3">
                <div className="bg-blue-600 h-3 rounded" style={{ width: `${completeness}%` }} />
              </div>
              <div className="text-sm font-medium">{completeness}%</div>
            </div>
            <button
              onClick={() => context.setView && context.setView('profile')}
              className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Profile
            </button>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-500">Quick Actions</div>
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={() => context.setView && context.setView('credentials')} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-left">Manage Credentials</button>
              <button onClick={() => context.setView && context.setView('add')} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-left">Add Employee</button>
              <button onClick={() => context.setView && context.setView('alerts')} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-left">Review Alerts</button>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
};

export default Dashboard;
