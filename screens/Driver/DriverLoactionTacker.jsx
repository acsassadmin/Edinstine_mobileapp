// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import Geolocation from '@react-native-community/geolocation';
// import { ChevronLeft, ArrowRight, LocateFixed } from 'lucide-react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import TopBar from '../../components/ParentTobBar';
// import { useUser } from '../../context/UserContext';
// import { useLocationTracking } from '../../context/LocationTrackingContext';
// import { BASEURL } from '../../appurls';

// const DriverLocationTracker = () => {
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [busRoute, setBusRoute] = useState(null);
//   const [routeCoordinates, setRouteCoordinates] = useState([]);
//   const [mapHtml, setMapHtml] = useState('');
//   const webViewRef = useRef(null);
//   const navigation = useNavigation();
//   const { token } = useUser();
//   const locationSubscription = useRef(null);
//   const [mapReady, setMapReady] = useState(false);

//   const fetchBusRoute = useCallback(async () => {
//     try {
//       console.log('triggers');
//       setLoading(true)
//       const storedUser = await AsyncStorage.getItem('user');
//       if (!storedUser) return;

//       const user = JSON.parse(storedUser);

//       const response = await axios.get(
//         `${BASEURL}/api/common/bus-routes/?bus_id=${user?.bus_id}`,
//         { headers: { Authorization: `Token ${token}` } },
//       );
//       console.log('resposne', response.data);

//       if (response.data.results?.length > 0) {
//         setBusRoute(response.data.results[0]);
//         setLoading(false)
//       }
//     } catch (err) {
//       setLoading(false)
//       Alert.alert('Error fetching bus route');
//     }
//   }, [token]);

//   const decodePolyline = useCallback(encoded => {
//     let points = [];
//     let index = 0,
//       lat = 0,
//       lng = 0;

//     while (index < encoded.length) {
//       let b,
//         shift = 0,
//         result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       lat += result & 1 ? ~(result >> 1) : result >> 1;

//       shift = result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       lng += result & 1 ? ~(result >> 1) : result >> 1;

//       points.push({
//         latitude: lat * 1e-5,
//         longitude: lng * 1e-5,
//       });
//     }
//     return points;
//   }, []);

//   const fallbackRoute = useCallback(route => {
//     const coords = [
//       {
//         latitude: parseFloat(route.start_latitude),
//         longitude: parseFloat(route.start_longitude),
//       },
//       ...(route.via_points || []).map(p => ({
//         latitude: p.lat,
//         longitude: p.lng,
//       })),
//       {
//         latitude: parseFloat(route.end_latitude),
//         longitude: parseFloat(route.end_longitude),
//       },
//     ];
//     setRouteCoordinates(coords);
//   }, []);

//   const fetchOSRMRoute = useCallback(
//     async route => {
//       if (!route) return;

//       try {
//         const waypoints = [
//           `${route.start_longitude},${route.start_latitude}`,
//           ...(route.via_points || []).map(p => `${p.lng},${p.lat}`),
//           `${route.end_longitude},${route.end_latitude}`,
//         ].join(';');

//         const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=polyline`;

//         const response = await fetch(url);
//         const data = await response.json();

//         if (data.routes?.length > 0) {
//           const decoded = decodePolyline(data.routes[0].geometry);
//           setRouteCoordinates(decoded);
//         }
//       } catch (error) {
//         fallbackRoute(route);
//       }
//     },
//     [decodePolyline, fallbackRoute],
//   );

//   const generateMapHtml = useCallback(route => {
//     if (!route) return '';

//     const start = [
//       parseFloat(route.start_latitude),
//       parseFloat(route.start_longitude),
//     ];
//     const end = [
//       parseFloat(route.end_latitude),
//       parseFloat(route.end_longitude),
//     ];

//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8"/>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//       <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
//       <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//       <style>
//         html,body,#map{height:100%;margin:0;padding:0;}
//         .bus-icon {
//           transform: translate(-50%, -50%);
//         }
//       </style>
//     </head>
//     <body>
//       <div id="map"></div>
//       <script>
//         var map = L.map('map').setView(${JSON.stringify(start)}, 13);

