import { EmployeeFormValues, FormErrors } from '../../types';

interface StepPersonalProps {
  values: EmployeeFormValues;
  handleChange: (name: keyof EmployeeFormValues, value: string) => void;
  errors: FormErrors;
}

const StepPersonal: React.FC<StepPersonalProps> = ({ values, handleChange, errors }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Step 1: Personal Information</h2>
      
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={values.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          className="border p-2 w-full rounded"
          value={values.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="tel"
          className="border p-2 w-full rounded"
          value={values.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>
    </div>
  );
};

export default StepPersonal;
