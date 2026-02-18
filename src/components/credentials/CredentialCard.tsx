import { memo, useCallback, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CredentialRequirement,
  CredentialDocument,
  getStatusColor,
  getStatusLabel,
} from '@/types/credential';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CredentialCardProps {
  requirement: CredentialRequirement;
  document?: CredentialDocument;
  onUpload: (requirementId: string, file: File) => Promise<void>;
  onDelete: (documentId: string) => void;
  onSimulateApproval?: (documentId: string, approved: boolean) => void;
}

export const CredentialCard = memo(function CredentialCard({
  requirement,
  document,
  onUpload,
  onDelete,
  onSimulateApproval,
}: CredentialCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        await onUpload(requirement.id, file);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onUpload, requirement.id]
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getStatusIcon = () => {
    if (!document) return <Upload className="w-4 h-4" />;
    
    switch (document.status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'approved_with_exception':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'pending_review':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  const getExpiryInfo = () => {
    if (!document?.expiresAt) return null;
    
    const expiryDate = parseISO(document.expiresAt);
    const daysUntil = differenceInDays(expiryDate, new Date());
    
    if (daysUntil < 0) {
      return { text: 'Expired', severity: 'destructive' as const };
    } else if (daysUntil <= 30) {
      return { text: `Expires in ${daysUntil} days`, severity: 'warning' as const };
    } else if (daysUntil <= 90) {
      return { text: `Expires ${format(expiryDate, 'MMM d, yyyy')}`, severity: 'secondary' as const };
    }
    return { text: `Valid until ${format(expiryDate, 'MMM d, yyyy')}`, severity: 'outline' as const };
  };

  const expiryInfo = getExpiryInfo();

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      document?.status === 'rejected' && "border-destructive/50",
      document?.status === 'approved' && "border-success/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-base font-medium">{requirement.name}</CardTitle>
          </div>
          <Badge variant={document ? getStatusColor(document.status) : 'secondary'}>
            {document ? getStatusLabel(document.status) : 'Not Uploaded'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{requirement.description}</p>

        {document && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{document.fileName}</span>
            </div>
            
            {expiryInfo && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Badge variant={expiryInfo.severity}>{expiryInfo.text}</Badge>
              </div>
            )}

            {document.reviewNotes && (
              <div className="p-2 bg-muted rounded-md text-sm">
                <p className="font-medium text-muted-foreground">Review Notes:</p>
                <p>{document.reviewNotes}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant={document ? "outline" : "default"}
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {document ? 'Replace' : 'Upload'}
          </Button>

          {document && (
            <>
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>{document.fileName}</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-auto">
                    {document.fileType.startsWith('image/') ? (
                      <img
                        src={document.fileDataUrl}
                        alt={document.fileName}
                        className="max-w-full h-auto"
                      />
                    ) : (
                      <iframe
                        src={document.fileDataUrl}
                        className="w-full h-[60vh]"
                        title={document.fileName}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this document? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(document.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Demo: Simulate Approval */}
              {onSimulateApproval && document.status === 'pending_review' && (
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-success border-success"
                    onClick={() => onSimulateApproval(document.id, true)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive"
                    onClick={() => onSimulateApproval(document.id, false)}
                  >
                    <AlertCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
