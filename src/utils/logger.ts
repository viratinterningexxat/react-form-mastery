// ============= Development Tools & Debugging Utilities =============
// Best practices for logging, performance monitoring, and debugging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  component?: string;
}

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Log levels with their priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level to display (configurable)
const MIN_LOG_LEVEL: LogLevel = isDevelopment ? 'debug' : 'warn';

// ANSI-style colors for console output
const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '#6B7280', // gray
  info: '#3B82F6',  // blue
  warn: '#F59E0B',  // amber
  error: '#EF4444', // red
};

/**
 * Development logger with structured output
 * Only logs in development mode by default
 */
export const logger = {
  /**
   * Debug level - detailed information for debugging
   */
  debug(message: string, data?: unknown, component?: string) {
    log('debug', message, data, component);
  },

  /**
   * Info level - general information about application state
   */
  info(message: string, data?: unknown, component?: string) {
    log('info', message, data, component);
  },

  /**
   * Warn level - potential issues that don't prevent operation
   */
  warn(message: string, data?: unknown, component?: string) {
    log('warn', message, data, component);
  },

  /**
   * Error level - errors that affect functionality
   */
  error(message: string, data?: unknown, component?: string) {
    log('error', message, data, component);
  },

  /**
   * Group related logs together
   */
  group(label: string) {
    if (isDevelopment) {
      console.group(`🏷️ ${label}`);
    }
  },

  /**
   * End a log group
   */
  groupEnd() {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Log table data
   */
  table(data: unknown[], columns?: string[]) {
    if (isDevelopment && LOG_LEVELS.debug >= LOG_LEVELS[MIN_LOG_LEVEL]) {
      console.table(data, columns);
    }
  },
};

function log(level: LogLevel, message: string, data?: unknown, component?: string) {
  // Skip if below minimum log level
  if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LOG_LEVEL]) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    component,
  };

  const prefix = component ? `[${component}]` : '';
  const color = LEVEL_COLORS[level];

  if (isDevelopment) {
    const style = `color: ${color}; font-weight: bold;`;
    const emoji = getLogEmoji(level);
    
    console[level](
      `%c${emoji} ${level.toUpperCase()}%c ${prefix} ${message}`,
      style,
      'color: inherit;',
      data !== undefined ? data : ''
    );
  } else if (level === 'error') {
    // In production, still log errors (could send to error tracking service)
    console.error(entry);
  }
}

function getLogEmoji(level: LogLevel): string {
  const emojis: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  };
  return emojis[level];
}

// ============= Performance Monitoring =============

interface PerformanceMark {
  name: string;
  startTime: number;
}

const marks = new Map<string, PerformanceMark>();

/**
 * Performance monitoring utilities
 */
export const perf = {
  /**
   * Start measuring performance
   */
  start(name: string) {
    marks.set(name, {
      name,
      startTime: performance.now(),
    });
    logger.debug(`⏱️ Started measuring: ${name}`, undefined, 'Performance');
  },

  /**
   * End measurement and log the duration
   */
  end(name: string) {
    const mark = marks.get(name);
    if (!mark) {
      logger.warn(`No performance mark found for: ${name}`, undefined, 'Performance');
      return;
    }

    const duration = performance.now() - mark.startTime;
    marks.delete(name);

    const formattedDuration = duration < 1 
      ? `${(duration * 1000).toFixed(2)}μs`
      : duration < 1000 
        ? `${duration.toFixed(2)}ms`
        : `${(duration / 1000).toFixed(2)}s`;

    logger.info(`⏱️ ${name}: ${formattedDuration}`, { duration }, 'Performance');

    return duration;
  },

  /**
   * Measure an async function's execution time
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  },

  /**
   * Measure a sync function's execution time
   */
  measureSync<T>(name: string, fn: () => T): T {
    this.start(name);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  },
};

// ============= React DevTools Helpers =============

/**
 * Helper to add displayName to components for better DevTools experience
 */
export function setDisplayName<T extends React.ComponentType<unknown>>(
  component: T,
  name: string
): T {
  component.displayName = name;
  return component;
}

/**
 * Debug hook - logs when component renders
 * Remove in production!
 */
export function useRenderCount(componentName: string) {
  if (isDevelopment) {
    const countRef = { current: 0 };
    countRef.current++;
    logger.debug(`Render count: ${countRef.current}`, undefined, componentName);
  }
}

/**
 * Debug hook - logs prop changes
 */
export function useWhyDidYouUpdate<T extends Record<string, unknown>>(
  componentName: string,
  props: T
) {
  if (!isDevelopment) return;

  const previousProps = { current: props };

  const changedProps: Record<string, { from: unknown; to: unknown }> = {};
  
  Object.keys(props).forEach(key => {
    if (previousProps.current[key] !== props[key]) {
      changedProps[key] = {
        from: previousProps.current[key],
        to: props[key],
      };
    }
  });

  if (Object.keys(changedProps).length > 0) {
    logger.debug('Props changed', changedProps, componentName);
  }

  previousProps.current = props;
}

// ============= Assert Utilities =============

/**
 * Development-only assertions
 * Throws in development, no-op in production
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (isDevelopment && !condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert that a value is defined (not null or undefined)
 */
export function assertDefined<T>(
  value: T | null | undefined,
  name: string
): asserts value is T {
  assert(value !== null && value !== undefined, `${name} must be defined`);
}
