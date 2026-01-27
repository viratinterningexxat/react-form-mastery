import { memo, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CredentialAccordionItem } from './CredentialAccordionItem';
import {
  CredentialRequirement,
  CredentialDocument,
  CredentialCategory,
  getCategoryLabel,
} from '@/types/credential';
import {
  Syringe,
  Award,
  Shield,
  GraduationCap,
  CreditCard,
  Stethoscope,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryAccordionProps {
  category: CredentialCategory;
  items: { requirement: CredentialRequirement; document?: CredentialDocument }[];
  onUpload: (requirementId: string, file: File) => Promise<void>;
  onDelete: (documentId: string) => void;
  onSimulateApproval?: (documentId: string, approved: boolean) => void;
  defaultOpen?: boolean;
}

const categoryIcons: Record<CredentialCategory, React.ReactNode> = {
  immunization: <Syringe className="w-5 h-5" />,
  certification: <Award className="w-5 h-5" />,
  background_check: <Shield className="w-5 h-5" />,
  training: <GraduationCap className="w-5 h-5" />,
  identification: <CreditCard className="w-5 h-5" />,
  health_screening: <Stethoscope className="w-5 h-5" />,
};

const categoryColors: Record<CredentialCategory, string> = {
  immunization: 'bg-blue-500',
  certification: 'bg-amber-500',
  background_check: 'bg-emerald-500',
  training: 'bg-purple-500',
  identification: 'bg-pink-500',
  health_screening: 'bg-cyan-500',
};

export const CategoryAccordion = memo(function CategoryAccordion({
  category,
  items,
  onUpload,
  onDelete,
  onSimulateApproval,
  defaultOpen = false,
}: CategoryAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const completedCount = items.filter(
    (item) =>
      item.document?.status === 'approved' ||
      item.document?.status === 'approved_with_exception'
  ).length;
  const pendingCount = items.filter(
    (item) => item.document?.status === 'pending_review'
  ).length;
  const totalCount = items.length;
  const isComplete = completedCount === totalCount;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Category Header */}
      <Accordion 
        type="single" 
        collapsible 
        defaultValue={defaultOpen ? category : undefined}
      >
        <AccordionItem value={category} className="border-none">
          <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4 w-full">
              {/* Icon with colored background */}
              <div className={cn(
                "p-2.5 rounded-lg text-white shrink-0",
                categoryColors[category]
              )}>
                {categoryIcons[category] || <FileText className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base">
                  {getCategoryLabel(category)}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <Progress value={progressPercent} className="h-1.5 w-32" />
                  <span className="text-xs text-muted-foreground">
                    {completedCount} of {totalCount} complete
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingCount} pending
                  </Badge>
                )}
                <Badge
                  variant={isComplete ? 'success' : 'outline'}
                  className={cn(
                    "text-xs font-medium",
                    isComplete && "bg-success text-success-foreground"
                  )}
                >
                  {completedCount}/{totalCount}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="pb-0">
            {/* Nested accordion for individual credentials */}
            <Accordion
              type="multiple"
              value={openItems}
              onValueChange={setOpenItems}
              className="border-t bg-muted/20"
            >
              {items.map(({ requirement, document }) => (
                <CredentialAccordionItem
                  key={requirement.id}
                  requirement={requirement}
                  document={document}
                  onUpload={onUpload}
                  onDelete={onDelete}
                  onSimulateApproval={onSimulateApproval}
                />
              ))}
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});
