import { memo, useCallback } from 'react';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { useCredentials } from '@/hooks/useCredentials';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { WorkHistorySection } from '@/components/profile/WorkHistorySection';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { StudentProfile } from '@/types/credential';
import { toast } from 'sonner';

const Profile = memo(function Profile() {
  const {
    profile,
    updateProfile,
    updateProfilePhoto,
    addWorkHistory,
    updateWorkHistory,
    removeWorkHistory,
    updateInterests,
    updateLanguages,
    updateCertifications,
    getProfileCompleteness,
  } = useStudentProfile();

  const { clinicalReadiness } = useCredentials();

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      try {
        await updateProfilePhoto(file);
        toast.success('Profile photo updated');
      } catch (error) {
        toast.error('Failed to update photo');
      }
    },
    [updateProfilePhoto]
  );

  const handleSaveProfile = useCallback(
    (data: Partial<StudentProfile>) => {
      updateProfile(data);
    },
    [updateProfile]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Professional Profile</h1>
        <p className="text-muted-foreground">
          Build your clinical identity. Complete profiles stand out to preceptors.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <ProfileCard
              profile={profile}
              readiness={clinicalReadiness}
              completeness={getProfileCompleteness()}
              onPhotoUpload={handlePhotoUpload}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileForm profile={profile} onSave={handleSaveProfile} />

          <WorkHistorySection
            workHistory={profile.workHistory}
            onAdd={addWorkHistory}
            onUpdate={updateWorkHistory}
            onRemove={removeWorkHistory}
          />

          <SkillsSection
            interests={profile.interests}
            languages={profile.languages}
            certifications={profile.certifications}
            onUpdateInterests={updateInterests}
            onUpdateLanguages={updateLanguages}
            onUpdateCertifications={updateCertifications}
          />
        </div>
      </div>
    </div>
  );
});

export default Profile;
