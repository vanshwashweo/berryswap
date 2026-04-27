"use client";

import { useState, useEffect } from "react";
import { eventStreamer, ParsedEvent } from "@/lib/events";

export const useRealtimeEvents = () => {
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(true);

    const unsubscribe = eventStreamer.subscribe((event) => {
      setEvents((prev) => {
        // Keep last 50 events and deduplicate
        const filtered = prev.filter(e => e.id !== event.id);
        const next = [event, ...filtered].slice(0, 50);
        return next;
      });
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, []);

  return { events, isConnected, error };
};
