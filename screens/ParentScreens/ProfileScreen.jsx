import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Mail,
  ChevronRight,
  BookOpen,
  Stethoscope,
  History,
  Calendar,
  Award,
  FileText,
  Library,
  User,
  Bell,
  ShieldEllipsis,
  Pen,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppFeatures from '../../Features';
import { getFeatures } from '../../features.service';
import ProfilePicture from '../ProfilePicture';

const AVATAR_SIZE = 120;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { appUser, logout, user } = useUser();

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 80 }}
      >
        <View style={styles.profileCard}>
          <ProfilePicture type={'parent'} style={styles.avatar} />

          <View style={styles.info}>
            <Text style={styles.name}>{appUser?.name}</Text>
            <Text style={styles.role}>
              {appUser?.standard_name} '{appUser?.section_name}'
            </Text>

            <View style={styles.row}>
              <Mail size={16} color="#555" />
              <Text style={styles.rowText}>{appUser?.email}</Text>
            </View>

            <View style={styles.row}>
              {getFeatures()?.fee_management && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('FeeScreen');
                  }}
                  style={{
                    padding: 10,
                    backgroundColor: '#86b952',
                    paddingHorizontal: 40,
                    paddingVertical: 20,
                    borderRadius: 20,
                    marginTop: 5,
                  }}
                >
                  <Text
                    style={{ fontSize: 18, color: 'white', fontWeight: '500' }}
                  >
                    Pay Fee
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            {(getFeatures()?.homework ||
              getFeatures()?.medical_instruction ||
              getFeatures()?.student_leave_management) && (
              <Text style={styles.subheading}>Student</Text>
            )}

            <View style={styles.listContainer}>
              {getFeatures()?.homework && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ViewHomework')}
                  style={styles.listItem}
                >
                  <View style={styles.listLeft}>
                    <BookOpen size={24} color="black" />
                    <Text style={styles.listText}>Handbook</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              )}

              {getFeatures()?.medical_instruction && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('MedicalInstruction');
                  }}
                  style={styles.listItem}
                >
                  <View style={styles.listLeft}>
                    <Stethoscope
                      size={20}
                      color="black"
                      style={{ marginRight: 12 }}
                    />
                    <Text style={styles.listText}>Medical Condition</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              )}
              {getFeatures()?.student_leave_management && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('StudentLeaveHistory');
                  }}
                  style={styles.listItem}
                >
                  <View style={styles.listLeft}>
                    <History size={20} color="black" />
                    <Text style={styles.listText}>Leave History</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('AttandanceList');
                }}
                style={styles.listItem}
              >
                <View style={styles.listLeft}>
                  <Calendar size={20} color="black" />
                  <Text style={styles.listText}>My Attendance</Text>
                </View>
                <ChevronRight size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            {(getFeatures()?.certificate_management ||
              getFeatures()?.report_card_management) && (
              <Text style={styles.subheading}>Acadamic</Text>
            )}

            <View style={styles.listContainer}>
              {getFeatures()?.certificate_management && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Achievements')}
                  style={styles.listItem}
                >
                  <View style={styles.listLeft}>
                    <Award size={24} color="black" />
                    <Text style={styles.listText}>Achievements</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              )}

              {getFeatures()?.report_card_management && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ReportCard');
                  }}
                  style={styles.listItem}
                >
                  <View style={styles.listLeft}>
                    <FileText
                      size={24}
                      color="black"
                      style={{ marginRight: 12 }}
                    />
                    <Text style={styles.listText}>Report Card</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            {getFeatures()?.library_management && (
              <Text style={styles.subheading}>More</Text>
            )}

            <View style={styles.listContainer}>
              {getFeatures()?.library_management && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('LibraryBooks')}
                  style={styles.listItem}
                >
                  <View style={styles.listLeft}>
                    <Library size={22} color="black" />
                    <Text style={styles.listText}>Library Books</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              )}

              {getFeatures()?.library_management && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('BookHistory');
                  }}
                  style={styles.listItem}
                >
                  <View style={styles.listLeft}>
                    <Library size={22} color="black" />

                    <Text style={styles.listText}>Book History</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              )}

              {
                <TouchableOpacity
                  onPress={() => navigation.navigate('ConcernScreen')}
                  style={styles.listItem}
                >
                  <View style={styles.listLeft}>
                    <Pen size={22} color="black" />

                    <Text style={styles.listText}>Raise a Concern</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              }
              <TouchableOpacity
                onPress={() => navigation.navigate('SchoolPolicies')}
                style={styles.listItem}
              >
                <View style={styles.listLeft}>
                  <ShieldEllipsis size={24} color="black" />
                  <Text style={styles.listText}>School policies</Text>
                </View>
                <ChevronRight size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.subheading}>Account</Text>

            <View style={styles.listContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileDetailsScreen')}
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
              onPress={() => {
                logout();
              }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
    paddingBottom: 50,
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
