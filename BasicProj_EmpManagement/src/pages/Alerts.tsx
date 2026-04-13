import { useMemo, useState } from 'react';
import { Employee } from '../types';

interface AlertsProps {
  employees: Employee[];
}

type Alert = {
  id: string;
  severity: 'Critical' | 'Warning' | 'Upcoming';
  message: string;
};

const Alerts: React.FC<AlertsProps> = ({ employees }) => {
  const [read, setRead] = useState<Record<string, boolean>>({});

  const alerts = useMemo<Alert[]>(() => {
    const list: Alert[] = [];
    employees.forEach((e) => {
      if (!e.email || !e.phone) {
        list.push({
          id: `${e.id}-contact`,
          severity: 'Critical',
          message: `${e.name}: Missing contact information`,
        });
      }
      if (!e.department) {
        list.push({
          id: `${e.id}-dept`,
          severity: 'Warning',
          message: `${e.name}: No department set`,
        });
      }
      if (!e.skills || e.skills.length === 0) {
        list.push({
          id: `${e.id}-skills`,
          severity: 'Upcoming',
          message: `${e.name}: No skills added`,
        });
      }
    });
    return list.sort((a, b) => {
      const order = { Critical: 0, Warning: 1, Upcoming: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [employees]);

  const markRead = (id: string) => setRead((r) => ({ ...r, [id]: true }));
  const markAll = () => {
    const all: Record<string, boolean> = {};
    alerts.forEach((a) => (all[a.id] = true));
    setRead(all);
  };

  const counts = useMemo(() => {
    const unreads = alerts.filter((a) => !read[a.id]);
    return {
      critical: unreads.filter((a) => a.severity === 'Critical').length,
      warning: unreads.filter((a) => a.severity === 'Warning').length,
      upcoming: unreads.filter((a) => a.severity === 'Upcoming').length,
    };
  }, [alerts, read]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Alerts</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="text-sm text-red-700">Critical</div>
          <div className="text-2xl font-bold text-red-700">{counts.critical}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <div className="text-sm text-yellow-700">Warning (Missing Dept)</div>
          <div className="text-2xl font-bold text-yellow-700">{counts.warning}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <div className="text-sm text-blue-700">Upcoming (Add Skills)</div>
          <div className="text-2xl font-bold text-blue-700">{counts.upcoming}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={markAll} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Mark All Read</button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">Details</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.filter((a) => !read[a.id]).length === 0 ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={3}>All clear</td></tr>
            ) : alerts.filter((a) => !read[a.id]).map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">
                  {a.severity === 'Critical' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Critical</span>}
                  {a.severity === 'Warning' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Warning</span>}
                  {a.severity === 'Upcoming' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Upcoming</span>}
                </td>
                <td className="p-3">{a.message}</td>
                <td className="p-3">
                  <button onClick={() => markRead(a.id)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Mark Read</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
