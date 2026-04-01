"use client";

import { useEffect, useRef } from 'react';

export function useAutoSave(challengeId, code, isAuthenticated) {
  const lastSavedCodeRef = useRef(code);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // skip if not authenticated or no challengeId
    if (!isAuthenticated || !challengeId) return;

    // skip if code hasn't changed since last save
    if (code === lastSavedCodeRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for 30 seconds
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/drafts/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId, code })
        });
        
        if (response.ok) {
          lastSavedCodeRef.current = code;
          console.log('[AUTO_SAVE] Draft synced successfully.');
        }
      } catch (err) {
        console.warn('[AUTO_SAVE] Sync failed:', err);
      }
    }, 30000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [code, challengeId, isAuthenticated]);

  // Optional: Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (code !== lastSavedCodeRef.current && isAuthenticated && challengeId) {
        // We can't use await fetch here reliably, but we can try to notify user
        // or use navigator.sendBeacon if the browser supports it for JSON
        // For simplicity, we just log for now
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [code, challengeId, isAuthenticated]);
}
