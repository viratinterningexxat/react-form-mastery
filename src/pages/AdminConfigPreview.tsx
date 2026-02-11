import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getRequirementConfig } from '@/utils/getRequirementConfig';
import { RequirementConfigList } from '@/types/RequirementConfig';
import { Settings, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

export default function AdminConfigPreview() {
  const [config, setConfig] = useState<RequirementConfigList>([]);
  const [loading, setLoading] = useState(true);

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

  const toggleFieldVisibility = (reqId: string, fieldKey: string) => {
    setConfig(prev =>
      prev.map(req =>
        req.requirementId === reqId
          ? {
              ...req,
              fields: {
                ...req.fields,
                [fieldKey]: {
                  ...req.fields[fieldKey],
                  visible: !req.fields[fieldKey].visible,
                },
              },
            }
          : req
      )
    );
  };

  const toggleFieldRequired = (reqId: string, fieldKey: string) => {
    setConfig(prev =>
      prev.map(req =>
        req.requirementId === reqId
          ? {
              ...req,
              fields: {
                ...req.fields,
                [fieldKey]: {
                  ...req.fields[fieldKey],
                  required: !req.fields[fieldKey].required,
                },
              },
            }
          : req
      )
    );
  };

  if (loading) {
    return <div>Loading config...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Admin Config Preview</h1>
      </div>

      {config.map(requirement => (
        <Card key={requirement.requirementId}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{requirement.label}</span>
              <Badge variant="outline">{requirement.category}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(requirement.fields).map(([fieldKey, fieldConfig]) => (
                <div key={fieldKey} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center space-x-2">
                    {fieldConfig.visible ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="font-medium">{fieldKey}</span>
                    <Badge variant={fieldConfig.type === 'file' ? 'default' : 'secondary'}>
                      {fieldConfig.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`visible-${requirement.requirementId}-${fieldKey}`}>
                        Visible
                      </Label>
                      <Switch
                        id={`visible-${requirement.requirementId}-${fieldKey}`}
                        checked={fieldConfig.visible}
                        onCheckedChange={() => toggleFieldVisibility(requirement.requirementId, fieldKey)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`required-${requirement.requirementId}-${fieldKey}`}>
                        Required
                      </Label>
                      <Switch
                        id={`required-${requirement.requirementId}-${fieldKey}`}
                        checked={fieldConfig.required}
                        onCheckedChange={() => toggleFieldRequired(requirement.requirementId, fieldKey)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-sm text-muted-foreground">
        Note: Changes are local only and will not persist. This is a mock admin interface.
      </div>
    </div>
  );
}