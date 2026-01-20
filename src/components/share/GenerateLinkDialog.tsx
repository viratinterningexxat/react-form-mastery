import { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, Link, Trash2 } from 'lucide-react';
import { useShareableLink } from '@/hooks/useShareableLink';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const GenerateLinkDialog = memo(function GenerateLinkDialog() {
  const [open, setOpen] = useState(false);
  const [expiration, setExpiration] = useState<string>('never');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { links, generateLink, deleteLink, getShareUrl } = useShareableLink();
  const { toast } = useToast();

  const handleGenerate = useCallback(() => {
    const expirationDays = expiration === 'never' ? undefined : parseInt(expiration);
    const link = generateLink(expirationDays);
    
    toast({
      title: 'Link Generated!',
      description: 'Your shareable profile link has been created.',
    });
    
    // Copy to clipboard immediately
    navigator.clipboard.writeText(getShareUrl(link.id));
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, [expiration, generateLink, getShareUrl, toast]);

  const handleCopy = useCallback((linkId: string) => {
    navigator.clipboard.writeText(getShareUrl(linkId));
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard.',
    });
  }, [getShareUrl, toast]);

  const handleDelete = useCallback((linkId: string) => {
    deleteLink(linkId);
    toast({
      title: 'Link Deleted',
      description: 'The shareable link has been removed.',
    });
  }, [deleteLink, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Delegator Link
          </DialogTitle>
          <DialogDescription>
            Generate a secure, read-only link to share your verified credentials with clinical sites.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Generate new link */}
          <div className="space-y-3">
            <Label>Link Expiration</Label>
            <div className="flex gap-2">
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never expires</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerate}>
                <Link className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {/* Existing links */}
          {links.length > 0 && (
            <div className="space-y-3">
              <Label>Active Links</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex-1 min-w-0">
                      <Input
                        readOnly
                        value={getShareUrl(link.id)}
                        className="text-xs h-8 bg-background"
                      />
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <span>Created {format(parseISO(link.createdAt), 'MMM d')}</span>
                        <span>•</span>
                        <span>{link.accessCount} views</span>
                        {link.expiresAt && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs py-0">
                              Expires {format(parseISO(link.expiresAt), 'MMM d')}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(link.id)}
                      >
                        {copiedId === link.id ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
