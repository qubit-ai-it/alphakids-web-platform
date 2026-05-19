'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface MobileAction {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

interface MobileActionContextValue {
  action: MobileAction | null;
  setAction: (action: MobileAction | null) => void;
}

const MobileActionCtx = createContext<MobileActionContextValue>({
  action: null,
  setAction: () => {},
});

export function MobileActionProvider({ children }: { children: React.ReactNode }) {
  const [action, setAction] = useState<MobileAction | null>(null);

  const handleSetAction = useCallback((a: MobileAction | null) => {
    setAction(a);
  }, []);

  return (
    <MobileActionCtx.Provider value={{ action, setAction: handleSetAction }}>
      {children}
    </MobileActionCtx.Provider>
  );
}

export function useMobileAction() {
  return useContext(MobileActionCtx);
}

export function useSetMobileAction(action: MobileAction | null) {
  const { setAction } = useMobileAction();
  const actionRef = useRef(action);

  useEffect(() => {
    actionRef.current = action;
    setAction(action);
    return () => setAction(null);
  });

  return setAction;
}
