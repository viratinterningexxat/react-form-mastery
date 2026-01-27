import { memo, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, Syringe, Building2 } from 'lucide-react';
import { VaccineDose, VACCINE_MANUFACTURERS, calculateExpirationDate } from '@/types/credentialDetails';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays } from 'date-fns';

interface VaccineDoseFormProps {
  requirementId: string;
  doses: VaccineDose[];
  maxDoses?: number;
  onDosesChange: (doses: VaccineDose[]) => void;
  validityYears?: number; // Override 1 year default
}

export const VaccineDoseForm = memo(function VaccineDoseForm({
  requirementId,
  doses,
  maxDoses = 3,
  onDosesChange,
  validityYears = 1,
}: VaccineDoseFormProps) {
  const handleAddDose = useCallback(() => {
    if (doses.length >= maxDoses) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newDose: VaccineDose = {
      doseNumber: doses.length + 1,
      manufacturer: '',
      administrationDate: today,
      expirationDate: calculateExpirationDate(today),
      lotNumber: '',
    };
    onDosesChange([...doses, newDose]);
  }, [doses, maxDoses, onDosesChange]);

  const handleRemoveDose = useCallback((index: number) => {
    const updated = doses.filter((_, i) => i !== index)
      .map((dose, i) => ({ ...dose, doseNumber: i + 1 }));
    onDosesChange(updated);
  }, [doses, onDosesChange]);

  const handleDoseChange = useCallback((
    index: number,
    field: keyof VaccineDose,
    value: string | number
  ) => {
    const updated = doses.map((dose, i) => {
      if (i !== index) return dose;
      
      const updatedDose = { ...dose, [field]: value };
      
      // Auto-calculate expiration when administration date changes
      if (field === 'administrationDate' && typeof value === 'string') {
        const expDate = new Date(value);
        expDate.setFullYear(expDate.getFullYear() + validityYears);
        updatedDose.expirationDate = expDate.toISOString().split('T')[0];
      }
      
      return updatedDose;
    });
    onDosesChange(updated);
  }, [doses, onDosesChange, validityYears]);

  const getExpiryStatus = (expirationDate: string) => {
    const days = differenceInDays(parseISO(expirationDate), new Date());
    if (days < 0) return { variant: 'destructive' as const, text: 'Expired' };
    if (days <= 30) return { variant: 'warning' as const, text: `${days}d left` };
    if (days <= 90) return { variant: 'secondary' as const, text: `${days}d left` };
    return { variant: 'success' as const, text: 'Valid' };
  };

  return (
    <div className="space-y-4">
      {doses.map((dose, index) => {
        const expiryStatus = getExpiryStatus(dose.expirationDate);
        
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
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    Manufacturer
                  </Label>
                  <Select
                    value={dose.manufacturer}
                    onValueChange={(value) => handleDoseChange(index, 'manufacturer', value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {VACCINE_MANUFACTURERS.map((mfr) => (
                        <SelectItem key={mfr} value={mfr}>
                          {mfr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lot Number */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Lot Number (Optional)
                  </Label>
                  <Input
                    value={dose.lotNumber || ''}
                    onChange={(e) => handleDoseChange(index, 'lotNumber', e.target.value)}
                    placeholder="e.g., EL9262"
                    className="bg-background"
                  />
                </div>

                {/* Administration Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Administration Date
                  </Label>
                  <Input
                    type="date"
                    value={dose.administrationDate}
                    onChange={(e) => handleDoseChange(index, 'administrationDate', e.target.value)}
                    className="bg-background"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Expiration Date (Auto-calculated, readonly display) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Expiration Date
                    <span className="text-xs text-muted-foreground/70">(Auto: +{validityYears}yr)</span>
                  </Label>
                  <Input
                    type="date"
                    value={dose.expirationDate}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {doses.length < maxDoses && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddDose}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dose {doses.length + 1}
        </Button>
      )}

      {doses.length === 0 && (
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
    </div>
  );
});
