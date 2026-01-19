import { performance } from 'perf_hooks';
import type { HealthIndicator, HealthStatus, MonitorConfig } from './types';

/**
 * HealthMonitor class for monitoring system health and event loop lag.
 * 
 * @example
 * ```typescript
 * const monitor = new HealthMonitor({ interval: 3000 });
 * monitor.register({
 *   name: 'db',
 *   check: async () => await db.ping()
 * }).start();
 * ```
 */
export class HealthMonitor {
  private indicators: HealthIndicator[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isCheckInProgress = false;
  
  private config: Required<MonitorConfig>;
  
  private latestStatus: HealthStatus = {
    status: 'ok',
    lag: 0,
    details: {},
    timestamp: Date.now(),
  };

  /**
   * Creates a new HealthMonitor instance.
   * @param config - Configuration options for the monitor.
   */
  constructor(config?: MonitorConfig) {
    this.config = {
      interval: config?.interval ?? 3000,
      timeout: config?.timeout ?? 1000,
    };
  }

  /**
   * Registers a new health indicator to be monitored.
   * @param indicator - The health indicator configuration.
   * @returns The HealthMonitor instance for method chaining.
   */
  register(indicator: HealthIndicator) {
    this.indicators.push(indicator);
    return this;
  }

  /**
   * Starts the periodic health check loop.
   * If the monitor is already running, this method does nothing.
   */
  start() {
    if (this.intervalId) return;
    this.check();
    this.intervalId = setInterval(() => this.check(), this.config.interval);
    this.intervalId.unref(); 
  }

  /**
   * Stops the health check loop.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Retrieves the current health status of the system.
   * 
   * If the health check loop is stalled (not updated for > 3x interval),
   * it returns a 'down' status with a system error.
   * 
   * @returns The current HealthStatus object.
   */
  getStatus(): HealthStatus {
    const now = Date.now();
    const isStale = (now - this.latestStatus.timestamp) > (this.config.interval * 3);

    if (isStale) {
      return { 
        status: 'down', 
        lag: now - this.latestStatus.timestamp,
        details: {
          system: { 
            status: 'down',
            error: 'Health check loop is stalled (Event loop might be blocked)',
          }
        },
        timestamp: now,
      };
    } 
    return this.latestStatus;
  }

  private async checkEventLoopLag(): Promise<number> {
    const start = performance.now();
    return new Promise(resolve => setImmediate(() => resolve(performance.now() - start)));
  }

  private async check() {
    if (this.isCheckInProgress) return;
    this.isCheckInProgress = true;

    try {
      const details: HealthStatus['details'] = {};
      let isAllUp = true;

      const lag = await this.checkEventLoopLag();

      const checkPromises = this.indicators.map(async (ind) => {
        const startTime = Date.now();
        const timeoutMs = ind.timeout ?? this.config.timeout;

        try {
          await Promise.race([
            ind.check(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout of ${timeoutMs}ms exceeded`)), timeoutMs)
            )
          ]);
          details[ind.name] = { status: 'up', latency: Date.now() - startTime };
        } catch (error: any) {
          isAllUp = false;
          details[ind.name] = { 
            status: 'down', 
            error: error.message || 'Unknown Error' 
          };
        }
      });

      await Promise.allSettled(checkPromises);
      this.latestStatus = {
        status: isAllUp ? 'ok' : 'down',
        lag,
        details,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('HealthMonitor unexpected error:', error);
    } finally {
      this.isCheckInProgress = false;
    }
  }
}