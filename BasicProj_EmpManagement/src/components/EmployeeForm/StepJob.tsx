import { EmployeeFormValues, FormErrors } from '../../types';

interface StepJobProps {
  values: EmployeeFormValues;
  handleChange: (name: keyof EmployeeFormValues, value: string | number) => void;
  errors: FormErrors;
}

const StepJob: React.FC<StepJobProps> = ({ values, handleChange, errors }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Step 2: Job Information</h2>
      
      <div>
        <label className="block text-sm font-medium">Department</label>
        <select
          className="border p-2 w-full rounded"
          value={values.department || ''}
          onChange={(e) => handleChange('department', e.target.value)}
        >
          <option value="">Select Department</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
        </select>
        {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Role</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={values.role || ''}
          onChange={(e) => handleChange('role', e.target.value)}
        />
        {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Experience (years)</label>
        <input
          type="number"
          className="border p-2 w-full rounded"
          value={values.experience || ''}
          onChange={(e) => handleChange('experience', e.target.value)}
          min="0"
        />
        {errors.experience && <p className="text-red-500 text-sm">{errors.experience}</p>}
      </div>
    </div>
  );
};

export default StepJob;
