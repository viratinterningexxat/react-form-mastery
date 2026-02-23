import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { SectionConfig, FieldConfig } from '../../../types/dynamicConfig';

const CONTROL_TYPES = [
  'textBox',
  'textArea',
  'datePicker',
  'dropDown',
  'radio',
  'checkBox',
  'fileUpload',
  'number',
  'email',
];

interface FieldsTabProps {
  section: SectionConfig | null;
  selectedField: FieldConfig | null;
  onSelectField: (field: FieldConfig | null) => void;
  onAddField: (fieldKey: string, label: string, controlType: string) => void;
  onUpdateField: (fieldKey: string, updates: Partial<FieldConfig>) => void;
  onDeleteField: (fieldKey: string) => void;
}

export const FieldsTab: React.FC<FieldsTabProps> = ({
  section,
  selectedField,
  onSelectField,
  onAddField,
  onUpdateField,
  onDeleteField,
}) => {
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    key: '',
    label: '',
    controlType: 'textBox',
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<FieldConfig>>({});

  if (!section) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Select a section to manage fields</p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateField = () => {
    if (!newFieldData.key.trim() || !newFieldData.label.trim()) return;
    onAddField(newFieldData.key, newFieldData.label, newFieldData.controlType);
    setNewFieldData({ key: '', label: '', controlType: 'textBox' });
    setShowNewField(false);
  };

  const handleSelectField = (field: FieldConfig) => {
    onSelectField(field);
    setEditMode(false);
    setEditData({
      label: field.label,
      required: field.required,
      enabled: field.enabled,
      placeholder: field.placeholder,
      helpText: field.helpText,
      controlType: field.controlType,
    });
  };

  const handleUpdateField = () => {
    if (selectedField) {
      onUpdateField(selectedField.key, editData);
      setEditMode(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Fields List */}
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full"
              onClick={() => setShowNewField(!showNewField)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Field
            </Button>

            {showNewField && (
              <div className="space-y-2 bg-blue-50 p-3 rounded">
                <Input
                  placeholder="Field key (e.g., employee_id)"
                  value={newFieldData.key}
                  onChange={(e) => setNewFieldData((prev) => ({ ...prev, key: e.target.value }))}
                />
                <Input
                  placeholder="Field label (e.g., Employee ID)"
                  value={newFieldData.label}
                  onChange={(e) => setNewFieldData((prev) => ({ ...prev, label: e.target.value }))}
                />
                <select
                  value={newFieldData.controlType}
                  onChange={(e) =>
                    setNewFieldData((prev) => ({ ...prev, controlType: e.target.value }))
                  }
                  className="w-full p-2 border rounded text-sm"
                >
                  {CONTROL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateField} className="flex-1">
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewField(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto border-t pt-2">
              {section.fields.map((field) => (
                <div
                  key={field.key}
                  className={`p-2 rounded border-2 cursor-pointer transition ${
                    selectedField?.key === field.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectField(field)}
                >
                  <div className="font-medium text-sm truncate">{field.label}</div>
                  <div className="text-xs text-gray-500">{field.controlType}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Details */}
      {selectedField && (
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{selectedField.label}</CardTitle>
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
                      value={editData.label || ''}
                      onChange={(e) => setEditData((prev) => ({ ...prev, label: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Control Type</label>
                    <select
                      value={editData.controlType || 'textBox'}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, controlType: e.target.value as any }))
                      }
                      className="w-full p-2 border rounded text-sm"
                    >
                      {CONTROL_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Placeholder</label>
                    <Input
                      value={editData.placeholder || ''}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, placeholder: e.target.value }))
                      }
                      placeholder="Leave empty if not needed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Help Text</label>
                    <Input
                      value={editData.helpText || ''}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, helpText: e.target.value }))
                      }
                      placeholder="Leave empty if not needed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.required || false}
                        onChange={(e) =>
                          setEditData((prev) => ({ ...prev, required: e.target.checked }))
                        }
                      />
                      <span className="text-sm font-medium">Required Field</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.enabled !== false}
                        onChange={(e) =>
                          setEditData((prev) => ({ ...prev, enabled: e.target.checked }))
                        }
                      />
                      <span className="text-sm font-medium">Enabled</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUpdateField}>Save</Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Field Key</label>
                    <code className="block text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                      {selectedField.key}
                    </code>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Control Type</label>
                    <p className="text-sm font-medium">{selectedField.controlType}</p>
                  </div>

                  {selectedField.placeholder && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Placeholder</label>
                      <p className="text-sm">{selectedField.placeholder}</p>
                    </div>
                  )}

                  {selectedField.helpText && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Help Text</label>
                      <p className="text-sm">{selectedField.helpText}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Required</label>
                      <p className="text-sm">
                        {selectedField.required ? (
                          <span className="text-red-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-600">No</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <p className="text-sm">
                        {selectedField.enabled ? (
                          <span className="text-green-600 font-medium">Enabled</span>
                        ) : (
                          <span className="text-gray-600">Disabled</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('Delete this field?')) {
                          onDeleteField(selectedField.key);
                          onSelectField(null);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Field
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

export default FieldsTab;
