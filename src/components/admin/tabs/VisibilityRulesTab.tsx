import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { FieldConfig, VisibilityRule } from '../../../types/dynamicConfig';

interface VisibilityRulesTabProps {
  field: FieldConfig | null;
  allSectionFields: FieldConfig[];
  onUpdate: (updates: Partial<FieldConfig>) => void;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'includes', label: 'Includes' },
  { value: 'notIncludes', label: 'Not Includes' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
];

export const VisibilityRulesTab: React.FC<VisibilityRulesTabProps> = ({
  field,
  allSectionFields,
  onUpdate,
}) => {
  const [rules, setRules] = useState<VisibilityRule[]>(field?.visibilityRules || []);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState({
    dependsOn: '',
    operator: 'equals' as VisibilityRule['operator'],
    value: '',
  });

  if (!field) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Select a field to manage visibility rules</p>
        </CardContent>
      </Card>
    );
  }

  const handleAddRule = () => {
    if (!newRule.dependsOn.trim() || !newRule.value.trim()) return;

    const rule: VisibilityRule = {
      dependsOn: newRule.dependsOn,
      operator: newRule.operator,
      value: isNaN(Number(newRule.value)) ? newRule.value : Number(newRule.value),
    };

    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    onUpdate({ visibilityRules: updatedRules });
    setNewRule({ dependsOn: '', operator: 'equals', value: '' });
    setShowNewRule(false);
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onUpdate({ visibilityRules: updatedRules });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility Rules for {field.label}</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Control when this field should be visible based on other field values
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-sm text-gray-500">No visibility rules configured</p>
          ) : (
            rules.map((rule, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Show when
                    <span className="font-mono text-blue-600 mx-1">{rule.dependsOn}</span>
                    <span className="font-medium">
                      {OPERATORS.find((o) => o.value === rule.operator)?.label}
                    </span>
                    <span className="font-mono text-blue-600 mx-1">{rule.value}</span>
                  </p>
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
              <label className="block text-sm font-medium mb-1">Depends On Field</label>
              <select
                value={newRule.dependsOn}
                onChange={(e) => setNewRule((prev) => ({ ...prev, dependsOn: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Select a field</option>
                {allSectionFields
                  .filter((f) => f.key !== field.key)
                  .map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label} ({f.key})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Operator</label>
              <select
                value={newRule.operator}
                onChange={(e) => setNewRule((prev) => ({ ...prev, operator: e.target.value as VisibilityRule['operator'] }))}
                className="w-full p-2 border rounded text-sm"
              >
                {OPERATORS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <Input
                value={newRule.value}
                onChange={(e) => setNewRule((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="Value to compare"
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
            Add Visibility Rule
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VisibilityRulesTab;
