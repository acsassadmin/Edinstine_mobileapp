import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../../components/ParentTobBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASEURL, scoketUrl } from '../../appurls';

const TrackBus = () => {
  const { token, appUser } = useUser();
  const navigation = useNavigation();

  const [busRoute, setBusRoute] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [busLocation, setBusLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapHtml, setMapHtml] = useState('');

  const socketRef = useRef(null);
  const webViewRef = useRef(null);

  const fetchBusRoute = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('accessToken');
      let storedUser = await AsyncStorage.getItem('user');
      if (!storedToken && !storedUser) {
        return null;
      }
      storedUser = JSON.parse(storedUser);
      const response = await axios.get(
        `${BASEURL}/api/common/bus-routes/?bus_id=${storedUser?.bus_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.results?.length > 0) {
        setBusRoute(response.data.results[0]);
      }
    } catch (error) {}
  }, [token]);

  const decodePolyline = useCallback(encoded => {
    const points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      lat += result & 1 ? ~(result >> 1) : result >> 1;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      lng += result & 1 ? ~(result >> 1) : result >> 1;

      points.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5,
      });
    }

    return points;
  }, []);

  const fallbackRoute = useCallback(() => {
    if (!busRoute) return;

    const coords = [
      {
        latitude: parseFloat(busRoute.start_latitude),
        longitude: parseFloat(busRoute.start_longitude),
      },
      ...(busRoute.via_points || []).map(point => ({
        latitude: parseFloat(point.lat),
        longitude: parseFloat(point.lng),
      })),
      {
        latitude: parseFloat(busRoute.end_latitude),
        longitude: parseFloat(busRoute.end_longitude),
      },
    ];

    setRouteCoordinates(coords);
  }, [busRoute]);

  const fetchOSRMRoute = useCallback(async () => {
    if (!busRoute) return;

    try {
      const waypoints = [
        `${busRoute.start_longitude},${busRoute.start_latitude}`,
        ...(busRoute.via_points || []).map(
          point => `${point.lng},${point.lat}`,
        ),
        `${busRoute.end_longitude},${busRoute.end_latitude}`,
      ].join(';');

      const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=polyline`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes?.length > 0) {
        const decoded = decodePolyline(data.routes[0].geometry);
        setRouteCoordinates(decoded);
      }
    } catch (error) {
      fallbackRoute();
    }
  }, [busRoute, decodePolyline, fallbackRoute]);

  const connectSocket = useCallback(async () => {
    const storedToken = await AsyncStorage.getItem('accessToken');
    let storedUser = await AsyncStorage.getItem('user');
    if (!storedToken && !storedUser) {
      return null;
    }
    storedUser = JSON.parse(storedUser);
    socketRef.current = new WebSocket(
      `${scoketUrl}bus/${storedUser?.bus_id}/${storedUser?.id}/`,
    );

    socketRef.current.onopen = () => {};

    socketRef.current.onmessage = event => {
      const message = JSON.parse(event.data);
      const { lat, lng } = message;
      const newLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      };
      setBusLocation(newLocation);

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.updateBusLocation) {
            window.updateBusLocation(${JSON.stringify(newLocation)});
          }
          true;
        `);
      }
    };

    socketRef.current.onclose = () => {
      setTimeout(connectSocket, 3000);
    };

    socketRef.current.onerror = () => {};
  }, []);

  const generateMapHtml = useCallback(() => {
    const startCoord = busRoute
      ? [
          parseFloat(busRoute.start_latitude),
          parseFloat(busRoute.start_longitude),
        ]
      : [12.9716, 77.5946];
    const endCoord = busRoute
      ? [parseFloat(busRoute.end_latitude), parseFloat(busRoute.end_longitude)]
      : [12.9716, 77.5946];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bus Tracker</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .bus-icon { transform: translate(-50%, -50%); }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView(${JSON.stringify(startCoord)}, 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          var routeLayer;
          var busMarker;
          var startMarker, endMarker;
          var busCircle;

          window.updateRoute = function(coords) {
            if (routeLayer) map.removeLayer(routeLayer);
            if (coords && coords.length > 1) {
              routeLayer = L.polyline(coords.map(c => [c.latitude, c.longitude]), {
                color: '#4285F4',
                weight: 6,
                opacity: 0.9
              }).addTo(map);
              map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
            }
          };

          window.updateBusLocation = function(location) {
            if (busMarker) map.removeLayer(busMarker);
            if (busCircle) map.removeLayer(busCircle);
            
            busMarker = L.marker([location.latitude, location.longitude], {
              icon: L.divIcon({
                className: 'bus-icon',
                html: '<img src="https://cdn-icons-png.freepik.com/256/6984/6984901.png?semt=ais_white_label" style="width:60px;height:60px;object-fit:contain;" alt="Bus"/>',
                iconSize: [60, 60],
                iconAnchor: [30, 30]
              })
            }).addTo(map);

            busCircle = L.circle([location.latitude, location.longitude], {
              radius: 35,
              color: '#ff6b35',
              fillColor: 'rgba(255,107,53,0.25)',
              fillOpacity: 0.5
            }).addTo(map);

            map.setView([location.latitude, location.longitude], 16, { animate: true });
          };

          window.addStartEndMarkers = function(start, end) {
            if (startMarker) map.removeLayer(startMarker);
            if (endMarker) map.removeLayer(endMarker);
            
            startMarker = L.marker(start).addTo(map)
              .bindPopup('Start').openPopup();
            endMarker = L.marker(end).addTo(map)
              .bindPopup('End');
          };

          map.fitBounds([${JSON.stringify(startCoord)}, ${JSON.stringify(
      endCoord,
    )}]);
        </script>
      </body>
      </html>
    `;
  }, [busRoute]);

  const trackCurrentLocation = useCallback(() => {
    if (webViewRef.current && busLocation) {
      webViewRef.current.injectJavaScript(`
        if (window.updateBusLocation) {
          window.updateBusLocation(${JSON.stringify(busLocation)});
        }
        true;
      `);
    }
  }, [busLocation]);

  useEffect(() => {
    const init = async () => {
      await fetchBusRoute();
      connectSocket();
      setLoading(false);
    };

    init();

    return () => socketRef.current?.close();
  }, [fetchBusRoute, connectSocket]);

  useEffect(() => {
    if (busRoute) {
      fetchOSRMRoute();
      setMapHtml(generateMapHtml());

      const timer = setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.addStartEndMarkers) {
              window.addStartEndMarkers(
                [${busRoute.start_latitude}, ${busRoute.start_longitude}],
                [${busRoute.end_latitude}, ${busRoute.end_longitude}]
              );
            }
            true;
          `);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [busRoute, fetchOSRMRoute, generateMapHtml]);

  useEffect(() => {
    if (routeCoordinates.length > 0 && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updateRoute) {
          window.updateRoute(${JSON.stringify(routeCoordinates)});
        }
        true;
      `);
    }
  }, [routeCoordinates]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text>Loading Bus Routed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <WebView
        ref={webViewRef}
        source={{ html: mapHtml || '<h1>Loading Map...</h1>' }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
      />

      <View style={styles.bottomCard}>
        <Text style={styles.busNumber}>🚌 Bus No {busRoute?.bus_number}</Text>
        <Text style={styles.routeText}>
          {busRoute?.start_point_name} → {busRoute?.end_point_name}
        </Text>
      </View>
    </View>
  );
};

export default TrackBus;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 18,
    elevation: 10,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  routeText: {
    fontSize: 14,
    color: '#86b952',
    marginTop: 4,
  },
});
