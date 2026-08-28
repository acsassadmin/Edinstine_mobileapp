import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Mail, User, Bell, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfilePicture from '../ProfilePicture';

const AVATAR_SIZE = 120;

const DriverProfileScreen = () => {
  const navigation = useNavigation();
  const { appUser, logout } = useUser();

  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
          logout();
        },
      },
    ]);
  }, [navigation, logout]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#86b952']}
            titleColor="#86b952"
          />
        }
      >
        <View style={styles.profileCard}>
          <ProfilePicture type={'driver'} style={styles.avatar} />

          <View style={styles.info}>
            <Text style={styles.name}>{appUser?.name}</Text>

            <View style={styles.row}>
              <Mail size={16} color="#555" />
              <Text style={styles.rowText}>{appUser?.email}</Text>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.subheading}>Account</Text>

            <View style={styles.listContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('DriverProfileDetail')}
                style={styles.listItem}
              >
                <View style={styles.listLeft}>
                  <User size={22} color="black" />
                  <Text style={styles.listText}>Profile Details</Text>
                </View>
                <ChevronRight size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Notification');
                }}
                style={styles.listItem}
              >
                <View style={styles.listLeft}>
                  <Bell size={22} color="black" />
                  <Text style={styles.listText}>Notification</Text>
                </View>
                <ChevronRight size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 30, marginBottom: 50 }}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebf4d7',
  },
  profileCard: {
    backgroundColor: '#fff',
    flex: 1,
    borderTopRightRadius: 80,
    borderTopLeftRadius: 80,
    paddingTop: AVATAR_SIZE / 2 + 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    position: 'absolute',
    top: -AVATAR_SIZE / 2,
    left: '55%',
    transform: [{ translateX: -(AVATAR_SIZE / 2) }],
    borderWidth: 8,
    borderColor: '#fff',
  },
  info: {
    alignItems: 'center',
    marginTop: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  role: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  subheading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContainer: {
    backgroundColor: '#ddead0',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
