import { EmployeeFormValues } from '../../types';

interface StepReviewProps {
  values: EmployeeFormValues;
  onEdit: (step: number) => void;
}

const StepReview: React.FC<StepReviewProps> = ({ values, onEdit }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Step 4: Review & Submit</h2>
      
      <div className="bg-gray-50 p-4 rounded space-y-2">
        <h3 className="font-semibold">Personal Info</h3>
        <p><strong>Name:</strong> {values.name}</p>
        <p><strong>Email:</strong> {values.email}</p>
        <p><strong>Phone:</strong> {values.phone}</p>
        <button className="text-blue-500 text-sm underline" onClick={() => onEdit(1)}>Edit</button>
      </div>

      <div className="bg-gray-50 p-4 rounded space-y-2">
        <h3 className="font-semibold">Job Info</h3>
        <p><strong>Department:</strong> {values.department}</p>
        <p><strong>Role:</strong> {values.role}</p>
        <p><strong>Experience:</strong> {values.experience} years</p>
        <button className="text-blue-500 text-sm underline" onClick={() => onEdit(2)}>Edit</button>
      </div>

      <div className="bg-gray-50 p-4 rounded space-y-2">
        <h3 className="font-semibold">Skills</h3>
        <ul className="list-disc pl-5">
          {values.skills && values.skills.map((skill, i) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>
        <button className="text-blue-500 text-sm underline" onClick={() => onEdit(3)}>Edit</button>
      </div>
    </div>
  );
};

export default StepReview;
