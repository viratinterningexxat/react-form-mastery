import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface ShareableLink {
  id: string;
  createdAt: string;
  expiresAt?: string;
  accessCount: number;
}

export function useShareableLink() {
  const [links, setLinks] = useLocalStorage<ShareableLink[]>('shareable-links', []);

  const generateLink = useCallback((expirationDays?: number): ShareableLink => {
    const id = crypto.randomUUID().slice(0, 8);
    const newLink: ShareableLink = {
      id,
      createdAt: new Date().toISOString(),
      expiresAt: expirationDays 
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString() 
        : undefined,
      accessCount: 0,
    };
    
    setLinks((prev) => [...prev, newLink]);
    return newLink;
  }, [setLinks]);

  const deleteLink = useCallback((linkId: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== linkId));
  }, [setLinks]);

  const getShareUrl = useCallback((linkId: string) => {
    return `${window.location.origin}/share/${linkId}`;
  }, []);

  const incrementAccessCount = useCallback((linkId: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId
          ? { ...link, accessCount: link.accessCount + 1 }
          : link
      )
    );
  }, [setLinks]);

  const isLinkValid = useCallback((linkId: string): boolean => {
    const link = links.find((l) => l.id === linkId);
    if (!link) return false;
    if (!link.expiresAt) return true;
    return new Date(link.expiresAt) > new Date();
  }, [links]);

  return {
    links,
    generateLink,
    deleteLink,
    getShareUrl,
    incrementAccessCount,
    isLinkValid,
  };
}
