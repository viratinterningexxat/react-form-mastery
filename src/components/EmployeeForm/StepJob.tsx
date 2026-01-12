import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmployeeFormData, DEPARTMENTS, ROLES } from '@/types/employee';
import { FormErrors } from '@/hooks/useForm';
import { Building2, Briefcase, Clock } from 'lucide-react';

interface StepJobProps {
  values: EmployeeFormData;
  errors: FormErrors;
  onChange: (name: keyof EmployeeFormData, value: any) => void;
}

export function StepJob({ values, errors, onChange }: StepJobProps) {
  const availableRoles = values.department 
    ? ROLES[values.department as keyof typeof ROLES] || []
    : [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground">Job Information</h2>
        <p className="text-muted-foreground mt-1">Define the employee's role and department</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="department" className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Department
          </Label>
          <Select
            value={values.department}
            onValueChange={(value) => {
              onChange('department', value);
              onChange('role', '');
            }}
          >
            <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && (
            <p className="text-sm text-destructive">{errors.department}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            Role
          </Label>
          <Select
            value={values.role}
            onValueChange={(value) => onChange('role', value)}
            disabled={!values.department}
          >
            <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
              <SelectValue placeholder={values.department ? "Select role" : "Select department first"} />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience" className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Years of Experience
          </Label>
          <Input
            id="experience"
            type="number"
            min="0"
            max="50"
            placeholder="0"
            value={values.experience}
            onChange={(e) => onChange('experience', parseInt(e.target.value) || 0)}
            className={errors.experience ? 'border-destructive' : ''}
          />
          {errors.experience && (
            <p className="text-sm text-destructive">{errors.experience}</p>
          )}
        </div>
      </div>
    </div>
  );
}
