import { useState, useMemo } from 'react';
import EmployeeRow from './EmployeeRow';
import { useDebounce } from '../hooks/useDebounce';
import { Employee } from '../types';

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onDelete, onSelect }) => {
  const [search, setSearch] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  
  const debouncedSearch = useDebounce<string>(search, 300);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                            emp.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesDept = departmentFilter ? emp.department === departmentFilter : true;
      return matchesSearch && matchesDept;
    });
  }, [employees, debouncedSearch, departmentFilter]);

  if (employees.length === 0) {
    return <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">No employees found. Add one to get started!</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="border p-2 rounded flex-grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-600">Name</th>
              <th className="p-3 text-left font-semibold text-gray-600">Email</th>
              <th className="p-3 text-left font-semibold text-gray-600">Department</th>
              <th className="p-3 text-left font-semibold text-gray-600">Role</th>
              <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(emp => (
                <EmployeeRow key={emp.id} employee={emp} onDelete={onDelete} onSelect={onSelect} />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No employees match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
