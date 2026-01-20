import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Syringe,
  Award,
  BookOpen,
  FileText,
  Heart,
  LucideIcon,
} from 'lucide-react';

interface CategoryData {
  category: string;
  completed: number;
  total: number;
}

interface CategoryProgressProps {
  categories: CategoryData[];
  className?: string;
}

const categoryIcons: Record<string, LucideIcon> = {
  immunizations: Syringe,
  certifications: Award,
  training: BookOpen,
  documents: FileText,
  health: Heart,
};

const categoryColors: Record<string, string> = {
  immunizations: 'bg-blue-500',
  certifications: 'bg-amber-500',
  training: 'bg-violet-500',
  documents: 'bg-emerald-500',
  health: 'bg-rose-500',
};

export const CategoryProgress = memo(function CategoryProgress({
  categories,
  className,
}: CategoryProgressProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Progress by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.category] || FileText;
          const color = categoryColors[cat.category] || 'bg-primary';
          const percentage = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
          
          return (
            <div key={cat.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('p-1.5 rounded-md', color.replace('bg-', 'bg-') + '/10')}>
                    <Icon className={cn('w-4 h-4', color.replace('bg-', 'text-'))} />
                  </div>
                  <span className="text-sm font-medium capitalize">{cat.category}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {cat.completed}/{cat.total}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});
