import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react-native';
import EasyCommunicationCard from '../../components/EasyCommunicationCard';
import NoticeBoardCard from '../../components/NoticeBoardCard';
import talkToParent from '../../assets/Cards/Frame_266.png';
import { useUser } from '../../context/UserContext';
import DashboardService from '../../services/HomeScreenService';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { useStorage } from '../../context/StorageContext';
import NoticeBoardSkeleton from '../../loadingScreens/NoticeBoardLoadingScreen';
import DisplayEvents from '../../components/DisplayEvents';
import { BASEURL } from '../../appurls';
import Feeds from '../Feeds';
import AppFeatures from '../../Features';
import { getFeatures } from '../../features.service';
import ProfilePicture from '../ProfilePicture';
import MedicalHealthCard from '../../components/MedicalHealthCard';
import NoticeBoardBanner from '../../components/NoticeBoardBanner';
import EventBoardBanner from '../../components/EventBoardBanner';
import SwitchRole from '../CommanScreens/SwitchRole';

const HomeScreen = () => {
  const { appUser, token, setUser, setAppUser, user, loadUser } = useUser();
  const [noticeLoading, setNoticeLoading] = useState(false);
  const { noticeBoard, setNoticeBoard } = useStorage();
  const [nextPage, setNextPage] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkinTime, setCheckinTime] = useState(null);
  const navigation = useNavigation();
  const { setSelectedTab } = useStorage();
  const [refreshing, setRefreshing] = useState(false);
  // console.log('messaginggfdg', getMessaging().getToken());
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const getCheckinTime = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASEURL}/api/parent/current-day-log/?date=${dayjs().format(
          'YYYY-MM-DD',
        )}&student_id=${appUser?.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
      }

      const data = await response.json();
      if (data?.status == true) {
        setCheckinTime(data.data);
      }
      return data;
    } catch (error) {
      return { status: false, data: 'Error occurred' };
    }
  }, [appUser?.id, token]);

  const getNoticeBoard = useCallback(async () => {
    try {
      setNoticeLoading(true);
      const response = await DashboardService.getNoticeBoard(
        token,
        appUser?.branch_id,
      );

      setNoticeBoard([...response.data.results]);
      setNextPage(response.links?.next || null);
    } catch (error) {
    } finally {
      setNoticeLoading(false);
    }
  }, [token, appUser?.branch_id, setNoticeBoard, setNextPage]);

  useEffect(() => {
    if (!appUser || !token) return;
    getCheckinTime();
    getNoticeBoard();
  }, [appUser, token, getCheckinTime, getNoticeBoard]);

  const renderNoticeItem = useCallback(({ item, index }) => {
    const dateObj = new Date(item.created_at);
    const date = dateObj.toLocaleDateString('en-GB');
    const time = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <NoticeBoardCard
        title={item.title}
        message={item.description}
        date={date}
        time={time}
        poster={item.poster}
        index={index}
        data={item}
      />
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      setNoticeBoard([]);
      setNextPage(null);

      await loadUser();
      await getNoticeBoard();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [loadUser, getNoticeBoard, setNoticeBoard, setNextPage]);

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
        <View
          style={{
            padding: 20,
          }}
        >
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
              <ProfilePicture type={'parent'} />

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
                  <Text
                    style={styles.className}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {appUser?.standard_name
                      ? appUser.standard_name.charAt(0).toUpperCase() +
                        appUser.standard_name.slice(1)
                      : ''}
                  </Text>

                  <Text style={styles.className}>
                    "{appUser?.section_name}"{' '}
                  </Text>
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
              {getFeatures()?.check_in_check_out && (
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
                    Check in -{' '}
                    {checkinTime ? dayjs(checkinTime).format('h:mmA') : '-'}
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
                title="Talk to Staffs"
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
                  setSelectedTab(1),
                    navigation.navigate('StudentCheckinCheckout');
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
                  navigation.navigate('StudentUpcomingBirthday');
                }}
              />
            )}

            {getFeatures()?.bus_tracking && (
              <EasyCommunicationCard
                icon="call"
                title="Bus Tracking"
                image={5}
                onPress={() => {
                  navigation.navigate('TrackBus');
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  mainContainer: {},
  topBar: {
    height: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  topBarText: {
    fontWeight: '600',
    fontSize: 16,
  },
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
});

export default HomeScreen;
