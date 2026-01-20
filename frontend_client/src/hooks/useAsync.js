import { useCallback, useEffect, useRef, useState } from "react";

function isAbortError(err) {
  return err && (err.name === "AbortError" || err.message === "AbortError");
}

// PUBLIC_INTERFACE
export function useAsync(asyncFn, deps = []) {
  /**
   * Run an async function and track {data, error, loading}. Returns a retry() method.
   * Designed for simple page-level data fetching.
   */
  const mountedRef = useRef(true);

  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const run = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await asyncFn();
      if (!mountedRef.current) return;
      setState({ loading: false, error: null, data });
    } catch (err) {
      if (!mountedRef.current) return;
      if (isAbortError(err)) return;
      setState({ loading: false, error: err, data: null });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => {
      mountedRef.current = false;
    };
  }, [run]);

  return { ...state, retry: run };
}
