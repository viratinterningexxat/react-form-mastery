import { memo, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudentProfile, ClinicalReadiness } from '@/types/credential';
import { Camera, Mail, Phone, GraduationCap, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: StudentProfile;
  readiness: ClinicalReadiness;
  completeness: number;
  onPhotoUpload: (file: File) => Promise<void>;
}

export const ProfileCard = memo(function ProfileCard({
  profile,
  readiness,
  completeness,
  onPhotoUpload,
}: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await onPhotoUpload(file);
      }
    },
    [onPhotoUpload]
  );

  const getInitials = () => {
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <Card className="overflow-hidden">
      {/* Header Banner */}
      <div className="h-24 gradient-hero" />
      
      <CardContent className="relative pt-0 -mt-12">
        {/* Avatar */}
        <div className="relative inline-block">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage src={profile.profilePhotoUrl} alt={profile.firstName} />
            <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handlePhotoClick}
            className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Profile Info */}
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {profile.firstName || profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : 'Complete Your Profile'}
              </h2>
              {readiness.isReady && (
                <Badge className="bg-success text-success-foreground">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            {profile.legalName && profile.legalName !== `${profile.firstName} ${profile.lastName}` && (
              <p className="text-sm text-muted-foreground">
                Legal Name: {profile.legalName}
              </p>
            )}
          </div>

          {profile.program && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span>{profile.program}</span>
              {profile.expectedGraduation && (
                <span className="text-sm">• Expected: {profile.expectedGraduation}</span>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            {profile.email && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
              {profile.bio}
            </p>
          )}

          {/* Profile Completeness */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Profile Completeness</span>
              <span className="text-sm font-medium">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">{readiness.totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{readiness.totalPending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{readiness.percentComplete}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
