import { memo, useState, useCallback, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Heart, Languages, Award } from 'lucide-react';

interface SkillsSectionProps {
  interests: string[];
  languages: string[];
  certifications: string[];
  onUpdateInterests: (interests: string[]) => void;
  onUpdateLanguages: (languages: string[]) => void;
  onUpdateCertifications: (certifications: string[]) => void;
}

interface TagInputProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: string[];
  placeholder: string;
  onUpdate: (items: string[]) => void;
}

const TagInput = memo(function TagInput({
  title,
  description,
  icon,
  items,
  placeholder,
  onUpdate,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = useCallback(() => {
    const value = inputValue.trim();
    if (value && !items.includes(value)) {
      onUpdate([...items, value]);
      setInputValue('');
    }
  }, [inputValue, items, onUpdate]);

  const handleRemove = useCallback(
    (item: string) => {
      onUpdate(items.filter((i) => i !== item));
    },
    [items, onUpdate]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={handleAdd} disabled={!inputValue.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary" className="pr-1">
              {item}
              <button
                onClick={() => handleRemove(item)}
                className="ml-1 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});

export const SkillsSection = memo(function SkillsSection({
  interests,
  languages,
  certifications,
  onUpdateInterests,
  onUpdateLanguages,
  onUpdateCertifications,
}: SkillsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Interests</CardTitle>
        <CardDescription>
          Showcase what makes you unique as a healthcare professional
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TagInput
          title="Clinical Interests"
          description="Areas of healthcare you're passionate about"
          icon={<Heart className="w-4 h-4" />}
          items={interests}
          placeholder="e.g., Pediatrics, Emergency Care"
          onUpdate={onUpdateInterests}
        />

        <TagInput
          title="Languages"
          description="Languages you can communicate in"
          icon={<Languages className="w-4 h-4" />}
          items={languages}
          placeholder="e.g., English, Spanish"
          onUpdate={onUpdateLanguages}
        />

        <TagInput
          title="Additional Certifications"
          description="Other certifications beyond requirements"
          icon={<Award className="w-4 h-4" />}
          items={certifications}
          placeholder="e.g., PALS, ACLS"
          onUpdate={onUpdateCertifications}
        />
      </CardContent>
    </Card>
  );
});
