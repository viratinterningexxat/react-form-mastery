import { memo, useCallback } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Employee } from '@/types/employee';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeRowProps {
  employee: Employee;
  onDelete: (id: string) => void;
}

export const EmployeeRow = memo(function EmployeeRow({ employee, onDelete }: EmployeeRowProps) {
  const handleDelete = useCallback(() => {
    onDelete(employee.id);
  }, [employee.id, onDelete]);

  const initials = employee.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{employee.name}</p>
            <p className="text-sm text-muted-foreground">{employee.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-accent text-accent-foreground">
          {employee.department}
        </Badge>
      </TableCell>
      <TableCell className="text-foreground">{employee.role}</TableCell>
      <TableCell className="text-muted-foreground">{employee.experience} yrs</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {employee.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {employee.skills.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{employee.skills.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {format(new Date(employee.createdAt), 'MMM d, yyyy')}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});
