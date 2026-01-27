import { memo, useState, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  SectionConfig,
  SectionKey,
  SectionFormData,
  FieldConfig,
  DoseConfig,
} from '@/types/formConfig';
import { ExtractedDocumentData } from '@/types/formConfig';
import { extractTextFromImage, parseExtractedText, normalizeDate, matchManufacturer } from '@/utils/ocrExtractor';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  Calendar,
  Building2,
  Hash,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, addYears } from 'date-fns';

interface DynamicFormSectionProps {
  sectionKey: SectionKey;
  config: SectionConfig;
  onDataChange?: (data: SectionFormData) => void;
}

// Calculate expiry based on config
function calculateExpiry(startDate: string, expiryConfig?: SectionConfig['expiryDate']): string {
  if (!expiryConfig) return '';
  
  const date = new Date(startDate);
  if (expiryConfig.period) {
    if (expiryConfig.period.years) {
      date.setFullYear(date.getFullYear() + expiryConfig.period.years);
    }
    if (expiryConfig.period.months) {
      date.setMonth(date.getMonth() + expiryConfig.period.months);
    }
    if (expiryConfig.period.days) {
      date.setDate(date.getDate() + expiryConfig.period.days);
    }
  } else {
    // Default 1 year
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString().split('T')[0];
}

export const DynamicFormSection = memo(function DynamicFormSection({
  sectionKey,
  config,
  onDataChange,
}: DynamicFormSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  
  // Store form data in localStorage
  const [formData, setFormData] = useLocalStorage<SectionFormData>(
    `section_${sectionKey}`,
    {
      sectionKey,
      status: 'pending_upload',
      doses: config.doses?.filter(d => d.date.enabled).map(() => ({
        date: '',
        manufacturer: '',
        lotNumber: '',
        induration: '',
      })) || [],
    }
  );

  const updateFormData = useCallback((updates: Partial<SectionFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      onDataChange?.(newData);
      return newData;
    });
  }, [setFormData, onDataChange]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image (for OCR)
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
      setIsProcessing(true);
      setOcrProgress(0);
      
      try {
        toast.info('Extracting text from document...', { duration: 2000 });
        
        const text = await extractTextFromImage(file, setOcrProgress);
        const extracted = parseExtractedText(text);
        setExtractedData(extracted);
        
        // Auto-fill form based on extracted data
        const updates: Partial<SectionFormData> = {
          fileName: file.name,
          status: 'pending_review',
        };
        
        // Auto-fill dates
        if (extracted.dates.length > 0) {
          const normalizedDate = normalizeDate(extracted.dates[0]);
          if (normalizedDate) {
            updates.resultDate = normalizedDate;
            updates.expiryDate = calculateExpiry(normalizedDate, config.expiryDate);
          }
        }
        
        // Auto-fill doses if applicable
        if (config.doses && extracted.dates.length > 0) {
          const updatedDoses = [...(formData.doses || [])];
          extracted.dates.forEach((dateStr, i) => {
            if (i < updatedDoses.length) {
              const normalized = normalizeDate(dateStr);
              if (normalized) {
                updatedDoses[i] = {
                  ...updatedDoses[i],
                  date: normalized,
                  manufacturer: extracted.manufacturers[i] 
                    ? matchManufacturer(extracted.manufacturers[i]) 
                    : updatedDoses[i].manufacturer,
                  lotNumber: extracted.lotNumbers[i] || updatedDoses[i].lotNumber,
                };
              }
            }
          });
          updates.doses = updatedDoses;
        }
        
        updateFormData(updates);
        
        toast.success('Document analyzed!', {
          description: `Found ${extracted.dates.length} dates, ${extracted.manufacturers.length} manufacturers`,
        });
      } catch (error) {
        console.error('OCR Error:', error);
        toast.error('Failed to extract text', {
          description: 'Please fill in the details manually.',
        });
      } finally {
        setIsProcessing(false);
        setOcrProgress(0);
      }
    } else {
      // Non-image file - just store reference
      updateFormData({
        fileName: file.name,
        status: 'pending_review',
      });
      toast.success('Document uploaded');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [config.doses, config.expiryDate, formData.doses, updateFormData]);

  const handleDoseChange = useCallback((
    doseIndex: number,
    field: 'date' | 'manufacturer' | 'lotNumber' | 'induration',
    value: string
  ) => {
    const updatedDoses = [...(formData.doses || [])];
    if (!updatedDoses[doseIndex]) {
      updatedDoses[doseIndex] = { date: '', manufacturer: '', lotNumber: '', induration: '' };
    }
    updatedDoses[doseIndex] = { ...updatedDoses[doseIndex], [field]: value };
    
    // Auto-calculate expiry when first dose date is set
    if (field === 'date' && doseIndex === 0 && value) {
      updateFormData({
        doses: updatedDoses,
        expiryDate: calculateExpiry(value, config.expiryDate),
      });
    } else {
      updateFormData({ doses: updatedDoses });
    }
  }, [formData.doses, config.expiryDate, updateFormData]);

  if (!config.enabled) return null;

  const enabledDoses = config.doses?.filter(d => d.date.enabled) || [];

  return (
    <AccordionItem value={sectionKey} className="border-b last:border-b-0">
      <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-muted/50">
        <div className="flex items-center gap-3 w-full pr-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm flex-1 text-left">{config.label}</span>
          <Badge 
            variant={formData.status === 'approved' ? 'success' : formData.status === 'pending_review' ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {formData.status === 'approved' ? 'Complete' : 
             formData.status === 'pending_review' ? 'Pending' : 'Required'}
          </Badge>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-2">
          {/* File Upload with OCR */}
          {config.src?.enabled && (
            <Card className="border-dashed">
              <CardContent className="pt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {isProcessing ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-sm font-medium">Analyzing document...</p>
                    <Progress value={ocrProgress} className="mt-3 max-w-xs mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">{ocrProgress}% complete</p>
                  </div>
                ) : formData.fileName ? (
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{formData.fileName}</p>
                      <p className="text-xs text-muted-foreground">Document uploaded</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="text-center py-6 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">{config.src.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload an image to auto-extract details with AI
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-primary">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-xs">OCR Auto-Fill Enabled</span>
                    </div>
                  </div>
                )}
                
                {extractedData && (
                  <div className="mt-3 p-2 bg-success/10 rounded-lg">
                    <p className="text-xs font-medium text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Auto-extracted: {extractedData.dates.length} dates, {extractedData.manufacturers.length} manufacturers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Dose Fields (for vaccines) */}
          {enabledDoses.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Dose Information</Label>
              {enabledDoses.map((doseConfig, index) => (
                <Card key={index} className="border-l-4 border-l-primary bg-muted/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Dose {index + 1}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Date */}
                      {doseConfig.date.enabled && (
                        <div className="space-y-1.5">
                          <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {doseConfig.date.label}
                          </Label>
                          <Input
                            type="date"
                            value={formData.doses?.[index]?.date || ''}
                            onChange={(e) => handleDoseChange(index, 'date', e.target.value)}
                            className="bg-background"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      )}
                      
                      {/* Manufacturer */}
                      {doseConfig.manufacturer.enabled && (
                        <div className="space-y-1.5">
                          <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {doseConfig.manufacturer.label}
                          </Label>
                          <Input
                            value={formData.doses?.[index]?.manufacturer || ''}
                            onChange={(e) => handleDoseChange(index, 'manufacturer', e.target.value)}
                            placeholder="e.g., Pfizer, Moderna"
                            className="bg-background"
                          />
                        </div>
                      )}
                      
                      {/* Lot Number */}
                      {doseConfig.lotNumber.enabled && (
                        <div className="space-y-1.5">
                          <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Hash className="w-3 h-3" />
                            {doseConfig.lotNumber.label}
                          </Label>
                          <Input
                            value={formData.doses?.[index]?.lotNumber || ''}
                            onChange={(e) => handleDoseChange(index, 'lotNumber', e.target.value)}
                            placeholder="e.g., EL9262"
                            className="bg-background"
                          />
                        </div>
                      )}
                      
                      {/* Induration (for TB) */}
                      {doseConfig.induration?.enabled && (
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            {doseConfig.induration.label}
                          </Label>
                          <Input
                            value={formData.doses?.[index]?.induration || ''}
                            onChange={(e) => handleDoseChange(index, 'induration', e.target.value)}
                            placeholder="e.g., 0mm"
                            className="bg-background"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Result Date */}
          {config.resultDate?.enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{config.resultDate.label}</Label>
              <Input
                type="date"
                value={formData.resultDate || ''}
                onChange={(e) => {
                  const date = e.target.value;
                  updateFormData({
                    resultDate: date,
                    expiryDate: calculateExpiry(date, config.expiryDate),
                  });
                }}
                className="max-w-xs"
              />
            </div>
          )}

          {/* Expiry Date (auto-calculated, readonly) */}
          {config.expiryLogic?.enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                {config.expiryLogic.label}
                <span className="text-muted-foreground/60">(Auto-calculated)</span>
              </Label>
              <Input
                type="date"
                value={formData.expiryDate || ''}
                readOnly
                className="max-w-xs bg-muted cursor-not-allowed"
              />
            </div>
          )}

          {/* Test Type (Radio) */}
          {config.testType?.enabled && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{config.testType.label}</Label>
              <RadioGroup
                value={formData.testType || ''}
                onValueChange={(val) => updateFormData({ testType: val })}
                className="flex flex-wrap gap-4"
              >
                {config.testType.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${sectionKey}-${option}`} />
                    <Label htmlFor={`${sectionKey}-${option}`} className="font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Dose Type (Checkbox) */}
          {config.doseType?.enabled && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{config.doseType.label}</Label>
              <div className="flex flex-wrap gap-4">
                {config.doseType.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${sectionKey}-dose-${option}`}
                      checked={formData.doseType?.includes(option)}
                      onCheckedChange={(checked) => {
                        const current = formData.doseType || [];
                        updateFormData({
                          doseType: checked 
                            ? [...current, option]
                            : current.filter(d => d !== option)
                        });
                      }}
                    />
                    <Label htmlFor={`${sectionKey}-dose-${option}`} className="font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certification Fields */}
          {config.courseName?.enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{config.courseName.label}</Label>
              <Input
                value={formData.courseName || ''}
                onChange={(e) => updateFormData({ courseName: e.target.value })}
                placeholder="Enter course name"
              />
            </div>
          )}

          {config.courseType?.enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{config.courseType.label}</Label>
              <Select
                value={formData.courseType || ''}
                onValueChange={(val) => updateFormData({ courseType: val })}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {config.courseType.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {config.provider?.enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{config.provider.label}</Label>
              <Input
                value={formData.provider || ''}
                onChange={(e) => updateFormData({ provider: e.target.value })}
                placeholder="Enter provider name"
              />
            </div>
          )}

          {/* Licensure Fields */}
          {config.licenseNumber?.enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{config.licenseNumber.label}</Label>
              <Input
                value={formData.licenseNumber || ''}
                onChange={(e) => updateFormData({ licenseNumber: e.target.value })}
                placeholder="Enter license number"
              />
            </div>
          )}

          {config.stateOfLicense?.enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{config.stateOfLicense.label}</Label>
              <Select
                value={formData.stateOfLicense || ''}
                onValueChange={(val) => updateFormData({ stateOfLicense: val })}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {config.stateOfLicense.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          {config.text?.enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{config.text.label}</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => updateFormData({ notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});
