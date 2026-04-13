import { memo, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, Syringe, Building2, Hash, Eye, EyeOff } from 'lucide-react';
import { DoseConfiguration, DynamicFieldConfig } from '@/types/enhancedConfig';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays } from 'date-fns';

interface EnhancedVaccineDose {
  [key: string]: string | number | boolean;
  doseNumber: number;
}

interface EnhancedVaccineFormProps {
  requirementId: string;
  doses: EnhancedVaccineDose[];
  config: DoseConfiguration;
  documentType: string;
  onDosesChange: (doses: EnhancedVaccineDose[]) => void;
  validityYears?: number;
}

export const EnhancedVaccineForm = memo(function EnhancedVaccineForm({
  requirementId,
  doses,
  config,
  documentType,
  onDosesChange,
  validityYears = 1,
}: EnhancedVaccineFormProps) {
  const [localDoses, setLocalDoses] = useState<EnhancedVaccineDose[]>(doses);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalDoses(doses);
  }, [doses]);

  const handleAddDose = useCallback(() => {
    if (localDoses.length >= config.count.max) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newDose: EnhancedVaccineDose = {
      doseNumber: localDoses.length + 1,
    };
    
    // Initialize all enabled fields with default values
    config.fields.forEach(field => {
      if (field.enabled) {
        if (field.key === 'date') {
          newDose[field.key] = today;
        } else if (field.type === 'date') {
          newDose[field.key] = '';
        } else if (field.type === 'number') {
          newDose[field.key] = '';
        } else {
          newDose[field.key] = '';
        }
      }
    });
    
    const updatedDoses = [...localDoses, newDose];
    setLocalDoses(updatedDoses);
    onDosesChange(updatedDoses);
  }, [localDoses, config, onDosesChange]);

  const handleRemoveDose = useCallback((index: number) => {
    const updated = localDoses.filter((_, i) => i !== index)
      .map((dose, i) => ({ ...dose, doseNumber: i + 1 }));
    setLocalDoses(updated);
    onDosesChange(updated);
  }, [localDoses, onDosesChange]);

  const handleDoseChange = useCallback((
    index: number,
    fieldKey: string,
    value: string
  ) => {
    const updated = localDoses.map((dose, i) => {
      if (i !== index) return dose;
      
      const updatedDose = { ...dose, [fieldKey]: value };
      
      // Auto-calculate expiration when administration date changes
      if (fieldKey === 'date' && value) {
        const expDate = new Date(value);
        expDate.setFullYear(expDate.getFullYear() + validityYears);
        // Store in a separate field or handle as needed
      }
      
      return updatedDose;
    });
    
    setLocalDoses(updated);
    onDosesChange(updated);
  }, [localDoses, onDosesChange, validityYears]);

  const getExpiryStatus = (dateValue: string) => {
    if (!dateValue) return { variant: 'secondary' as const, text: 'No date' };
    const days = differenceInDays(parseISO(dateValue), new Date());
    if (days < 0) return { variant: 'destructive' as const, text: 'Expired' };
    if (days <= 30) return { variant: 'warning' as const, text: `${days}d left` };
    if (days <= 90) return { variant: 'secondary' as const, text: `${days}d left` };
    return { variant: 'success' as const, text: 'Valid' };
  };

  const shouldShowField = (field: DynamicFieldConfig): boolean => {
    // Check visibility rules based on document type
    if (field.key === 'induration') {
      return documentType === 'TB';
    }
    
    // Check custom visibility rules
    if (field.visibilityRules) {
      return field.visibilityRules.some(rule => {
        if (rule.showWhen.documentType) {
          return rule.showWhen.documentType === documentType;
        }
        return true;
      });
    }
    
    return field.enabled;
  };

  const renderField = (field: DynamicFieldConfig, dose: EnhancedVaccineDose, index: number) => {
    if (!shouldShowField(field)) return null;

    const value = dose[field.key] || '';
    const isRequired = field.required;

    const baseProps = {
      id: `${requirementId}-${index}-${field.key}`,
      value: String(value),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleDoseChange(index, field.key, e.target.value),
      required: isRequired,
      className: cn("bg-background", isRequired && "border-destructive"),
    };

    switch (field.type) {
      case 'date':
        return (
          <div className="space-y-2" key={field.key}>
            <Label 
              htmlFor={baseProps.id} 
              className={cn(
                "text-xs font-medium text-muted-foreground",
                isRequired && "text-destructive"
              )}
            >
              {field.label}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              {...baseProps}
              type="date"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2" key={field.key}>
            <Label 
              htmlFor={baseProps.id} 
              className={cn(
                "text-xs font-medium text-muted-foreground",
                isRequired && "text-destructive"
              )}
            >
              {field.label}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={String(value)}
              onValueChange={(val) => handleDoseChange(index, field.key, val)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2" key={field.key}>
            <Label 
              htmlFor={baseProps.id} 
              className={cn(
                "text-xs font-medium text-muted-foreground",
                isRequired && "text-destructive"
              )}
            >
              {field.label}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              {...baseProps}
              type="number"
              placeholder={field.placeholder}
            />
          </div>
        );

      default: // text, textarea
        return (
          <div className="space-y-2" key={field.key}>
            <Label 
              htmlFor={baseProps.id} 
              className={cn(
                "text-xs font-medium text-muted-foreground",
                isRequired && "text-destructive"
              )}
            >
              {field.label}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              {...baseProps}
              placeholder={field.placeholder}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {localDoses.map((dose, index) => {
        const expiryStatus = dose.date ? getExpiryStatus(String(dose.date)) : 
          { variant: 'secondary' as const, text: 'No date' };
        
        return (
          <Card key={index} className="border-l-4 border-l-primary bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Dose {dose.doseNumber}</span>
                  <Badge variant={expiryStatus.variant} className="text-xs">
                    {expiryStatus.text}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveDose(index)}
                  disabled={localDoses.length <= config.count.min}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.fields.map(field => renderField(field, dose, index))}
              </div>

              {/* Visibility indicators for special fields */}
              {dose.induration && documentType === 'TB' && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <Eye className="w-4 h-4 inline mr-1" />
                  Induration recorded: {dose.induration}mm
                </div>
              )}
              
              {documentType !== 'TB' && config.fields.some(f => f.key === 'induration' && f.enabled) && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  <EyeOff className="w-4 h-4 inline mr-1" />
                  Induration field hidden for {documentType} documents
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {localDoses.length < config.count.max && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddDose}
          className="w-full border-dashed"
          disabled={localDoses.length >= config.count.max}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dose {localDoses.length + 1}
        </Button>
      )}

      {localDoses.length === 0 && (
        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
          <Syringe className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No doses recorded yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddDose}
            className="mt-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record First Dose
          </Button>
        </div>
      )}

      {/* Configuration Info */}
      <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
        <p className="font-medium mb-1">Current Configuration:</p>
        <p>Dose Range: {config.count.min} - {config.count.max} doses</p>
        <p>Document Type: {documentType}</p>
        <p>Enabled Fields: {config.fields.filter(f => shouldShowField(f)).length}/{config.fields.length}</p>
      </div>
    </div>
  );
});