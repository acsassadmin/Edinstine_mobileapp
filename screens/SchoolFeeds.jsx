import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Play, CirclePlay, X, Camera, Pause } from 'lucide-react-native';
import dayjs from 'dayjs';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { BASEURL } from '../appurls';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const VideoModalPlayer = ({ fileUri }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.videoModalContainer}>
      <Video
        source={{ uri: fileUri }}
        style={styles.modalVideoPlayer}
        resizeMode="contain"
        controls={false}
        paused={!isPlaying}
        onEnd={() => setIsPlaying(false)}
      />

      <TouchableOpacity
        style={styles.videoModalOverlay}
        onPress={togglePlay}
        activeOpacity={0.9}
      >
        {!isPlaying ? (
          <Play size={64} color="white" />
        ) : (
          <Pause color="white" size={64} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const PortfolioCard = memo(({ item, openMediaViewer }) => (
  <View style={styles.section}>
    <Text style={styles.dateText}>
      {dayjs(item.date).format('dddd, D MMMM YYYY')}
    </Text>

    <View style={styles.galleryRow}>
      {item.photos.map((media, index) => {
        const mediaUri = media.uri.toLowerCase();
        const isVideo =
          mediaUri.endsWith('.mp4') ||
          mediaUri.endsWith('.mov') ||
          mediaUri.endsWith('.avi') ||
          mediaUri.endsWith('.mkv') ||
          mediaUri.endsWith('.3gp');

        if (isVideo) {
          return (
            <TouchableOpacity
              key={`video-${media.id}`}
              onPress={() => openMediaViewer(item.photos, index)}
              style={styles.mediaContainer}
            >
              <Video
                source={{ uri: media?.uri }}
                playInBackground={false}
                paused={true}
                style={{ borderWidth: 0, height: '100%', width: '100%' }}
              />
              {/* <Video
                source={{ uri: fileUri }}
                style={styles.modalVideoPlayer}
                resizeMode="contain"
                controls={false}
                paused={!isPlaying}
                onEnd={() => setIsPlaying(false)}
              /> */}

              {/* <View style={styles.videoBackground} /> */}
              <View
                style={{
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                <CirclePlay size={44} color="#fff" />
                {/* <Text style={styles.videoLabel}>VIDEO</Text> */}
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={`img-${media.id}`}
            onPress={() => openMediaViewer(item.photos, index)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: media.uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
));

const SchoolFeeds = () => {
  const [studentsData, setStudentsData] = useState([{ id: 4, name: 'Vinith' }]);
  const [selectedStudent, setSelectedStudent] = useState(studentsData[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const { appUser, token } = useUser();

  // useRef to track loading state without causing useCallback to regenerate
  const loadingRef = useRef(false);

  const openMediaViewer = useCallback((photos, index) => {
    setSelectedPhotos(photos);
    setSelectedIndex(index);
    setModalVisible(true);
  }, []);

  const fetchPortfolio = useCallback(
    async (url = null) => {
      // Prevent concurrent fetches using ref
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const apiUrl =
          url ||
          `${BASEURL}/api/common/activityimages/?branch_id=${appUser?.branch_id}`;

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const results = response.data.results;

        const grouped = results.map(item => ({
          id: item.id,
          date: item.date,
          photos: item.photos.map(p => ({
            id: p.id,
            uri: `${p.image}`,
          })),
        }));

        setPortfolio(prev => (url ? [...prev, ...grouped] : grouped));

        setNextPage(response.data.links.next);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    // Removed 'loading' from dependencies to break the infinite loop
    [appUser?.branch_id, token],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPortfolio([]);
    setNextPage(null);
    await fetchPortfolio();
    setRefreshing(false);
  }, [fetchPortfolio]);

  useEffect(() => {
    setPortfolio([]);
    fetchPortfolio();
  }, [selectedStudent, fetchPortfolio]);

  const renderItem = useCallback(
    ({ item }) => (
      <PortfolioCard item={item} openMediaViewer={openMediaViewer} />
    ),
    [openMediaViewer],
  );

  const handleLoadMore = useCallback(() => {
    if (nextPage && !loading) {
      fetchPortfolio(nextPage);
    }
  }, [nextPage, loading, fetchPortfolio]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleUploadNavigation = useCallback(() => {
    navigation.navigate('UploadPortfolio');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={portfolio}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#86b952']}
            tintColor="#86b952"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.noDataText}>No portfolio available</Text>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color="#86b952"
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
      />
      {appUser?.role !== 'student' && (
        <TouchableOpacity
          style={styles.fabWithText}
          onPress={handleUploadNavigation}
        >
          <Camera size={26} color="#fff" />
          <Text style={styles.fabText}> Upload Photo</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView
            horizontal
            pagingEnabled
            contentOffset={{ x: selectedIndex * width, y: 0 }}
            showsHorizontalScrollIndicator={false}
          >
            {selectedPhotos.map(media => {
              const isVideo =
                media.uri.toLowerCase().endsWith('.mp4') ||
                media.uri.toLowerCase().endsWith('.mov') ||
                media.uri.toLowerCase().endsWith('.avi') ||
                media.uri.toLowerCase().endsWith('.mkv') ||
                media.uri.toLowerCase().endsWith('.3gp');

              return (
                <View key={media.id} style={styles.modalImageContainer}>
                  {isVideo ? (
                    <VideoModalPlayer fileUri={media.uri} />
                  ) : (
                    <Image
                      source={{ uri: media.uri }}
                      style={styles.modalImage}
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
          >
            <X size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  },
  section: { marginBottom: 24 },
  dateText: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  galleryRow: { flexDirection: 'row', flexWrap: 'wrap' },
  image: { width: (width - 48) / 3, height: 110, margin: 2, borderRadius: 8 },
  loadMoreBtn: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  loadMoreText: { color: '#fff', fontWeight: '600' },
  loadingIndicator: { marginVertical: 20 },
  closeButton: { position: 'absolute', top: 50, right: 20 },
  modalImageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  modalImage: { width, height, resizeMode: 'contain' },
  mediaContainer: {
    width: (width - 48) / 3,
    height: 110,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    width: (width - 48) / 3,
    height: 110,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoBackground: {
    flex: 1,
    backgroundColor: '#86b952',
    borderRadius: 8,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  videoModalContainer: {
    width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalVideoPlayer: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    // backgroundColor: '#000',
  },
  videoModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  fabWithText: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#86b952',
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 25,
    elevation: 5,
  },
  fabText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
});

export default SchoolFeeds;
