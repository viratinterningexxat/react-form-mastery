import { useState, useEffect, useCallback, useRef } from 'react';

// ============= TypeScript Generics & Discriminated Unions =============

/**
 * Represents the possible states of an async operation
 * Uses discriminated union pattern for type-safe state handling
 */
export type AsyncState<T, E = Error> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: E };

/**
 * Configuration options for the useFetch hook
 */
export interface UseFetchOptions<T> {
  /** Whether to fetch immediately on mount */
  immediate?: boolean;
  /** Initial data value */
  initialData?: T;
  /** Callback on successful fetch */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Cache key for request deduplication */
  cacheKey?: string;
  /** Retry configuration */
  retry?: {
    count: number;
    delay: number;
  };
}

/**
 * Return type of useFetch hook
 * Provides comprehensive API for data fetching operations
 */
export interface UseFetchReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  status: AsyncState<T>['status'];
  execute: () => Promise<T | null>;
  reset: () => void;
  refetch: () => Promise<T | null>;
}

// Simple in-memory cache for request deduplication
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for data fetching with loading/error states
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useFetch(
 *   () => fetchUsers(),
 *   { immediate: true }
 * );
 * ```
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    immediate = true,
    initialData,
    onSuccess,
    onError,
    cacheKey,
    retry = { count: 0, delay: 1000 },
  } = options;

  const [state, setState] = useState<AsyncState<T>>(() => {
    // Check cache first
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return { status: 'success', data: cached.data as T, error: null };
      }
    }
    
    if (initialData !== undefined) {
      return { status: 'success', data: initialData, error: null };
    }
    return { status: 'idle', data: null, error: null };
  });

  // Use refs to track the latest callbacks and avoid stale closures
  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Update refs when dependencies change
  useEffect(() => {
    fetcherRef.current = fetcher;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const execute = useCallback(async (): Promise<T | null> => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState({ status: 'loading', data: null, error: null });

    try {
      const data = await fetcherRef.current();
      
      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      setState({ status: 'success', data, error: null });
      onSuccessRef.current?.(data);
      retryCountRef.current = 0;
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Retry logic
      if (retryCountRef.current < retry.count) {
        retryCountRef.current++;
        await new Promise(resolve => setTimeout(resolve, retry.delay));
        return execute();
      }

      setState({ status: 'error', data: null, error });
      onErrorRef.current?.(error);
      retryCountRef.current = 0;
      return null;
    }
  }, [cacheKey, retry.count, retry.delay]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    retryCountRef.current = 0;
    setState({ status: 'idle', data: null, error: null });
  }, []);

  const refetch = useCallback(() => {
    // Clear cache before refetching
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    return execute();
  }, [execute, cacheKey]);

  // Fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    // Cleanup on unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [immediate, execute]);

  return {
    data: state.status === 'success' ? state.data : null,
    error: state.status === 'error' ? state.error : null,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    isIdle: state.status === 'idle',
    status: state.status,
    execute,
    reset,
    refetch,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 * Does not fetch on mount, requires explicit execution
 */
export function useMutation<T, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: Omit<UseFetchOptions<T>, 'immediate'> = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const onSuccessRef = useRef(options.onSuccess);
  const onErrorRef = useRef(options.onError);

  useEffect(() => {
    onSuccessRef.current = options.onSuccess;
    onErrorRef.current = options.onError;
  });

  const mutate = useCallback(async (variables: TVariables): Promise<T | null> => {
    setState({ status: 'loading', data: null, error: null });

    try {
      const data = await mutationFn(variables);
      setState({ status: 'success', data, error: null });
      onSuccessRef.current?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ status: 'error', data: null, error });
      onErrorRef.current?.(error);
      return null;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  return {
    data: state.status === 'success' ? state.data : null,
    error: state.status === 'error' ? state.error : null,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    isIdle: state.status === 'idle',
    mutate,
    reset,
  };
}
