import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useUser } from './UserContext';
import NotificationPopUp from '../components/NotificationPopUp';
import { BASEURL, scoketUrl } from '../appurls';
import axios from 'axios';
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [currentNotification, setCurrentNotification] = useState(null);
  const { appUser, token } = useUser();
  const [notificationCount, setNotificationCount] = useState(null);
  const WS_URL = appUser?.id ? `${scoketUrl}notifications/${appUser.id}/` : '';

  //  SHOW NOTIFICATION FUNCTION
  const showNotificationPopup = data => {
    const notification = {
      title:
        data.payload?.title || data.payload?.sender_name || 'New Notification',
      message:
        data.payload?.message ||
        data.payload?.content ||
        'You have a new message',
      type: data.payload?.type || 'default',
      timeText: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      id: data.id,
    };

    // console.log("🔔 Showing notification:", notification);
    setCurrentNotification(notification);
  };

  const connect = useCallback(
    socketId => {
      // Clear existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      if (socketRef.current) {
        socketRef.current.close();
      }

      // console.log("🔌 Connecting to:", WS_URL);
      socketRef.current = new WebSocket(WS_URL);

      socketRef.current.onopen = () => {
        // console.log(" WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        socketRef.current.send(
          JSON.stringify({
            type: 'login',
            user_id: socketId,
            user_name: appUser?.name || 'Unknown',
          }),
        );
      };

      socketRef.current.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          // console.log("📨 Notification:", data);
          //  SHOW POPUP IMMEDIATELY
          showNotificationPopup(data.payload);

          // Store in list (avoid duplicates)
          setNotifications(prev => {
            const exists = prev.find(n => n.id === data.id);
            if (!exists) {
              return [data, ...prev.slice(0, 19)];
            }
            return prev;
          });

          setLastMessage(data);
          getNotificationCount();
        } catch (err) {
          console.warn('Non-JSON:', event.data);
        }
      };

      socketRef.current.onerror = () => {
        // console.error("❌ Socket error");
        setIsConnected(false);
      };

      socketRef.current.onclose = () => {
        // console.log("🔌 Disconnected");
        setIsConnected(false);

        // Smart reconnect (3s delay)
        reconnectTimeoutRef.current = setTimeout(() => {
          if (appUser?.id) {
            connect(socketId);
          }
        }, 3000);
      };
    },
    [appUser?.id, WS_URL, appUser],
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback(message => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Close notification callback
  const handleNotificationClose = () => {
    setCurrentNotification(null);
  };

  const getNotificationCount = async () => {
    const response = await axios.get(
      BASEURL + '/api/common/notifications/?user_id=' + appUser?.id,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setNotificationCount(response.data.unread_count);
    // console.log("response notificationssss", response.data.unread_count);
  };

  useEffect(() => {
    if (appUser?.id) {
      const socketId = `${appUser.name?.toLowerCase().replace(/\s+/g, '_')}_${
        appUser.id
      }`;
      connect(socketId);
    }
    getNotificationCount();

    return () => {
      disconnect();
    };
  }, [appUser, connect, disconnect]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        notifications,
        lastMessage,
        sendMessage,
        clearNotifications,
        setNotificationCount,
        notificationCount,
        socketId: appUser?.id
          ? `${appUser.name?.toLowerCase().replace(/\s+/g, '_')}_${appUser.id}`
          : null,
      }}
    >
      {children}

      {/* NOTIFICATION POPUP - RENDERED ON TOP */}
      <NotificationPopUp
        visible={!!currentNotification}
        title={currentNotification?.title}
        message={currentNotification?.message}
        type={currentNotification?.type}
        timeText={currentNotification?.timeText}
        onClose={handleNotificationClose}
        autoClose={5000}
      />
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
