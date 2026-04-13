import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Eye, 
  EyeOff, 
  Calendar,
  Hash,
  Building2,
  Syringe
} from 'lucide-react';
import { DoseConfiguration, DynamicFieldConfig, ExpiryCalculationRule } from '@/types/enhancedConfig';
import { cn } from '@/lib/utils';

interface EnhancedVaccineConfigProps {
  config: DoseConfiguration;
  onConfigChange: (config: DoseConfiguration) => void;
  documentType: string;
}

export function EnhancedVaccineConfig({
  config,
  onConfigChange,
  documentType
}: EnhancedVaccineConfigProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateConfig = useCallback((updates: Partial<DoseConfiguration>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  const addField = useCallback(() => {
    const newField: DynamicFieldConfig = {
      key: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      enabled: true,
      required: false
    };
    updateConfig({
      fields: [...config.fields, newField]
    });
  }, [config.fields, updateConfig]);

  const updateField = useCallback((index: number, updates: Partial<DynamicFieldConfig>) => {
    const updatedFields = [...config.fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    updateConfig({ fields: updatedFields });
  }, [config.fields, updateConfig]);

  const removeField = useCallback((index: number) => {
    const updatedFields = config.fields.filter((_, i) => i !== index);
    updateConfig({ fields: updatedFields });
  }, [config.fields, updateConfig]);

  const shouldShowInduration = documentType === 'TB';

  return (
    <div className="space-y-6">
      {/* Dose Count Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Syringe className="w-5 h-5" />
            Dose Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Minimum Doses</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={config.count.min}
                onChange={(e) => updateConfig({
                  count: { ...config.count, min: parseInt(e.target.value) || 1 }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Doses</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={config.count.max}
                onChange={(e) => updateConfig({
                  count: { ...config.count, max: parseInt(e.target.value) || 4 }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Doses</Label>
              <Input
                type="number"
                min={config.count.min}
                max={config.count.max}
                value={config.count.default}
                onChange={(e) => updateConfig({
                  count: { ...config.count, default: parseInt(e.target.value) || 2 }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Field Configuration
            </div>
            <Button onClick={addField} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {config.fields.map((field, index) => (
              <Card key={field.key} className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {field.enabled ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{field.label}</span>
                      <Badge variant="secondary">{field.type}</Badge>
                      {field.required && <Badge variant="destructive">Required</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(editingField === field.key ? null : field.key)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {editingField === field.key && (
                    <div className="space-y-3 pt-3 border-t border-muted">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            placeholder="Field label"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value: any) => updateField(index, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="radio">Radio</SelectItem>
                              <SelectItem value="file">File</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.enabled}
                            onCheckedChange={(checked) => updateField(index, { enabled: checked })}
                          />
                          <Label>Enabled</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(index, { required: checked })}
                          />
                          <Label>Required</Label>
                        </div>
                      </div>

                      {(field.type === 'select' || field.type === 'radio') && (
                        <div className="space-y-2">
                          <Label>Options (comma separated)</Label>
                          <Input
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(index, {
                              options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                            })}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}

                      {field.type === 'text' && (
                        <div className="space-y-2">
                          <Label>Placeholder</Label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                            placeholder="Enter placeholder text"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conditional visibility indicator */}
                  {field.key === 'induration' && !shouldShowInduration && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <EyeOff className="w-4 h-4 inline mr-1" />
                      This field will be hidden for {documentType} documents
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Type Specific Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Conditional Visibility Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">Induration Field</span>
                <Badge variant={shouldShowInduration ? "success" : "secondary"}>
                  {shouldShowInduration ? "Visible for TB" : "Hidden for " + documentType}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                Only shown when document type is TB
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Current rules:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Induration field shows only for TB documents</li>
                <li>All other fields are visible for all document types</li>
                <li>Dose count can be configured between {config.count.min}-{config.count.max} doses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}