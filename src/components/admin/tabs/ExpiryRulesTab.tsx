import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { SectionConfig, ExpiryRule } from '../../../types/dynamicConfig';

interface ExpiryRulesTabProps {
  section: SectionConfig | null;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export const ExpiryRulesTab: React.FC<ExpiryRulesTabProps> = ({ section, onUpdate }) => {
  const [ruleType, setRuleType] = useState<ExpiryRule['type']>(section?.expiryRule?.type || 'never');
  const [period, setPeriod] = useState({
    years: section?.expiryRule?.period?.years || 0,
    months: section?.expiryRule?.period?.months || 0,
    days: section?.expiryRule?.period?.days || 0,
  });
  const [baseField, setBaseField] = useState(section?.expiryRule?.baseField || '');
  const [fixedDate, setFixedDate] = useState({
    day: section?.expiryRule?.fixedDate?.day || 1,
    month: section?.expiryRule?.fixedDate?.month || 1,
    year: section?.expiryRule?.fixedDate?.year || 2025,
  });

  if (!section) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Select a section to set expiry rules</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    const expiryRule: ExpiryRule = {
      type: ruleType,
    };

    if (ruleType === 'period') {
      expiryRule.period = {
        years: period.years || undefined,
        months: period.months || undefined,
        days: period.days || undefined,
      };
    } else if (ruleType === 'basedOnField') {
      expiryRule.baseField = baseField;
      expiryRule.period = {
        years: period.years || undefined,
        months: period.months || undefined,
        days: period.days || undefined,
      };
    } else if (ruleType === 'fixedDate') {
      expiryRule.fixedDate = fixedDate;
    }

    onUpdate({ expiryRule });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiry Rules for {section.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Expiry Type</label>
          <select
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value as ExpiryRule['type'])}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="never">No Expiry</option>
            <option value="period">Expiry After Period</option>
            <option value="basedOnField">Based on Field Date</option>
            <option value="fixedDate">Fixed Expiry Date</option>
          </select>
        </div>

        {ruleType === 'period' && (
          <div className="space-y-3 bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Credential expires after this period</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Years</label>
                <Input
                  type="number"
                  min="0"
                  value={period.years}
                  onChange={(e) => setPeriod((prev) => ({ ...prev, years: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Months</label>
                <Input
                  type="number"
                  min="0"
                  max="11"
                  value={period.months}
                  onChange={(e) => setPeriod((prev) => ({ ...prev, months: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Days</label>
                <Input
                  type="number"
                  min="0"
                  value={period.days}
                  onChange={(e) => setPeriod((prev) => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
        )}

        {ruleType === 'basedOnField' && (
          <div className="space-y-3 bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Calculate expiry from a field date</p>
            <div>
              <label className="block text-sm font-medium mb-1">Base Field Key</label>
              <Input
                placeholder="e.g., resultDate, lastDoseDate"
                value={baseField}
                onChange={(e) => setBaseField(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Years</label>
                <Input
                  type="number"
                  min="0"
                  value={period.years}
                  onChange={(e) => setPeriod((prev) => ({ ...prev, years: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Months</label>
                <Input
                  type="number"
                  min="0"
                  value={period.months}
                  onChange={(e) => setPeriod((prev) => ({ ...prev, months: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Days</label>
                <Input
                  type="number"
                  min="0"
                  value={period.days}
                  onChange={(e) => setPeriod((prev) => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
        )}

        {ruleType === 'fixedDate' && (
          <div className="space-y-3 bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">All credentials expire on this date</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={fixedDate.month}
                  onChange={(e) => setFixedDate((prev) => ({ ...prev, month: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={fixedDate.day}
                  onChange={(e) => setFixedDate((prev) => ({ ...prev, day: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input
                  type="number"
                  value={fixedDate.year}
                  onChange={(e) => setFixedDate((prev) => ({ ...prev, year: parseInt(e.target.value) || 2025 }))}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex gap-2">
          <Button onClick={handleSave}>Save Expiry Rules</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpiryRulesTab;
