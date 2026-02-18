import { useState, useCallback } from 'react';
import { extractTextFromImage, parseExtractedText } from '@/utils/ocrExtractor';
import { ExtractedDocumentData, MappedFieldData } from '@/types/formConfig';
import { mapExtractedDataToFields } from '@/utils/ocrMapper';
import { toast } from 'sonner';

interface UseDocumentProcessorOptions {
  onDataExtracted?: (data: MappedFieldData) => void;
  onError?: (error: string) => void;
}

export function useDocumentProcessor(options: UseDocumentProcessorOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processDocument = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Extract text from image
      const extractedText = await extractTextFromImage(file, (prog) => setProgress(prog));

      // Parse the extracted text
      const extractedData: ExtractedDocumentData = parseExtractedText(extractedText);

      // Map to form fields
      const mappedData = mapExtractedDataToFields(extractedData);

      options.onDataExtracted?.(mappedData);

      toast.success('Document processed successfully. Fields have been auto-filled.');
    } catch (error) {
      console.error('OCR processing failed:', error);
      const errorMessage = 'Failed to process document. Please fill in the fields manually.';
      options.onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [options]);

  return {
    processDocument,
    isProcessing,
    progress,
  };
}