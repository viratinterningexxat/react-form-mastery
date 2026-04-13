import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  EyeOff, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { DocumentTypeConfig, ExpiryCalculationRule } from '@/types/enhancedConfig';

interface DocumentTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  configs: DocumentTypeConfig[];
  onConfigUpdate: (type: string, config: DocumentTypeConfig) => void;
}

export function DocumentTypeSelector({
  selectedType,
  onTypeChange,
  configs,
  onConfigUpdate
}: DocumentTypeSelectorProps) {
  const [editingType, setEditingType] = useState<string | null>(null);
  const currentConfig = configs.find(config => config.type === selectedType);

  const updateConfig = useCallback((type: string, updates: Partial<DocumentTypeConfig>) => {
    const config = configs.find(c => c.type === type);
    if (config) {
      onConfigUpdate(type, { ...config, ...updates });
    }
  }, [configs, onConfigUpdate]);

  const addNewType = useCallback(() => {
    const newType: DocumentTypeConfig = {
      type: `custom_${Date.now()}`,
      name: 'New Document Type',
      defaultDoseCount: 2,
      showInduration: false,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 1 }
      },
      boosterRequired: false,
      specialFields: []
    };
    // In a real implementation, you'd add this to the configs array
    console.log('New type would be added:', newType);
  }, []);

  const predefinedTypes = [
    { type: 'TB', name: 'Tuberculosis', showInduration: true, defaultDoseCount: 2 },
    { type: 'HepB', name: 'Hepatitis B', showInduration: false, defaultDoseCount: 3 },
    { type: 'Flu', name: 'Influenza', showInduration: false, defaultDoseCount: 1 },
    { type: 'Covid', name: 'COVID-19', showInduration: false, defaultDoseCount: 2 },
    { type: 'MMR', name: 'Measles, Mumps, Rubella', showInduration: false, defaultDoseCount: 2 },
    { type: 'Varicella', name: 'Chickenpox', showInduration: false, defaultDoseCount: 2 },
    { type: 'TDAP', name: 'Tetanus/Diphtheria/Pertussis', showInduration: false, defaultDoseCount: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Document Type Configuration
            </div>
            <Button onClick={addNewType} variant="outline" size="sm">
              Add Custom Type
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Document Type</Label>
              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a document type" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedTypes.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      <div className="flex items-center gap-2">
                        <span>{type.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {type.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentConfig && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {currentConfig.showInduration ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">Induration Field</span>
                    <Badge variant={currentConfig.showInduration ? "success" : "secondary"}>
                      {currentConfig.showInduration ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Default Doses</span>
                    <Badge variant="outline">{currentConfig.defaultDoseCount}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Booster Required</span>
                    <Badge variant={currentConfig.boosterRequired ? "destructive" : "secondary"}>
                      {currentConfig.boosterRequired ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium mb-2">Expiry Logic:</p>
                    <p className="text-muted-foreground">
                      Based on: {currentConfig.expiryLogic.basedOn}
                    </p>
                    <p className="text-muted-foreground">
                      Period: {currentConfig.expiryLogic.period?.years || 0} years
                    </p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium mb-2">Special Fields:</p>
                    {currentConfig.specialFields.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {currentConfig.specialFields.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Editor */}
      {currentConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configure {currentConfig.name}
              </div>
              <Button
                variant={editingType === selectedType ? "default" : "outline"}
                size="sm"
                onClick={() => setEditingType(editingType === selectedType ? null : selectedType)}
              >
                {editingType === selectedType ? "Done" : "Edit"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingType === selectedType ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <input
                      type="text"
                      value={currentConfig.name}
                      onChange={(e) => updateConfig(selectedType, { name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Document type name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default Dose Count</Label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={currentConfig.defaultDoseCount}
                      onChange={(e) => updateConfig(selectedType, { defaultDoseCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={currentConfig.showInduration}
                      onCheckedChange={(checked) => updateConfig(selectedType, { showInduration: checked })}
                    />
                    <Label>Show Induration Field</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={currentConfig.boosterRequired}
                      onCheckedChange={(checked) => updateConfig(selectedType, { boosterRequired: checked })}
                    />
                    <Label>Booster Required</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Fields (comma separated)</Label>
                  <input
                    type="text"
                    value={currentConfig.specialFields.join(', ')}
                    onChange={(e) => updateConfig(selectedType, {
                      specialFields: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="field1, field2, field3"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Click "Edit" to configure document type settings</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Current Visibility Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">TB Documents</span>
              </div>
              <span className="text-sm text-green-700">Show induration field</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Other Documents</span>
              </div>
              <span className="text-sm text-blue-700">Hide induration field</span>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Active rules for {selectedType || 'selected document'}:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Induration field visibility: {currentConfig?.showInduration ? 'Visible' : 'Hidden'}</li>
                <li>Default dose count: {currentConfig?.defaultDoseCount || 'N/A'}</li>
                <li>Booster requirement: {currentConfig?.boosterRequired ? 'Required' : 'Optional'}</li>
                <li>Expiry calculation: Based on {currentConfig?.expiryLogic.basedOn || 'N/A'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}