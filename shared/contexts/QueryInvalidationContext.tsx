'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

/**
 * Simple query invalidation context.
 *
 * Call `invalidate('institutions')` after creating/updating/deleting an institution,
 * and any component that called `useRefresh('institutions', refetchFn)` will
 * automatically `refetch()`.
 */

type ListenerEntry = { key: string; listener: () => void };

interface QueryInvalidationContextValue {
  invalidate: (key: string) => void;
  subscribe: (key: string, listener: () => void) => () => void;
}

const QueryInvalidationContext = createContext<QueryInvalidationContextValue | null>(null);

export function QueryInvalidationProvider({ children }: { children: React.ReactNode }) {
  const listenersRef = useRef<Map<string, Set<() => void>>>(new Map());
  // Dummy state to force re-renders when invalidate is called
  const [, setTick] = useState(0);

  const invalidate = useCallback((key: string) => {
    const set = listenersRef.current.get(key);
    if (set) {
      for (const listener of set) {
        listener();
      }
    }
    // Force re-render so subscribed components update
    setTick((t) => t + 1);
  }, []);

  const subscribe = useCallback((key: string, listener: () => void) => {
    if (!listenersRef.current.has(key)) {
      listenersRef.current.set(key, new Set());
    }
    listenersRef.current.get(key)!.add(listener);

    return () => {
      listenersRef.current.get(key)?.delete(listener);
    };
  }, []);

  return (
    <QueryInvalidationContext.Provider value={{ invalidate, subscribe }}>
      {children}
    </QueryInvalidationContext.Provider>
  );
}

/**
 * Call `invalidate('institutions')` after a mutation to trigger all subscribers.
 */
export function useInvalidate() {
  const ctx = useContext(QueryInvalidationContext);
  if (!ctx) throw new Error('useInvalidate must be used within QueryInvalidationProvider');
  return ctx.invalidate;
}

/**
 * Subscribes `refetchFn` to be called whenever `invalidate(key)` is triggered.
 * Automatically cleans up on unmount.
 */
export function useRefresh(key: string, refetchFn: () => void) {
  const ctx = useContext(QueryInvalidationContext);
  if (!ctx) throw new Error('useRefresh must be used within QueryInvalidationContext');

  const refetchFnRef = useRef(refetchFn);
  refetchFnRef.current = refetchFn;

  React.useEffect(() => {
    return ctx.subscribe(key, () => refetchFnRef.current());
  }, [key, ctx]);
}
