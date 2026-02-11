import { useState, useCallback } from 'react';
import { extractTextFromImage, parseExtractedText } from '@/utils/ocrExtractor';
import { ExtractedDocumentData } from '@/types/formConfig';

interface BatchProcessingResult {
  file: File;
  success: boolean;
  data?: ExtractedDocumentData;
  error?: string;
  progress: number;
}

interface UseBatchDocumentProcessorOptions {
  onBatchComplete?: (results: BatchProcessingResult[]) => void;
  onProgress?: (completed: number, total: number) => void;
}

export function useBatchDocumentProcessor(options: UseBatchDocumentProcessorOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchProcessingResult[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const processBatch = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setResults([]);
    setOverallProgress(0);

    const batchResults: BatchProcessingResult[] = [];
    let completed = 0;

    for (const file of files) {
      const result: BatchProcessingResult = {
        file,
        success: false,
        progress: 0,
      };

      try {
        // Validate file
        if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
          throw new Error('Invalid file type. Only images and PDFs are supported.');
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error('File size exceeds 10MB limit.');
        }

        // Process file
        const extractedText = await extractTextFromImage(file, (progress) => {
          result.progress = progress;
          setResults(prev => {
            const updated = prev.map(r => r.file === file ? result : r);
            if (updated.length === 0) updated.push(result);
            return updated;
          });
        });

        const extractedData = parseExtractedText(extractedText);

        result.success = true;
        result.data = extractedData;

      } catch (error) {
        result.success = false;
        result.error = error instanceof Error ? error.message : 'Unknown error occurred';
      }

      batchResults.push(result);
      completed++;
      setOverallProgress((completed / files.length) * 100);
      options.onProgress?.(completed, files.length);
    }

    setResults(batchResults);
    setIsProcessing(false);
    options.onBatchComplete?.(batchResults);
  }, [options]);

  const clearResults = useCallback(() => {
    setResults([]);
    setOverallProgress(0);
  }, []);

  return {
    processBatch,
    clearResults,
    isProcessing,
    results,
    overallProgress,
  };
}