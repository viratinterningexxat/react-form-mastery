import { Employee } from '../types';

interface EmployeeRowProps {
  employee: Employee;
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({ employee, onDelete, onSelect }) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">{employee.name}</td>
      <td className="p-3">{employee.email}</td>
      <td className="p-3">{employee.department}</td>
      <td className="p-3">{employee.role}</td>
      <td className="p-3 text-center">
        <div className="flex gap-3 justify-center">
          {onSelect && (
            <button
              onClick={() => onSelect(employee.id)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Select
            </button>
          )}
          <button
            onClick={() => onDelete(employee.id)}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default EmployeeRow;
