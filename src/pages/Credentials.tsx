import { memo, useCallback, useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { DynamicFormSection } from '@/components/credentials/DynamicFormSection';
import { SectionKey, SectionConfig, SectionFormData } from '@/types/formConfig';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import requirementConfig from '@/data/requirement-config.json';
import { 
  FileCheck, 
  Info, 
  Sparkles, 
  Send,
  Syringe,
  Award,
  Stethoscope,
  FileText,
  Shield,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Section order and grouping
const sectionGroups = [
  {
    title: 'Vaccination Details',
    icon: Syringe,
    color: 'bg-blue-500',
    sections: ['vaccine'] as SectionKey[],
  },
  {
    title: 'Blood Tests & Screening',
    icon: Stethoscope,
    color: 'bg-red-500',
    sections: ['bloodTest', 'chestXray', 'symptomScrn'] as SectionKey[],
  },
  {
    title: 'Titer Results',
    icon: ClipboardCheck,
    color: 'bg-purple-500',
    sections: ['titer', 'repeatTiter', 'otherTiter'] as SectionKey[],
  },
  {
    title: 'Certifications & Licensure',
    icon: Award,
    color: 'bg-amber-500',
    sections: ['certification', 'licensure'] as SectionKey[],
  },
  {
    title: 'Health Summary',
    icon: FileText,
    color: 'bg-cyan-500',
    sections: ['hisummary', 'custom'] as SectionKey[],
  },
  {
    title: 'Declination & History',
    icon: Shield,
    color: 'bg-emerald-500',
    sections: ['decline', 'historyOfDisease', 'booster'] as SectionKey[],
  },
];

const Credentials = memo(function Credentials() {
  const [configMode, setConfigMode] = useState<'details' | 'declination'>('details');
  const [completedSections, setCompletedSections] = useLocalStorage<string[]>(
    'completed_sections',
    []
  );

  const handleSectionDataChange = useCallback((sectionKey: SectionKey, data: SectionFormData) => {
    // Track completion
    if (data.status === 'pending_review' && !completedSections.includes(sectionKey)) {
      setCompletedSections([...completedSections, sectionKey]);
    }
  }, [completedSections, setCompletedSections]);

  const handleSubmit = useCallback(() => {
    toast.success('Credentials submitted for review!', {
      description: 'You will be notified once they are approved.',
    });
  }, []);

  // Get section config safely
  const getSectionConfig = (key: SectionKey): SectionConfig | null => {
    const config = (requirementConfig as any)[key];
    return config?.enabled ? config : null;
  };

  // Calculate overall progress
  const totalSections = sectionGroups.flatMap(g => g.sections)
    .filter(key => getSectionConfig(key))
    .length;
  const completedCount = completedSections.length;
  const progressPercent = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold">Clinical Credentials</h1>
          </div>
          <p className="text-muted-foreground">
            Upload documents and they will be automatically analyzed to fill in the details.
          </p>
        </div>
        <Button onClick={handleSubmit} className="shrink-0">
          <Send className="w-4 h-4 mr-2" />
          Submit
        </Button>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Overall Progress</span>
            <Badge variant={progressPercent === 100 ? 'success' : 'secondary'}>
              {completedCount}/{totalSections} sections
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {progressPercent === 100 
              ? '✓ All sections complete! Ready to submit.'
              : `${100 - progressPercent}% remaining`}
          </p>
        </CardContent>
      </Card>

      {/* Configuration Mode Selection */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5">
          <RadioGroup
            value={configMode}
            onValueChange={(val) => setConfigMode(val as 'details' | 'declination')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="details" id="details" />
              <Label htmlFor="details" className="cursor-pointer">
                I want to provide details for {requirementConfig.name}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="declination" id="declination" />
              <Label htmlFor="declination" className="cursor-pointer">
                I want to provide declination for {requirementConfig.name}
              </Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground mt-4">
            Open the section(s) relevant to you and provide the needed information
          </p>
        </CardContent>
      </Card>

      {/* OCR Feature Notice */}
      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <Sparkles className="w-4 h-4 text-primary" />
        <AlertTitle className="text-primary">Smart Document Analysis</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Upload vaccine cards or medical documents - our AI will automatically extract dates, 
          manufacturers, and lot numbers to fill in the form.
        </AlertDescription>
      </Alert>

      {/* Section Groups */}
      <div className="space-y-4">
        {sectionGroups.map((group) => {
          const enabledSections = group.sections.filter(key => getSectionConfig(key));
          if (enabledSections.length === 0) return null;

          const groupCompleted = enabledSections.filter(s => completedSections.includes(s)).length;
          const groupTotal = enabledSections.length;

          return (
            <Card key={group.title} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg text-white", group.color)}>
                    <group.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={(groupCompleted / groupTotal) * 100} className="h-1.5 w-24" />
                      <span className="text-xs text-muted-foreground">
                        {groupCompleted}/{groupTotal}
                      </span>
                    </div>
                  </div>
                  <Badge variant={groupCompleted === groupTotal ? 'success' : 'outline'}>
                    {groupCompleted === groupTotal ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-2">
                <Accordion type="multiple" className="border-t">
                  {enabledSections.map((sectionKey) => {
                    const config = getSectionConfig(sectionKey);
                    if (!config) return null;

                    return (
                      <DynamicFormSection
                        key={sectionKey}
                        sectionKey={sectionKey}
                        config={config}
                        onDataChange={(data) => handleSectionDataChange(sectionKey, data)}
                      />
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions Panel */}
      <Card className="bg-muted/20">
        <CardContent className="pt-5">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Instructions for completing documents
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Upload clear images of your vaccination cards or medical documents</li>
            <li>Our AI will automatically extract dates, manufacturers, and lot numbers</li>
            <li>Review and correct any extracted information before submitting</li>
            <li>Expiration dates are auto-calculated based on the administration date</li>
            <li>All documents must be in PDF, JPG, or PNG format</li>
          </ul>
          <Separator className="my-4" />
          <h3 className="font-semibold mb-2">Guidelines for reviewers</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Verify that names match across all documents</li>
            <li>Check expiration dates and ensure all required doses are documented</li>
            <li>Confirm manufacturer and lot numbers are legible</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
});

export default Credentials;
