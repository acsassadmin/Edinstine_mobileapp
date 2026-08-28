import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import TopBar from '../../components/ParentTobBar';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import BackButton from '../../components/BackButton';
import { BASEURL } from '../../appurls';
import axios from 'axios';
import schoolLogo from '../../assets/icon.png';
import CustomeTab from '../../components/CustomeTab';

const BooksList = () => {
  const { appUser, token } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [libBooks, setLibrayBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [showBookRequestModel, setShowBookRequestModel] = useState(false);
  const [selectedBook, setSelectedBook] = useState({
    name: null,
    id: null,
    image: null,
  });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchLibraryBooks = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;

    try {
      setLoadingBooks(true);

      const currentPage = pageRef.current;

      const response = await axios.get(
        `${BASEURL}/api/library/books/?page=${currentPage}&branch_id=${appUser.branch_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newData = response.data.results || [];
      setLibrayBooks(prev => [...prev, ...newData]);

      if (response.data.links && response.data.links.next) {
        pageRef.current = currentPage + 1;
        setPage(currentPage + 1);
      } else {
        setHasMore(false);
      }
      setLoadingBooks(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to load librarys');
    } finally {
      setLoadingBooks(false);
      isFetchingRef.current = false;
    }
  }, [appUser, token, hasMore]);

  useEffect(() => {
    if (!appUser) return;
    fetchLibraryBooks();
  }, [appUser, fetchLibraryBooks]);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return libBooks.filter(
      book =>
        (book.name || '').toLowerCase().includes(query) ||
        (book.author_name || '').toLowerCase().includes(query),
    );
  }, [libBooks, searchQuery]);

  const submitBookRequest = useCallback(async () => {
    try {
      const payload = {
        branch: appUser?.branch_id,
        book: selectedBook.id,
        school: appUser?.school_id,
        requested_by: appUser?.id,
      };

      await axios.post(`${BASEURL}/api/library/request-book/`, payload, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setShowBookRequestModel(false);
      Alert.alert('Success', 'Request Submitted');
    } catch (e) {
      Alert.alert('Error', 'Failed to send request');
    } finally {
      setShowBookRequestModel(false);
    }
  }, [appUser, selectedBook, token]);

  const renderBooksCard = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[
          styles.libBooksListCard,
          {
            backgroundColor: item.status === 'Available' ? 'white' : '#ececec',
            elevation: item.status === 'Available' ? 4 : 0,
          },
        ]}
        onPress={
          item.status === 'Available'
            ? () => {
                setShowBookRequestModel(true);
                setSelectedBook({
                  name: item.name,
                  id: item.id,
                  image: item.image,
                });
              }
            : () => {}
        }
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          {item.image != null ? (
            <TouchableOpacity
              onPress={() => {
                setIsImageVisible(true);
                setVisibleImage(item.image);
              }}
            >
              <Image
                source={item.image ? { uri: item.image } : schoolLogo}
                style={[
                  styles.profilePic,
                  {
                    backgroundColor:
                      item.status === 'Available' ? 'white' : '#d3d3d3',
                  },
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.rollNumber}>{item.isbn}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.classroom}>{item.author_name}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  if (loadingBooks) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text style={styles.loadingText}>Loading Books</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}
      >
        <BackButton />
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: '#1A1A1A',
            marginBottom: 4,
            flex: 1,
          }}
          numberOfLines={1}
        >
          Books List
        </Text>
      </View>

      <FlatList
        style={{ paddingTop: 20 }}
        data={filteredBooks}
        renderItem={renderBooksCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => fetchLibraryBooks()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No students found in this class</Text>
        }
      />

      <Modal
        visible={showBookRequestModel}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowBookRequestModel(false)}
      >
        <View style={styles.modalOverlay}>
          {selectedBook && (
            <View style={styles.modalContainer}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'Bold',
                  marginBottom: 10,
                }}
              >
                {selectedBook.name}
              </Text>
              <Image
                source={
                  selectedBook.image ? { uri: selectedBook.image } : schoolLogo
                }
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  style={[styles.closeButton, { flex: 1 }]}
                  onPress={() => setShowBookRequestModel(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { flex: 1, marginLeft: 10, backgroundColor: '#86b952' },
                  ]}
                  onPress={() => submitBookRequest()}
                >
                  <Text>Send Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const RequestedBooksList = () => {
  const { appUser, token } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [libBooks, setLibrayBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [showBookRequestModel, setShowBookRequestModel] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchLibraryBooks = useCallback(async () => {
    try {
      if (isFetchingRef.current || !hasMore) return;
      isFetchingRef.current = true;

      setLoadingBooks(true);

      const currentPage = pageRef.current;

      const response = await axios.get(
        `${BASEURL}/api/library/request-book/?page=${currentPage}&branch_id=${appUser.branch_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.detail === 'Invalid page.') {
        setHasMore(false);
        return;
      }

      const data = response.data;
      const newData = data.results || [];
      setLibrayBooks(prev => [...prev, ...newData]);

      if (data.links && data.links.next) {
        pageRef.current = currentPage + 1;
        setPage(currentPage + 1);
      } else {
        setHasMore(false);
      }

      setLoadingBooks(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to load librarys');
    } finally {
      setLoadingBooks(false);
      isFetchingRef.current = false;
    }
  }, [appUser, token, hasMore]);

  useEffect(() => {
    if (!appUser) return;
    fetchLibraryBooks();
  }, [appUser, fetchLibraryBooks]);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return libBooks.filter(
      book =>
        (book.name || '').toLowerCase().includes(query) ||
        (book.author_name || '').toLowerCase().includes(query),
    );
  }, [libBooks, searchQuery]);

  const renderBooksCard = useCallback(
    ({ item, index }) => (
      <TouchableOpacity
        key={index}
        style={[styles.studentCard, { backgroundColor: 'white' }]}
        onPress={() => {}}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          {
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.book_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>
            </View>
          }

          <View style={styles.infoContainer}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.book_name}
            </Text>
            <Text style={styles.rollNumber}>Due Date - {item.due_date}</Text>
            <Text style={styles.rollNumber}>
              Requested Date - {item.due_date}
            </Text>
            <View style={styles.detailsRow}>
              <Text
                style={[
                  styles.classroom,
                  {
                    color:
                      item.status === 'pending'
                        ? '#484f52'
                        : item.status === 'issued'
                        ? '#dfce49'
                        : item.status === 'rejected'
                        ? '#e02713'
                        : '#86b952',
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [],
  );
  console.log('filtered', filteredBooks);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}
      >
        <BackButton></BackButton>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: '#1A1A1A',
            marginBottom: 4,
            flex: 1,
          }}
          numberOfLines={1}
        >
          Request List
        </Text>
      </View>

      <FlatList
        style={{ paddingTop: 20 }}
        data={filteredBooks}
        renderItem={renderBooksCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => fetchLibraryBooks()}
        ListFooterComponent={
          loadingBooks ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="large" color="#86b952" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loadingBooks && libBooks.length === 0 ? (
            <Text style={styles.emptyText}>
              No students found in this class
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const LibraryBooks = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const navigation = useNavigation();
  const { appUser } = useUser();

  useEffect(() => {
    return () => {};
  }, [appUser]);

  const tabs = ['Books List', 'Book Request'];

  const handleOnPress = useCallback(index => {
    setSelectedTab(index);
  }, []);

  const renderTabUI = useCallback(() => {
    if (selectedTab === 0) {
      return <BooksList />;
    } else if (selectedTab === 1) {
      return <RequestedBooksList />;
    }
  }, [selectedTab]);

  return (
    <View style={styles.mainContainer}>
      <View>
        <TopBar />
        <CustomeTab tabs={tabs} onTabPress={index => handleOnPress(index)} />
      </View>
      {renderTabUI()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    padding: 10,
  },
  profilePic: {
    width: 50,
    height: 56,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#86b95220',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    elevation: 5,
  },
  modalImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#2d3748',
    padding: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  logInputStyle: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    marginBottom: 20,
    height: 50,
  },
  logCard: {
    backgroundColor: 'white',
    marginHorizontal: 1,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#86b952',
    flex: 1,
  },
  libBooksListCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  studentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#86b952',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },
  infoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  rollNumber: {
    fontSize: 13,
    color: '#666',
    // fontWeight: '700',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  classroom: {
    fontSize: 12,
    color: '#86b952',
    fontWeight: '700',
    backgroundColor: 'rgba(134, 185, 82, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listContent: {
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    padding: 60,
    fontWeight: '500',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1E1E',
    flex: 1,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 28,
  },
  formSection: {
    marginBottom: 32,
  },
  horizontalInputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1E1E',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    fontSize: 18,
    backgroundColor: '#FAFAFA',
    fontWeight: '600',
  },
  inputLeft: {},
  inputRight: {},
  healthSection: {
    flex: 1,
  },
  healthList: {
    flex: 1,
  },
  healthRecord: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#86b952',
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  healthLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  healthValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E1A',
  },
  bmiValue: {
    color: '#86b952',
  },
  healthDate: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
  },
  loadingHealthContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingHealthText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  noHealthContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noHealthText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 8,
  },
  noHealthSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  sheetActions: {
    flexDirection: 'row',
    paddingVertical: 28,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cancelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#86b952',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#86b952',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  disabledButton: {
    backgroundColor: '#B8D9B8',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: { padding: 8, justifyContent: 'center', borderRadius: 12 },
  searchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  searchInfoText: { fontSize: 14, color: '#666', fontWeight: '500' },
  clearAllButton: { paddingHorizontal: 12, paddingVertical: 6 },
  clearAllText: { fontSize: 14, color: '#0066cc', fontWeight: '600' },
});

export default LibraryBooks;
