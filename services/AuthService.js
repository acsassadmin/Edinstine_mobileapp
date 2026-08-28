import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appUrls } from '../appurls';

const AuthService = {
  login: async (email, password, expoPushToken) => {
    try {
      const response = await axios.post(appUrls.login, {
        username: email,
        password: password,
        device_type: 'mobile',
      });

      if (response.data.status === false) {
        return {
          success: false,
          message:
            response.data.mesage ||
            response.data.message ||
            response.data.detail ||
            'Login failed',
          data: response.data,
        };
      }
      const { token } = response.data;

      if (!token?.access) {
        return {
          success: false,
          message: 'Login failed: No access token received',
          data: response.data,
        };
      }

      return {
        success: true,
        user: token?.user,
        access: token?.access,
        data: response.data,
      };
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          message:
            error.response.data.mesage ||
            error.response.data.message ||
            error.response.data.detail ||
            'Login failed',
          data: error.response.data,
          statusCode: error.response.status,
        };
      }

      return {
        success: false,
        message: error.message || 'Login failed',
        data: null,
      };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
  },

  getAccessToken: async () => {
    return await AsyncStorage.getItem('accessToken');
  },

  getRefreshToken: async () => {
    return await AsyncStorage.getItem('refreshToken');
  },

  getUser: async () => {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
};

export default AuthService;
