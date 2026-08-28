import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BASEURL } from '../../appurls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

const SwitchRole = () => {
  const navigation = useNavigation();
  const { user, token, setAppUser, loadUser } = useUser();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const getData = useCallback(async () => {
    try {
      const res = await axios.get(`${BASEURL}/api/core/switch-profile/`, {
        params: {
          family_id: user?.family_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfiles(res.data?.users || []);
    } catch (error) {
      console.log('error =>', error?.response?.data || error.message);
    }
  }, [user, token]);

  useEffect(() => {
    if (user?.family_id && token) {
      getData();
    }
  }, [getData, user, token]);

  const handleSelect = useCallback(
    async item => {
      try {
        setLoading(true);

        const payload = {
          profile_id: item.id,
          family_id: user?.family_id,
        };
        setAppUser(null);
        const response = await axios.post(
          `${BASEURL}/api/core/select-profile/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const resData = response.data;

        await AsyncStorage.setItem('accessToken', resData?.access);
        await AsyncStorage.setItem('refreshToken', resData?.refresh);
        await AsyncStorage.setItem('user', JSON.stringify(resData?.user));

        const role = resData?.user?.role;
        loadUser();
        setModalVisible(false);

        if (role === 'student') navigation.navigate('Parent');
        else if (role === 'staff') navigation.navigate('Staff');
        else if (role === 'driver') navigation.navigate('Driver');
      } catch (error) {
        console.log(
          'Select Profile Error =>',
          error?.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    },
    [user, token, setAppUser, loadUser, navigation],
  );

  const renderItem = useCallback(
    ({ item }) => {
      const isStudent = item?.role === 'student';

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleSelect(item)}
          disabled={loading}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: isStudent ? '#2563EB' : '#16A34A' },
            ]}
          >
            <Text style={styles.avatarText}>
              {item?.name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item?.role}</Text>
          </View>

          <Text style={{ fontSize: 22, color: '#999' }}>›</Text>
        </TouchableOpacity>
      );
    },
    [loading, handleSelect],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Switch Role</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!loading) setModalVisible(false);
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>Select Profile</Text>

            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#86b952" />
                <Text style={{ marginTop: 10, fontWeight: '600' }}>
                  Switching profile...
                </Text>
              </View>
            ) : (
              <FlatList
                data={profiles}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                  <View>
                    <Text>There is no accounts</Text>
                  </View>
                }
              />
            )}

            <TouchableOpacity
              onPress={() => !loading && setModalVisible(false)}
              disabled={loading}
              style={{
                marginTop: 15,
                padding: 14,
                backgroundColor: 'rgba(0, 0, 0, 0.07)',
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: loading ? '#ccc' : 'black',
                  fontWeight: '800',
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SwitchRole;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    marginTop: 18,
  },
  button: {
    padding: 18,
    backgroundColor: '#86b952',
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  role: {
    fontSize: 12,
    color: '#666',
  },
});
