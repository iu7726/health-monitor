/**
 * Interface representing a health check indicator.
 */
export interface HealthIndicator {
  /**
   * The name of the component being monitored (e.g., 'database', 'redis').
   */
  name: string;
  /**
   * A function that performs the health check.
   * Should return a Promise that resolves if healthy, and rejects if unhealthy.
   */
  check: () => Promise<any>;
  /**
   * Optional timeout for this specific indicator in milliseconds.
   * If not provided, the global monitor timeout will be used.
   */
  timeout?: number;
}

/**
 * Interface representing the status details of a specific component.
 */
export interface ComponentDetail {
  /**
   * The status of the component ('up' or 'down').
   */
  status: 'up' | 'down';
  /**
   * The latency of the health check in milliseconds.
   */
  latency?: number;
  /**
   * The error message if the status is 'down'.
   */
  error?: string;
}

/**
 * Interface representing the overall health status of the system.
 */
export interface HealthStatus {
  /**
   * The overall status of the system ('ok' if all indicators are up, 'down' otherwise).
   */
  status: 'ok' | 'down';
  /**
   * The event loop lag in milliseconds.
   * High lag indicates the system is under heavy load.
   */
  lag: number;
  /**
   * Detailed status of each registered component.
   */
  details: Record<string, ComponentDetail>;
  /**
   * The timestamp when this status was generated.
   */
  timestamp: number;
}

/**
 * Configuration options for the HealthMonitor.
 */
export interface MonitorConfig {
  /**
   * The interval between health checks in milliseconds.
   * @default 3000
   */
  interval?: number;
  /**
   * The default timeout for health checks in milliseconds.
   * @default 1000
   */
  timeout?: number;
}