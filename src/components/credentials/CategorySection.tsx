import { memo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CredentialCard } from './CredentialCard';
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
} from 'lucide-react';

interface CategorySectionProps {
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

export const CategorySection = memo(function CategorySection({
  category,
  items,
  onUpload,
  onDelete,
  onSimulateApproval,
  defaultOpen = false,
}: CategorySectionProps) {
  const completedCount = items.filter(
    (item) => item.document?.status === 'approved' || item.document?.status === 'approved_with_exception'
  ).length;
  const totalCount = items.length;
  const isComplete = completedCount === totalCount;

  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? category : undefined}>
      <AccordionItem value={category} className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {categoryIcons[category] || <FileText className="w-5 h-5" />}
            </span>
            <span className="font-medium">{getCategoryLabel(category)}</span>
            <Badge 
              variant={isComplete ? "default" : "secondary"}
              className={isComplete ? "bg-success text-success-foreground" : ""}
            >
              {completedCount}/{totalCount}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="grid gap-4 md:grid-cols-2">
            {items.map(({ requirement, document }) => (
              <CredentialCard
                key={requirement.id}
                requirement={requirement}
                document={document}
                onUpload={onUpload}
                onDelete={onDelete}
                onSimulateApproval={onSimulateApproval}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});
