// ============= TypeScript Best Practices =============
// Advanced TypeScript patterns for React applications

// ============= Utility Types =============

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make all properties deeply partial
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Make all properties deeply required
 */
export type DeepRequired<T> = T extends object ? {
  [P in keyof T]-?: DeepRequired<T[P]>;
} : T;

/**
 * Extract keys where value is of type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Branded types for nominal typing
 * Prevents mixing up values of the same underlying type
 */
export type Brand<T, B> = T & { __brand: B };

// Example branded types
export type UserId = Brand<string, 'UserId'>;
export type EmployeeId = Brand<string, 'EmployeeId'>;
export type Email = Brand<string, 'Email'>;

/**
 * Create a branded type from a string
 */
export function createUserId(id: string): UserId {
  return id as UserId;
}

export function createEmployeeId(id: string): EmployeeId {
  return id as EmployeeId;
}

// ============= Discriminated Unions =============

/**
 * Result type for operations that can fail
 * Similar to Rust's Result or Haskell's Either
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Create a success result
 */
export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Create an error result
 */
export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Check if result is success
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

/**
 * Check if result is error
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

// ============= Option Type =============

/**
 * Option type for values that may not exist
 */
export type Option<T> = { some: true; value: T } | { some: false };

export function Some<T>(value: T): Option<T> {
  return { some: true, value };
}

export const None: Option<never> = { some: false };

export function isSome<T>(option: Option<T>): option is { some: true; value: T } {
  return option.some;
}

export function isNone<T>(option: Option<T>): option is { some: false } {
  return !option.some;
}

// ============= React Component Types =============

/**
 * Props that include children
 */
export type PropsWithChildren<P = unknown> = P & {
  children?: React.ReactNode;
};

/**
 * Props with className for styled components
 */
export type PropsWithClassName<P = unknown> = P & {
  className?: string;
};

/**
 * Common component props
 */
export type CommonProps<P = unknown> = P & {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
};

/**
 * Extract props from a component type
 */
export type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * Polymorphic component types
 * Allows component to render as different HTML elements
 */
export type AsProp<C extends React.ElementType> = {
  as?: C;
};

export type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = object
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

export type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = object
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

// ============= Form Types =============

/**
 * Form field configuration
 */
export interface FormFieldConfig<T> {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  validation?: (value: T[keyof T]) => string | undefined;
  options?: { value: string; label: string }[];
}

/**
 * Form state including touched and dirty states
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

// ============= API Types =============

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request configuration
 */
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============= Event Types =============

/**
 * Common event handler types
 */
export type ClickHandler<T = HTMLButtonElement> = React.MouseEventHandler<T>;
export type ChangeHandler<T = HTMLInputElement> = React.ChangeEventHandler<T>;
export type SubmitHandler = React.FormEventHandler<HTMLFormElement>;
export type KeyboardHandler<T = HTMLElement> = React.KeyboardEventHandler<T>;

// ============= Async Types =============

/**
 * Async function type
 */
export type AsyncFunction<T = void, P extends unknown[] = []> = (
  ...args: P
) => Promise<T>;

/**
 * Callback function type
 */
export type Callback<T = void> = (value: T) => void;

/**
 * Predicate function type
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Comparator function type
 */
export type Comparator<T> = (a: T, b: T) => number;
