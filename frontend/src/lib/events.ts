import { scValToNative, rpc } from "@stellar/stellar-sdk";
import { server, CONTRACT_IDS } from "./blockchain";

export interface ParsedEvent {
  id: string;
  contractId: string;
  type: "swap" | "deposit" | "withdraw" | "transfer" | "mint" | "burn" | "other";
  user: string;
  data: any;
  ledger: number;
  timestamp: number;
}

export type EventCallback = (event: ParsedEvent) => void;

class EventStreamer {
  private listeners: EventCallback[] = [];
  private lastLedger: number = 0;
  private isPolling: boolean = false;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const latest = await server.getLatestLedger();
      this.lastLedger = latest.sequence;
    } catch (e) {
      console.error("Failed to get latest ledger", e);
    }
  }

  public subscribe(callback: EventCallback) {
    this.listeners.push(callback);
    if (!this.isPolling) this.startPolling();
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
      if (this.listeners.length === 0) this.stopPolling();
    };
  }

  private startPolling() {
    this.isPolling = true;
    this.intervalId = setInterval(() => this.poll(), 2000); // 2s polling
  }

  private stopPolling() {
    this.isPolling = false;
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private async poll() {
    // Demo Mode: Generate mock events if we're in placeholder state
    if (CONTRACT_IDS.pool.includes("...") || !CONTRACT_IDS.pool.startsWith("C")) {
      if (Math.random() > 0.7) { // 30% chance each poll 
        const mock: ParsedEvent = {
          id: "demo-" + Math.random().toString(36).substring(7),
          contractId: "demo",
          type: Math.random() > 0.5 ? "swap" : "deposit",
          user: "G" + Math.random().toString(36).substring(0, 10).toUpperCase(),
          data: { amountIn: 10000000, amountOut: 9970000, amountA: 50000000, amountB: 50000000 },
          ledger: this.lastLedger,
          timestamp: Date.now()
        };
        this.listeners.forEach(l => l(mock));
      }
      this.lastLedger++;
      return;
    }

    try {
      if (this.lastLedger === 0) {
        const latest = await server.getLatestLedger();
        this.lastLedger = latest.sequence;
        return;
      }

      const response = await server.getEvents({
        startLedger: this.lastLedger + 1,
        filters: [
          {
            type: "contract",
            // Monitoring all core contracts
          },
        ],
      });

      if (response.events && response.events.length > 0) {
        response.events.forEach(event => {
          const parsed = this.parseSorobanEvent(event);
          if (parsed) {
            this.listeners.forEach(l => l(parsed));
          }
        });
        this.lastLedger = response.latestLedger;
      }
    } catch (e) {
      console.error("Polling error", e);
    }
  }

  private parseSorobanEvent(event: any): ParsedEvent | null {
    try {
      const topics = event.topic.map((t: any) => scValToNative(t));
      const value = scValToNative(event.value);
      
      if (!topics || topics.length === 0) return null;
      const action = topics[0]?.toString().toLowerCase() || "other";

      let type: ParsedEvent["type"] = "other";
      let data: any = value;
      let user = topics[1] ? topics[1].toString() : "Unknown";

      if (action.includes("swap")) {
        type = "swap";
        data = { tokenIn: topics[2], amountIn: value[0], amountOut: value[1] };
      } else if (action.includes("deposit")) {
        type = "deposit";
        data = { amountA: value[0], amountB: value[1] };
      } else if (action.includes("withdraw")) {
        type = "withdraw";
        data = { amountA: value[0], amountB: value[1] };
      } else if (action.includes("transfer")) {
        type = "transfer";
        data = { to: topics[2], amount: value };
      }

      return {
        id: event.id,
        contractId: event.contractId,
        type,
        user,
        data,
        ledger: event.ledger,
        timestamp: Date.now(),
      };
    } catch (e) {
      return null;
    }
  }
}

export const eventStreamer = new EventStreamer();
