'use client';

import { useEffect } from 'react';

/**
 * Fires a POST /api/visits once per page load to count the visit.
 * Renders nothing.
 */
export default function VisitTracker() {
  useEffect(() => {
    fetch('/api/visits', { method: 'POST' }).catch(() => {
      // silent — analytics should never break the page
    });
  }, []);

  return null;
}
