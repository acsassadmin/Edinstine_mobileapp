import React, { useState, useCallback, memo } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BASEURL } from '../appurls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserCard = memo(({ item, type, loading, onSelect }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.card}
    disabled={loading}
    onPress={() => onSelect(item)}
  >
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: type === 'student' ? '#2563EB' : '#16A34A',
        },
      ]}
    >
      <Text style={styles.avatarText}>
        {item?.name?.charAt(0)?.toUpperCase()}
      </Text>
    </View>

    <View style={styles.infoContainer}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.email}>{item.email}</Text>

      <View
        style={[
          styles.roleBadge,
          {
            backgroundColor: type === 'student' ? '#E8F1FF' : '#E9FFF0',
          },
        ]}
      >
        <Text
          style={[
            styles.roleText,
            {
              color: type === 'student' ? '#2563EB' : '#16A34A',
            },
          ]}
        >
          {type === 'student' ? 'Student' : 'Staff'}
        </Text>
      </View>
    </View>

    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
));

const SelectRoleScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);

  const data = route.params?.data ? JSON.parse(route.params.data) : {};

  const students = data?.students || [];
  const staffs = data?.staffs || [];
  const accessToken = data?.token?.access;

  const handleSelect = useCallback(
    async item => {
      try {
        setLoading(true);

        const payload = {
          profile_id: item.id,
          family_id: item.family_id,
        };

        const response = await axios.post(
          `${BASEURL}/api/core/select-profile/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const resData = response.data;

        await AsyncStorage.setItem('accessToken', resData?.access);
        await AsyncStorage.setItem('refreshToken', resData?.refresh);
        await AsyncStorage.setItem('user', JSON.stringify(resData?.user));

        if (resData?.user?.role === 'student') {
          navigation.navigate('Parent');
        } else if (resData?.user?.role === 'staff') {
          navigation.navigate('Staff');
        } else if (resData?.user?.role === 'driver') {
          navigation.navigate('Driver');
        }
      } catch (error) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'Failed to select profile',
        );
      } finally {
        setLoading(false);
      }
    },
    [accessToken, navigation],
  );

  const renderStudentCard = useCallback(
    ({ item }) => (
      <UserCard
        item={item}
        type="student"
        loading={loading}
        onSelect={handleSelect}
      />
    ),
    [loading, handleSelect],
  );

  const renderStaffCard = useCallback(
    ({ item }) => (
      <UserCard
        item={item}
        type="staff"
        loading={loading}
        onSelect={handleSelect}
      />
    ),
    [loading, handleSelect],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: 'white',
          padding: 22,
          flex: 1,
        }}
      >
        <Text style={styles.title}>Select Profile</Text>
        <Text style={styles.subtitle}>Choose a profile to continue</Text>

        {students?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Students</Text>

            <FlatList
              data={students}
              keyExtractor={item => item.id.toString()}
              renderItem={renderStudentCard}
              scrollEnabled={false}
            />
          </View>
        )}

        {staffs?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Staff</Text>

            <FlatList
              data={staffs}
              keyExtractor={item => item.id.toString()}
              renderItem={renderStaffCard}
              scrollEnabled={false}
            />
          </View>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#86b952" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SelectRoleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#000000',
    marginTop: 6,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  email: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 28,
    color: '#94A3B8',
    fontWeight: '300',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 150,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
