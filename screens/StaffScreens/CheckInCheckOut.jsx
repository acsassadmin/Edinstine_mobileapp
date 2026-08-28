import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  Alert,
  Animated,
  TouchableOpacity,
  Platform,
  Keyboard,
  TextInput,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import axios from 'axios';
import { appUrls } from '../../appurls';
import dayjs from 'dayjs';
import { useUser } from '../../context/UserContext';
import CheckInCheckOutCard from '../../components/CheckInCheckOutCard';
import { launchCamera } from 'react-native-image-picker';
import { SearchX, Search, X } from 'lucide-react-native';
import BackButton from '../../components/BackButton';

const CheckInCheckOut = () => {
  const { appUser, token } = useUser();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [searchAnim] = useState(new Animated.Value(1));
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const currentSearchQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  const fetchStudents = useCallback(
    async (url = null, isLoadMore = false) => {
      try {
        isLoadMore ? setLoadingMore(true) : setLoading(true);

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const config = url
          ? {
              headers: { Authorization: `Bearer ${token}` },
              signal,
            }
          : {
              params: {
                class_id: appUser?.class_id,
                date: dayjs(new Date()).format('YYYY-MM-DD'),
                search: currentSearchQuery || undefined,
              },
              headers: { Authorization: `Bearer ${token}` },
              signal,
            };

        let response;
        if (url) {
          response = await axios.get(url, config);
        } else {
          response = await axios.get(appUrls.check_in_check_out, config);
        }

        const results = response.data.results || [];
        const next = response.data.links?.next || null;

        if (isLoadMore) {
          setStudents(prev => [...prev, ...results]);
        } else {
          setStudents(results);
        }

        setNextUrl(next);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        Alert.alert('Error', 'Failed to load student list');
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [token, appUser?.class_id, currentSearchQuery],
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setStudents([]);
      setNextUrl(null);
      setLoading(true);
      setIsSearching(!!currentSearchQuery);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      fetchStudents(null, false);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [currentSearchQuery, fetchStudents]);

  useEffect(() => {
    if (token && appUser?.class_id) {
      fetchStudents();
    }
  }, [token, appUser?.class_id, fetchStudents]);

  const handleLoadMore = useCallback(() => {
    if (nextUrl && !loading && !loadingMore) {
      fetchStudents(nextUrl, true);
    }
  }, [nextUrl, loading, loadingMore, fetchStudents]);

  const handleCheckIn = useCallback(
    async (student, uri) => {
      try {
        if (!uri) {
          Alert.alert('No Image', 'Please take or pick a photo');
          return;
        }

        const filename = uri.split('/').pop();
        const ext = filename?.split('.').pop()?.toLowerCase();
        const typeMime = ext ? `image/${ext}` : 'image/jpg';

        const formData = new FormData();
        formData.append('student', student.student_id);
        formData.append('type', 'check_in');
        formData.append('class_id', appUser?.class_id);
        formData.append('photo', {
          uri,
          name: filename,
          type: typeMime,
        });

        await axios.post(appUrls.check_in_check_out, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        fetchStudents(null, false);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload check-in image');
      }
    },
    [appUser?.class_id, token, fetchStudents],
  );

  const handleCheckOut = useCallback(
    async student => {
      try {
        const result = await launchCamera({
          mediaType: 'photo',
          quality: 0.7,
          saveToPhotos: false,
        });

        if (!result.didCancel && result.assets?.length > 0) {
          const { uri, type, fileName } = result.assets[0];
          const filename = fileName || uri.split('/').pop();
          const ext = filename?.split('.').pop()?.toLowerCase();
          const typeMime = ext ? `image/${ext}` : type || 'image/jpg';

          const localUri =
            Platform.OS === 'android' && !uri.startsWith('file://')
              ? 'file://' + uri
              : uri;

          const formData = new FormData();
          formData.append('student', student.student_id);
          formData.append('type', 'check_out');
          formData.append('class_id', appUser?.class_id);
          formData.append('photo', {
            uri: localUri,
            name: filename,
            type: typeMime,
          });

          await axios.post(appUrls.check_in_check_out, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });

          fetchStudents(null, false);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to capture or upload check-out image');
      }
    },
    [appUser?.class_id, token, fetchStudents],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    Keyboard.dismiss();
    setIsSearching(false);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <CheckInCheckOutCard
          student={item}
          fetchStudents={fetchStudents}
          onCaptureCheckIn={imgUri => handleCheckIn(item, imgUri)}
          onCaptureCheckOut={() => handleCheckOut(item)}
        />
      </View>
    ),
    [fetchStudents, handleCheckIn, handleCheckOut],
  );

  const renderSearchResults = useCallback(() => {
    if (loading && students.length === 0) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>
            {isSearching
              ? `Searching "${currentSearchQuery}"...`
              : 'Loading students...'}
          </Text>
        </View>
      );
    }

    if (students.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <SearchX size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>
            {isSearching ? 'No students found' : 'No students for today'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isSearching
              ? `"${currentSearchQuery}" matches no students`
              : 'Check back later for attendance updates'}
          </Text>
          {isSearching && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={clearSearch}
            >
              <Text style={styles.clearSearchButtonText}>
                Show All Students
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={students}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.7}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color="#0066cc" />
              <Text style={styles.loadingMoreText}>
                Loading more students...
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    );
  }, [
    loading,
    students,
    isSearching,
    currentSearchQuery,
    clearSearch,
    renderItem,
    handleLoadMore,
    loadingMore,
  ]);

  return (
    <View style={styles.container}>
      <TopBar />
      <BackButton />
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: searchAnim,
            transform: [
              {
                scale: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Search size={24} color="#666" style={styles.searchIcon} />

          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search students by name"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
            selectionColor="#0066cc"
            underlineColorAndroid="transparent"
          />

          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
              activeOpacity={0.7}
            >
              <X size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {isSearching && (
          <View style={styles.searchInfo}>
            <Text style={styles.searchInfoText}>
              Found {students.length} students for "{currentSearchQuery}"
            </Text>
            <TouchableOpacity
              onPress={clearSearch}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <View style={styles.content}>{renderSearchResults()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderBottomColor: '#f0f2f5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    paddingHorizontal: 4,
  },
  clearButton: {
    padding: 8,
    justifyContent: 'center',
    borderRadius: 12,
  },
  searchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  clearSearchButton: {
    marginTop: 24,
    backgroundColor: '#0066cc',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clearSearchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  loadingMore: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default CheckInCheckOut;
