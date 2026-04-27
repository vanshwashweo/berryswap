/**
 * Polyfills for browser environment to support Blockchain SDK
 */
import { Buffer } from "buffer";
import { EventEmitter } from "events";
import process from "process";

export function initPolyfills() {
  if (typeof window !== "undefined") {
    (window as any).Buffer = Buffer;
    (window as any).process = process;
    (window as any).global = window;
    (window as any).EventEmitter = EventEmitter;
    
    // Some libraries check for process.env
    if (!(window as any).process.env) {
      (window as any).process.env = {};
    }
    
    console.log("🛠️ Polyfills initialized");
  }
}
