import { memo, useCallback } from 'react';
import { useCredentials } from '@/hooks/useCredentials';
import { CategoryAccordion } from '@/components/credentials/CategoryAccordion';
import { ReadinessCard } from '@/components/credentials/ReadinessCard';
import { CredentialCategory } from '@/types/credential';
import { toast } from 'sonner';
import { FileCheck, Info, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const categoryOrder: CredentialCategory[] = [
  'immunization',
  'certification',
  'training',
  'background_check',
  'health_screening',
  'identification',
];

const Credentials = memo(function Credentials() {
  const {
    documentsByCategory,
    clinicalReadiness,
    uploadDocument,
    deleteDocument,
    simulateApproval,
  } = useCredentials();

  const [configMode, setConfigMode] = useState<'details' | 'declination'>('details');

  const handleUpload = useCallback(
    async (requirementId: string, file: File) => {
      try {
        await uploadDocument(requirementId, file);
        toast.success('Document uploaded successfully', {
          description: 'Your document has been submitted for review.',
        });
      } catch (error) {
        toast.error('Upload failed', {
          description: 'Please try again with a valid PDF or image file.',
        });
      }
    },
    [uploadDocument]
  );

  const handleDelete = useCallback(
    (documentId: string) => {
      deleteDocument(documentId);
      toast.success('Document removed');
    },
    [deleteDocument]
  );

  const handleSimulateApproval = useCallback(
    (documentId: string, approved: boolean) => {
      simulateApproval(
        documentId,
        approved,
        approved
          ? undefined
          : 'Name mismatch detected. Please reupload with correct legal name.'
      );
      toast.info(approved ? 'Document approved (demo)' : 'Document rejected (demo)');
    },
    [simulateApproval]
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold">Clinical Credentials</h1>
          </div>
          <p className="text-muted-foreground">
            Upload and manage your clinical requirements. All documents are reviewed for compliance.
          </p>
        </div>
        <Button variant="default" className="shrink-0">
          Submit
        </Button>
      </div>

      {/* Configuration Mode Selection */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5">
          <RadioGroup
            value={configMode}
            onValueChange={(val) => setConfigMode(val as 'details' | 'declination')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="details" id="details" />
              <Label htmlFor="details" className="cursor-pointer">
                I want to provide details for Detailed Base Configuration
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="declination" id="declination" />
              <Label htmlFor="declination" className="cursor-pointer">
                I want to provide declination for Detailed Base Configuration
              </Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground mt-4">
            Open the section(s) relevant to you and provide the needed information
          </p>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <Info className="w-4 h-4 text-primary" />
        <AlertTitle className="text-primary">Demo Mode</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          This is a demo with localStorage. Use the ✓ and ✕ buttons on pending
          documents to simulate the approval workflow.
        </AlertDescription>
      </Alert>

      {/* Readiness Status */}
      <ReadinessCard readiness={clinicalReadiness} />

      {/* Credential Categories - Accordion Style */}
      <div className="space-y-3">
        {categoryOrder.map((category, index) => {
          const items = documentsByCategory[category];
          if (!items || items.length === 0) return null;

          return (
            <CategoryAccordion
              key={category}
              category={category}
              items={items}
              onUpload={handleUpload}
              onDelete={handleDelete}
              onSimulateApproval={handleSimulateApproval}
              defaultOpen={index === 0}
            />
          );
        })}
      </div>

      {/* Instructions Sidebar would go here in a wider layout */}
      <Card className="bg-muted/20">
        <CardContent className="pt-5">
          <h3 className="font-semibold mb-2">Instructions for completing document</h3>
          <p className="text-sm text-muted-foreground">
            Please ensure all vaccine records include the manufacturer name, lot number,
            and administration date. Documents must be in PDF, JPG, or PNG format.
          </p>
          <Separator className="my-4" />
          <h3 className="font-semibold mb-2">Guidelines for reviewers</h3>
          <p className="text-sm text-muted-foreground">
            Verify that names match across all documents. Check expiration dates and ensure
            all required doses are documented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

export default Credentials;
