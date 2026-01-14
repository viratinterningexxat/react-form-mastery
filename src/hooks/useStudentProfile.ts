import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { StudentProfile, WorkHistoryEntry } from '@/types/credential';

const STORAGE_KEY = 'student_profile';

const DEFAULT_PROFILE: StudentProfile = {
  id: 'student_1',
  firstName: '',
  lastName: '',
  legalName: '',
  email: '',
  phone: '',
  program: '',
  expectedGraduation: '',
  bio: '',
  profilePhotoUrl: undefined,
  workHistory: [],
  interests: [],
  languages: [],
  certifications: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useStudentProfile() {
  const [profile, setProfile] = useLocalStorage<StudentProfile>(
    STORAGE_KEY,
    DEFAULT_PROFILE
  );

  const updateProfile = useCallback(
    (updates: Partial<StudentProfile>) => {
      setProfile((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    },
    [setProfile]
  );

  const updateBasicInfo = useCallback(
    (info: Pick<StudentProfile, 'firstName' | 'lastName' | 'legalName' | 'email' | 'phone' | 'program' | 'expectedGraduation'>) => {
      updateProfile(info);
    },
    [updateProfile]
  );

  const updateBio = useCallback(
    (bio: string) => {
      updateProfile({ bio });
    },
    [updateProfile]
  );

  const updateProfilePhoto = useCallback(
    async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const photoUrl = reader.result as string;
          updateProfile({ profilePhotoUrl: photoUrl });
          resolve(photoUrl);
        };
        reader.onerror = () => reject(new Error('Failed to read photo'));
        reader.readAsDataURL(file);
      });
    },
    [updateProfile]
  );

  const addWorkHistory = useCallback(
    (entry: Omit<WorkHistoryEntry, 'id'>) => {
      const newEntry: WorkHistoryEntry = {
        ...entry,
        id: `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      setProfile((prev) => ({
        ...prev,
        workHistory: [...prev.workHistory, newEntry],
        updatedAt: new Date().toISOString(),
      }));
      return newEntry;
    },
    [setProfile]
  );

  const updateWorkHistory = useCallback(
    (id: string, updates: Partial<WorkHistoryEntry>) => {
      setProfile((prev) => ({
        ...prev,
        workHistory: prev.workHistory.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [setProfile]
  );

  const removeWorkHistory = useCallback(
    (id: string) => {
      setProfile((prev) => ({
        ...prev,
        workHistory: prev.workHistory.filter((entry) => entry.id !== id),
        updatedAt: new Date().toISOString(),
      }));
    },
    [setProfile]
  );

  const updateInterests = useCallback(
    (interests: string[]) => {
      updateProfile({ interests });
    },
    [updateProfile]
  );

  const updateLanguages = useCallback(
    (languages: string[]) => {
      updateProfile({ languages });
    },
    [updateProfile]
  );

  const updateCertifications = useCallback(
    (certifications: string[]) => {
      updateProfile({ certifications });
    },
    [updateProfile]
  );

  const isProfileComplete = useCallback(() => {
    return (
      profile.firstName.trim() !== '' &&
      profile.lastName.trim() !== '' &&
      profile.legalName.trim() !== '' &&
      profile.email.trim() !== '' &&
      profile.program.trim() !== ''
    );
  }, [profile]);

  const getProfileCompleteness = useCallback(() => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.legalName,
      profile.email,
      profile.phone,
      profile.program,
      profile.expectedGraduation,
      profile.bio,
      profile.profilePhotoUrl,
    ];
    
    const bonusFields = [
      profile.workHistory.length > 0,
      profile.interests.length > 0,
      profile.languages.length > 0,
    ];

    const filledFields = fields.filter((f) => f && String(f).trim() !== '').length;
    const filledBonus = bonusFields.filter(Boolean).length;
    
    const basePercentage = (filledFields / fields.length) * 80;
    const bonusPercentage = (filledBonus / bonusFields.length) * 20;

    return Math.round(basePercentage + bonusPercentage);
  }, [profile]);

  return {
    profile,
    updateProfile,
    updateBasicInfo,
    updateBio,
    updateProfilePhoto,
    addWorkHistory,
    updateWorkHistory,
    removeWorkHistory,
    updateInterests,
    updateLanguages,
    updateCertifications,
    isProfileComplete,
    getProfileCompleteness,
  };
}
