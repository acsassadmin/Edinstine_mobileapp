import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import { BASEURL } from '../../appurls';
import BackButton from '../../components/BackButton';
import dayjs from 'dayjs';
import schoolLogo from '../../assets/icon.png';

const DailyLogsList = () => {
  const { appUser, token } = useUser();
  const [students, setStudents] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [visibleImage, setVisibleImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // current page
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1); // 1. Add a ref to track page instantaneously
  const isFetchingRef = useRef(false);

  // Sync the ref with state if needed (optional, but good for debugging)
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchStudentsLogData = async () => {
    // 2. Use ref for the lock check
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;

    // 1. Safety Check: Don't fetch if student ID is missing
    const studentId = parseInt(appUser?.id);
    if (!studentId) {
      // console.log("Abort: No valid student ID found");
      return;
    }

    try {
      setLoadingHealth(true);

      // 3. USE THE REF HERE for the URL to ensure we get the correct, latest number
      const currentPage = pageRef.current;
      // console.log("Fetching Page:", currentPage);

      // console.log(`${BASEURL}/api/parent/update-student-log/?page=${currentPage}&student_id=${studentId}`);
      // console.log("Token :", token)
      const response = await fetch(
        `${BASEURL}/api/parent/update-student-log/?page=${currentPage}&student_id=${studentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 2. Status Check: Handle 404, 500, etc. before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server Error ${response.status}: ${errorText.substring(0, 100)}`,
        );
      }

      const data = await response.json();
      // console.log("student log data", data.links);

      // Check for errors
      if (data.detail === 'Invalid page.') {
        setHasMore(false);
        return;
      }

      const newData = data.results || [];
      setStudents(prev => [...prev, ...newData]);

      // 4. Update Logic
      if (data.links && data.links.next) {
        // Increment the Ref immediately so the next call uses the new number
        pageRef.current = currentPage + 1;
        // Update state for UI consistency
        setPage(currentPage + 1);
      } else {
        setHasMore(false);
      }

      // // 3. Data Check: Ensure results exists before setting state
      // if (data && data.results) {
      //   setStudents(data.results);
      //   console.log("Data :", data.results);
      // } else {
      //   console.log("No results found in data:", data);
      //   setStudents([]); // Clear list if no results
      // }
    } catch (error) {
      // This will now catch the "Unexpected character <" gracefully
      // console.log("Health fetch error:", error.message);
    } finally {
      setLoadingHealth(false);
      isFetchingRef.current = false;
    }
  };
  const fetchStudentsLogData2 = async () => {
    // 2. Use ref for the lock check
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;

    // 1. Safety Check: Don't fetch if student ID is missing
    const studentId = parseInt(appUser?.id);
    if (!studentId) {
      // console.log("Abort: No valid student ID found");
      return;
    }

    try {
      setLoading(true);

      // 3. USE THE REF HERE for the URL to ensure we get the correct, latest number
      const currentPage = pageRef.current;
      // console.log("Fetching Page:", currentPage);

      // console.log(`${BASEURL}/api/parent/update-student-log/?page=${currentPage}&student_id=${studentId}`);
      // console.log("Token :", token)
      const response = await fetch(
        `${BASEURL}/api/parent/update-student-log/?page=${currentPage}&student_id=${studentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 2. Status Check: Handle 404, 500, etc. before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server Error ${response.status}: ${errorText.substring(0, 100)}`,
        );
      }

      const data = await response.json();
      // console.log("student log data", data.links);

      // Check for errors
      if (data.detail === 'Invalid page.') {
        setHasMore(false);
        return;
      }

      const newData = data.results || [];
      setStudents(prev => [...prev, ...newData]);

      // 4. Update Logic
      if (data.links && data.links.next) {
        // Increment the Ref immediately so the next call uses the new number
        pageRef.current = currentPage + 1;
        // Update state for UI consistency
        setPage(currentPage + 1);
      } else {
        setHasMore(false);
      }

      // // 3. Data Check: Ensure results exists before setting state
      // if (data && data.results) {
      //   setStudents(data.results);
      //   console.log("Data :", data.results);
      // } else {
      //   console.log("No results found in data:", data);
      //   setStudents([]); // Clear list if no results
      // }
    } catch (error) {
      // This will now catch the "Unexpected character <" gracefully
      // console.log("Health fetch error:", error.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!appUser) return;
    fetchStudentsLogData();
  }, [appUser]);

  const renderStudentCard = ({ item }) => (
    <TouchableOpacity style={styles.studentCard} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        {item.image != null ? (
          <TouchableOpacity
            onPress={() => {
              setIsImageVisible(true);
              setVisibleImage(item.image);
            }}
          >
            <Image
              source={
                item.image
                  ? { uri: item.image } // Network image
                  : schoolLogo // Fallback local image
              }
              style={styles.profilePic}
              resizeMode="contain"
              // onError={(error) =>
              //   console.log("Logo load error:", error.nativeEvent.error)
              // }
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.student_name
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
            {dayjs(item.time_stamp).format('DD MMM YYYY, h:mm A')}
          </Text>
          <Text style={styles.rollNumber}>{item.message}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    setIsSearching(!!query);
    return students.filter(
      student =>
        student.student_name.toLowerCase().includes(query) ||
        (student.roll_number && student.roll_number.toString().includes(query)),
    );
  }, [students, searchQuery]);

  if (loadingHealth) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text style={styles.loadingText}>Loading student logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
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
            textAlign: 'center',
            marginRight: 40,
          }}
          numberOfLines={1}
        >
          Daily Logs List
        </Text>
      </View>
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!loading) fetchStudentsLogData2();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={{ padding: 10 }}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              No students found in this class
            </Text>
          )
        }
      />
      {/* show image model */}
      <Modal
        visible={isImageVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsImageVisible(false)}
      >
        {/* The overlay handles centering on the full screen */}
        <View style={styles.modalOverlay}>
          {/* This container defines the centered white box */}
          <View style={styles.modalContainer}>
            <Image
              source={visibleImage ? { uri: visibleImage } : schoolLogo}
              style={styles.modalImage}
              resizeMode="contain"
            />

            {/* Close button placed inside the centered container */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsImageVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profilePic: {
    width: 50,
    height: 56,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#86b95220',
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
    backgroundColor: '#fdfdfe',
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

  // Student Cards
  studentCard: {
    backgroundColor: 'white',
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
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  rollNumber: {
    fontSize: 18,
    color: '#666',
    //    fontWeight: '700',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  classroom: {
    fontSize: 14,
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

  // 95% TALL BOTTOM SHEET
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
    alignItems: 'center', // Centers the image and button inside the box
    shadowColor: '#000', // Optional: adds depth
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

  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '95%', // TALL SHEET
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    alignItems: 'center',
  },

  // Header
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
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
  },

  // Content
  modalContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 28,
  },

  // 1️⃣ INPUT FORM - SIDE BY SIDE
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

  // 2️⃣ HEALTH RECORDS
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

  // Action Buttons
  sheetActions: {
    flexDirection: 'row',
    // paddingHorizontal: 28,
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

export default DailyLogsList;
