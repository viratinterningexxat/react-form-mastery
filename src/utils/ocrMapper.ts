import { ExtractedDocumentData, MappedFieldData } from '@/types/formConfig';
import { normalizeDate, matchManufacturer } from './ocrExtractor';

export function mapExtractedDataToFields(extractedData: ExtractedDocumentData): MappedFieldData {
  const mapped: MappedFieldData = {};

  // Map dose/result date (usually the most recent or first found date)
  if (extractedData.dates.length > 0) {
    const normalized = normalizeDate(extractedData.dates[0]);
    if (normalized) {
      mapped.resultDate = normalized;
    }
  }

  // Map lot number
  if (extractedData.lotNumbers.length > 0) {
    mapped.lotNumber = extractedData.lotNumbers[0];
  }

  // Map manufacturer
  if (extractedData.manufacturers.length > 0) {
    mapped.manufacturer = matchManufacturer(extractedData.manufacturers[0]);
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