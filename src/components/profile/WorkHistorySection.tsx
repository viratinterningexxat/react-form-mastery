import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkHistoryEntry } from '@/types/credential';
import { Plus, Briefcase, Trash2, Edit2, X, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WorkHistorySectionProps {
  workHistory: WorkHistoryEntry[];
  onAdd: (entry: Omit<WorkHistoryEntry, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<WorkHistoryEntry>) => void;
  onRemove: (id: string) => void;
}

interface WorkFormData {
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

const emptyForm: WorkFormData = {
  title: '',
  organization: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
};

export const WorkHistorySection = memo(function WorkHistorySection({
  workHistory,
  onAdd,
  onUpdate,
  onRemove,
}: WorkHistorySectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkFormData>(emptyForm);

  const handleOpenAdd = useCallback(() => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((entry: WorkHistoryEntry) => {
    setEditingId(entry.id);
    setFormData({
      title: entry.title,
      organization: entry.organization,
      startDate: entry.startDate,
      endDate: entry.endDate || '',
      isCurrent: entry.isCurrent,
      description: entry.description,
    });
    setIsDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const entryData = {
      title: formData.title,
      organization: formData.organization,
      startDate: formData.startDate,
      endDate: formData.isCurrent ? null : formData.endDate || null,
      isCurrent: formData.isCurrent,
      description: formData.description,
    };

    if (editingId) {
      onUpdate(editingId, entryData);
    } else {
      onAdd(entryData);
    }
    setIsDialogOpen(false);
    setFormData(emptyForm);
  }, [formData, editingId, onAdd, onUpdate]);

  const handleInputChange = useCallback((field: keyof WorkFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const sortedHistory = [...workHistory].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Work History</CardTitle>
            <CardDescription>Add your clinical and healthcare experience</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Experience' : 'Add Experience'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Nursing Assistant"
                  />
                </div>
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    placeholder="Memorial Hospital"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="month"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="month"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      disabled={formData.isCurrent}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onCheckedChange={(checked) => handleInputChange('isCurrent', checked as boolean)}
                  />
                  <Label htmlFor="isCurrent" className="font-normal">
                    I currently work here
                  </Label>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.title || !formData.organization}>
                    {editingId ? 'Save Changes' : 'Add Experience'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No work history added yet</p>
            <p className="text-sm">Add your clinical and healthcare experience</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedHistory.map((entry) => (
              <div
                key={entry.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{entry.title}</h4>
                      <p className="text-sm text-muted-foreground">{entry.organization}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.startDate} - {entry.isCurrent ? 'Present' : entry.endDate}
                      </p>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenEdit(entry)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => onRemove(entry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
