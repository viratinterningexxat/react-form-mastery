import { useState } from 'react';
import { AdminPortal } from '@/components/credentials/AdminPortal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Eye, 
  EyeOff,
  Syringe,
  RotateCcw,
  FileText,
  Database,
  Cog,
  Repeat,
  Calendar
} from 'lucide-react';
import { SectionConfig, FieldConfig, RepeatConfig, ExpiryRule, VisibilityRule } from '@/types/enhancedConfig';

export function EnhancedDemo() {
  const [currentConfig, setCurrentConfig] = useState<EnhancedSectionConfig>({
    enabled: true,
    label: 'Medical Credentials',
    required: true,
    category: 'Health Requirements',
    tags: {
      ouCode: 'MED001',
      userType: 'Clinical Staff'
    },
    workflow: {
      auto: true,
      on: {
        'PendingReview': [null, 'Approved']
      }
    },
    carryForwardConfig: {
      disabled: false,
      type: 'UntilExpiration',
      days: 30
    }
  });

  const [showAdmin, setShowAdmin] = useState(false);

  const handleSaveConfig = (config: EnhancedSectionConfig) => {
    setCurrentConfig(config);
    console.log('Configuration saved:', config);
    // In a real app, this would save to your backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enhanced Credential Management System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dynamic, configurable credential management with conditional field visibility and advanced admin controls
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Dynamic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure dose ranges, field visibility, and requirements dynamically through the admin portal
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <Badge variant="secondary">1-10 doses</Badge>
                <Badge variant="secondary">Custom fields</Badge>
                <Badge variant="secondary">Per-dose config</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-500" />
                <EyeOff className="w-5 h-5 text-red-500" />
                Conditional Visibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Show/hide fields based on document type, context, or custom rules
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <Badge variant="outline">TB: Show induration</Badge>
                <Badge variant="outline">Others: Hide induration</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                Admin Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intuitive interface for managing all credential requirements and configurations
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <Badge variant="secondary">Visual editor</Badge>
                <Badge variant="secondary">Real-time preview</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={() => setShowAdmin(!showAdmin)}
            variant={showAdmin ? "secondary" : "default"}
            size="lg"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showAdmin ? 'Close Admin Portal' : 'Open Admin Portal'}
          </Button>
        </div>

        {/* Admin Portal Demo */}
        {showAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration Admin Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <AdminPortal 
                  initialConfig={currentConfig}
                  onSave={handleSaveConfig}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Syringe className="w-4 h-4" />
                  Vaccine Settings
                </h3>
                <div className="text-sm space-y-2 bg-muted p-4 rounded-lg">
                  <p><strong>Enabled:</strong> {currentConfig.enabled ? 'Yes' : 'No'}</p>
                  <p><strong>Label:</strong> {currentConfig.label}</p>
                  <p><strong>Category:</strong> {currentConfig.category}</p>
                  <p><strong>Required:</strong> {currentConfig.required ? 'Yes' : 'No'}</p>
                  <p><strong>OU Code:</strong> {currentConfig.tags?.ouCode || 'N/A'}</p>
                  <p><strong>User Type:</strong> {currentConfig.tags?.userType || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Types Supported
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="font-medium">Tuberculosis (TB)</span>
                    <Badge variant="success">Induration: Visible</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="font-medium">Hepatitis B (HepB)</span>
                    <Badge variant="secondary">Induration: Hidden</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <span className="font-medium">COVID-19</span>
                    <Badge variant="secondary">Induration: Hidden</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="font-medium">Influenza (Flu)</span>
                    <Badge variant="secondary">Induration: Hidden</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Booster Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">Flexible</p>
                  <p className="text-sm text-muted-foreground">Dose count configuration</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">Independent</p>
                  <p className="text-sm text-muted-foreground">Fields & expiry logic</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">Toggle</p>
                  <p className="text-sm text-muted-foreground">Enable/disable as needed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Benefits */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-6">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Scalability', desc: 'Handles 1-10 doses per vaccine', icon: '📈' },
              { title: 'Flexibility', desc: 'Dynamic field configuration', icon: '⚙️' },
              { title: 'Intelligence', desc: 'Conditional field visibility', icon: '🤖' },
              { title: 'Admin Control', desc: 'Visual configuration portal', icon: '🎨' }
            ].map((benefit, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl mb-2">{benefit.icon}</div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}