import { useState, useCallback } from 'react';
import { extractTextFromImage, parseExtractedText } from '@/utils/ocrExtractor';
import { ExtractedDocumentData } from '@/types/formConfig';
import { toast } from 'sonner';

interface UseDocumentProcessorOptions {
  onDataExtracted?: (data: Partial<Record<string, any>>) => void;
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

function mapExtractedDataToFields(extractedData: ExtractedDocumentData): Partial<Record<string, any>> {
  const mapped: Partial<Record<string, any>> = {};

  if (extractedData.expiryDate) {
    mapped.expiryDate = extractedData.expiryDate;
  }

  if (extractedData.doseDate) {
    mapped.resultDate = extractedData.doseDate;
  }

  if (extractedData.lotNumber) {
    mapped.lotNumber = extractedData.lotNumber;
  }

  if (extractedData.manufacturer) {
    mapped.manufacturer = extractedData.manufacturer;
  }

  // Add more mappings as needed

  return mapped;
}