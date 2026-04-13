import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Syringe, 
  RotateCcw, 
  FileText, 
  Calendar,
  Save,
  RefreshCw
} from 'lucide-react';
import { EnhancedVaccineConfig } from './EnhancedVaccineConfig';
import { EnhancedBoosterConfig } from './EnhancedBoosterConfig';
import { DocumentTypeSelector } from './DocumentTypeSelector';
import { 
  DoseConfiguration, 
  BoosterConfiguration, 
  DocumentTypeConfig,
  EnhancedSectionConfig
} from '@/types/enhancedConfig';

interface AdminPortalProps {
  initialConfig: EnhancedSectionConfig;
  onSave: (config: EnhancedSectionConfig) => void;
}

export function AdminPortal({ initialConfig, onSave }: AdminPortalProps) {
  const [config, setConfig] = useState<EnhancedSectionConfig>(initialConfig);
  const [selectedDocType, setSelectedDocType] = useState('TB');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with enhanced configuration structure
  const [vaccineConfig, setVaccineConfig] = useState<DoseConfiguration>({
    count: {
      min: 1,
      max: 10,
      default: 3
    },
    fields: [
      {
        key: 'date',
        type: 'date',
        label: 'Administration Date',
        enabled: true,
        required: true
      },
      {
        key: 'manufacturer',
        type: 'select',
        label: 'Manufacturer',
        enabled: true,
        required: true,
        options: [
          'Pfizer-BioNTech',
          'Moderna', 
          'Johnson & Johnson',
          'AstraZeneca',
          'Novavax',
          'Other'
        ]
      },
      {
        key: 'lotNumber',
        type: 'text',
        label: 'Lot Number',
        enabled: true,
        required: false,
        placeholder: 'e.g., EL9262'
      },
      {
        key: 'induration',
        type: 'text',
        label: 'Induration (mm)',
        enabled: selectedDocType === 'TB',
        required: false,
        placeholder: 'e.g., 15mm'
      }
    ]
  });

  const [boosterConfig, setBoosterConfig] = useState<BoosterConfiguration>({
    enabled: false,
    doseCount: 1,
    fields: [
      {
        key: 'boosterDate',
        type: 'date',
        label: 'Booster Date',
        enabled: true,
        required: true
      },
      {
        key: 'boosterManufacturer',
        type: 'select',
        label: 'Booster Manufacturer',
        enabled: true,
        required: false,
        options: [
          'Pfizer-BioNTech',
          'Moderna',
          'Johnson & Johnson',
          'Other'
        ]
      },
      {
        key: 'boosterLot',
        type: 'text',
        label: 'Booster Lot Number',
        enabled: true,
        required: false
      }
    ],
    expiryLogic: {
      basedOn: 'boosterDate',
      period: { years: 1 }
    }
  });

  const [documentTypes] = useState<DocumentTypeConfig[]>([
    {
      type: 'TB',
      name: 'Tuberculosis',
      defaultDoseCount: 2,
      showInduration: true,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 1 }
      },
      boosterRequired: true,
      specialFields: ['induration']
    },
    {
      type: 'HepB',
      name: 'Hepatitis B',
      defaultDoseCount: 3,
      showInduration: false,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 10 }
      },
      boosterRequired: false,
      specialFields: []
    },
    {
      type: 'Flu',
      name: 'Influenza',
      defaultDoseCount: 1,
      showInduration: false,
      expiryLogic: {
        basedOn: 'resultDate',
        period: { years: 1 }
      },
      boosterRequired: false,
      specialFields: []
    },
    {
      type: 'Covid',
      name: 'COVID-19',
      defaultDoseCount: 2,
      showInduration: false,
      expiryLogic: {
        basedOn: 'lastDoseDate',
        period: { years: 1 }
      },
      boosterRequired: true,
      specialFields: []
    }
  ]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Update the main config with enhanced settings
      const updatedConfig = {
        ...config,
        vaccine: {
          ...config.vaccine,
          doses: vaccineConfig,
          booster: boosterConfig
        }
      };
      
      await onSave(updatedConfig);
      
      // Show success feedback
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setIsSaving(false);
    }
  }, [config, vaccineConfig, boosterConfig, onSave]);

  const updateVaccineConfig = useCallback((newConfig: DoseConfiguration) => {
    // Update induration field visibility based on document type
    const updatedFields = newConfig.fields.map(field => {
      if (field.key === 'induration') {
        return { ...field, enabled: selectedDocType === 'TB' };
      }
      return field;
    });
    
    setVaccineConfig({ ...newConfig, fields: updatedFields });
  }, [selectedDocType]);

  const updateDocTypeConfig = useCallback((type: string, docConfig: DocumentTypeConfig) => {
    // In a real implementation, this would update the document types array
    console.log('Updating document type config:', type, docConfig);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Credential Admin Portal
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure credential requirements and dynamic form behavior
        </p>
      </div>

      <Tabs defaultValue="vaccine" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vaccine" className="flex items-center gap-2">
            <Syringe className="w-4 h-4" />
            Vaccine
          </TabsTrigger>
          <TabsTrigger value="booster" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Booster
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document Types
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vaccine">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5" />
                Vaccine Configuration
                <Badge variant="secondary">{selectedDocType}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedVaccineConfig
                config={vaccineConfig}
                onConfigChange={updateVaccineConfig}
                documentType={selectedDocType}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booster">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Booster Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedBoosterConfig
                config={boosterConfig}
                onConfigChange={setBoosterConfig}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Type Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentTypeSelector
                selectedType={selectedDocType}
                onTypeChange={setSelectedDocType}
                configs={documentTypes}
                onConfigUpdate={updateDocTypeConfig}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">Vaccine Settings</h3>
                    <div className="text-sm space-y-1">
                      <p>Dose Range: {vaccineConfig.count.min} - {vaccineConfig.count.max}</p>
                      <p>Default Doses: {vaccineConfig.count.default}</p>
                      <p>Fields: {vaccineConfig.fields.filter(f => f.enabled).length} enabled</p>
                      <p>Induration for {selectedDocType}: {selectedDocType === 'TB' ? 'Visible' : 'Hidden'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Booster Settings</h3>
                    <div className="text-sm space-y-1">
                      <p>Enabled: {boosterConfig.enabled ? 'Yes' : 'No'}</p>
                      <p>Dose Count: {boosterConfig.doseCount}</p>
                      <p>Fields: {boosterConfig.fields.filter(f => f.enabled).length} enabled</p>
                      <p>Expiry: {boosterConfig.expiryLogic?.period?.years || 0} years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}