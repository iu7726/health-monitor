export interface HealthIndicator {
  name: string;
  check: () => Promise<any>;
  timeout?: number;
}

export interface ComponentDetail {
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}

export interface HealthStatus {
  status: 'ok' | 'down';
  lag: number; // 이벤트 루프 지연 시간 (ms)
  details: Record<string, ComponentDetail>;
  timestamp: number;
}

export interface MonitorConfig {
  interval?: number; // 기본 3000ms
  timeout?: number;  // 기본 1000ms
}