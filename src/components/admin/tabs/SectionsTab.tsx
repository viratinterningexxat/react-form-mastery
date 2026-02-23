import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { DynamicFormConfig, SectionConfig } from '../../../types/dynamicConfig';

interface SectionsTabProps {
  config: DynamicFormConfig;
  selectedSection: SectionConfig | null;
  onSelectSection: (section: SectionConfig | null) => void;
  onAddSection: (label: string) => void;
  onUpdateSection: (updates: Partial<SectionConfig>) => void;
  onDeleteSection: (sectionId: string) => void;
}

export const SectionsTab: React.FC<SectionsTabProps> = ({
  config,
  selectedSection,
  onSelectSection,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
}) => {
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    label: selectedSection?.label || '',
    description: selectedSection?.description || '',
  });

  const handleCreateSection = () => {
    if (!newSectionLabel.trim()) return;
    onAddSection(newSectionLabel);
    setNewSectionLabel('');
    setShowNewSection(false);
  };

  const handleUpdateSection = () => {
    onUpdateSection({
      label: editData.label,
      description: editData.description,
    });
    setEditMode(false);
  };

  const handleSelectSection = (section: SectionConfig) => {
    onSelectSection(section);
    setEditMode(false);
    setEditData({
      label: section.label,
      description: section.description || '',
    });
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Sections List */}
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full"
              onClick={() => setShowNewSection(!showNewSection)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Section
            </Button>

            {showNewSection && (
              <div className="space-y-2 bg-blue-50 p-3 rounded">
                <Input
                  placeholder="Section label"
                  value={newSectionLabel}
                  onChange={(e) => setNewSectionLabel(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleCreateSection();
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateSection} className="flex-1">
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewSection(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto border-t pt-2">
              {config.sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-2 rounded border-2 cursor-pointer transition ${
                    selectedSection?.id === section.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectSection(section)}
                >
                  <div className="font-medium text-sm truncate">{section.label}</div>
                  <div className="text-xs text-gray-500">{section.fields.length} fields</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Details */}
      {selectedSection && (
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{selectedSection.label}</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Label</label>
                    <Input
                      value={editData.label}
                      onChange={(e) => setEditData((prev) => ({ ...prev, label: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full p-2 border rounded text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUpdateSection}>Save</Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Label</label>
                    <p className="text-sm font-medium">{selectedSection.label}</p>
                  </div>

                  {selectedSection.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-sm">{selectedSection.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <p className="text-sm">
                        {selectedSection.enabled ? (
                          <span className="text-green-600 font-medium">Enabled</span>
                        ) : (
                          <span className="text-gray-600">Disabled</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Required</label>
                      <p className="text-sm">
                        {selectedSection.required ? (
                          <span className="font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-600">No</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('Delete this section?')) {
                          onDeleteSection(selectedSection.id);
                          onSelectSection(null);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Section
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SectionsTab;
