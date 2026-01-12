import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmployeeFormData } from '@/types/employee';
import { User, Briefcase, Sparkles } from 'lucide-react';

interface StepReviewProps {
  values: EmployeeFormData;
}

export function StepReview({ values }: StepReviewProps) {
  const validSkills = values.skills.filter(s => s.trim().length > 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground">Review & Submit</h2>
        <p className="text-muted-foreground mt-1">Verify all information before submitting</p>
      </div>

      <div className="space-y-4">
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{values.name}</h3>
              <p className="text-sm text-muted-foreground">{values.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium text-foreground">{values.role}</p>
                <p className="text-sm text-muted-foreground">{values.department}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-muted-foreground text-sm font-medium mt-0.5">📞</span>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{values.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-muted-foreground text-sm font-medium mt-0.5">⏱️</span>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium text-foreground">{values.experience} years</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {validSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-accent text-accent-foreground">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
