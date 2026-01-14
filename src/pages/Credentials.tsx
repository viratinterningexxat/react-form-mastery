import { memo, useCallback } from 'react';
import { useCredentials } from '@/hooks/useCredentials';
import { CategorySection } from '@/components/credentials/CategorySection';
import { ReadinessCard } from '@/components/credentials/ReadinessCard';
import { CredentialCategory, getCategoryLabel } from '@/types/credential';
import { toast } from 'sonner';
import { FileCheck, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
      simulateApproval(documentId, approved, approved ? undefined : 'Name mismatch detected. Please reupload with correct legal name.');
      toast.info(approved ? 'Document approved (demo)' : 'Document rejected (demo)');
    },
    [simulateApproval]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileCheck className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">My Credentials</h1>
        </div>
        <p className="text-muted-foreground">
          Upload and manage your clinical requirements. All documents are reviewed for compliance.
        </p>
      </div>

      {/* Demo Notice */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          This is a demo with localStorage. Use the ✓ and ✕ buttons on pending documents to simulate the approval workflow.
        </AlertDescription>
      </Alert>

      {/* Readiness Status */}
      <ReadinessCard readiness={clinicalReadiness} />

      {/* Credential Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Requirements by Category</h2>
        {categoryOrder.map((category, index) => {
          const items = documentsByCategory[category];
          if (!items || items.length === 0) return null;

          return (
            <CategorySection
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
    </div>
  );
});

export default Credentials;
