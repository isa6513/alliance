import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface NavbarOptions {
  whiteBackground?: boolean;
  noBorder?: boolean;
}

interface NavbarOptionsContextValue {
  options: NavbarOptions;
  setOptions: (opts: Partial<NavbarOptions>) => void;
}

export const NavbarOptionsContext = createContext<
  NavbarOptionsContextValue | undefined
>(undefined);

export function NavbarOptionsProvider({ children }: { children: ReactNode }) {
  const [options, setOptionsState] = useState<NavbarOptions>({});

  const setOptions = useCallback((opts: Partial<NavbarOptions>) => {
    setOptionsState((prev) => ({ ...prev, ...opts }));
  }, []);

  const value = useMemo(
    () => ({ options, setOptions }),
    [options, setOptions],
  );

  return (
    <NavbarOptionsContext.Provider value={value}>
      {children}
    </NavbarOptionsContext.Provider>
  );
}

export function useNavbarOptions(opts: NavbarOptions) {
  const context = useContext(NavbarOptionsContext);
  if (!context) return;

  const { setOptions } = context;

  useEffect(() => {
    setOptions(opts);
    return () => setOptions({ whiteBackground: false, noBorder: false });
  }, [opts.whiteBackground, opts.noBorder, setOptions]);
}
