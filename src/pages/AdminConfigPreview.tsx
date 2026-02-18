import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getRequirementConfig } from '@/utils/getRequirementConfig';
import { BaseConfig, BaseFieldConfig } from '@/types/RequirementConfig';
import {
  Settings,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Save,
  RotateCcw,
  Workflow,
  Calendar,
  FileText,
  Shield,
  TestTube,
  Stethoscope,
  GraduationCap,
  Award,
  FileCheck,
  AlertTriangle,
  Activity,
  Pill
} from 'lucide-react';

const SECTION_ICONS = {
  vaccine: Shield,
  booster: Pill,
  titer: TestTube,
  repeatTiter: TestTube,
  bloodTest: Activity,
  chestXray: Stethoscope,
  symptomScrn: AlertTriangle,
  certification: Award,
  licensure: FileCheck,
  hisummary: FileText,
  decline: XCircle,
  historyOfDisease: Activity,
  otherTiter: TestTube
};

const SECTION_LABELS = {
  vaccine: 'Vaccination',
  booster: 'Booster/Revaccination',
  titer: 'Titer Tests',
  repeatTiter: 'Repeat Titer Tests',
  bloodTest: 'Blood Tests',
  chestXray: 'Chest X-Ray',
  symptomScrn: 'Symptom Screening',
  certification: 'Certification',
  licensure: 'Licensure',
  hisummary: 'Health Immunization Summary',
  decline: 'Declination',
  historyOfDisease: 'History of Disease',
  otherTiter: 'Other Titer Tests'
};

