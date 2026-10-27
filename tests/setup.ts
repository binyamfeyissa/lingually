import "@testing-library/jest-dom";
import "fake-indexeddb/auto";

// Mock localStorage and sessionStorage for testing
class StorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: new StorageMock(),
  });
  Object.defineProperty(window, "sessionStorage", {
    value: new StorageMock(),
  });
}
