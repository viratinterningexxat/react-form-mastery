import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCredentials } from '@/hooks/useCredentials';
import { CredentialDocument } from '@/types/credential';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  User,
  Building,
  FileText,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Verify() {
  const { linkId } = useParams<{ linkId: string }>();
  const { documents } = useCredentials();
  const [studentData, setStudentData] = useState<{
    name: string;
    email: string;
    university: string;
    credentials: CredentialDocument[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch data from an API using the linkId
    // For demo purposes, we'll use mock data
    const mockStudentData = {
      name: 'John Student',
      email: 'john.student@university.edu',
      university: 'University of Example',
      credentials: documents.filter(doc => doc.status === 'approved'),
    };

    setTimeout(() => {
      setStudentData(mockStudentData);
      setLoading(false);
    }, 1000);
  }, [documents]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground mb-4">
              This verification link is invalid or has expired.
            </p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF report
    alert('Download functionality would generate a PDF report of verified credentials');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Credential Verification</CardTitle>
            <p className="text-muted-foreground">
              Official verification of clinical credentials
            </p>
          </CardHeader>
        </Card>

        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-lg font-semibold">{studentData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{studentData.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">University</label>
                <p className="text-lg">{studentData.university}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Verification Date</label>
                <p className="text-lg">{format(new Date(), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Verified Credentials
              </span>
              <Badge variant="default" className="bg-green-500">
                {studentData.credentials.length} Approved
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentData.credentials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p>No approved credentials found for this student.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentData.credentials.map((credential, index) => (
                  <div key={credential.id}>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                          <h3 className="font-medium">{credential.requirementName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Approved on {format(parseISO(credential.approvedAt || ''), 'MMM dd, yyyy')}
                          </p>
                          {credential.expiresAt && (
                            <p className="text-sm text-muted-foreground">
                              Expires: {format(parseISO(credential.expiresAt), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        Verified
                      </Badge>
                    </div>
                    {index < studentData.credentials.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Return to ClinCred</Link>
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              This verification is valid as of {format(new Date(), 'MMMM dd, yyyy hh:mm a')}
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>ClinCred - Clinical Credentialing Platform</p>
          <p>Secure verification powered by blockchain-level security</p>
        </div>
      </div>
    </div>
  );
}