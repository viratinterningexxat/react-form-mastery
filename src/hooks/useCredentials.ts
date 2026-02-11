import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  CredentialDocument,
  CredentialRequirement,
  ClinicalReadiness,
  ExpirationAlert,
  DocumentStatus,
  DEFAULT_REQUIREMENTS,
} from '@/types/credential';
import { differenceInDays, parseISO, addDays, format } from 'date-fns';

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
