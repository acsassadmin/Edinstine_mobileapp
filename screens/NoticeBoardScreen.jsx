import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import TopBar from '../components/ParentTobBar';
import BackButton from '../components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASEURL } from '../appurls';
import { MessageCircleIcon, Share2Icon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { shareMessage } from '../utils/ShareMessage';
import { useUser } from '../context/UserContext';

const NoticeBoardScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const notice = route?.params?.data?.data;
  const { appUser, token, setUser, setAppUser, setToken } = useUser();
  // console.log("Notice", notice);
  const shareNotice = () => {
    const payload = {
      message: `
📢 *${notice.title}*

📚 Description: ${notice.description}

📅 Start Date: ${notice.start_date}
📅 End Date: ${notice.end_date ?? 'N/A'}
    `.trim(),

      image: `${BASEURL}${notice.poster}`,
    };

    shareMessage(payload);
  };

  return (
    <View style={styles.container}>
      <TopBar />

      {/* Header */} 
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Notice Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={{ height: 200, borderWidth: 0 }}>
            <Image
              source={{
                uri: `${BASEURL}${notice.poster}`,
              }}
              resizeMode="contain"
              style={{ width: '100%', height: '100%' }}
            />
          </View>

          <Text style={styles.title}>{notice?.title}</Text>

          <Text style={styles.description}>{notice?.description}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            {/* <Ionicons name="calendar-outline" size={20} color="#3B82F6" /> */}
            <Text style={styles.infoText}>
              Start Date : {notice?.start_date}
            </Text>
          </View>

          <View style={styles.infoRow}>
            {/* <Ionicons name="calendar-clear-outline" size={20} color="#EF4444" /> */}
            <Text style={styles.infoText}>End Date : {notice?.end_date}</Text>
          </View>

          <View style={styles.infoRow}>
            {/* <Ionicons name="time-outline" size={20} color="#10B981" /> */}
            <Text style={styles.infoText}>
              Created : {new Date(notice?.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
      {/* Over lay */}
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          flexDirection: 'column',
          right: 20,
          rowGap: 10,
        }}
      >
        {appUser?.id !== notice?.created_by && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ChatScreen', { staffId: notice?.created_by })
            }
            style={{
              backgroundColor: '#86b952',
              borderRadius: 100,
              width: 60,
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
              //   backgroundColor: "black",
            }}
          >
            <MessageCircleIcon color={'white'} strokeWidth={1.6} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => shareNotice()}
          style={{
            borderRadius: 100,
            width: 60,
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
          }}
        >
          <Share2Icon color={'white'} strokeWidth={1.2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NoticeBoardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    // paddingTop: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10,
    // marginTop: 10,
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },

  card: {
    backgroundColor: '#c7c1c121',
    borderRadius: 20,
    padding: 20,
    // elevation: 4,
    // shadowColor: "#000",
    // shadowOpacity: 0.08,
    // shadowRadius: 10,
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    // marginBottom: 15,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },

  badgeText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 28,
    color: '#4B5563',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },

  infoRow: {
    flexDirection: 'row',
    // alignItems: "center",/
    marginBottom: 8,
  },

  infoText: {
    // marginLeft: 10,
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },

  posterCard: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 20,
    padding: 15,
    elevation: 4,
  },

  posterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#111827',
  },
});
