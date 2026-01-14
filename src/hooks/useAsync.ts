import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/logger';

// ============= useAsync Hook =============
// Generic hook for managing async operations with TypeScript

type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}

interface UseAsyncReturn<T, P extends unknown[]> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * useAsync - Generic hook for handling async operations
 * 
 * @template T - The type of data returned by the async function
 * @template P - The parameter types of the async function
 * 
 * @example
 * ```tsx
 * const { execute, isPending, data } = useAsync(
 *   async (id: string) => api.getUser(id),
 *   { onSuccess: (user) => console.log('Got user:', user) }
 * );
 * 
 * // Later in code:
 * await execute('user-123');
 * ```
 */
export function useAsync<T, P extends unknown[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  options: {
    immediate?: boolean;
    immediateArgs?: P;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  } = {}
): UseAsyncReturn<T, P> {
  const {
    immediate = false,
    immediateArgs,
    onSuccess,
    onError,
    onSettled,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  // Track mounted state to prevent state updates after unmount
  const mountedRef = useRef(true);
  const asyncFnRef = useRef(asyncFunction);

  // Keep ref updated with latest async function
  useEffect(() => {
    asyncFnRef.current = asyncFunction;
  }, [asyncFunction]);

  // Track component mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: P): Promise<T | null> => {
    logger.debug('useAsync: Starting execution', { args }, 'useAsync');
    
    setState({ status: 'pending', data: null, error: null });

    try {
      const result = await asyncFnRef.current(...args);
      
      if (mountedRef.current) {
        setState({ status: 'success', data: result, error: null });
        onSuccess?.(result);
        logger.debug('useAsync: Success', { result }, 'useAsync');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (mountedRef.current) {
        setState({ status: 'error', data: null, error });
        onError?.(error);
        logger.error('useAsync: Error', error, 'useAsync');
      }
      
      return null;
    } finally {
      onSettled?.();
    }
  }, [onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate && immediateArgs) {
      execute(...immediateArgs);
    }
  }, [immediate]); // Only on mount

  return {
    ...state,
    isIdle: state.status === 'idle',
    isPending: state.status === 'pending',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    execute,
    reset,
    setData,
  };
}

// ============= useAsyncCallback =============

/**
 * useAsyncCallback - Wraps a callback in async state management
 * Useful for form submissions, button clicks, etc.
 * 
 * @example
 * ```tsx
 * const [handleSubmit, { isPending }] = useAsyncCallback(
 *   async (data: FormData) => {
 *     await api.createUser(data);
 *   },
 *   { onSuccess: () => toast.success('Created!') }
 * );
 * 
 * return (
 *   <button onClick={() => handleSubmit(formData)} disabled={isPending}>
 *     {isPending ? 'Submitting...' : 'Submit'}
 *   </button>
 * );
 * ```
 */
export function useAsyncCallback<T, P extends unknown[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  } = {}
): [(...args: P) => Promise<T | null>, UseAsyncReturn<T, P>] {
  const asyncState = useAsync(asyncFunction, options);
  return [asyncState.execute, asyncState];
}

// ============= useInterval =============

/**
 * useInterval - Declarative setInterval hook
 * Properly handles cleanup and dynamic delays
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// ============= useTimeout =============

/**
 * useTimeout - Declarative setTimeout hook
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

// ============= usePrevious =============

/**
 * usePrevious - Track the previous value of a variable
 * Useful for comparison logic in effects
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============= useToggle =============

/**
 * useToggle - Simple boolean toggle hook
 */
export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const set = useCallback((newValue: boolean) => setValue(newValue), []);

  return [value, toggle, set];
}
