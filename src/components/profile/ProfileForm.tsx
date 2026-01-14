import { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { StudentProfile } from '@/types/credential';
import { Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  legalName: z.string().min(1, 'Legal name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  program: z.string().min(1, 'Program is required'),
  expectedGraduation: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: StudentProfile;
  onSave: (data: Partial<StudentProfile>) => void;
}

export const ProfileForm = memo(function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      legalName: profile.legalName,
      email: profile.email,
      phone: profile.phone,
      program: profile.program,
      expectedGraduation: profile.expectedGraduation,
      bio: profile.bio,
    },
  });

  const onSubmit = useCallback(
    (data: ProfileFormData) => {
      onSave(data);
      toast.success('Profile updated successfully');
    },
    [onSave]
  );

  const legalName = form.watch('legalName');
  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');
  const namesMismatch = legalName && (firstName || lastName) && 
    legalName.toLowerCase() !== `${firstName} ${lastName}`.toLowerCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your profile information. Your legal name must match your certificates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Name (as on certificates)</FormLabel>
                  <FormControl>
                    <Input placeholder="Jonathan Smith" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must match exactly as it appears on your official documents
                  </FormDescription>
                  {namesMismatch && (
                    <div className="flex items-center gap-2 text-warning text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Legal name differs from display name - ensure certificates match</span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program</FormLabel>
                    <FormControl>
                      <Input placeholder="Bachelor of Science in Nursing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expectedGraduation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Graduation</FormLabel>
                    <FormControl>
                      <Input placeholder="May 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell clinical sites about yourself, your interests, and career goals..."
                      className="resize-none"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {(field.value?.length || 0)}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="gradient-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
});
