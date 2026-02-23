// ============================================
// Admin Demo Page
// Demonstrates the dynamic form configuration system
// ============================================

import React, { useState } from 'react';
import { ConfigurationPortal } from '../components/admin';
import { DynamicFormRenderer } from '../components/forms/DynamicFormRenderer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { loadConfiguration, loadAllConfigurations } from '../services/configurationService';
import { DynamicFormConfig, CredentialSubmission } from '../types/dynamicConfig';

type ViewMode = 'admin' | 'preview';

export const AdminDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [selectedConfig, setSelectedConfig] = useState<DynamicFormConfig | null>(null);
  const [submissionData, setSubmissionData] = useState<CredentialSubmission | null>(null);

  const handleConfigSelected = (config: DynamicFormConfig) => {
    setSelectedConfig(config);
    setViewMode('preview');
  };

  const handleFormSubmit = (submission: CredentialSubmission) => {
    setSubmissionData(submission);
    alert('Form submitted successfully!\n\nCheck the browser console for submission data.');
    console.log('Submission Data:', submission);
  };

  const handleBackToAdmin = () => {
    setViewMode('admin');
    setSelectedConfig(null);
  };

  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100">
        <ConfigurationPortal onConfigChange={handleConfigSelected} />
      </div>
    );
  }

  if (viewMode === 'preview' && selectedConfig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">{selectedConfig.name} - Form Preview</h1>
            <Button variant="outline" onClick={handleBackToAdmin}>
              Back to Admin
            </Button>
          </div>
        </div>

        <DynamicFormRenderer
          config={selectedConfig}
          employeeId="demo_user"
          onSubmit={handleFormSubmit}
          onCancel={handleBackToAdmin}
        />

        {submissionData && (
          <div className="max-w-4xl mx-auto my-8">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">Form Submitted Successfully!</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-white p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(submissionData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Configuration System Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Welcome to the Dynamic Configuration System. This system allows you to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
            <li>Create and manage flexible credential form configurations</li>
            <li>Define sections, fields, validation rules, and visibility conditions</li>
            <li>Set up expiry rules based on various logic</li>
            <li>Render dynamic forms based on configurations</li>
            <li>Collect and validate user submissions</li>
          </ul>
          <Button onClick={() => setViewMode('admin')} size="lg">
            Open Configuration Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDemo;
