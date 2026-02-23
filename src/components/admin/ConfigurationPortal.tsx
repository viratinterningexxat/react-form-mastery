// ============================================
// Dynamic Configuration Portal
// Admin UI for managing dynamic forms
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Trash2, Plus, Edit2, Copy, Download, Upload } from 'lucide-react';
import {
  DynamicFormConfig,
  SectionConfig,
  FieldConfig,
} from '../../types/dynamicConfig';
import {
  saveConfiguration,
  loadConfiguration,
  loadAllConfigurations,
  deleteConfiguration,
  duplicateConfiguration,
  addSectionToConfiguration,
  removeSectionFromConfiguration,
  updateSectionInConfiguration,
  addFieldToSection,
  removeFieldFromSection,
  updateFieldInSection,
  createConfiguration,
  createSection,
  createField,
  exportConfiguration,
  importConfiguration,
} from '../../services/configurationService';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import SectionsTab from './tabs/SectionsTab';
import FieldsTab from './tabs/FieldsTab';
import ExpiryRulesTab from './tabs/ExpiryRulesTab';
import ValidationRulesTab from './tabs/ValidationRulesTab';
import VisibilityRulesTab from './tabs/VisibilityRulesTab';

type ActiveTab =
  | 'general'
  | 'sections'
  | 'fields'
  | 'expiry'
  | 'validation'
  | 'visibility';

interface ConfigurationPortalProps {
  onConfigChange?: (config: DynamicFormConfig) => void;
}

