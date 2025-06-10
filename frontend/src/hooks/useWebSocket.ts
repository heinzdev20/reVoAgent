import { useEffect, useRef } from 'react';
import { wsService } from '@/services/websocket';

export function useWebSocket() {
  const isConnected = useRef(false);

  useEffect(() => {
    // Temporarily disable WebSocket to prevent startup issues
    // TODO: Re-enable after fixing connection issues
    /*
    if (!isConnected.current) {
      wsService.connect();
      isConnected.current = true;
    }

    return () => {
      wsService.disconnect();
      isConnected.current = false;
    };
    */
  }, []);

  return wsService;
}

export function useWebSocketEvent(eventType: string, handler: (data: any) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const eventHandler = (data: any) => handlerRef.current(data);
    
    wsService.on(eventType, eventHandler);
    
    return () => {
      wsService.off(eventType, eventHandler);
    };
  }, [eventType]);
}