export default function AdminConfigPreview() {
  const [config, setConfig] = useState<BaseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getRequirementConfig();
        setConfig(data);
      } catch (error) {
        console.error('Failed to load config:', error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const updateSectionEnabled = (sectionName: string, enabled: boolean) => {
    if (!config) return;
    setConfig(prev => prev ? {
      ...prev,
      [sectionName]: {
        ...prev[sectionName as keyof BaseConfig],
        enabled
      }
    } : null);
    setHasChanges(true);
  };

  const updateSectionLabel = (sectionName: string, label: string) => {
    if (!config) return;
    setConfig(prev => prev ? {
      ...prev,
      [sectionName]: {
        ...prev[sectionName as keyof BaseConfig],
        label
      }
    } : null);
    setHasChanges(true);
  };

  const updateFieldConfig = (sectionName: string, fieldName: string, updates: Partial<BaseFieldConfig>) => {
    if (!config) return;
    const section = config[sectionName as keyof BaseConfig] as Record<string, unknown>;
    if (!section || !section[fieldName]) return;

    setConfig(prev => prev ? {
      ...prev,
      [sectionName]: {
        ...prev[sectionName as keyof BaseConfig],
        [fieldName]: {
          ...section[fieldName],
          ...updates
        }
      }
    } : null);
    setHasChanges(true);
  };

  const updateDoseConfig = (sectionName: string, doseIndex: number, fieldName: string, updates: Partial<BaseFieldConfig>) => {
    if (!config) return;
    const section = config[sectionName as keyof BaseConfig] as Record<string, unknown>;
    if (!section || !section.doses || !Array.isArray(section.doses) || !section.doses[doseIndex] || !(section.doses[doseIndex] as Record<string, unknown>)[fieldName]) return;

    setConfig(prev => {
      if (!prev) return null;
      const newConfig = { ...prev };
      const sectionCopy = { ...newConfig[sectionName as keyof BaseConfig] } as Record<string, unknown>;
      const dosesCopy = [...(sectionCopy.doses as unknown[])];
      dosesCopy[doseIndex] = {
        ...dosesCopy[doseIndex],
        [fieldName]: {
          ...(dosesCopy[doseIndex] as Record<string, unknown>)[fieldName],
          ...updates
        }
      };
      sectionCopy.doses = dosesCopy;
      newConfig[sectionName as keyof BaseConfig] = sectionCopy;
      return newConfig;
    });
    setHasChanges(true);
  };

  const addDose = (sectionName: string) => {
    if (!config) return;
    const section = config[sectionName as keyof BaseConfig] as any;
    if (!section || !section.doses) return;

    const newDose = {
      date: { controlType: 'datePicker', enabled: true, label: `Dose ${section.doses.length + 1} Date`, required: false },
      lotNumber: { controlType: 'textBox', enabled: true, label: `Dose ${section.doses.length + 1} Lot Number`, required: false },
      manufacturer: { controlType: 'textBox', enabled: true, label: `Dose ${section.doses.length + 1} Manufacturer`, required: false }
    };

    setConfig(prev => {
      if (!prev) return null;
      const newConfig = { ...prev };
      const sectionCopy = { ...newConfig[sectionName as keyof BaseConfig] } as any;
      sectionCopy.doses = [...sectionCopy.doses, newDose];
      newConfig[sectionName as keyof BaseConfig] = sectionCopy;
      return newConfig;
    });
    setHasChanges(true);
  };

  const removeDose = (sectionName: string, doseIndex: number) => {
    if (!config) return;
    const section = config[sectionName as keyof BaseConfig] as any;
    if (!section || !section.doses || section.doses.length <= 1) return;

    setConfig(prev => {
      if (!prev) return null;
      const newConfig = { ...prev };
      const sectionCopy = { ...newConfig[sectionName as keyof BaseConfig] } as any;
      sectionCopy.doses = sectionCopy.doses.filter((_: unknown, index: number) => index !== doseIndex);
      newConfig[sectionName as keyof BaseConfig] = sectionCopy;
      return newConfig;
    });
    setHasChanges(true);
  };

  const saveConfig = () => {
    // In a real app, this would save to backend
    console.log('Saving config:', config);
    setHasChanges(false);
    // TODO: Implement actual save functionality
  };

  const resetConfig = () => {
    // Reload from file
    const loadConfig = async () => {
      try {
        const data = await getRequirementConfig();
        setConfig(data);
        setHasChanges(false);
      } catch (error) {
        console.error('Failed to reload config:', error);
      }
    };
    loadConfig();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading configuration...</div>;
  }

  if (!config) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Credential Intelligence Engine</h1>
          <Badge variant="outline">{config.name}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && <Badge variant="destructive">Unsaved Changes</Badge>}
          <Button variant="outline" onClick={resetConfig} disabled={!hasChanges}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveConfig} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Config
          </Button>
        </div>
      </div>

      {/* Global Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Global Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Configuration Name</Label>
              <Input value={config.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={config.category} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <Input value={config.version} readOnly />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={config.required} disabled />
            <Label>Required Configuration</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={config.workflow.auto} disabled />
            <Label>Auto Workflow</Label>
          </div>
        </CardContent>
      </Card>

      {/* Section Configuration */}
      <Tabs defaultValue="vaccine" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="vaccine">Vaccine</TabsTrigger>
          <TabsTrigger value="titer">Titer</TabsTrigger>
          <TabsTrigger value="certification">Cert</TabsTrigger>
          <TabsTrigger value="licensure">License</TabsTrigger>
          <TabsTrigger value="screening">Screening</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Vaccine Tab */}
        <TabsContent value="vaccine" className="space-y-4">
          <SectionConfig
            config={config}
            sectionName="vaccine"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
            onUpdateDose={updateDoseConfig}
            onAddDose={addDose}
            onRemoveDose={removeDose}
          />
          <SectionConfig
            config={config}
            sectionName="booster"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
            onUpdateDose={updateDoseConfig}
            onAddDose={addDose}
            onRemoveDose={removeDose}
          />
        </TabsContent>

        {/* Titer Tab */}
        <TabsContent value="titer" className="space-y-4">
          <SectionConfig
            config={config}
            sectionName="titer"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
          <SectionConfig
            config={config}
            sectionName="repeatTiter"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
          <SectionConfig
            config={config}
            sectionName="otherTiter"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
        </TabsContent>

        {/* Certification Tab */}
        <TabsContent value="certification" className="space-y-4">
          <SectionConfig
            config={config}
            sectionName="certification"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
        </TabsContent>

        {/* Licensure Tab */}
        <TabsContent value="licensure" className="space-y-4">
          <SectionConfig
            config={config}
            sectionName="licensure"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
        </TabsContent>

        {/* Screening Tab */}
        <TabsContent value="screening" className="space-y-4">
          <SectionConfig
            config={config}
            sectionName="bloodTest"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
          <SectionConfig
            config={config}
            sectionName="chestXray"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
          <SectionConfig
            config={config}
            sectionName="symptomScrn"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other" className="space-y-4">
          <SectionConfig
            config={config}
            sectionName="hisummary"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
          <SectionConfig
            config={config}
            sectionName="decline"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
          <SectionConfig
            config={config}
            sectionName="historyOfDisease"
            onUpdateEnabled={updateSectionEnabled}
            onUpdateLabel={updateSectionLabel}
            onUpdateField={updateFieldConfig}
          />
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Carry Forward Days</Label>
                    <Input
                      type="number"
                      value={config.carryForwardConfig.days}
                      onChange={(e) => setConfig(prev => prev ? {
                        ...prev,
                        carryForwardConfig: {
                          ...prev.carryForwardConfig,
                          days: parseInt(e.target.value) || 0
                        }
                      } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Carry Forward Type</Label>
                    <Select
                      value={config.carryForwardConfig.type}
                      onValueChange={(value) => setConfig(prev => prev ? {
                        ...prev,
                        carryForwardConfig: {
                          ...prev.carryForwardConfig,
                          type: value
                        }
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UntilExpiration">Until Expiration</SelectItem>
                        <SelectItem value="CustomDays">Custom Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={!config.carryForwardConfig.disabled}
                    onCheckedChange={(checked) => setConfig(prev => prev ? {
                      ...prev,
                      carryForwardConfig: {
                        ...prev.carryForwardConfig,
                        disabled: !checked
                      }
                    } : null)}
                  />
                  <Label>Enable Carry Forward</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Section Configuration Component
interface SectionConfigProps {
  config: BaseConfig;
  sectionName: string;
  onUpdateEnabled: (sectionName: string, enabled: boolean) => void;
  onUpdateLabel: (sectionName: string, label: string) => void;
  onUpdateField: (sectionName: string, fieldName: string, updates: Partial<BaseFieldConfig>) => void;
  onUpdateDose?: (sectionName: string, doseIndex: number, fieldName: string, updates: Partial<BaseFieldConfig>) => void;
  onAddDose?: (sectionName: string) => void;
  onRemoveDose?: (sectionName: string, doseIndex: number) => void;
}

function SectionConfig({
  config,
  sectionName,
  onUpdateEnabled,
  onUpdateLabel,
  onUpdateField,
  onUpdateDose,
  onAddDose,
  onRemoveDose
}: SectionConfigProps) {
  const section = config[sectionName as keyof BaseConfig] as Record<string, unknown>;
  const IconComponent = SECTION_ICONS[sectionName as keyof typeof SECTION_ICONS] || Settings;

  if (!section) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5" />
            {SECTION_LABELS[sectionName as keyof typeof SECTION_LABELS] || sectionName}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={section.enabled}
              onCheckedChange={(checked) => onUpdateEnabled(sectionName, checked)}
            />
            <Badge variant={section.enabled ? "default" : "secondary"}>
              {section.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Section Label</Label>
          <Input
            value={section.label}
            onChange={(e) => onUpdateLabel(sectionName, e.target.value)}
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="fields">
            <AccordionTrigger>Field Configuration</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {Object.entries(section).map(([fieldName, fieldConfig]: [string, unknown]) => {
                  if (typeof fieldConfig !== 'object' || fieldConfig === null || !('controlType' in fieldConfig)) return null;

                  return (
                    <FieldConfigComponent
                      key={fieldName}
                      fieldName={fieldName}
                      fieldConfig={fieldConfig as BaseFieldConfig}
                      onUpdate={(updates) => onUpdateField(sectionName, fieldName, updates)}
                    />
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {section.doses && (
            <AccordionItem value="doses">
              <AccordionTrigger>Dose Configuration</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {(section.doses as unknown[]).map((dose: unknown, doseIndex: number) => (
                    <div key={doseIndex} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Dose {doseIndex + 1}</h4>
                        {(section.doses as unknown[]).length > 1 && onRemoveDose && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRemoveDose(sectionName, doseIndex)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {Object.entries(dose as Record<string, unknown>).map(([fieldName, fieldConfig]: [string, unknown]) => (
                        <FieldConfigComponent
                          key={fieldName}
                          fieldName={fieldName}
                          fieldConfig={fieldConfig as BaseFieldConfig}
                          onUpdate={(updates) => onUpdateDose && onUpdateDose(sectionName, doseIndex, fieldName, updates)}
                        />
                      ))}
                    </div>
                  ))}
                  {onAddDose && (
                    <Button variant="outline" onClick={() => onAddDose(sectionName)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Dose
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

// Field Configuration Component
interface FieldConfigComponentProps {
  fieldName: string;
  fieldConfig: BaseFieldConfig;
  onUpdate: (updates: Partial<BaseFieldConfig>) => void;
}

function FieldConfigComponent({ fieldName, fieldConfig, onUpdate }: FieldConfigComponentProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium capitalize">{fieldName.replace(/([A-Z])/g, ' $1')}</h4>
        <div className="flex items-center gap-2">
          <Switch
            checked={fieldConfig.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
          />
          <Badge variant={fieldConfig.enabled ? "default" : "secondary"}>
            {fieldConfig.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={fieldConfig.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Control Type</Label>
          <Select
            value={fieldConfig.controlType}
            onValueChange={(value: any) => onUpdate({ controlType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="textBox">Text Box</SelectItem>
              <SelectItem value="textArea">Text Area</SelectItem>
              <SelectItem value="datePicker">Date Picker</SelectItem>
              <SelectItem value="dropDown">Dropdown</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="checkBox">Checkbox</SelectItem>
              <SelectItem value="fileUpload">File Upload</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={fieldConfig.required}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
          />
          <Label>Required</Label>
        </div>
      </div>

      {(fieldConfig.controlType === 'dropDown' || fieldConfig.controlType === 'radio' || fieldConfig.controlType === 'checkBox') && (
        <div className="space-y-2">
          <Label>Options (one per line)</Label>
          <Textarea
            value={fieldConfig.options?.join('\n') || ''}
            onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(Boolean) })}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}
    </div>
  );
}