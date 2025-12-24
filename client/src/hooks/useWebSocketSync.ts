import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  payload: any;
}

export function useWebSocketSync(roomCode: string | null, onMessage: (data: WebSocketMessage) => void) {
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!roomCode || ws.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      ws.current?.send(JSON.stringify({
        type: 'join',
        roomCode,
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }, [roomCode, onMessage]);

  const send = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const sendGameAction = useCallback((eventType: string, payload: any) => {
    send({
      type: 'game_action',
      payload: { eventType, payload },
    });
  }, [send]);

  const sendVoiceContext = useCallback((userId: number, voiceChannelId: string) => {
    send({
      type: 'voice_context',
      payload: { userId, voiceChannelId },
    });
  }, [send]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return { send, sendGameAction, sendVoiceContext };
}
