import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  DeviceEventEmitter // Changed to DeviceEventEmitter
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, PlayCircle, StopCircle, MapPin } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';

import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Geolocation from '@react-native-community/geolocation'; 
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import ProfilePicture from '../ProfilePicture';
import LocationModule from "../../TurboModules/NativeLocationModule";

const DriverHomeScreen = () => {
  const { appUser, token, setAppUser, setUser, setToken } = useUser();
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(false);
  const [isTripStarted, setIsTripStarted] = useState(false);
  const [driver, setDriver] = useState(null);
  const [driverDetailLoading, setDriverDetailLoading] = useState(false);

 
  useEffect(() => {
    console.log("Setting up location listener...");
    
    const subscription = DeviceEventEmitter.addListener("onLocationUpdate", (coordsString) => {
      console.log("Location from Native Service:", coordsString);
      // coordsString is "lat,lng" (e.g., "50.123,3.456")
      const [lat, lng] = coordsString.split(',');
      // If you need to send to server from here, you can call your API here.
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('accessToken');
      let newuser = await AsyncStorage.getItem('user');

      if (storedToken && newuser) {
        setToken(storedToken);
        newuser = JSON.parse(newuser);
        setAppUser({
          name: newuser.name,
          role: newuser.role,
          profile_pic: newuser.profile_pic,
          section_name: newuser.section_name,
          branch_id: newuser.branch_id,
          school_id: newuser.school_id,
          id: newuser.id,
          email: newuser.email,
          standard_name: newuser.standard_name,
          class_id: newuser.class_id,
        });

        const decoded = jwtDecode(storedToken);
        setUser(decoded);
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  }, [navigation, setAppUser, setToken, setUser]);

  useEffect(() => {
    loadUser();

    const loadTripState = async () => {
      const storedTrip = await AsyncStorage.getItem('is_trip_started');
      if (storedTrip === 'true') {
        setIsTripStarted(true);
        startLiveTracking();
      }
    };

    loadTripState();
  }, [loadUser]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location for live tracking.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      return new Promise(resolve => {
        Geolocation.requestAuthorization(
          status => resolve(status === 'granted'),
          error => resolve(false),
        );
      });
    }
  };  

  const startLiveTracking = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    console.log("Live started, Permission granted:", hasPermission);
    
    if (hasPermission) {
      // Starts the Kotlin Foreground Service
      LocationModule.startLocationUpdates();
    } else {
      Alert.alert('Permission denied', 'Location permission is required to start tracking.');
    }
  }, []);

  const stopLiveTracking = useCallback(() => {
    // Stops the Kotlin Foreground Service
    LocationModule.stopLocationUpdates();
  }, []);

  const handleTripToggle = useCallback(async () => {
    try {
      setLoading(true);

      if (!isTripStarted) {
        await AsyncStorage.setItem('is_trip_started', 'true');
        setIsTripStarted(true);
        await startLiveTracking();
        navigation.navigate('DriverLoactionTracker');
        Alert.alert('Trip Started 🚍');
      } else {
        await AsyncStorage.setItem('is_trip_started', 'false');
        setIsTripStarted(false);
        stopLiveTracking();
        Alert.alert('Trip Ended');
      }
    } catch (error) {
      console.error("Error toggling trip:", error);
    } finally {
      setLoading(false);
    }
  }, [isTripStarted, navigation, startLiveTracking, stopLiveTracking]);

  return (
    <View style={styles.safeArea}>
      <ScrollView>
        {driverDetailLoading ? (
          <ActivityIndicator size="large" color="#86b952" />
        ) : (
          <View style={{ padding: 20 }}>
            <ImageBackground
              source={require('../../assets/Cards/Top_Card.png')}
              imageStyle={{ borderRadius: 16 }}
              style={styles.profileCardContainer}
            >
              <ProfilePicture type={'driver'} />

              <Text style={styles.profileName}>{appUser?.name}</Text>
              <Text style={styles.className}>Driver</Text>

              <View style={styles.dateRow}>
                <Calendar size={22} color="#000" />
                <Text style={{ marginLeft: 8 }}>
                  {dayjs().format('ddd, D MMM')}
                </Text>
              </View>
            </ImageBackground>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.tripButton,
              {
                backgroundColor: isTripStarted ? '#ff6b35' : '#86b952',
              },
            ]}
            onPress={handleTripToggle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                {isTripStarted ? (
                  <StopCircle size={22} color="#fff" />
                ) : (
                  <PlayCircle size={22} color="#fff" />
                )}
                <Text style={styles.buttonText}>
                  {isTripStarted ? 'End Trip' : 'Start Trip'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isTripStarted && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.liveButton}
              onPress={() => navigation.navigate('DriverLoactionTracker')}
            >
              <MapPin size={20} color="#fff" />
              <Text style={styles.buttonText}>View Live Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DriverHomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileCardContainer: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 80,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  className: {
    fontSize: 18,
    color: '#555',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 25,
  },
  tripButton: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    gap: 10,
  },
  liveButton: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4ecdc4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});