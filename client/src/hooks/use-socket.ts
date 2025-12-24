import { useEffect, useRef, useState, useCallback } from "react";
import { WS_EVENTS } from "@shared/schema";

type WebSocketMessage = {
  type: string;
  payload: any;
};

export function useGameSocket(roomCode: string | undefined, onMessage?: (type: string, payload: any) => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomCode) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected, joining room:", roomCode);
      setIsConnected(true);
      // Send join message with room code
      socket.send(JSON.stringify({ type: 'join', roomCode }));
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log("WS Message received:", message.type, message.payload);
        if (onMessage) {
          onMessage(message.type, message.payload);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [roomCode]);

  const sendMessage = useCallback((type: string, payload: any = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Sending WS message:", type);
      socketRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("WebSocket not connected, cannot send message:", type);
    }
  }, []);

  return { isConnected, sendMessage };
}
