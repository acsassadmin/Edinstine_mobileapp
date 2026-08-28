import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useNavigation } from '@react-navigation/native';
import { initFeatures } from '../features.service';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigation = useNavigation();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState({
    name: null,
    email: null,
    id: null,
    role: null,
    profile_pic: null,
    standard_name: null,
    section_name: null,
    branch_id: null,
    school_id: null,
    class_id: null,
    school_logo: null,
    bus_id: null,
    class_list: [],
    class_name_with_id: [],
  });
  const [loading, setLoading] = useState(true);

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
          school_logo: newuser.school_logo,
          bus_id: newuser.bus_id,
          class_list: newuser.class_list,
          class_name_with_id: newuser.class_name_with_id,
        });
        initFeatures(storedToken);

        const decoded = jwtDecode(storedToken);
        setUser(decoded);
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const saveToken = useCallback(async newToken => {
    try {
      await AsyncStorage.setItem('userToken', newToken);
      setToken(newToken);
      setUser(jwtDecode(newToken));
    } catch (error) {}
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAppUser(null);
    navigation.navigate('Login');
  }, [navigation]);

  const updateProfilePic = useCallback(newPicUrl => {
    setAppUser(prevState => ({
      ...prevState,
      profile_pic: newPicUrl,
    }));
  }, []);

  const switchClass = useCallback(id => {
    setAppUser(prevState => ({
      ...prevState,
      class_id: id,
    }));
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        saveToken,
        logout,
        appUser,
        setAppUser,
        setUser,
        setToken,
        updateProfilePic,
        switchClass,
        loadUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
