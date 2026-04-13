import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import {
  CredentialDocument,
  CredentialRequirement,
  ClinicalReadiness,
  ExpirationAlert,
  DocumentStatus,
  DEFAULT_REQUIREMENTS,
} from '@/types/credential';
import { differenceInDays, parseISO, addDays, format, subDays } from 'date-fns';

const STORAGE_KEYS = {
  documents: 'credential_documents',
  alerts: 'expiration_alerts',
  requirements: 'credential_requirements',
} as const;

export function useCredentials() {
  const [documents, setDocuments] = useLocalStorage<CredentialDocument[]>(
    STORAGE_KEYS.documents,
    []
  );
  const [alerts, setAlerts] = useLocalStorage<ExpirationAlert[]>(
    STORAGE_KEYS.alerts,
    []
  );
  const [requirements] = useLocalStorage<CredentialRequirement[]>(
    STORAGE_KEYS.requirements,
    DEFAULT_REQUIREMENTS
  );
  const { user } = useAuth();

  const getRequirementExpiry = (requirement: CredentialRequirement | undefined, uploadedAt: string) => {
    if (!requirement || requirement.validityPeriodDays === null) return null;
    return addDays(new Date(uploadedAt), requirement.validityPeriodDays).toISOString();
  };

  const createMockDocument = (params: {
    requirementId: string;
    status: DocumentStatus;
    uploadedAt: string;
    expiresAt: string | null;
    studentId?: string;
    studentName?: string;
    reviewNotes?: string;
    reviewedAt?: string;
    reviewedBy?: string;
  }): CredentialDocument => ({
    id: `${params.requirementId}_${Math.random().toString(36).substr(2, 8)}`,
    requirementId: params.requirementId,
    fileName: `${params.requirementId}_document.pdf`,
    fileType: 'application/pdf',
    fileSize: 1024,
    fileDataUrl: '',
    uploadedAt: params.uploadedAt,
    status: params.status,
    expiresAt: params.expiresAt,
    reviewNotes: params.reviewNotes,
    reviewedAt: params.reviewedAt,
    reviewedBy: params.reviewedBy,
    studentId: params.studentId,
    studentName: params.studentName,
  });

  const generateMockDocuments = (role: 'student' | 'approver' | 'clinical_site') => {
    const now = new Date();
    const formatUploaded = (daysAgo: number) => subDays(now, daysAgo).toISOString();

    const statuses: DocumentStatus[] = ['pending_review', 'approved', 'approved_with_exception', 'rejected'];
    const studentNames = [
      'John Student', 'Jane Doe', 'Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince', 'Eve Wilson', 'Frank Miller',
      'Grace Lee', 'Henry Ford', 'Ivy Chen', 'Jack Ryan', 'Kate Bush', 'Liam Neeson', 'Mia Khalifa', 'Noah Centineo',
      'Olivia Rodrigo', 'Peter Parker', 'Quinn Fabray', 'Rachel Green', 'Sam Wilson', 'Tina Fey', 'Uma Thurman',
      'Victor Hugo', 'Wanda Maximoff', 'Xavier Charles', 'Yara Shahidi', 'Zoe Saldana', 'Aaron Judge', 'Bella Thorne',
      'Cody Simpson', 'Dakota Fanning', 'Ethan Hawke', 'Fiona Apple', 'Gavin Newsom', 'Holly Hunter', 'Ian McShane',
      'Julia Roberts', 'Kevin Hart', 'Lana Del Rey', 'Mason Mount', 'Nina Dobrev', 'Owen Wilson', 'Piper Perabo',
      'Quincy Jones', 'Riley Reid', 'Seth Rogen', 'Tilda Swinton', 'Uri Geller', 'Vanessa Hudgens', 'Will Smith',
      'Xena Warrior', 'Yusuf Islam', 'Zara Larsson', 'Adam Levine', 'Betty White', 'Chris Evans', 'Drew Barrymore',
      'Elton John', 'Florence Welch', 'George Clooney', 'Halle Berry', 'Idris Elba', 'Jennifer Lopez', 'Kanye West',
      'Lady Gaga', 'Michael Jordan', 'Natalie Portman', 'Oprah Winfrey', 'Prince Harry', 'Queen Latifah', 'Ryan Reynolds',
      'Scarlett Johansson', 'Tom Hanks', 'Ursula K. Le Guin', 'Vin Diesel', 'Willem Dafoe', 'Xzibit', 'Yoda', 'Zac Efron',
      'Ava Gardner', 'Bruce Willis', 'Cameron Diaz', 'Daniel Radcliffe', 'Emma Watson', 'Forest Whitaker', 'Gal Gadot',
      'Harrison Ford', 'Ingrid Bergman', 'James Dean', 'Kirsten Dunst', 'Leonardo DiCaprio', 'Meryl Streep', 'Nicolas Cage',
      'Orlando Bloom', 'Penelope Cruz', 'Quentin Tarantino', 'Robert Downey Jr.', 'Sandra Bullock', 'Tim Burton',
      'Uma Thurman', 'Viggo Mortensen', 'Winona Ryder', 'Xavier Dolan', 'Yann Martel', 'Zoe Kravitz'
    ];

    const generateBatch = (count: number, studentPrefix: string, statusDistribution: Record<DocumentStatus, number>) => {
      const docs: CredentialDocument[] = [];
      let idCounter = 0;

      for (let i = 0; i < count; i++) {
        const requirementId = requirements[Math.floor(Math.random() * requirements.length)].id;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const daysAgo = Math.floor(Math.random() * 365) + 1; // 1 to 365 days ago
        const studentIndex = Math.floor(Math.random() * studentNames.length);
        const studentId = `${studentPrefix}_${studentIndex}`;
        const studentName = studentNames[studentIndex];

        const doc = createMockDocument({
          requirementId,
          status,
          uploadedAt: formatUploaded(daysAgo),
          expiresAt: getRequirementExpiry(requirements.find((r) => r.id === requirementId), formatUploaded(daysAgo)),
          studentId,
          studentName,
          reviewNotes: status === 'rejected' ? 'Random rejection note' : status === 'approved_with_exception' ? 'Approved with minor exception' : undefined,
          reviewedAt: status !== 'pending_review' ? formatUploaded(Math.floor(Math.random() * daysAgo)) : undefined,
          reviewedBy: status !== 'pending_review' ? 'Mock Reviewer' : undefined,
        });
        docs.push(doc);
      }
      return docs;
    };

    if (role === 'approver') {
      return generateBatch(10000, 'approver_student', { pending_review: 60, approved: 25, approved_with_exception: 10, rejected: 5 });
    }

    if (role === 'clinical_site') {
      return generateBatch(10000, 'clinical_student', { pending_review: 20, approved: 60, approved_with_exception: 15, rejected: 5 });
    }

    // Default student mock data - 10000 documents for the student
    return generateBatch(10000, 'student', { pending_review: 10, approved: 70, approved_with_exception: 15, rejected: 5 });
  };

  useEffect(() => {
    if (!user || documents.length > 0 || requirements.length === 0) return;
    const mockDocs = generateMockDocuments(user.role);
    setDocuments(mockDocs);
  }, [user, documents.length, requirements.length, requirements, setDocuments]);

  // Calculate expiration alerts
  const calculateAlerts = useCallback(() => {
    const now = new Date();
    const newAlerts: ExpirationAlert[] = [];

    documents.forEach((doc) => {
      if (!doc.expiresAt) return;

      const expiryDate = parseISO(doc.expiresAt);
      const daysUntilExpiry = differenceInDays(expiryDate, now);

      // Only alert for documents expiring within 90 days
      if (daysUntilExpiry <= 90 && daysUntilExpiry > -30) {
        const requirement = requirements.find((r) => r.id === doc.requirementId);
        
        let severity: ExpirationAlert['severity'] = 'info';
        if (daysUntilExpiry <= 0) severity = 'critical';
        else if (daysUntilExpiry <= 30) severity = 'warning';

        newAlerts.push({
          id: `alert_${doc.id}`,
          credentialId: doc.id,
          credentialName: requirement?.name || 'Unknown',
          expiresAt: doc.expiresAt,
          daysUntilExpiry,
          severity,
          isRead: alerts.find((a) => a.id === `alert_${doc.id}`)?.isRead || false,
          createdAt: now.toISOString(),
        });
      }
    });

    setAlerts(newAlerts);
    return newAlerts;
  }, [documents, requirements, alerts, setAlerts]);

  // Run alert calculation on mount and when documents change
  useEffect(() => {
    calculateAlerts();
  }, [documents]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get document for a specific requirement
  const getDocumentForRequirement = useCallback(
    (requirementId: string): CredentialDocument | undefined => {
      return documents.find((d) => d.requirementId === requirementId);
    },
    [documents]
  );

  // Upload a new document
  const uploadDocument = useCallback(
    async (
      requirementId: string,
      file: File
    ): Promise<CredentialDocument> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          const requirement = requirements.find((r) => r.id === requirementId);
          if (!requirement) {
            reject(new Error('Requirement not found'));
            return;
          }

          const now = new Date();
          const expiresAt = requirement.validityPeriodDays
            ? addDays(now, requirement.validityPeriodDays).toISOString()
            : null;

          const newDocument: CredentialDocument = {
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            requirementId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileDataUrl: reader.result as string,
            uploadedAt: now.toISOString(),
            status: 'pending_review',
            expiresAt,
          };

          // Remove any existing document for this requirement
          setDocuments((prev) => [
            ...prev.filter((d) => d.requirementId !== requirementId),
            newDocument,
          ]);

          resolve(newDocument);
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    },
    [requirements, setDocuments]
  );

  // Simulate approval (for demo purposes)
  const simulateApproval = useCallback(
    (documentId: string, approved: boolean, notes?: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status: approved ? 'approved' : 'rejected',
                reviewNotes: notes,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Exxat Approve Team',
              }
            : doc
        )
      );
    },
    [setDocuments]
  );

  // Delete a document
  const deleteDocument = useCallback(
    (documentId: string) => {
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    },
    [setDocuments]
  );

  // Mark alert as read
  const markAlertAsRead = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
      );
    },
    [setAlerts]
  );

  // Calculate clinical readiness
  const clinicalReadiness = useMemo((): ClinicalReadiness => {
    const requiredCredentials = requirements.filter((r) => r.isRequired);
    const totalRequired = requiredCredentials.length;

    let totalCompleted = 0;
    let totalPending = 0;
    let totalExpiring = 0;
    let totalRejected = 0;
    const missingRequirements: string[] = [];
    const expiringRequirements: string[] = [];

    const now = new Date();

    requiredCredentials.forEach((req) => {
      const doc = getDocumentForRequirement(req.id);

      if (!doc) {
        missingRequirements.push(req.name);
        return;
      }

      if (doc.status === 'approved' || doc.status === 'approved_with_exception') {
        // Check if expiring soon
        if (doc.expiresAt) {
          const daysUntilExpiry = differenceInDays(parseISO(doc.expiresAt), now);
          if (daysUntilExpiry <= 30) {
            totalExpiring++;
            expiringRequirements.push(req.name);
          } else if (daysUntilExpiry <= 0) {
            missingRequirements.push(req.name);
          } else {
            totalCompleted++;
          }
        } else {
          totalCompleted++;
        }
      } else if (doc.status === 'pending_review') {
        totalPending++;
      } else if (doc.status === 'rejected') {
        totalRejected++;
        missingRequirements.push(req.name);
      } else if (doc.status === 'expired') {
        missingRequirements.push(req.name);
      }
    });

    const percentComplete = Math.round((totalCompleted / totalRequired) * 100);

    return {
      isReady: totalCompleted === totalRequired && totalRejected === 0 && missingRequirements.length === 0,
      totalRequired,
      totalCompleted,
      totalPending,
      totalExpiring,
      totalRejected,
      percentComplete,
      missingRequirements,
      expiringRequirements,
    };
  }, [requirements, getDocumentForRequirement]);

  // Get documents grouped by category
  const documentsByCategory = useMemo(() => {
    const grouped: Record<string, { requirement: CredentialRequirement; document?: CredentialDocument }[]> = {};

    requirements.forEach((req) => {
      if (!grouped[req.category]) {
        grouped[req.category] = [];
      }
      grouped[req.category].push({
        requirement: req,
        document: getDocumentForRequirement(req.id),
      });
    });

    return grouped;
  }, [requirements, getDocumentForRequirement]);

  // Get unread alerts count
  const unreadAlertsCount = useMemo(
    () => alerts.filter((a) => !a.isRead).length,
    [alerts]
  );

  // Update document status (for approvers)
  const updateDocumentStatus = useCallback(
    (documentId: string, status: DocumentStatus, notes?: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status,
                reviewNotes: notes,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Approver', // In real app, get from auth context
              }
            : doc
        )
      );
    },
    [setDocuments]
  );

  return {
    documents,
    requirements,
    alerts,
    clinicalReadiness,
    documentsByCategory,
    unreadAlertsCount,
    uploadDocument,
    deleteDocument,
    simulateApproval,
    updateDocumentStatus,
    markAlertAsRead,
    getDocumentForRequirement,
    calculateAlerts,
  };
}
