import { HealthMonitor } from "../src/index";

describe("HealthMonitor", () => {
  let monitor: HealthMonitor;

  beforeEach(() => {
    monitor = new HealthMonitor({ interval: 100, timeout: 100 });
    monitor.start();
  });

  afterEach(() => {
    if (monitor) {
      monitor.stop();
    }
  });

  test("should create an instance", () => {
    expect(monitor).toBeDefined();
  });

  test("should start the monitor", () => {
    monitor.start();
    expect(monitor.getStatus().status).toBe("ok");
  });

  test("should be normal status", async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));

    const status = monitor.getStatus();
    expect(status).toBeDefined();
    expect(status.status).toBe("ok");
    expect(status.lag).toBeLessThan(100);
  });

  test("should be CPU Block status", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    const start = Date.now();
    let status = monitor.getStatus();
    while (Date.now() - start < 1000) {
      status = monitor.getStatus();
      if (status.status == 'down') {
        break;
      }
    }
    expect(status).toBeDefined();
    expect(status.lag).toBeGreaterThan(100);
  });

  test("should be Custom Indicator", async () => {
    monitor.register({
      name: "custom",
      check: async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
      },
      timeout: 20
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    const status = monitor.getStatus();

    expect(status).toBeDefined();
    expect(status.status).toBe("ok");
    expect(status.details.custom).toBeDefined();
    expect(status.details.custom.status).toBe("up");
    expect(status.lag).toBeLessThan(100);
  });

  test("should be Custom Indicator with timeout", async () => {
    monitor.register({
      name: "custom",
      check: async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      },
      timeout: 10,
    });
    monitor.register({
      name: "custom2",
      check: async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      },
      timeout: 20,
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    const status = monitor.getStatus();

    expect(status).toBeDefined();
    expect(status.status).toBe("down");
    expect(status.details.custom).toBeDefined();
    expect(status.details.custom.status).toBe("down");
    expect(status.details.custom.error).toBe("Timeout of 10ms exceeded");
    expect(status.details.custom2).toBeDefined();
    expect(status.details.custom2.status).toBe("up");
    expect(status.lag).toBeLessThan(100);
  });

  test("should be Custom Indicator with Error", async () => {
    monitor.register({
      name: "custom",
      check: async () => {
        throw new Error("Custom error");
      },
      timeout: 10,
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const status = monitor.getStatus();

    expect(status).toBeDefined();
    expect(status.status).toBe("down");
    expect(status.details.custom).toBeDefined();
    expect(status.details.custom.status).toBe("down");
    expect(status.details.custom.error).toBe("Custom error");
    expect(status.lag).toBeLessThan(100);
  });

  test("should be stop health-monitor", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    let status = monitor.getStatus();
    expect(status.status).toBe("ok");

    monitor.stop();

    await new Promise((resolve) => setTimeout(resolve, 350));

    status = monitor.getStatus();
    expect(status.status).toBe("down");
    expect(status.details.system).toBeDefined();
    expect(status.details.system?.status).toBe("down");
    expect(status.details.system?.error).toContain("Health check loop is stalled");
  });
});