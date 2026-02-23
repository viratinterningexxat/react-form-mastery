import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { DynamicFormConfig } from '../../../types/dynamicConfig';

interface GeneralSettingsTabProps {
  config: DynamicFormConfig;
  onUpdate: (updates: Partial<DynamicFormConfig>) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  config,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: config.name,
    description: config.description || '',
    category: config.category || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate({
      name: formData.name,
      description: formData.description,
      category: formData.category,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Configuration Name</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Faculty Health Screening"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the purpose of this configuration"
              className="w-full p-2 border rounded text-sm"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Input
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Health, Compliance, etc."
            />
          </div>

          <div className="pt-4 flex gap-2">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={() => setFormData({
              name: config.name,
              description: config.description || '',
              category: config.category || '',
            })}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Configuration ID:</span>
            <code className="bg-gray-100 px-2 py-1 rounded">{config.id}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium">{config.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${config.active ? 'text-green-600' : 'text-gray-600'}`}>
              {config.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sections:</span>
            <span className="font-medium">{config.sections.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated:</span>
            <span className="text-xs">{new Date(config.updatedAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettingsTab;
