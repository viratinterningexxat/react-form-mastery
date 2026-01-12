import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { EmployeeForm } from '@/components/EmployeeForm';
import { EmployeeTable } from '@/components/EmployeeTable';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Employee } from '@/types/employee';
import { UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [employees, setEmployees] = useLocalStorage<Employee[]>('employees', []);
  const [showForm, setShowForm] = useState(false);

  const handleAddEmployee = useCallback((employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
    setShowForm(false);
  }, [setEmployees]);

  const handleDeleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    toast.success('Employee removed successfully');
  }, [setEmployees]);

  const handleShowForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleHideForm = useCallback(() => {
    setShowForm(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Employee Hub</h1>
                <p className="text-sm text-muted-foreground">Manage your team</p>
              </div>
            </div>
            {!showForm && (
              <Button onClick={handleShowForm} className="gradient-primary border-0">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {showForm ? (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground">Employee Onboarding</h2>
              <p className="text-muted-foreground mt-1">Complete the form to add a new team member</p>
            </div>
            <EmployeeForm onSubmit={handleAddEmployee} onCancel={handleHideForm} />
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Team Directory</h2>
              <p className="text-muted-foreground mt-1">
                {employees.length} {employees.length === 1 ? 'employee' : 'employees'} in your organization
              </p>
            </div>
            <EmployeeTable employees={employees} onDelete={handleDeleteEmployee} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
