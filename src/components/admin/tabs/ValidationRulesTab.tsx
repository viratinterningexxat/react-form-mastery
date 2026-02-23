import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { FieldConfig, ValidationRule } from '../../../types/dynamicConfig';

interface ValidationRulesTabProps {
  field: FieldConfig | null;
  onUpdate: (updates: Partial<FieldConfig>) => void;
}

const VALIDATION_TYPES = [
  { value: 'required', label: 'Required' },
  { value: 'minLength', label: 'Minimum Length' },
  { value: 'maxLength', label: 'Maximum Length' },
  { value: 'pattern', label: 'Pattern (Regex)' },
  { value: 'email', label: 'Email Format' },
  { value: 'date', label: 'Valid Date' },
];

export const ValidationRulesTab: React.FC<ValidationRulesTabProps> = ({ field, onUpdate }) => {
  const [rules, setRules] = useState<ValidationRule[]>(field?.validation || []);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState({
    type: 'required' as ValidationRule['type'],
    message: '',
    value: '',
  });

  if (!field) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Select a field to manage validation rules</p>
        </CardContent>
      </Card>
    );
  }

  const handleAddRule = () => {
    if (!newRule.message.trim()) return;

    const rule: ValidationRule = {
      type: newRule.type,
      message: newRule.message,
    };

    if (newRule.value && ['minLength', 'maxLength', 'pattern'].includes(newRule.type)) {
      rule.value = isNaN(Number(newRule.value)) ? newRule.value : Number(newRule.value);
    }

    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    onUpdate({ validation: updatedRules });
    setNewRule({ type: 'required', message: '', value: '' });
    setShowNewRule(false);
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onUpdate({ validation: updatedRules });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation Rules for {field.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-sm text-gray-500">No validation rules configured</p>
          ) : (
            rules.map((rule, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">
                    {VALIDATION_TYPES.find((t) => t.value === rule.type)?.label || rule.type}
                  </p>
                  <p className="text-sm text-gray-600">{rule.message}</p>
                  {rule.value && (
                    <p className="text-xs text-gray-500 mt-1">Value: {rule.value}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveRule(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>

        {showNewRule ? (
          <div className="space-y-3 bg-blue-50 p-4 rounded">
            <div>
              <label className="block text-sm font-medium mb-1">Validation Type</label>
              <select
                value={newRule.type}
                onChange={(e) => setNewRule((prev) => ({ ...prev, type: e.target.value as ValidationRule['type'] }))}
                className="w-full p-2 border rounded text-sm"
              >
                {VALIDATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {['minLength', 'maxLength', 'pattern'].includes(newRule.type) && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {newRule.type === 'pattern' ? 'Regex Pattern' : 'Value'}
                </label>
                <Input
                  value={newRule.value}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder={
                    newRule.type === 'pattern'
                      ? 'e.g., ^[A-Z][a-z]+$'
                      : 'e.g., 5'
                  }
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Error Message</label>
              <Input
                value={newRule.message}
                onChange={(e) => setNewRule((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Error message to display"
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddRule} className="flex-1">
                Add Rule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNewRule(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowNewRule(true)} className="w-full">
            <Plus className="w-4 h-4 mr-1" />
            Add Validation Rule
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationRulesTab;
