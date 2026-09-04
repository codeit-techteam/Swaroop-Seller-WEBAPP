"use client";

import { useCallback, useEffect, useState } from "react";

interface AsyncResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  errorMessage: string,
): AsyncResource<T> {
  const key = JSON.stringify(deps);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const requestKey = `${key}:${nonce}`;
  const loading = resolvedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;

    loader()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
        setResolvedKey(requestKey);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setError(errorMessage);
        setResolvedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
    // loader identity is controlled by the caller via deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, errorMessage]);

  const retry = useCallback(() => {
    setResolvedKey(null);
    setNonce((value) => value + 1);
  }, []);

  return { data, loading, error, retry };
}
