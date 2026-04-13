import { useState, useEffect, useCallback } from 'react';
import EmployeeForm from './components/EmployeeForm';
import EmployeeTable from './components/EmployeeTable';
import { generateMockEmployees } from './utils/mockData';
import { Employee } from './types';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Credentials from './pages/Credentials';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';

type View = 'dashboard' | 'add' | 'credentials' | 'profile' | 'alerts';

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Employee) => {
    try {
      await api.addEmployee(employee);
      setEmployees(prev => [...prev, employee]);
      setView('dashboard');
    } catch (err) {
      alert('Failed to save employee');
    }
  };

  const deleteEmployee = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.deleteEmployee(id);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
      } catch (err) {
        alert('Failed to delete employee');
      }
    }
  }, []);

  const handleFetchExternal = async () => {
    setLoading(true);
    try {
      const externalData = await api.fetchExternalEmployees();
      setEmployees(prev => [...prev, ...externalData]);
      alert(`Fetched ${externalData.length} employees from external API!`);
    } catch (err) {
      alert("Failed to fetch external data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMockData = () => {
    const count = 50;
    if (window.confirm(`This will add ${count} mock employees locally. Continue?`)) {
      const mockData = generateMockEmployees(count);
      setEmployees(prev => [...prev, ...mockData]);
      alert(`Added ${count} mock employees!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1">
            <Sidebar view={view} setView={setView} />
          </div>

          <div className="md:col-span-4">
            <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
              <div className="flex gap-4">
                <button
                  onClick={handleFetchExternal}
                  className="px-4 py-2 rounded text-purple-600 bg-purple-100 hover:bg-purple-200 font-medium transition-colors"
                >
                  Fetch External API
                </button>
                <button
                  onClick={handleGenerateMockData}
                  className="px-4 py-2 rounded text-blue-600 bg-blue-100 hover:bg-blue-200 font-medium transition-colors"
                >
                  Generate Mock Data
                </button>
              </div>
            </header>

            <main>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                  <span><strong>Error:</strong> {error}</span>
                  <button onClick={loadEmployees} className="underline hover:text-red-800">Retry</button>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : view === 'dashboard' ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Dashboard onNavigate={(v) => setView(v as View)} />
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Employee Directory</h3>
                    <EmployeeTable employees={employees} onDelete={deleteEmployee} />
                  </div>
                </div>
              ) : view === 'add' ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-center">Onboard New Employee</h2>
                  <EmployeeForm onEmployeeAdd={addEmployee} />
                </div>
              ) : view === 'credentials' ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Credentials />
                </div>
              ) : view === 'profile' ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Profile />
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Alerts />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
