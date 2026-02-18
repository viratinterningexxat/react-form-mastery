import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useDocumentProcessor } from '@/hooks/useDocumentProcessor';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { MappedFieldData } from '@/types/formConfig';

interface DocumentUploaderProps {
  onDataExtracted: (data: MappedFieldData) => void;
  onError: (error: string) => void;
  accept?: string;
  label?: string;
}

export function DocumentUploader({
  onDataExtracted,
  onError,
  accept = "image/*,.pdf",
  label = "Upload Document"
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processDocument, isProcessing, progress } = useDocumentProcessor({
    onDataExtracted,
    onError,
  });

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processDocument(file);
    }
  }, [processDocument]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isProcessing ? 'Processing...' : 'Choose File'}
        </Button>
        {fileInputRef.current?.files?.[0] && (
          <span className="text-sm text-muted-foreground">
            {fileInputRef.current.files[0].name}
          </span>
        )}
      </div>
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Processing document... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}