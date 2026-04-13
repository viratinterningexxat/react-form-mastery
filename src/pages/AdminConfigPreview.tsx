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
    const sections = config.sections.map(s =>
      s.id === sectionName ? { ...s, enabled } : s
    );
    setConfig({ ...config, sections });
    setHasChanges(true);
  };

  const updateSectionLabel = (sectionName: string, label: string) => {
    if (!config) return;
    const sections = config.sections.map(s =>
      s.id === sectionName ? { ...s, label } : s
    );
    setConfig({ ...config, sections });
    setHasChanges(true);
  };

  const updateFieldConfig = (
    sectionName: string,
    fieldName: string,
    updates: Partial<FieldConfig>
  ) => {
    if (!config) return;
    const sections = config.sections.map(s => {
      if (s.id !== sectionName) return s;
      const fields = s.fields.map(f =>
        f.key === fieldName ? { ...f, ...updates } : f
      );
      return { ...s, fields };
    });
    setConfig({ ...config, sections });
    setHasChanges(true);
  };

  const updateSection = (sectionId: string, updates: Partial<SectionConfig>) => {
    if (!config) return;
    const sections = config.sections.map(s =>
      s.id === sectionId ? { ...s, ...updates } : s
    );
    setConfig({ ...config, sections });
    setHasChanges(true);
  };

  // repeatable helpers
  const updateRepeatField = (
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
      <Tabs defaultValue={config.sections[0]?.id || ''} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {config.sections.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {config.sections.map((s) => (
          <TabsContent key={s.id} value={s.id} className="space-y-4">
            <SectionConfig
              section={s}
              onUpdateEnabled={updateSectionEnabled}
              onUpdateLabel={updateSectionLabel}
              onUpdateField={updateFieldConfig}
              onUpdateSection={updateSection}
              onUpdateRepeatField={updateRepeatField}
              onAddRepeatField={addRepeatField}
              onRemoveRepeatField={removeRepeatField}
            />
          </TabsContent>
        ))}
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
  section: SectionConfig;
  onUpdateEnabled: (sectionId: string, enabled: boolean) => void;
  onUpdateLabel: (sectionId: string, label: string) => void;
  onUpdateField: (sectionId: string, fieldKey: string, updates: Partial<FieldConfig>) => void;
  onUpdateSection: (sectionId: string, updates: Partial<SectionConfig>) => void;
  onUpdateRepeatField?: (sectionId: string, fieldIndex: number, updates: Partial<FieldConfig>) => void;
  onAddRepeatField?: (sectionId: string, field: FieldConfig) => void;
  onRemoveRepeatField?: (sectionId: string, fieldIndex: number) => void;
}

function SectionConfig({
  section,
  onUpdateEnabled,
  onUpdateLabel,
  onUpdateField,
  onUpdateSection,
  onUpdateRepeatField,
  onAddRepeatField,
  onRemoveRepeatField,
}: SectionConfigProps) {
  const IconComponent = SECTION_ICONS[section.id as keyof typeof SECTION_ICONS] || Settings;

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
            onChange={(e) => onUpdateLabel(section.id, e.target.value)}
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="fields">
            <AccordionTrigger>Field Configuration</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <FieldConfigComponent
                    key={field.key}
                    fieldName={field.key}
                    fieldConfig={field as BaseFieldConfig}
                    onUpdate={(updates) => onUpdateField(section.id, field.key, updates)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {section.repeatConfig && (
            <AccordionItem value="repeat">
              <AccordionTrigger>Repeatable Group</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min</Label>
                      <Input
                        type="number"
                        value={section.repeatConfig.min}
                        onChange={(e) =>
                          onUpdateSection(section.id, {
                            repeatConfig: { ...section.repeatConfig!, min: parseInt(e.target.value) || 0 }
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max</Label>
                      <Input
                        type="number"
                        value={section.repeatConfig.max}
                        onChange={(e) =>
                          onUpdateSection(section.id, {
                            repeatConfig: { ...section.repeatConfig!, max: parseInt(e.target.value) || 0 }
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {section.repeatConfig.fields.map((field, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <FieldConfigComponent
                          fieldName={field.key}
                          fieldConfig={field as BaseFieldConfig}
                          onUpdate={(updates) =>
                            onUpdateRepeatField && onUpdateRepeatField(section.id, idx, updates)
                          }
                        />
                        {section.repeatConfig && section.repeatConfig.fields.length > 1 && onRemoveRepeatField && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRemoveRepeatField(section.id, idx)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {onAddRepeatField && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          onAddRepeatField(section.id, {
                            key: `field${section.repeatConfig!.fields.length + 1}`,
                            label: `Field ${section.repeatConfig!.fields.length + 1}`,
                            type: 'text',
                            enabled: true,
                            required: false,
                          })
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Field
                      </Button>
                    )}
                  </div>
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
  fieldConfig: FieldConfig;
  onUpdate: (updates: Partial<FieldConfig>) => void;
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
          <Label>Field Type</Label>
          <Select
            value={fieldConfig.type}
            onValueChange={(value: any) => onUpdate({ type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="file">File</SelectItem>
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