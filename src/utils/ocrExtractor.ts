import Tesseract from 'tesseract.js';
import { ExtractedDocumentData } from '@/types/formConfig';

// Common vaccine manufacturer patterns
const MANUFACTURER_PATTERNS = [
  'pfizer', 'moderna', 'johnson', 'j&j', 'janssen',
  'astrazeneca', 'novavax', 'merck', 'gsk', 'glaxosmithkline',
  'sanofi', 'seqirus', 'csl', 'biotech', 'biontech'
];

// Date patterns (multiple formats)
const DATE_PATTERNS = [
  /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/g, // MM/DD/YYYY or DD/MM/YYYY
  /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/g,   // YYYY-MM-DD
  /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/gi,
  /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/gi,
];

// Lot number patterns
const LOT_NUMBER_PATTERNS = [
  /lot[:\s#]*([a-z0-9]{4,12})/gi,
  /batch[:\s#]*([a-z0-9]{4,12})/gi,
  /\b([A-Z]{2}\d{4,8})\b/g, // Common lot format like EL9262
];

/**
 * Extract text from an image file using Tesseract OCR
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const result = await Tesseract.recognize(
          reader.result as string,
          'eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text' && onProgress) {
                onProgress(Math.round(m.progress * 100));
              }
            },
          }
        );
        resolve(result.data.text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Parse extracted text to find relevant vaccine/medical data
 */
export function parseExtractedText(text: string): ExtractedDocumentData {
  const normalizedText = text.toLowerCase();
  
  // Extract dates
  const dates: string[] = [];
  DATE_PATTERNS.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      dates.push(match[0]);
    }
  });

  // Extract manufacturers
  const manufacturers: string[] = [];
  MANUFACTURER_PATTERNS.forEach(mfr => {
    if (normalizedText.includes(mfr)) {
      // Capitalize properly
      const properName = mfr.charAt(0).toUpperCase() + mfr.slice(1);
      if (!manufacturers.includes(properName)) {
        manufacturers.push(properName);
      }
    }
  });

  // Extract lot numbers
  const lotNumbers: string[] = [];
  LOT_NUMBER_PATTERNS.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && !lotNumbers.includes(match[1])) {
        lotNumbers.push(match[1].toUpperCase());
      }
    }
  });

  // Extract names (simple pattern for names after common labels)
  const names: string[] = [];
  const namePatterns = [
    /patient[:\s]+([a-z]+\s+[a-z]+)/gi,
    /name[:\s]+([a-z]+\s+[a-z]+)/gi,
    /recipient[:\s]+([a-z]+\s+[a-z]+)/gi,
  ];
  namePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) names.push(match[1]);
    }
  });

  // Extract any numbers that might be relevant (IDs, etc.)
  const numbers: string[] = [];
  const numberPattern = /\b\d{6,12}\b/g;
  const numberMatches = text.matchAll(numberPattern);
  for (const match of numberMatches) {
    numbers.push(match[0]);
  }

  return {
    dates: [...new Set(dates)].slice(0, 5),
    manufacturers: [...new Set(manufacturers)],
    lotNumbers: [...new Set(lotNumbers)].slice(0, 5),
    names: [...new Set(names)],
    numbers: [...new Set(numbers)].slice(0, 5),
    rawText: text,
  };
}

/**
 * Smart date parser - converts various date formats to YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string | null {
  try {
    // Try parsing with Date
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    
    // Manual parsing for common formats
    const mmddyyyy = dateStr.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (mmddyyyy) {
      const [_, m, d, y] = mmddyyyy;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Map extracted manufacturer to standard list
 */
export function matchManufacturer(extracted: string): string {
  const normalized = extracted.toLowerCase();
  
  const mapping: Record<string, string> = {
    'pfizer': 'Pfizer-BioNTech',
    'biontech': 'Pfizer-BioNTech',
    'moderna': 'Moderna',
    'johnson': 'Johnson & Johnson',
    'janssen': 'Johnson & Johnson',
    'j&j': 'Johnson & Johnson',
    'astrazeneca': 'AstraZeneca',
    'novavax': 'Novavax',
    'merck': 'Merck',
    'gsk': 'GlaxoSmithKline (GSK)',
    'glaxosmithkline': 'GlaxoSmithKline (GSK)',
    'sanofi': 'Sanofi Pasteur',
    'seqirus': 'Seqirus',
    'csl': 'CSL Limited',
  };
  
  for (const [key, value] of Object.entries(mapping)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return extracted;
}
