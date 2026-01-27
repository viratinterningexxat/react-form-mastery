import { memo, useCallback, useRef, useState } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  CredentialRequirement,
  CredentialDocument,
  getStatusColor,
  getStatusLabel,
} from '@/types/credential';
import { VaccineDose } from '@/types/credentialDetails';
import { VaccineDoseForm } from './VaccineDoseForm';
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
  ChevronRight,
  Info,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CredentialAccordionItemProps {
  requirement: CredentialRequirement;
  document?: CredentialDocument;
  onUpload: (requirementId: string, file: File) => Promise<void>;
  onDelete: (documentId: string) => void;
  onSimulateApproval?: (documentId: string, approved: boolean) => void;
}

// Determine max doses based on vaccine type
function getMaxDoses(requirementId: string): number {
  const multiDoseVaccines: Record<string, number> = {
    mmr: 2,
    varicella: 2,
    hepatitis_b: 3,
    covid_vaccine: 4,
  };
  return multiDoseVaccines[requirementId] || 1;
}

// Determine validity period in years
function getValidityYears(validityPeriodDays: number | null): number {
  if (!validityPeriodDays) return 99; // Lifetime = 99 years
  return Math.round(validityPeriodDays / 365);
}

export const CredentialAccordionItem = memo(function CredentialAccordionItem({
  requirement,
  document,
  onUpload,
  onDelete,
  onSimulateApproval,
}: CredentialAccordionItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Store vaccine doses in localStorage
  const [doses, setDoses] = useLocalStorage<VaccineDose[]>(
    `doses_${requirement.id}`,
    []
  );

  const isVaccineType = requirement.category === 'immunization';
  const maxDoses = getMaxDoses(requirement.id);
  const validityYears = getValidityYears(requirement.validityPeriodDays);

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
    if (!document) return <Clock className="w-4 h-4 text-muted-foreground" />;
    
    switch (document.status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'approved_with_exception':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'pending_review':
        return <Clock className="w-4 h-4 text-primary animate-pulse" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getExpiryInfo = () => {
    if (!document?.expiresAt) return null;
    
    const expiryDate = parseISO(document.expiresAt);
    const daysUntil = differenceInDays(expiryDate, new Date());
    
    if (daysUntil < 0) {
      return { text: 'Expired', severity: 'destructive' as const };
    } else if (daysUntil <= 30) {
      return { text: `${daysUntil}d`, severity: 'warning' as const };
    } else if (daysUntil <= 90) {
      return { text: `${daysUntil}d`, severity: 'secondary' as const };
    }
    return null;
  };

  const expiryInfo = getExpiryInfo();

  // Calculate progress for multi-dose vaccines
  const completedDoses = doses.filter(d => d.manufacturer && d.administrationDate).length;
  const progressPercent = (completedDoses / maxDoses) * 100;

  return (
    <AccordionItem 
      value={requirement.id} 
      className={cn(
        "border-b last:border-b-0 transition-colors",
        document?.status === 'approved' && "bg-success/5",
        document?.status === 'rejected' && "bg-destructive/5"
      )}
    >
      <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 w-full pr-2">
          {getStatusIcon()}
          <span className="font-medium text-sm flex-1 text-left">{requirement.name}</span>
          
          <div className="flex items-center gap-2">
            {/* Show doses progress for vaccines */}
            {isVaccineType && maxDoses > 1 && (
              <Badge variant="outline" className="text-xs font-normal">
                {completedDoses}/{maxDoses} doses
              </Badge>
            )}
            
            {/* Expiry warning */}
            {expiryInfo && (
              <Badge variant={expiryInfo.severity} className="text-xs">
                {expiryInfo.text}
              </Badge>
            )}
            
            {/* Status badge */}
            <Badge 
              variant={document ? getStatusColor(document.status) as any : 'secondary'}
              className="min-w-[80px] justify-center text-xs"
            >
              {document ? getStatusLabel(document.status) : 'Pending'}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-2">
          {/* Description & Instructions */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p>{requirement.description}</p>
              {requirement.validityPeriodDays && (
                <p className="mt-1 text-xs">
                  Validity: {validityYears === 99 ? 'Lifetime' : `${validityYears} year${validityYears > 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          </div>

          {/* Vaccine Dose Form */}
          {isVaccineType && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Vaccination Details</Label>
                  {maxDoses > 1 && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {completedDoses}/{maxDoses}
                      </span>
                    </div>
                  )}
                </div>
                <VaccineDoseForm
                  requirementId={requirement.id}
                  doses={doses}
                  maxDoses={maxDoses}
                  onDosesChange={setDoses}
                  validityYears={validityYears}
                />
              </div>
            </>
          )}

          {/* Document Upload Section */}
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium">Supporting Document</Label>
            
            {document && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{document.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {format(parseISO(document.uploadedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
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
                            className="max-w-full h-auto rounded-lg"
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
                      <Button variant="ghost" size="sm" className="text-destructive">
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
                </div>
              </div>
            )}

            {/* Review Notes */}
            {document?.reviewNotes && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm font-medium text-warning-foreground">Review Notes:</p>
                <p className="text-sm text-muted-foreground mt-1">{document.reviewNotes}</p>
              </div>
            )}

            {/* Upload & Actions */}
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
                {document ? 'Replace Document' : 'Upload Document'}
              </Button>

              {/* Demo: Simulate Approval */}
              {onSimulateApproval && document && document.status === 'pending_review' && (
                <div className="flex gap-1 ml-auto">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-success border-success hover:bg-success/10"
                          onClick={() => onSimulateApproval(document.id, true)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve (Demo)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => onSimulateApproval(document.id, false)}
                        >
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject (Demo)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});
