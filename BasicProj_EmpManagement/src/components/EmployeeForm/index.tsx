import { useState, FormEvent } from 'react';
import { useForm } from '../../hooks/useForm';
import { validateEmployeeForm } from '../../utils/validators';
import StepPersonal from './StepPersonal';
import StepJob from './StepJob';
import StepSkills from './StepSkills';
import StepReview from './StepReview';
import { Employee, EmployeeFormValues } from '../../types';

interface EmployeeFormProps {
  onEmployeeAdd: (employee: Employee) => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onEmployeeAdd }) => {
  const [step, setStep] = useState<number>(1);
  const { values, errors, handleChange, validateForm, setValues } = useForm<EmployeeFormValues>({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    experience: '',
    skills: []
  }, validateEmployeeForm);

  const nextStep = () => {
    if (validateForm(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const goToStep = (stepNumber: number) => {
      setStep(stepNumber);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm('all')) {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: values.name,
        email: values.email,
        phone: values.phone,
        department: values.department,
        role: values.role,
        experience: Number(values.experience),
        skills: values.skills
      };
      
      onEmployeeAdd(newEmployee);
      alert("Employee Added Successfully!");
      setValues({
          name: '',
          email: '',
          phone: '',
          department: '',
          role: '',
          experience: '',
          skills: []
      });
      setStep(1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
           <span className="text-gray-500 font-medium">Step {step} of 4</span>
           <div className="h-2 w-full bg-gray-200 rounded ml-4">
             <div 
               className="h-full bg-blue-500 rounded transition-all duration-300"
               style={{ width: `${(step / 4) * 100}%` }}
             ></div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && <StepPersonal values={values} handleChange={handleChange} errors={errors} />}
        {step === 2 && <StepJob values={values} handleChange={handleChange} errors={errors} />}
        {step === 3 && <StepSkills values={values} setValues={setValues} errors={errors} />}
        {step === 4 && <StepReview values={values} onEdit={goToStep} />}

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 font-medium"
            >
              Back
            </button>
          ) : <div></div>}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