//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
//          var redIcon = L.icon({
//           iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
//           shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//           iconSize: [25,41],
//           iconAnchor: [12,41],
//           popupAnchor: [1,-34],
//           shadowSize: [41,41]
//         });

//         var routeLayer, driverMarker;

//         var busIcon = L.divIcon({
//           className: "bus-icon",
//           html: '<img src="https://cdn-icons-png.freepik.com/256/6984/6984901.png?semt=ais_white_label" style="width:50px;height:50px;" />',
//           iconSize: [50,50],
//           iconAnchor: [25,25]
//         });

//         window.addRoute = function(coords){
//           if(routeLayer) map.removeLayer(routeLayer);
//           routeLayer = L.polyline(coords.map(c=>[c.latitude,c.longitude]),{
//             color:'#4285F4',
//             weight:6
//           }).addTo(map);
//           map.fitBounds(routeLayer.getBounds());
//         }

//         window.addMarkers = function(start,end){
//           L.marker(start).addTo(map).bindPopup("Start");
//            L.marker(end, { icon: redIcon }).addTo(map).bindPopup("End");
//         }

//         window.updateDriver = function(loc){
//           if(!driverMarker){
//             driverMarker = L.marker([loc.latitude,loc.longitude], { icon: busIcon }).addTo(map);
//           } else {
//             driverMarker.setLatLng([loc.latitude,loc.longitude]);
//           }

//           map.setView([loc.latitude,loc.longitude], 16, { animate: true });
//         }

//         window.addMarkers(${JSON.stringify(start)},${JSON.stringify(end)});
//       </script>
//     </body>
//     </html>
//   `;
//   }, []);

//   const requestLocationPermission = async () => {
//     if (Platform.OS === 'android') {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Permission',
//           message: 'App needs access to your location for live tracking.',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         },
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } else {
//       return new Promise(resolve => {
//         Geolocation.requestAuthorization(
//           status => resolve(status === 'granted'),
//           error => resolve(false),
//         );
//       });
//     }
//   };

//   const startTracking = useCallback(() => {
//     locationSubscription.current = Geolocation.watchPosition(
//       async pos => {
//         const { latitude, longitude } = pos.coords;
//         setLocation({ latitude, longitude });
//         await sendLocation(latitude, longitude);

//         if (webViewRef.current) {
//           webViewRef.current.injectJavaScript(`
//             window.updateDriver(${JSON.stringify({ latitude, longitude })});
//             true;
//           `);
//         }
//       },
//       error => {
//         console.log('Location tracking error:', error);
//       },
//       {
//         enableHighAccuracy: true,
//         distanceFilter: 5,
//         interval: 3000,
//         fastestInterval: 1000,
//       },
//     );
//   }, [sendLocation]);

//   useEffect(() => {
//     fetchBusRoute();
//   }, []);

//   useEffect(() => {
//     if (busRoute || mapReady) {
//       setMapHtml(generateMapHtml(busRoute));
//       fetchOSRMRoute(busRoute);
//     }
//   }, [busRoute, mapReady, generateMapHtml, fetchOSRMRoute]);

//   useEffect(() => {
//     if (routeCoordinates.length && webViewRef.current) {
//       webViewRef.current.injectJavaScript(`
//         window.addRoute(${JSON.stringify(routeCoordinates)});
//         true;
//       `);
//     }
//   }, [routeCoordinates, mapReady]);

//   if (loading || !location) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#86b952" />
//         <Text>Loading Bus Route.fd..</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <TopBar />

//       <WebView
//         ref={webViewRef}
//         source={{ html: mapHtml }}
//         style={{ flex: 1 }}
//         javaScriptEnabled
//         domStorageEnabled
//         onLoadEnd={() => {
//           setMapReady(true);
//         }}
//       />

//       <View style={styles.topBarContainer}>
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.goBack()}
//           activeOpacity={0.8}
//         >
//           <ChevronLeft size={22} color="#1e293b" />
//         </TouchableOpacity>

