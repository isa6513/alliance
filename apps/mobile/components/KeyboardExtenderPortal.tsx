import React, { createContext, useContext, useMemo, useState } from "react";
import { KeyboardExtender } from "react-native-keyboard-controller";

type PortalContextValue = {
  setToolbar: (node: React.ReactNode | null) => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

export function useKeyboardExtenderPortal() {
  return useContext(PortalContext);
}

/**
 * Renders a single screen-level KeyboardExtender.
 * Children use `useKeyboardExtenderPortal().setToolbar(node)` to push
 * toolbar content into it (or `null` to hide).
 */
export function KeyboardExtenderPortalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toolbar, setToolbar] = useState<React.ReactNode>(null);

  const contextValue = useMemo<PortalContextValue>(() => ({ setToolbar }), []);

  return (
    <PortalContext.Provider value={contextValue}>
      {children}
      {toolbar !== null && (
        <KeyboardExtender enabled>{toolbar}</KeyboardExtender>
      )}
    </PortalContext.Provider>
  );
}
