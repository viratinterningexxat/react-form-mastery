import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmployeeFormData } from '@/types/employee';
import { FormErrors } from '@/hooks/useForm';
import { Plus, X, Sparkles } from 'lucide-react';

interface StepSkillsProps {
  values: EmployeeFormData;
  errors: FormErrors;
  onChange: (name: keyof EmployeeFormData, value: unknown) => void;
}

export function StepSkills({ values, errors, onChange }: StepSkillsProps) {
  const addSkill = () => {
    onChange('skills', [...values.skills, '']);
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = values.skills.map((skill, i) => 
      i === index ? value : skill
    );
    onChange('skills', newSkills);
  };

  const removeSkill = (index: number) => {
    if (values.skills.length > 1) {
      const newSkills = values.skills.filter((_, i) => i !== index);
      onChange('skills', newSkills);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground">Skills & Expertise</h2>
        <p className="text-muted-foreground mt-1">Add the employee's professional skills</p>
      </div>

      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          Skills (at least 1 required)
        </Label>

        <div className="space-y-3">
          {values.skills.map((skill, index) => (
            <div key={index} className="flex gap-2 items-center animate-fade-in">
              <Input
                placeholder={`Skill ${index + 1}`}
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                className={errors.skills ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSkill(index)}
                disabled={values.skills.length === 1}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {errors.skills && (
          <p className="text-sm text-destructive">{errors.skills}</p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addSkill}
          className="w-full mt-4 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Skill
        </Button>
      </div>
    </div>
  );
}
