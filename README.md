# Health Monitor

A lightweight health check and event loop monitoring library for Node.js applications.

## Features

- **Event Loop Lag Detection**: Monitors if the event loop is blocked to detect system load.
- **Custom Health Indicators**: Check the status of various components like databases, Redis, external APIs, etc.
- **Timeout Handling**: Prevents unresponsive states by setting timeouts for each health check.
- **Stale State Detection**: Automatically switches to 'down' state if the health check loop stops or is delayed.
- **TypeScript Support**: Includes type definitions for safe use in TypeScript projects.

## Installation

```bash
npm install @mh.js/health-monitor
```

## Usage

### Basic Configuration

```typescript
import { HealthMonitor } from "health-monitor";

// Create monitor instance
const monitor = new HealthMonitor({
  interval: 3000, // Check interval (default: 3000ms)
  timeout: 1000, // Timeout (default: 1000ms)
});

// Start monitoring
monitor.start();

// Get status (e.g., Express route handler)
app.get("/health", (req, res) => {
  const status = monitor.getStatus();
  res.status(status.status === "ok" ? 200 : 503).json(status);
});
```

### Register Custom Indicators

```typescript
// Database check example
monitor.register({
  name: "database",
  check: async () => {
    // Perform actual DB ping logic
    await db.ping();
  },
  timeout: 500, // Individual timeout setting
});

// Redis check example
monitor.register({
  name: "redis",
  check: async () => {
    // Perform actual Redis ping logic
    await redis.ping();
  },
  timeout: 500,
});

// External API check example
monitor.register({
  name: "external-api",
  check: async () => {
    const response = await fetch("https://api.example.com/health");
    if (!response.ok) throw new Error("API Unreachable");
  },
});
```

## API

### `new HealthMonitor(config?)`

- `config.interval`: Health check interval (ms). Default 3000.
- `config.timeout`: Default timeout for each indicator (ms). Default 1000.

### `monitor.register(indicator)`

Registers a new health indicator. Supports method chaining.

- `indicator.name`: Component name (identifier).
- `indicator.check`: Async function to check status. Considered 'down' if Promise rejects.
- `indicator.timeout`: (Optional) Timeout for this indicator (ms).

### `monitor.start()`

Starts periodic health checks.

### `monitor.stop()`

Stops health checks.

### `monitor.getStatus()`

Returns the current health status.

#### Return Type (`HealthStatus`)

```typescript
interface HealthStatus {
  status: "ok" | "down";
  lag: number; // Event loop lag (ms)
  details: {
    [name: string]: {
      status: "up" | "down";
      latency?: number; // Response time (ms)
      error?: string; // Error message
    };
  };
  timestamp: number; // Last check timestamp
}
```

---

# Health Monitor (Korean)

Node.js 애플리케이션을 위한 경량 헬스 체크 및 이벤트 루프 모니터링 라이브러리입니다.

## 기능

- **이벤트 루프 지연(Lag) 감지**: 이벤트 루프가 차단되었는지 모니터링하여 시스템 부하를 감지합니다.
- **커스텀 헬스 인디케이터**: 데이터베이스, Redis, 외부 API 등 다양한 구성 요소의 상태를 체크할 수 있습니다.
- **타임아웃 처리**: 각 헬스 체크에 대한 타임아웃을 설정하여 응답 없는 상태를 방지합니다.
- **Stale 상태 감지**: 헬스 체크 루프가 멈추거나 지연될 경우 자동으로 'down' 상태로 전환합니다.
- **TypeScript 지원**: 타입 정의가 포함되어 있어 TypeScript 프로젝트에서 안전하게 사용할 수 있습니다.

## 설치

```bash
npm install @mh.js/health-monitor
```

## 사용법

### 기본 설정

```typescript
import { HealthMonitor } from "health-monitor";

// 모니터 인스턴스 생성
const monitor = new HealthMonitor({
  interval: 3000, // 체크 주기 (기본값: 3000ms)
  timeout: 1000, // 타임아웃 (기본값: 1000ms)
});

// 모니터링 시작
monitor.start();

// 상태 조회 (예: Express 라우트 핸들러)
app.get("/health", (req, res) => {
  const status = monitor.getStatus();
  res.status(status.status === "ok" ? 200 : 503).json(status);
});
```

### 커스텀 인디케이터 등록

```typescript
// 데이터베이스 체크 예시
monitor.register({
  name: "database",
  check: async () => {
    // 실제 DB 핑(ping) 로직 수행
    await db.ping();
  },
  timeout: 500, // 개별 타임아웃 설정 가능
});

// redis 체크 예시
monitor.register({
  name: "redis",
  check: async () => {
    // 실제 Redis 핑(ping) 로직 수행
    await redis.ping();
  },
  timeout: 500,
});

// 외부 API 체크 예시
monitor.register({
  name: "external-api",
  check: async () => {
    const response = await fetch("https://api.example.com/health");
    if (!response.ok) throw new Error("API Unreachable");
  },
});
```

## API

### `new HealthMonitor(config?)`

- `config.interval`: 헬스 체크 주기 (ms). 기본값 3000.
- `config.timeout`: 각 인디케이터의 기본 타임아웃 (ms). 기본값 1000.

### `monitor.register(indicator)`

새로운 헬스 인디케이터를 등록합니다. 메서드 체이닝을 지원합니다.

- `indicator.name`: 컴포넌트 이름 (식별자).
- `indicator.check`: 상태를 체크하는 비동기 함수. Promise가 reject되면 'down'으로 간주합니다.
- `indicator.timeout`: (선택) 해당 인디케이터의 타임아웃 (ms).

### `monitor.start()`

주기적인 헬스 체크를 시작합니다.

### `monitor.stop()`

헬스 체크를 중지합니다.

### `monitor.getStatus()`

현재 헬스 상태를 반환합니다.

#### 반환 타입 (`HealthStatus`)

```typescript
interface HealthStatus {
  status: "ok" | "down";
  lag: number; // 이벤트 루프 지연 시간 (ms)
  details: {
    [name: string]: {
      status: "up" | "down";
      latency?: number; // 응답 시간 (ms)
      error?: string; // 에러 메시지
    };
  };
  timestamp: number; // 마지막 체크 시간
}
```
