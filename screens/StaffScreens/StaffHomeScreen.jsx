import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
  Modal,
  PermissionsAndroid,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
// import Geolocation from 'react-native-geolocation-service';
import { Calendar, Clock, Camera } from 'lucide-react-native';
// import NoticeBoardCard from '../../components/NoticeBoardCard';
import { useUser } from '../../context/UserContext';
// import DashboardService from '../../services/HomeScreenService';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { useStorage } from '../../context/StorageContext';
import NoticeBoardSkeleton from '../../loadingScreens/NoticeBoardLoadingScreen';
import axios from 'axios';
import { appUrls, BASEURL } from '../../appurls';
// import DisplayEvents from '../../components/DisplayEvents';
import FrontCamera from '../../components/FrontCamera';
import EasyCommunicationCard from '../../components/EasyCommunicationCard';
import Feeds from '../Feeds';
import { jwtDecode } from 'jwt-decode';
// import AppFeatures from '../../Features';
import { getFeatures } from '../../features.service';
import ProfilePicture from '../ProfilePicture';
import MedicalHealthCard from '../../components/MedicalHealthCard';
import EventBoardBanner from '../../components/EventBoardBanner';
import NoticeBoardBanner from '../../components/NoticeBoardBanner';
import SwitchRole from '../CommanScreens/SwitchRole';
import { getCurrentLocation } from '../../services/location';
import RNFS from 'react-native-fs';