export const ConfigurationPortal: React.FC<ConfigurationPortalProps> = ({
  onConfigChange,
}) => {
  const [configs, setConfigs] = useState<DynamicFormConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<DynamicFormConfig | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionConfig | null>(null);
  const [selectedField, setSelectedField] = useState<FieldConfig | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [showNewConfig, setShowNewConfig] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Load configurations on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = useCallback(() => {
    const loadedConfigs = loadAllConfigurations();
    setConfigs(loadedConfigs);
  }, []);

  const handleCreateConfig = () => {
    if (!newConfigName.trim()) return;

    const newConfig = createConfiguration(newConfigName);
    saveConfiguration(newConfig);
    setConfigs([...configs, newConfig]);
    setSelectedConfig(newConfig);
    setNewConfigName('');
    setShowNewConfig(false);
  };

  const handleSelectConfig = (config: DynamicFormConfig) => {
    setSelectedConfig(config);
    setSelectedSection(null);
    setSelectedField(null);
    setActiveTab('general');
    setUnsavedChanges(false);
  };

  const handleDeleteConfig = (configId: string) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;
    deleteConfiguration(configId);
    setConfigs(configs.filter((c) => c.id !== configId));
    if (selectedConfig?.id === configId) {
      setSelectedConfig(null);
    }
  };

  const handleDuplicateConfig = (configId: string) => {
    const newName = `${selectedConfig?.name || 'Config'} (Copy)`;
    const duplicated = duplicateConfiguration(configId, newName);
    if (duplicated) {
      setConfigs([...configs, duplicated]);
    }
  };

  const handleUpdateConfig = (updates: Partial<DynamicFormConfig>) => {
    if (!selectedConfig) return;

    const updated = { ...selectedConfig, ...updates };
    saveConfiguration(updated);
    setSelectedConfig(updated);
    setConfigs(
      configs.map((c) => (c.id === updated.id ? updated : c))
    );
    setUnsavedChanges(true);
    onConfigChange?.(updated);
  };

  const handleAddSection = (label: string) => {
    if (!selectedConfig) return;

    const sectionId = `section_${Date.now()}`;
    const section = createSection(sectionId, label);
    const updated = addSectionToConfiguration(selectedConfig.id, section);
    if (updated) {
      setSelectedConfig(updated);
      setConfigs(
        configs.map((c) => (c.id === updated.id ? updated : c))
      );
      setUnsavedChanges(true);
    }
  };

  const handleUpdateSection = (updates: Partial<SectionConfig>) => {
    if (!selectedConfig || !selectedSection) return;

    const updated = updateSectionInConfiguration(
      selectedConfig.id,
      selectedSection.id,
      updates
    );
    if (updated) {
      const updatedSection = updated.sections.find((s) => s.id === selectedSection.id);
      setSelectedSection(updatedSection || null);
      setSelectedConfig(updated);
      setConfigs(
        configs.map((c) => (c.id === updated.id ? updated : c))
      );
      setUnsavedChanges(true);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!selectedConfig) return;
    const updated = removeSectionFromConfiguration(selectedConfig.id, sectionId);
    if (updated) {
      setSelectedConfig(updated);
      setConfigs(
        configs.map((c) => (c.id === updated.id ? updated : c))
      );
      if (selectedSection?.id === sectionId) {
        setSelectedSection(null);
      }
      setUnsavedChanges(true);
    }
  };

  const handleAddField = (fieldKey: string, label: string, controlType: string) => {
    if (!selectedConfig || !selectedSection) return;

    const field = createField(fieldKey, label, controlType);
    const updated = addFieldToSection(selectedConfig.id, selectedSection.id, field);
    if (updated) {
      const updatedSection = updated.sections.find((s) => s.id === selectedSection.id);
      setSelectedSection(updatedSection || null);
      setSelectedConfig(updated);
      setConfigs(
        configs.map((c) => (c.id === updated.id ? updated : c))
      );
      setUnsavedChanges(true);
    }
  };

  const handleUpdateField = (fieldKey: string, updates: Partial<FieldConfig>) => {
    if (!selectedConfig || !selectedSection) return;

    const updated = updateFieldInSection(
      selectedConfig.id,
      selectedSection.id,
      fieldKey,
      updates
    );
    if (updated) {
      const updatedSection = updated.sections.find((s) => s.id === selectedSection.id);
      const updatedField = updatedSection?.fields.find((f) => f.key === fieldKey);
      setSelectedField(updatedField || null);
      setSelectedSection(updatedSection || null);
      setSelectedConfig(updated);
      setConfigs(
        configs.map((c) => (c.id === updated.id ? updated : c))
      );
      setUnsavedChanges(true);
    }
  };

  const handleDeleteField = (fieldKey: string) => {
    if (!selectedConfig || !selectedSection) return;

    const updated = removeFieldFromSection(
      selectedConfig.id,
      selectedSection.id,
      fieldKey
    );
    if (updated) {
      const updatedSection = updated.sections.find((s) => s.id === selectedSection.id);
      setSelectedSection(updatedSection || null);
      setSelectedConfig(updated);
      setConfigs(
        configs.map((c) => (c.id === updated.id ? updated : c))
      );
      if (selectedField?.key === fieldKey) {
        setSelectedField(null);
      }
      setUnsavedChanges(true);
    }
  };

  const handleExportConfig = (configId: string) => {
    const json = exportConfiguration(configId);
    if (!json) return;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', `config_${configId}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImportConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        const json = event.target.result;
        const imported = importConfiguration(json);
        if (imported) {
          setConfigs([...configs, imported]);
          alert('Configuration imported successfully!');
        } else {
          alert('Failed to import configuration');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="flex h-full gap-6 p-6">
        {/* Left Panel: Configuration List */}
        <div className="w-80 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Configurations</CardTitle>
              <CardDescription>Manage credential forms</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  onClick={() => setShowNewConfig(true)}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Config
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleImportConfig}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>

              {showNewConfig && (
                <div className="flex gap-2 mb-3 bg-blue-50 p-2 rounded">
                  <Input
                    placeholder="Config name"
                    value={newConfigName}
                    onChange={(e) => setNewConfigName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleCreateConfig();
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateConfig}
                  >
                    Create
                  </Button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2 border-t pt-3">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className={`p-3 rounded border-2 cursor-pointer transition ${
                      selectedConfig?.id === config.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectConfig(config)}
                  >
                    <div className="font-medium text-sm truncate">{config.name}</div>
                    <div className="text-xs text-gray-500">
                      v{config.version} • {config.sections.length} sections
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateConfig(config.id);
                        }}
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportConfig(config.id);
                        }}
                        title="Export"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConfig(config.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Configuration Details */}
        {selectedConfig ? (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedConfig.name}</h2>
                <p className="text-sm text-gray-600">
                  {unsavedChanges && '* Unsaved changes'}
                </p>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as ActiveTab)}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="expiry">Expiry</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="visibility">Visibility</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="general">
                  <GeneralSettingsTab
                    config={selectedConfig}
                    onUpdate={handleUpdateConfig}
                  />
                </TabsContent>

                <TabsContent value="sections">
                  <SectionsTab
                    config={selectedConfig}
                    selectedSection={selectedSection}
                    onSelectSection={setSelectedSection}
                    onAddSection={handleAddSection}
                    onUpdateSection={handleUpdateSection}
                    onDeleteSection={handleDeleteSection}
                  />
                </TabsContent>

                <TabsContent value="fields">
                  <FieldsTab
                    section={selectedSection}
                    selectedField={selectedField}
                    onSelectField={setSelectedField}
                    onAddField={handleAddField}
                    onUpdateField={handleUpdateField}
                    onDeleteField={handleDeleteField}
                  />
                </TabsContent>

                <TabsContent value="expiry">
                  <ExpiryRulesTab
                    section={selectedSection}
                    onUpdate={handleUpdateSection}
                  />
                </TabsContent>

                <TabsContent value="validation">
                  <ValidationRulesTab
                    field={selectedField}
                    onUpdate={(updates) => {
                      if (selectedField) {
                        handleUpdateField(selectedField.key, updates);
                      }
                    }}
                  />
                </TabsContent>

                <TabsContent value="visibility">
                  <VisibilityRulesTab
                    field={selectedField}
                    allSectionFields={selectedSection?.fields || []}
                    onUpdate={(updates) => {
                      if (selectedField) {
                        handleUpdateField(selectedField.key, updates);
                      }
                    }}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Select or create a configuration</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationPortal;
