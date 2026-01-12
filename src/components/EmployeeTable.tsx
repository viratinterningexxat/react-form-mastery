import { useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmployeeRow } from './EmployeeRow';
import { Employee, DEPARTMENTS } from '@/types/employee';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Users, Filter } from 'lucide-react';
import { useState } from 'react';

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (id: string) => void;
}

export function EmployeeTable({ employees, onDelete }: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        emp.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesDepartment = 
        departmentFilter === 'all' || emp.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [employees, debouncedSearch, departmentFilter]);

  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  if (employees.length === 0) {
    return (
      <Card className="p-12 text-center shadow-card">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No employees yet</h3>
        <p className="text-muted-foreground">
          Add your first employee to get started with the onboarding process.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative sm:w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-card overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Experience</TableHead>
                  <TableHead className="font-semibold">Skills</TableHead>
                  <TableHead className="font-semibold">Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <EmployeeRow
                    key={employee.id}
                    employee={employee}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
      
      <p className="text-sm text-muted-foreground text-center">
        Showing {filteredEmployees.length} of {employees.length} employees
      </p>
    </div>
  );
}
