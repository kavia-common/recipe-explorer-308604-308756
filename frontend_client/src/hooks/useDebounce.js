import { useEffect, useState } from "react";

// PUBLIC_INTERFACE
export function useDebounce(value, delayMs = 350) {
  /** Debounce any value by delayMs. Useful for search inputs. */
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
