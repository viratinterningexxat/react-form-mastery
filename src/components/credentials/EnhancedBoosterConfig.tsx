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
  Calendar,
  Hash,
  Building2,
  RotateCcw
} from 'lucide-react';
import { BoosterConfiguration, DynamicFieldConfig, ExpiryCalculationRule } from '@/types/enhancedConfig';
import { cn } from '@/lib/utils';

interface EnhancedBoosterConfigProps {
  config: BoosterConfiguration;
  onConfigChange: (config: BoosterConfiguration) => void;
}

export function EnhancedBoosterConfig({
  config,
  onConfigChange
}: EnhancedBoosterConfigProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateConfig = useCallback((updates: Partial<BoosterConfiguration>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  const addField = useCallback(() => {
    const newField: DynamicFieldConfig = {
      key: `booster_field_${Date.now()}`,
      type: 'text',
      label: 'New Booster Field',
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

  const updateExpiryLogic = useCallback((updates: Partial<ExpiryCalculationRule>) => {
    const newExpiryLogic = { ...config.expiryLogic, ...updates };
    updateConfig({ expiryLogic: newExpiryLogic });
  }, [config.expiryLogic, updateConfig]);

  return (
    <div className="space-y-6">
      {/* Booster Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Booster Configuration
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="booster-toggle">Enable Booster</Label>
              <Switch
                id="booster-toggle"
                checked={config.enabled}
                onCheckedChange={(checked) => updateConfig({ enabled: checked })}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!config.enabled ? (
            <div className="text-center py-6 text-muted-foreground">
              <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Booster section is disabled</p>
              <p className="text-sm">Enable to configure booster requirements</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Booster Doses</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={config.doseCount}
                    onChange={(e) => updateConfig({ doseCount: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booster Fields Configuration */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Booster Fields
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booster Expiry Logic */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booster Expiry Logic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Based On</Label>
                  <Select
                    value={config.expiryLogic?.basedOn || 'boosterDate'}
                    onValueChange={(value: any) => updateExpiryLogic({ basedOn: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boosterDate">Booster Date</SelectItem>
                      <SelectItem value="lastDoseDate">Last Dose Date</SelectItem>
                      <SelectItem value="resultDate">Result Date</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Years</Label>
                  <Input
                    type="number"
                    min="0"
                    value={config.expiryLogic?.period?.years || 1}
                    onChange={(e) => updateExpiryLogic({
                      period: { ...config.expiryLogic?.period, years: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Expiry will be calculated as:</p>
                <p className="font-mono bg-muted p-2 rounded mt-1">
                  {config.expiryLogic?.basedOn} + {config.expiryLogic?.period?.years || 1} years
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}