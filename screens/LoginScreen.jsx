import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMessaging,
  requestPermission,
  getToken,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import RNFS from 'react-native-fs';
import { Eye, EyeOff } from 'lucide-react-native';
import AuthService from '../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';

const backgroundImage = require('../assets/Login.png');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const { appUser, loadUser } = useUser();

  // const registerForPushNotificationsAsync = useCallback(async () => {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (!enabled) {
  //     Alert.alert(
  //       'Permission Required',
  //       'Push notifications permission is required',
  //     );
  //     return;
  //   }

  //   try {
  //     const token = await messaging().getToken();
  //     setFcmToken(token);
  //   } catch (err) {}
  // }, []);

  // useEffect(() => {
  //   registerForPushNotificationsAsync();

  //   const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
  //     const screen = remoteMessage.data.screen;
  //     if (screen) {
  //       navigation.navigate(screen);
  //     }
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [registerForPushNotificationsAsync, navigation]);

  // const getToken = async () => {
  //   try {
  //     const token = await messaging();
  //   } catch (error) {}
  // };
  // const messaging = getMessaging();
  // const registerForPushNotificationsAsync = useCallback(async () => {
  //   try {
  //     const authStatus = await requestPermission(messaging);

  //     const enabled =
  //       authStatus === AuthorizationStatus.AUTHORIZED ||
  //       authStatus === AuthorizationStatus.PROVISIONAL;
  //     console.log('enabled', enabled);
  //     if (!enabled) {
  //       Alert.alert(
  //         'Permission Required',
  //         'Push notifications permission is required',
  //       );
  //       return;
  //     }

  //     const token = await getToken(messaging);

  //     console.log('FCM Token:', token);

  //     setFcmToken(token);
  //   } catch (error) {
  //     console.error('FCM token error:', error);
  //   }
  // }, []);

  const messaging = getMessaging();
  const registerForPushNotificationsAsync = useCallback(async () => {
    try {
      const authStatus = await requestPermission(messaging);

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      console.log('Permission status:', authStatus);

      if (!enabled) {
        Alert.alert(
          'Permission Required',
          'Push notifications permission is required',
        );
        return;
      }

      // 2. CRITICAL IOS FIX: Register native device with Apple APNs first
      if (Platform.OS === 'ios') {
        await messaging.registerDeviceForRemoteMessages(getMessaging());
      }

      // 3. Fetch the actual native FCM token
      const token = await messaging.getToken();

      console.log('FCM Token:', token);
      setFcmToken(token);
    } catch (error) {
      console.error('FCM token error:', error);
    }
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Notification opened when app was in background
    const unsubscribe = onNotificationOpenedApp(messaging, remoteMessage => {
      console.log('Notification opened:', remoteMessage);

      const screen = remoteMessage?.data?.screen;

      if (screen) {
        navigation.navigate(screen);
      }
    });

    // Notification opened when app was completely closed
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) {
        console.log('Initial notification:', remoteMessage);

        const screen = remoteMessage?.data?.screen;

        if (screen) {
          navigation.navigate(screen);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [registerForPushNotificationsAsync, navigation]);

  const getFCMToken = async () => {
    try {
      const token = await getToken(messaging);

      console.log('FCM Token:', token);

      return token;
    } catch (error) {
      console.error('Get FCM token error:', error);
    }
  };

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.login(email, password, fcmToken);

      if (!result.statusCode) {
        if (!result.success) {
          Alert.alert('Login Failed', result.message);
          return;
        }
        const { user, access, data, decodedToken } = result;
        await AsyncStorage.setItem('accessToken', access);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        if (!user?.is_switchable) {
          await AsyncStorage.setItem('accessToken', access);
          await AsyncStorage.setItem('user', JSON.stringify(user));
          if (user?.role === 'student') {
            navigation.replace('Parent');
          } else if (user?.role === 'staff') {
            navigation.replace('Staff');
          } else if (user?.role === 'driver') {
            navigation.replace('Driver');
          }
          loadUser();
          return;
        }

        navigation.navigate('SelectRoleScreen', {
          data: JSON.stringify(data),
        });
      } else {
        Alert.alert(
          'Invalid Login',
          `${result?.statusCode} : ${result?.message}`,
        );
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [email, password, fcmToken, navigation, loadUser]);

  const writeErrorToFile = useCallback(async error => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/error_log.txt`;
      const errorMessage = `
      ==========================
      DATE: ${new Date().toISOString()}
      MESSAGE: ${error?.message}
      CODE: ${error?.code}
      RESPONSE: ${JSON.stringify(error?.response)}
      FULL ERROR: ${JSON.stringify(error)}
      ==========================
      `;
      await RNFS.appendFile(path, errorMessage, 'utf8');
    } catch (fileError) {}
  }, []);

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#666" />
            ) : (
              <Eye size={20} color="#666" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          disabled={loading}
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '90%',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    color: 'black',
    borderWidth: 1,
    borderColor: '#fff',
  },
  passwordContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyeButton: { paddingHorizontal: 15, paddingVertical: 15 },
  button: {
    width: '90%',
    backgroundColor: '#86b952',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default LoginScreen;