//         <View style={styles.routeCard}>
//           {busRoute ? (
//             <>
//               <Text style={styles.busNumber}>🚌 Bus {busRoute.bus_number}</Text>

//               <View style={styles.routeRow}>
//                 <Text style={styles.routePoint}>
//                   {busRoute.start_point_name}
//                 </Text>

//                 <ArrowRight size={14} color="#94a3b8" />

//                 <Text style={styles.routePoint}>{busRoute.end_point_name}</Text>
//               </View>
//             </>
//           ) : (
//             <>
//               <Text style={styles.busNumber}>🚌 Loading Route</Text>
//               <Text style={styles.loadingRoute}>Please wait...</Text>
//             </>
//           )}
//         </View>

//         <TouchableOpacity style={styles.iconButtonPrimary} activeOpacity={0.8}>
//           <LocateFixed size={20} color="white" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default DriverLocationTracker;

// const styles = StyleSheet.create({
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   topBarContainer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 16,
//     right: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   iconButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 16,
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   iconButtonPrimary: {
//     width: 48,
//     height: 48,
//     borderRadius: 16,
//     backgroundColor: '#16a34a',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 6,
//     shadowColor: '#16a34a',
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   routeCard: {
//     flex: 1,
//     marginHorizontal: 12,
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//   },
//   busNumber: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#0f172a',
//     textAlign: 'center',
//   },
//   routeRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 6,
//     gap: 6,
//   },
//   routePoint: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#16a34a',
//   },
//   loadingRoute: {
//     fontSize: 12,
//     color: '#94a3b8',
//     textAlign: 'center',
//     marginTop: 4,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });


import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  DeviceEventEmitter, // Changed to DeviceEventEmitter
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft, ArrowRight, LocateFixed } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import { useLocationTracking } from '../../context/LocationTrackingContext';
import { BASEURL } from '../../appurls';
import LocationModule from "../../TurboModules/NativeLocationModule";

const DriverLocationTracker = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busRoute, setBusRoute] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapHtml, setMapHtml] = useState('');
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const { token } = useUser();
  const { sendLocation } = useLocationTracking();
  const [mapReady, setMapReady] = useState(false);

  const fetchBusRoute = useCallback(async () => {
    try {
      console.log('Fetching bus route...');
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      const response = await axios.get(
        `${BASEURL}/api/common/bus-routes/?bus_id=${user?.bus_id}`,
        { headers: { Authorization: `Token ${token}` } },
      );

      if (response.data.results?.length > 0) {
        setBusRoute(response.data.results[0]);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error fetching bus route');
    }
  }, [token]);

  const decodePolyline = useCallback(encoded => {
    let points = [];
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

      shift = result = 0; 
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

  const fallbackRoute = useCallback(route => {
    const coords = [
      {
        latitude: parseFloat(route.start_latitude),
        longitude: parseFloat(route.start_longitude),
      },
      ...(route.via_points || []).map(p => ({
        latitude: p.lat,
        longitude: p.lng,
      })),
      {
        latitude: parseFloat(route.end_latitude),
        longitude: parseFloat(route.end_longitude),
      },
    ];
    setRouteCoordinates(coords);
  }, []);

  const fetchOSRMRoute = useCallback(
    async route => {
      if (!route) return;

      try {
        const waypoints = [
          `${route.start_longitude},${route.start_latitude}`,
          ...(route.via_points || []).map(p => `${p.lng},${p.lat}`),
          `${route.end_longitude},${route.end_latitude}`,
        ].join(';');

        const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=polyline`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes?.length > 0) {
          const decoded = decodePolyline(data.routes[0].geometry);
          setRouteCoordinates(decoded);
        }
      } catch (error) {
        fallbackRoute(route);
      }
    },
    [decodePolyline, fallbackRoute],
  );

  const generateMapHtml = useCallback(route => {
    if (!route) return '';

    const start = [
      parseFloat(route.start_latitude),
      parseFloat(route.start_longitude),
    ];
    const end = [
      parseFloat(route.end_latitude),
      parseFloat(route.end_longitude),
    ];

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html,body,#map{height:100%;margin:0;padding:0;}
        .bus-icon {
          transform: translate(-50%, -50%);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView(${JSON.stringify(start)}, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
         var redIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25,41],
          iconAnchor: [12,41],
          popupAnchor: [1,-34],
          shadowSize: [41,41]
        });

        var routeLayer, driverMarker;

        var busIcon = L.divIcon({
          className: "bus-icon",
          html: '<img src="https://cdn-icons-png.freepik.com/256/6984/6984901.png?semt=ais_white_label" style="width:50px;height:50px;" />',
          iconSize: [50,50],
          iconAnchor: [25,25]
        });

        window.addRoute = function(coords){
          if(routeLayer) map.removeLayer(routeLayer);
          routeLayer = L.polyline(coords.map(c=>[c.latitude,c.longitude]),{
            color:'#4285F4',
            weight:6
          }).addTo(map);
          map.fitBounds(routeLayer.getBounds());
        }

        window.addMarkers = function(start,end){
          L.marker(start).addTo(map).bindPopup("Start");
           L.marker(end, { icon: redIcon }).addTo(map).bindPopup("End");
        }

        window.updateDriver = function(loc){
          if(!driverMarker){
            driverMarker = L.marker([loc.latitude,loc.longitude], { icon: busIcon }).addTo(map);
          } else {
            driverMarker.setLatLng([loc.latitude,loc.longitude]);
          }

          map.setView([loc.latitude,loc.longitude], 16, { animate: true });
        }

        window.addMarkers(${JSON.stringify(start)},${JSON.stringify(end)});
      </script>
    </body>
    </html>
  `;
  }, []);

  // --- NEW: Listen to Native Kotlin Location Updates ---
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("onLocationUpdate", (coordsString) => {
      if (coordsString) {
        // The Kotlin service sends a string "lat,lng" (e.g. "50.123,3.456")
        const [latStr, lngStr] = coordsString.split(',');
        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lngStr);
        
        const newLocation = { latitude, longitude };
        setLocation(newLocation);

        // Send to your server via context
        sendLocation(latitude, longitude);

        // Update WebView Map
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.updateDriver(${JSON.stringify(newLocation)});
            true;
          `);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [sendLocation]);

  useEffect(() => {
    fetchBusRoute();
  }, []);

  useEffect(() => {
    if (busRoute || mapReady) {
      setMapHtml(generateMapHtml(busRoute));
      fetchOSRMRoute(busRoute);
    }
  }, [busRoute, mapReady, generateMapHtml, fetchOSRMRoute]);

  useEffect(() => {
    if (routeCoordinates.length && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.addRoute(${JSON.stringify(routeCoordinates)});
        true;
      `);
    }
  }, [routeCoordinates, mapReady]);

  if (loading || !location) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text>Loading Bus Route & Location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TopBar />

      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => {
          setMapReady(true);
        }}
      />

      <View style={styles.topBarContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color="#1e293b" />
        </TouchableOpacity>

        <View style={styles.routeCard}>
          {busRoute ? (
            <>
              <Text style={styles.busNumber}>🚌 Bus {busRoute.bus_number}</Text>

              <View style={styles.routeRow}>
                <Text style={styles.routePoint}>
                  {busRoute.start_point_name}
                </Text>

                <ArrowRight size={14} color="#94a3b8" />

                <Text style={styles.routePoint}>{busRoute.end_point_name}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.busNumber}>🚌 Loading Route</Text>
              <Text style={styles.loadingRoute}>Please wait...</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.iconButtonPrimary} activeOpacity={0.8}>
          <LocateFixed size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverLocationTracker;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  iconButtonPrimary: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#16a34a',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  routeCard: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  busNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  routePoint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  loadingRoute: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});