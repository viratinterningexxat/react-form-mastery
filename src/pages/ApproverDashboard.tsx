import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCredentials } from '@/hooks/useCredentials';
import { CredentialDocument, DocumentStatus } from '@/types/credential';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
  Users,
  TrendingUp,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

interface ReviewDocument extends CredentialDocument {
  studentName?: string;
  requirementName?: string;
  submittedAt: string;
}

interface ReviewDialogProps {
  document: ReviewDocument;
  onApprove: (id: string, notes?: string) => void;
  onApproveWithException: (id: string, notes: string) => void;
  onReject: (id: string, reason: string) => void;
}

function ReviewDialog({ document, onApprove, onApproveWithException, onReject }: ReviewDialogProps) {
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = () => {
    switch (decision) {
      case 'approve':
        onApprove(document.id, notes);
        break;
      case 'approve_exception':
        if (notes.trim()) {
          onApproveWithException(document.id, notes);
        }
        break;
      case 'reject':
        if (rejectionReason.trim()) {
          onReject(document.id, rejectionReason);
        }
        break;
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Review Credential</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Student Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            STUDENT INFORMATION
          </h3>
          <div className="grid gap-2 text-sm">
            <div><strong>Name:</strong> {document.studentName || 'Unknown Student'}</div>
            <div><strong>Program:</strong> Nursing</div>
            <div><strong>School:</strong> University of California</div>
          </div>
        </div>

        {/* Credential Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            CREDENTIAL DETAILS
          </h3>
          <div className="grid gap-2 text-sm">
            <div><strong>Type:</strong> {document.requirementName}</div>
            <div><strong>Date:</strong> {format(new Date(document.submittedAt), 'MMM dd, yyyy')}</div>
            <div><strong>Clinic:</strong> Student Health Center</div>
            <div><strong>Document:</strong> <span className="text-blue-600">vaccination_record.pdf</span></div>
          </div>
        </div>

        {/* Approval Decision */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            APPROVAL DECISION
          </h3>
          <RadioGroup value={decision} onValueChange={setDecision}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approve" id="approve" />
              <Label htmlFor="approve">Approve (Full approval)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approve_exception" id="approve_exception" />
              <Label htmlFor="approve_exception">Approve with Exception</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reject" id="reject" />
              <Label htmlFor="reject">Reject</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any comments or feedback..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Rejection Reason */}
        {decision === 'reject' && (
          <div className="space-y-2">
            <Label htmlFor="rejection">Rejection Reason (Required)</Label>
            <Textarea
              id="rejection"
              placeholder="Please provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!decision || (decision === 'reject' && !rejectionReason.trim())}>
            Submit Review
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default function ApproverDashboard() {
  const { documents, requirements, updateDocumentStatus } = useCredentials();

  const enrichedDocuments = useMemo(() => {
    return documents.map(doc => {
      const requirement = requirements.find(r => r.id === doc.requirementId);
      return {
        ...doc,
        requirementName: requirement?.name || 'Unknown Requirement',
        studentName: 'Virat Gandhi', // Mock data
        submittedAt: doc.uploadedAt,
      } as ReviewDocument;
    });
  }, [documents, requirements]);

  const stats = useMemo(() => {
    const pending = enrichedDocuments.filter(doc => doc.status === 'pending_review').length;
    const approved = enrichedDocuments.filter(doc => doc.status === 'approved' || doc.status === 'approved_with_exception').length;
    const rejected = enrichedDocuments.filter(doc => doc.status === 'rejected').length;
    const total = enrichedDocuments.length;

    return { pending, approved, rejected, total };
  }, [enrichedDocuments]);

  const pendingDocuments = enrichedDocuments.filter(doc => doc.status === 'pending_review');
  const reviewedDocuments = enrichedDocuments.filter(doc => doc.status !== 'pending_review');

  const handleApprove = (docId: string, notes?: string) => {
    updateDocumentStatus(docId, 'approved', notes);
  };

  const handleApproveWithException = (docId: string, notes: string) => {
    updateDocumentStatus(docId, 'approved_with_exception', notes);
  };

  const handleReject = (docId: string, reason: string) => {
    updateDocumentStatus(docId, 'rejected', reason);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Credential Review Portal</h1>
          <p className="text-muted-foreground">Review and validate credentials</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Pending Review: {stats.pending}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileCheck className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Credentials Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            PENDING REVIEW QUEUE
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No pending credentials to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDocuments.map((doc) => (
                <Card key={doc.id} className="p-4 border-l-4 border-l-yellow-500">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Credential: {doc.requirementName}</h3>
                        <Badge variant="secondary">High Priority</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Student: {doc.studentName || 'Unknown Student'} (ID: {doc.studentId || 'N/A'})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {format(new Date(doc.submittedAt), 'MMM dd, yyyy \'at\' h:mm a')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Days Pending: {Math.floor((new Date().getTime() - new Date(doc.submittedAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            Review & Approve
                          </Button>
                        </DialogTrigger>
                        <ReviewDialog
                          document={doc}
                          onApprove={handleApprove}
                          onApproveWithException={handleApproveWithException}
                          onReject={handleReject}
                        />
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviewed Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            ALREADY REVIEWED
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewedDocuments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reviewed credentials yet</p>
          ) : (
            <div className="space-y-3">
              {reviewedDocuments.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {doc.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {doc.status === 'approved_with_exception' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                    {doc.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                    <div>
                      <p className="font-medium">
                        {doc.requirementName} - {
                          doc.status === 'approved' ? 'Approved' :
                          doc.status === 'approved_with_exception' ? 'Approved w/ Exception' :
                          'Rejected'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doc.approvedAt ? format(new Date(doc.approvedAt), 'MMM dd, yyyy') : 'Recently reviewed'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
              {reviewedDocuments.length > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  And {reviewedDocuments.length - 5} more...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}