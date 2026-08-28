import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  Easing,
  Pressable,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Play, PlayCircle, X } from 'lucide-react-native';
import dayjs from 'dayjs';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { BASEURL } from '../../appurls';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const VideoModalPlayer = memo(({ fileUri }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <TouchableOpacity
      style={styles.videoModalContainer}
      activeOpacity={1}
      onPress={togglePlay}
    >
      <Video
        source={{ uri: fileUri }}
        style={styles.modalVideoPlayer}
        resizeMode="contain"
        paused={!isPlaying}
        controls={false}
        onLoad={() => setIsPlaying(false)}
        onEnd={() => setIsPlaying(false)}
      />

      {!isPlaying && (
        <View style={styles.videoModalOverlay} pointerEvents="none">
          <Play size={64} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
});

const Portfolio = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const { appUser, token } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [portfolioSections, setPortfolioSections] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigation = useNavigation();

  const fetchStudentsData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/api/parent/classroom-student-list/`,
        {
          params: { class_id: appUser?.class_id },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStudentsData(response.data);
      if (response.data.length > 0 && !selectedStudent) {
        setSelectedStudent(response.data[0]);
      }
    } catch (error) {}
  }, [appUser?.class_id, token, selectedStudent]);

  const fetchPortfolio = useCallback(
    async (url = null, isLoadMore = false) => {
      if (!selectedStudent?.id && !url) return;

      try {
        isLoadMore ? setLoadingMore(true) : setLoading(true);

        const apiUrl = url || `${BASEURL}/api/common/student-activities/`;
        const params = url ? {} : { student_id: appUser.id };

        const response = await axios.get(apiUrl, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });

        const results = response.data.results || [];

        const newSections = results.map(item => ({
          id: item.id,
          student_id: item.student_id,
          student_name: item.student_name,
          classname: item.classname,
          date: item.date,
          created_by_name: item.created_by_name,
          photos: item.photos.map(p => ({
            id: p.id,
            uri: p.image,
          })),
        }));

        setPortfolioSections(prev =>
          isLoadMore ? [...prev, ...newSections] : newSections,
        );
        setNextPage(response.data.links?.next);
      } catch (error) {
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedStudent?.id, token, appUser.id],
  );

  const loadMore = useCallback(() => {
    if (nextPage && !loadingMore) {
      fetchPortfolio(nextPage, true);
    }
  }, [nextPage, loadingMore, fetchPortfolio]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    setPortfolioSections([]);
    setNextPage(null);
    setStudentsData([]);
    setSelectedStudent(null);

    await fetchStudentsData();

    setRefreshing(false);
  }, [fetchStudentsData]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  useEffect(() => {
    if (selectedStudent) {
      setPortfolioSections([]);
      setNextPage(null);
      fetchPortfolio();
    }
  }, [selectedStudent, fetchPortfolio]);

  const openImageViewer = useCallback((photos, index) => {
    setSelectedPhotos(photos);
    setSelectedIndex(index);
    setModalVisible(true);
  }, []);

  const openMediaViewer = useCallback((photos, index) => {
    setSelectedPhotos(photos);
    setSelectedIndex(index);
    setModalVisible(true);
  }, []);

  const renderPortfolioSection = useCallback(
    ({ item }) => (
      <View style={styles.section}>
        <Text style={styles.dateText}>
          {dayjs(item.date).format('dddd, D MMMM YYYY')}
        </Text>
        <View style={styles.galleryRow}>
          {item.photos.map((media, index) => {
            const mediaUri = media.uri.toLowerCase();
            const isVideo =
              mediaUri.includes('.mp4') ||
              mediaUri.includes('.mov') ||
              mediaUri.includes('.avi') ||
              mediaUri.includes('.mkv') ||
              mediaUri.includes('.3gp');

            if (isVideo) {
              return (
                <TouchableOpacity
                  key={`video-${media.id}`}
                  onPress={() => openMediaViewer(item.photos, index)}
                  style={styles.mediaContainer}
                >
                  <View style={styles.videoBackground}></View>

                  <View style={styles.videoOverlay}>
                    <PlayCircle size={44} color="#fff" />
                    <Text style={styles.videoLabel}>VIDEO</Text>
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={`img-${media.id}`}
                onPress={() => openImageViewer(item.photos, index)}
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
    ),
    [openMediaViewer, openImageViewer],
  );

  return (
    <View style={styles.container}>
      {loading && portfolioSections.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#86b952"
          style={styles.loadingIndicator}
        />
      ) : portfolioSections.length === 0 && !loading ? (
        <Text style={styles.emptyText}>
          No portfolio available for this student
        </Text>
      ) : (
        <FlatList
          data={portfolioSections}
          keyExtractor={item => item.id.toString()}
          renderItem={renderPortfolioSection}
          contentContainerStyle={{ paddingBottom: 100 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color="#86b952"
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade">
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
                media.uri.toLowerCase().endsWith('.avi');

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
            onPress={() => setModalVisible(false)}
          >
            <X size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Portfolio;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 6, fontWeight: '500' },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 6,
    backgroundColor: '#faf8f6',
    elevation: 2,
  },
  dropdownHeaderActive: { borderColor: '#86b952' },
  dropdownText: { fontSize: 16, color: '#111' },
  placeholderText: { color: '#999' },
  dropdownList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  dropdownItem: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: { fontSize: 16, color: '#111' },
  selectedItem: { backgroundColor: '#86b952' },
  selectedItemText: { color: '#fff', fontWeight: '600' },
  selectedStudentName: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 12,
    color: '#86b952',
  },
  section: { marginBottom: 24 },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  galleryRow: { flexDirection: 'row', flexWrap: 'wrap' },
  imageContainer: {
    width: (width - 64) / 3,
    height: 120,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
  loadingIndicator: {
    flex: 1,
    marginVertical: 40,
  },
  fabWithText: {
    position: 'absolute',
    bottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  modalImageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width * 0.9,
    height: height * 0.8,
    resizeMode: 'contain',
  },
  mediaContainer: {
    width: (width - 64) / 3,
    height: 120,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  videoBackground: {
    flex: 1,
    backgroundColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
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
    textTransform: 'uppercase',
  },
  videoModalContainer: {
    position: 'relative',
    width: width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalVideoPlayer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#000',
  },
  videoModalOverlay: {
    ...StyleSheet.absoluteFillObjecT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
  },
});
