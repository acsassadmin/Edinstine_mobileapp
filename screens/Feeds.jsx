import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import Video from 'react-native-video';
// Import Play and Pause icons from lucide-react-native
import { X, Play, Pause } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { BASEURL } from '../appurls';
import { Text } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.55;
const CARD_MARGIN = 10;

const FeedVideo = ({ uri, isActive = false, showControls = false }) => {
  const [paused, setPaused] = useState(true);

  // If this video becomes inactive, pause it.
  useEffect(() => {
    if (!isActive) {
      setPaused(true);
    }
  }, [isActive]);

  const handlePlayPause = () => {
    console.log('Clicked');
    setPaused(prev => !prev);
  };

  return (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri }}
        style={styles.video}
        resizeMode="cover"
        controls={false}
        repeat
        paused={paused}
        playInBackground={false}
        playWhenInactive={false}
      />
      {/* Removed the {paused && ...} wrapper so the button is always tappable */}
      <View style={styles.playOverlay}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          {/* Conditionally render Play or Pause icon */}
          {paused ? (
            <Play size={28} color="#000" fill="#000" />
          ) : (
            <Pause size={28} color="#000" fill="#000" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ModalFeedViewer = memo(({ visible, feeds, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const renderItem = useCallback(
    ({ item, index }) => {
      const uri = item.image?.toLowerCase() || '';
      const isVideo =
        uri.endsWith('.mp4') ||
        uri.endsWith('.mov') ||
        uri.endsWith('.avi') ||
        uri.endsWith('.mkv') ||
        uri.endsWith('.3gp');

      return (
        <View style={{ width, height }}>
          {isVideo ? (
            <FeedVideo
              uri={item.image}
              isActive={index === currentIndex}
              showControls={true}
            />
          ) : (
            <Image source={{ uri: item.image }} style={styles.fullImageFull} />
          )}
        </View>
      );
    },
    [currentIndex],
  );

  const handleScroll = useCallback(event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainerFull}>
        <FlatList
          data={feeds}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          keyExtractor={item => item.id.toString()}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={handleScroll}
          renderItem={renderItem}
        />

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <X size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
});

const Feeds = () => {
  const { appUser, token } = useUser();

  const [feeds, setFeeds] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const fetchFeeds = useCallback(
    async (url = null) => {
      if (loading) return;
      try {
        setLoading(true);
        const apiUrl =
          url ||
          `${BASEURL}/api/common/school-feed/?unassigned=true&branch_id=${appUser?.branch_id}`;
        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const results = response.data.results;
        setFeeds(prev => (url ? [...prev, ...results] : results));
        setNextPage(response.data.links?.next);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [loading, appUser?.branch_id, token],
  );

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setFeeds([]);
    setNextPage(null);
    await fetchFeeds();
    setRefreshing(false);
  }, [fetchFeeds]);

  const loadMore = useCallback(() => {
    if (nextPage && !loading) fetchFeeds(nextPage);
  }, [nextPage, loading, fetchFeeds]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 70,
  });

  const renderItem = useCallback(
    ({ item, index }) => {
      const uri = item.image?.toLowerCase() || '';

      const isVideo =
        uri.endsWith('.mp4') ||
        uri.endsWith('.mov') ||
        uri.endsWith('.avi') ||
        uri.endsWith('.mkv') ||
        uri.endsWith('.3gp');

      return isVideo ? (
        <View style={styles.cardContainer}>
          <FeedVideo uri={item.image} isActive={index === activeIndex} />
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setModalIndex(index);
            setModalVisible(true);
          }}
          style={styles.cardContainer}
        >
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        </TouchableOpacity>
      );
    },
    [activeIndex],
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={feeds}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (width - CARD_WIDTH) / 2,
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loading && <ActivityIndicator size="small" style={{ margin: 20 }} />
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
      />

      <ModalFeedViewer
        visible={modalVisible}
        feeds={feeds}
        initialIndex={modalIndex}
        onClose={handleCloseModal}
      />
    </View>
  );
};

export default Feeds;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },

  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 15,
    overflow: 'hidden',
  },

  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  videoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },

  video: {
    width: '100%',
    height: '100%',
  },

  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainerFull: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullImageFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});
