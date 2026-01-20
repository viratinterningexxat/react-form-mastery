import { memo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useShareableLink } from '@/hooks/useShareableLink';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { useCredentials } from '@/hooks/useCredentials';
import {
  Shield,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  AlertTriangle,
  Home,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const SharedProfile = memo(function SharedProfile() {
  const { linkId } = useParams<{ linkId: string }>();
  const { links, isLinkValid, incrementAccessCount } = useShareableLink();
  const { profile } = useStudentProfile();
  const { documents, clinicalReadiness } = useCredentials();

  const link = links.find((l) => l.id === linkId);
  const isValid = linkId ? isLinkValid(linkId) : false;

  useEffect(() => {
    if (linkId && isValid) {
      incrementAccessCount(linkId);
    }
  }, [linkId, isValid, incrementAccessCount]);

  if (!link || !isValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-warning mb-4" />
            <h1 className="text-xl font-bold mb-2">Link Not Found or Expired</h1>
            <p className="text-muted-foreground mb-6">
              This shareable profile link is no longer valid. Please contact the credential holder for a new link.
            </p>
            <Link to="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const approvedDocs = documents.filter((doc) => doc.status === 'approved');
  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">ClinCred</h1>
              <p className="text-xs text-muted-foreground">Verified Credential Profile</p>
            </div>
            <Badge variant="success" className="ml-auto">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.profilePhotoUrl} />
                <AvatarFallback className="text-2xl">{initials || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-muted-foreground">{profile.bio || 'Healthcare Professional'}</p>
                <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-sm text-muted-foreground">
                  {profile.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">
                  {clinicalReadiness.percentComplete}%
                </div>
                <p className="text-sm text-muted-foreground">Clinical Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Verified Credentials
              <Badge variant="secondary" className="ml-auto">
                {approvedDocs.length} Approved
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedDocs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No approved credentials to display
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {approvedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-success/5 border-success/20"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.fileName}</p>
                      {doc.expiresAt && (
                        <p className="text-xs text-muted-foreground">
                          Valid until {format(parseISO(doc.expiresAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work History */}
        {profile.workHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Clinical Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.workHistory.map((work) => (
                <div key={work.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{work.title}</h4>
                    <p className="text-sm text-muted-foreground">{work.organization}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(work.startDate), 'MMM yyyy')} -{' '}
                      {work.endDate ? format(parseISO(work.endDate), 'MMM yyyy') : 'Present'}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Skills & Interests */}
        {profile.interests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Skills & Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>This profile was shared via ClinCred Delegator Link</p>
          <p>Credentials verified as of {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
      </div>
    </div>
  );
});

export default SharedProfile;
