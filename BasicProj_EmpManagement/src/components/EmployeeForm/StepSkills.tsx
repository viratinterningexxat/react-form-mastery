import { Dispatch, SetStateAction } from 'react';
import { EmployeeFormValues, FormErrors } from '../../types';

interface StepSkillsProps {
  values: EmployeeFormValues;
  setValues: Dispatch<SetStateAction<EmployeeFormValues>>;
  errors: FormErrors;
}

const StepSkills: React.FC<StepSkillsProps> = ({ values, setValues, errors }) => {
  const addSkill = () => {
    setValues(prev => ({ ...prev, skills: [...(prev.skills || []), ""] }));
  };

  const updateSkill = (index: number, value: string) => {
    setValues(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) => (i === index ? value : s))
    }));
  };

  const removeSkill = (index: number) => {
    setValues(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Step 3: Skills</h2>
      
      <div className="space-y-2">
        {values.skills && values.skills.map((skill, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
              placeholder="Enter a skill"
            />
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={addSkill}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Skill
      </button>

      {errors.skills && <p className="text-red-500 text-sm">{errors.skills}</p>}
    </div>
  );
};

export default StepSkills;
