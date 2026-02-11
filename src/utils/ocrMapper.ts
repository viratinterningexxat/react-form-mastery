import { ExtractedDocumentData } from '@/types/formConfig';

export function mapExtractedDataToFields(extractedData: ExtractedDocumentData): Partial<Record<string, any>> {
  const mapped: Partial<Record<string, any>> = {};

  // Map expiry date
  if (extractedData.expiryDate) {
    mapped.expiryDate = extractedData.expiryDate;
  }

  // Map dose/result date
  if (extractedData.doseDate) {
    mapped.resultDate = extractedData.doseDate;
  }

  // Map lot number
  if (extractedData.lotNumber) {
    mapped.lotNumber = extractedData.lotNumber;
  }

  // Map manufacturer
  if (extractedData.manufacturer) {
    mapped.manufacturer = extractedData.manufacturer;
  }

  // Map dose number if available
  if (extractedData.doseNumber) {
    mapped.doseNumber = extractedData.doseNumber;
  }

  return mapped;
}

export function mapFieldToOcrKey(field: string): string | null {
  const mapping: Record<string, string> = {
    expiryDate: 'OCR_EXPIRY_DATE',
    resultDate: 'OCR_DOSE_DATE',
    doseNumber: 'OCR_DOSE_NUMBER',
    lotNumber: 'OCR_LOT_NUMBER',
    manufacturer: 'OCR_MANUFACTURER',
  };

  return mapping[field] || null;
}