const StaffHomeScreen = () => {
  const { appUser, token, setUser, setAppUser, setToken } = useUser();

  const [noticeLoading, setNoticeLoading] = useState(false);
  const { noticeBoard, setNoticeBoard } = useStorage();
  const [checkIn, setCheckIn] = useState(null);

  const [loadHomeScreen, setLoadHomeScreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const [attendanceType, setAttendanceType] = useState('Check-In');

  const navigation = useNavigation();
  const { setSelectedTab } = useStorage();

  const fetchCheckInTime = useCallback(async () => {
    try {
      const response = await axios.get(appUrls.check_in_time, {
        params: { staff_id: appUser?.id },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setCheckIn(response.data);
      } else {
        setCheckIn(null);
      }
    } catch (error) {}
  }, [appUser?.id, token]);

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
        });

        const decoded = jwtDecode(storedToken);
        setUser(decoded);
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {}
  }, [setToken, setAppUser, setUser, navigation]);

  useEffect(() => {
    setLoadHomeScreen(true);
    loadUser();
    return () => {
      setLoadHomeScreen(true);
    };
  }, [loadUser]);

  useEffect(() => {
    fetchCheckInTime();
    if (!appUser || !token) return;
  }, [appUser, token, fetchCheckInTime]);

  const showAttendanceChoice = useCallback(() => {
    const isCurrentlyCheckedIn =
      checkIn?.check_in_time && !checkIn?.check_out_time;

    if (isCurrentlyCheckedIn) {
      setAttendanceType('Check-Out');
    } else {
      setAttendanceType('Check-In');
    }

    setShowChoiceModal(true);
  }, [checkIn]);

  const uploadAttendance = useCallback(
    async (imageUri, type) => {
      try {
        setLoading(true);

        const filename = imageUri.split('/').pop();
        const mimeType = `image/${
          filename.split('.').pop()?.toLowerCase() || 'jpeg'
        }`;
        const uri =
          Platform.OS === 'android' && !imageUri.startsWith('file://')
            ? 'file://' + imageUri
            : imageUri;

        console.log('crash before');
        // return;
        const position = await getCurrentLocation();
        console.log('position', position);

        const latitude = parseFloat(position.latitude.toFixed(6));
        const longitude = parseFloat(position.longitude.toFixed(6));

        const formData = new FormData();
        formData.append('staff', appUser.id);
        formData.append('branch', appUser?.branch_id);
        formData.append('attendance_type', type);
        formData.append('captured_lat', latitude.toString());
        formData.append('captured_lng', longitude.toString());
        formData.append('photo', { uri, name: filename, type: mimeType });
        console.log('form data', formData);
        await axios.post(`${BASEURL}/api/staff/class-attendance/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('data fetched');
        await fetchCheckInTime();

        Alert.alert('Success', `${type} uploaded successfully!`);
      } catch (error) {
        console.log('erorr', error.response.data);

        Alert.alert('Error', `${error.response.data.message}`);
      } finally {
        setLoading(false);
      }
    },
    [appUser, token, fetchCheckInTime],
  );

  const handleTakePicture = useCallback(
    photoUri => {
      setShowCameraModal(false);
      uploadAttendance(photoUri, attendanceType);
    },
    [uploadAttendance, attendanceType],
  );

  const handleUploadFromGallery = useCallback(async () => {
    try {
      setShowChoiceModal(false);

      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (asset?.uri) {
        uploadAttendance(asset.uri, attendanceType);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  }, [uploadAttendance, attendanceType]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setNoticeBoard([]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [setNoticeBoard]);

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.mainContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#86b952']}
            tintColor="#86b952"
            title="Refreshing Dashboard..."
            titleColor="#86b952"
            enabled={true}
          />
        }
      >
        <View style={{ padding: 20 }}>
          <ImageBackground
            source={require('../../assets/Cards/Top_Card.png')}
            imageStyle={{ borderRadius: 16 }}
            style={styles.profileCardContainer}
          >
            <View
              style={{
                display: 'flex',
                width: '100%',
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                alignContent: 'center',
              }}
            >
              <ProfilePicture type={'staff'} />

              <View>
                <Text
                  style={styles.profileName}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {appUser?.name}
                </Text>
                <View
                  style={{ display: 'flex', flexDirection: 'row', gap: 10 }}
                >
                  <Text style={styles.className}>Teacher</Text>
                </View>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                flex: 1,
                width: '100%',
                justifyContent: 'space-around',
                marginTop: 15,
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Calendar size={24} color="black" />
                <Text>{dayjs().format('ddd, D MMM')}</Text>
              </View>
              {getFeatures()?.staff_checkin && (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Clock size={24} color="black" />
                  <Text>
                    Check In -{' '}
                    {checkIn
                      ? dayjs(checkIn?.check_in_time).format('h:mmA')
                      : '-'}
                  </Text>
                </View>
              )}
            </View>
            <SwitchRole />
          </ImageBackground>
        </View>

        <View style={styles.section2}>
          <Text style={styles.sectionHeading}>Easy Communication</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              marginTop: 10,
              paddingBottom: 10,
            }}
          >
            {getFeatures()?.chat.inbox && (
              <EasyCommunicationCard
                icon="chat"
                title="Talk to Parents"
                image={0}
                onPress={() => {
                  navigation.navigate('Chat');
                }}
              />
            )}

            {getFeatures()?.check_in_check_out && (
              <EasyCommunicationCard
                icon="call"
                title="Check In Check Out"
                image={1}
                onPress={() => {
                  setSelectedTab(1);
                  navigation.navigate('CheckInCheckOut');
                }}
              />
            )}
            <MedicalHealthCard />
            {getFeatures()?.upcoming_birthday && (
              <EasyCommunicationCard
                icon="call"
                title="Upcoming Birthday"
                image={4}
                onPress={() => {
                  navigation.navigate('StaffUpcomingBirthday');
                }}
              />
            )}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 12, rowGap: 8, gap: 5 }}>
          <Text style={styles.sectionHeading}>Notice & Circular</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 150,
              gap: 10,
            }}
          >
            {getFeatures()?.notice_board && <NoticeBoardBanner />}
            {getFeatures()?.events && <EventBoardBanner />}
          </View>
        </View>
        {getFeatures()?.portfolio && (
          <View style={styles.section3}>
            <Text style={styles.sectionHeading}>School Feeds</Text>
            {noticeLoading ? <NoticeBoardSkeleton length={2} /> : <Feeds />}
          </View>
        )}

        {getFeatures()?.staff_checkin && (
          <View style={styles.uploadAttdanceButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.uploadAttdanceButton,
                loading && styles.uploadAttdanceButtonDisabled,
              ]}
              onPress={showAttendanceChoice}
              disabled={loading}
            >
              <View style={styles.buttonContent}>
                <Camera size={24} color="white" />
                <Text style={styles.buttonText}>
                  {loading ? 'Uploading...' : 'Upload Attendance'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showChoiceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChoiceModal(false)}
      >
        <View style={styles.choiceModalOverlay}>
          <View style={styles.choiceModalContainer}>
            <Text style={styles.choiceModalTitle}>{attendanceType}</Text>
            <Text style={styles.choiceModalSubtitle}>
              Choose how to capture photo
            </Text>

            <TouchableOpacity
              style={styles.choiceButton}
              onPress={() => {
                setShowChoiceModal(false);
                setShowCameraModal(true);
              }}
              activeOpacity={0.7}
            >
              <Camera size={50} color="#007bff" />
              <Text style={styles.choiceButtonText}>Take Picture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowChoiceModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCameraModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCameraModal(false)}
      >
        <View style={styles.cameraModalOverlay}>
          <FrontCamera
            onPhotoCaptured={handleTakePicture}
            onClose={() => setShowCameraModal(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 100,
  },
  mainContainer: {},
  profileCardContainer: {
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
    includeFontPadding: false,
  },
  className: {
    fontSize: 15,
    fontWeight: '200',
    color: '#333',
    textAlign: 'start',
  },
  section2: {
    marginTop: 10,
    padding: 10,
  },
  section3: {
    marginTop: 10,
    padding: 10,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#86b952',
  },
  list: {
    height: 160,
    marginTop: 13,
  },
  listContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  emptyText: {
    marginLeft: 15,
    marginTop: 10,
    color: '#777',
  },
  uploadAttdanceButton: {
    backgroundColor: '#86b952',
    padding: 15,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAttdanceButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 500,
  },
  uploadAttdanceButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  choiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  choiceModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  choiceModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  choiceModalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  choiceButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  cameraModalOverlay: {
    flex: 1,
    backgroundColor: 'black',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default StaffHomeScreen;
