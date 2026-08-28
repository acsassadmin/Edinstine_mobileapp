import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { useUser } from './UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { scoketUrl } from '../appurls';

const LocationTrackingContext = createContext();
export const useLocationTracking = () => useContext(LocationTrackingContext);

export const LocationTrackingProvider = ({ children }) => {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isTracking = useRef(false);
  const sendTimeout = useRef(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const { appUser } = useUser();
  const lastSentLocation = useRef({ latitude: null, longitude: null });

  const [location, setLocation] = useState(null);

  const RECONNECT_DELAY = 3000;

  const connectWebSocket = useCallback(async () => {
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    let busId = appUser?.bus_id;
    let user_id = appUser?.id;
    if (!busId) {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          busId = JSON.parse(storedUser)?.bus_id;
          user_id = JSON.parse(storedUser)?.id;
        }
      } catch (err) {}
    }

    if (!busId) {
      return;
    }

    socketRef.current = new WebSocket(`${scoketUrl}bus/${busId}/${user_id}/`);

    socketRef.current.onopen = () => {
      isTracking.current = true;

      if (location) {
        const payload = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        socketRef.current.send(JSON.stringify(payload));
        lastSentLocation.current = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    socketRef.current.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        setReceivedMessage(data);

        if (data.type === 'notification') {
          alert(`Server says: ${data.message}`);
        }
      } catch (err) {}
    };

    socketRef.current.onclose = () => {
      isTracking.current = false;

      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, RECONNECT_DELAY);
    };

    socketRef.current.onerror = () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [appUser?.bus_id, location]);

  const sendLocation = useCallback(
    (lat, lng) => {
      if (sendTimeout.current) clearTimeout(sendTimeout.current);

      sendTimeout.current = setTimeout(() => {
        const { latitude, longitude } = lastSentLocation.current;
        const threshold = 0.0005;

        if (
          latitude !== null &&
          longitude !== null &&
          Math.abs(latitude - lat) < threshold &&
          Math.abs(longitude - lng) < threshold
        )
          return;

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          const payload = { latitude: lat, longitude: lng };
          socketRef.current.send(JSON.stringify(payload));
          lastSentLocation.current = { latitude: lat, longitude: lng };
        } else {
          connectWebSocket();
        }
      }, 1000);
    },
    [connectWebSocket],
  );

  useEffect(() => {
    let watchId = null;
    (async () => {
      const storedUser = await AsyncStorage.getItem('user');
      const role = storedUser ? JSON.parse(storedUser)?.role : null;
      if (role !== 'driver') return;

      watchId = Geolocation.watchPosition(
        pos => {
          setLocation(pos.coords);
        },
        error => {},
        {
          enableHighAccuracy: true,
          timeout: 2000,
          distanceFilter: 3,
        },
      );
    })();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (!location) return;
    sendLocation(location.latitude, location.longitude);
    return () => sendTimeout.current && clearTimeout(sendTimeout.current);
  }, [location, sendLocation, receivedMessage]);

  const startTripTracking = useCallback(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const stopTripTracking = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }

    isTracking.current = false;
    lastSentLocation.current = { latitude: null, longitude: null };
  }, []);

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        const isTripStarted = await AsyncStorage.getItem('is_trip_started');
        if (isTripStarted === 'true') {
          connectWebSocket();
        }
      } catch (error) {}
    };

    initWebSocket();

    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connectWebSocket]);

  return (
    <LocationTrackingContext.Provider
      value={{
        sendLocation,
        startTripTracking,
        stopTripTracking,
        isTracking: isTracking.current,
        location,
      }}
    >
      {children}
    </LocationTrackingContext.Provider>
  );
};

export default LocationTrackingProvider;
