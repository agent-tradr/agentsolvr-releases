import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  autoReconnect?: boolean;
}

export interface UseWebSocketReturn {
  socket: WebSocket | null;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  sendMessage: (type: string, data: any) => boolean;
  sendJsonMessage: (message: any) => boolean;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  messageHistory: WebSocketMessage[];
}

export const useWebSocket = (config: WebSocketConfig): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);
  
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  const {
    url,
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    autoReconnect = true
  } = config;

  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval > 0) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          sendMessage('ping', { timestamp: Date.now() });
        }
      }, heartbeatInterval);
    }
  }, [socket, heartbeatInterval]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const parsedData = JSON.parse(event.data);
      const message: WebSocketMessage = {
        type: parsedData.type || 'message',
        data: parsedData.data || parsedData,
        timestamp: new Date(),
        id: parsedData.id
      };

      setLastMessage(message);
      setMessageHistory(prev => [...prev.slice(-99), message]); // Keep last 100 messages

      // Handle heartbeat response
      if (message.type === 'pong') {
        return; // Don't trigger onMessage for heartbeat responses
      }

      if (onMessage) {
        onMessage(message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      const message: WebSocketMessage = {
        type: 'raw',
        data: event.data,
        timestamp: new Date()
      };
      setLastMessage(message);
      if (onMessage) {
        onMessage(message);
      }
    }
  }, [onMessage]);

  const handleOpen = useCallback((event: Event) => {
    setConnectionState('connected');
    setError(null);
    reconnectAttemptsRef.current = 0;
    shouldReconnectRef.current = true;
    
    startHeartbeat();
    
    if (onOpen) {
      onOpen(event);
    }
  }, [onOpen, startHeartbeat]);

  const handleClose = useCallback((event: CloseEvent) => {
    setConnectionState('disconnected');
    clearTimeouts();
    
    if (onClose) {
      onClose(event);
    }

    // Auto-reconnect logic
    if (autoReconnect && shouldReconnectRef.current && reconnectAttemptsRef.current < reconnectAttempts) {
      const delay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current++;
        connect();
      }, delay);
    }
  }, [onClose, autoReconnect, reconnectAttempts, reconnectInterval, clearTimeouts]);

  const handleError = useCallback((event: Event) => {
    setConnectionState('error');
    setError('WebSocket connection error');
    
    if (onError) {
      onError(event);
    }
  }, [onError]);

  const connect = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      setConnectionState('connecting');
      setError(null);
      
      const newSocket = new WebSocket(url, protocols);
      
      newSocket.addEventListener('open', handleOpen);
      newSocket.addEventListener('message', handleMessage);
      newSocket.addEventListener('close', handleClose);
      newSocket.addEventListener('error', handleError);
      
      setSocket(newSocket);
    } catch (error) {
      setConnectionState('error');
      setError(error instanceof Error ? error.message : 'Failed to create WebSocket connection');
    }
  }, [url, protocols, handleOpen, handleMessage, handleClose, handleError, socket]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearTimeouts();
    
    if (socket) {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('error', handleError);
      
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
      
      setSocket(null);
    }
    
    setConnectionState('disconnected');
  }, [socket, handleOpen, handleMessage, handleClose, handleError, clearTimeouts]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    shouldReconnectRef.current = true;
    
    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);

  const sendMessage = useCallback((type: string, data: any): boolean => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Cannot send message.');
      return false;
    }

    try {
      const message = {
        type,
        data,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      return false;
    }
  }, [socket]);

  const sendJsonMessage = useCallback((message: any): boolean => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Cannot send message.');
      return false;
    }

    try {
      socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send JSON message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send JSON message');
      return false;
    }
  }, [socket]);

  // Effect to establish initial connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [url, protocols]); // Only reconnect when URL or protocols change

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      clearTimeouts();
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Derived state
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return {
    socket,
    connectionState,
    lastMessage,
    sendMessage,
    sendJsonMessage,
    connect,
    disconnect,
    reconnect,
    isConnected,
    isConnecting,
    error,
    messageHistory
  };
};

// Additional utility hooks

export const useWebSocketSubscription = (
  websocket: UseWebSocketReturn,
  messageType: string,
  handler: (data: any) => void
) => {
  useEffect(() => {
    if (websocket.lastMessage && websocket.lastMessage.type === messageType) {
      handler(websocket.lastMessage.data);
    }
  }, [websocket.lastMessage, messageType, handler]);
};

export const useWebSocketEvent = (
  websocket: UseWebSocketReturn,
  eventType: string,
  handler: (data: any) => void,
  dependencies: any[] = []
) => {
  useEffect(() => {
    const handleEvent = (message: WebSocketMessage) => {
      if (message.type === eventType) {
        handler(message.data);
      }
    };

    if (websocket.isConnected) {
      // Subscribe to future messages
      const originalOnMessage = websocket.socket?.onmessage;
      if (websocket.socket) {
        websocket.socket.onmessage = (event) => {
          if (originalOnMessage) {
            originalOnMessage.call(websocket.socket, event);
          }
          try {
            const message = JSON.parse(event.data);
            handleEvent({
              type: message.type,
              data: message.data,
              timestamp: new Date(),
              id: message.id
            });
          } catch (error) {
            // Ignore parsing errors
          }
        };
      }
    }
  }, [websocket.isConnected, eventType, handler, ...dependencies]);
};

export default useWebSocket;