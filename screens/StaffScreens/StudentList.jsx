// import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   ScrollView,
//   TextInput,
//   Platform,
// } from 'react-native';
// import TopBar from '../../components/ParentTobBar';
// import FrontCamera from '../../components/FrontCamera';
// import { useUser } from '../../context/UserContext';
// import axios from 'axios';
// import { BASEURL } from '../../appurls';
// import BackButton from '../../components/BackButton';
// import { Search, X } from 'lucide-react-native';
// import { useNavigation } from '@react-navigation/native';

// const StudentCard = memo(({ item, onPress }) => (
//   <TouchableOpacity
//     style={styles.studentCard}
//     onPress={onPress}
//     activeOpacity={0.8}
//   >
//     <View style={styles.cardContent}>
//       <View style={styles.avatarContainer}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>
//             {item.student_name
//               .split(' ')
//               .map(n => n[0])
//               .join('')
//               .toUpperCase()}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.infoContainer}>
//         <Text style={styles.studentName} numberOfLines={1}>
//           {item.student_name}
//         </Text>
//         <Text style={styles.rollNumber}>{item.roll_number}</Text>
//         <View style={styles.detailsRow}>
//           <Text style={styles.classroom}>{item.classroom_name}</Text>
//         </View>
//       </View>
//     </View>
//   </TouchableOpacity>
// ));

// const HealthItem = memo(({ item }) => (
//   <View style={styles.logCard}>
//     <Text
//       style={{
//         color: '#000',
//         fontSize: 15,
//         fontWeight: 'bold',
//       }}
//     >
//       Date:{' '}
//       <Text
//         style={{
//           color: 'green',
//         }}
//       >
//         {item.created_at.substring(0, 10)}
//       </Text>{' '}
//       Time:{' '}
//       <Text
//         style={{
//           color: 'green',
//         }}
//       >
//         {item.created_at.substring(11, 19)}
//       </Text>
//     </Text>
//     <Text
//       style={{
//         color: '#000',
//         fontSize: 17,
//         marginTop: 10,
//       }}
//     >
//       {item.message}
//     </Text>
//   </View>
// ));

// const StaffBasedStudentsList = () => {
//   const { appUser, token } = useUser();
//   const [students, setStudents] = useState([]);
//   const [loadingStudents, setLoadingStudents] = useState(true);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [logData, setLogData] = useState([]);
//   const [loadingHealth, setLoadingHealth] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isSearching, setIsSearching] = useState(false);
//   const navigation = useNavigation();
//   const [isCameraVisible, setIsCameraVisible] = useState(false);
//   const [capturedMedia, setCapturedMedia] = useState({ uri: null, type: null });

//   const [logText, setLogText] = useState(null);

//   const fetchStudents = useCallback(async () => {
//     try {
//       setLoadingStudents(true);
//       const res = await axios.get(
//         `${BASEURL}/api/parent/classroom-student-list/`,
//         {
//           params: { class_id: appUser?.class_id },
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       setStudents(res.data);
//     } catch (e) {
//       Alert.alert('Error', 'Failed to load students');
//     } finally {
//       setLoadingStudents(false);
//     }
//   }, [BASEURL, appUser?.class_id, token]);

//   const fetchStudentsLogData = useCallback(
//     async studentId => {
//       try {
//         setLoadingHealth(true);
//         const response = await fetch(
//           `${BASEURL}/api/parent/update-student-log/?student_id=${parseInt(
//             studentId,
//           )}`,
//           {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );

//         const data = await response.json();
//         setLogData(data.results || []);
//       } catch (error) {
//       } finally {
//         setLoadingHealth(false);
//       }
//     },
//     [BASEURL, token],
//   );

//   useEffect(() => {
//     if (selectedStudent?.student) {
//       setLogText(null);
//       setCapturedMedia({ uri: null, type: null });
//       fetchStudentsLogData(selectedStudent.student);
//     }
//   }, [selectedStudent, fetchStudentsLogData]);

//   useEffect(() => {
//     if (!appUser) return;
//     fetchStudents();
//   }, [appUser, fetchStudents]);

//   useEffect(() => {
//     const query = searchQuery.trim().toLowerCase();
//     setIsSearching(!!query);
//   }, [searchQuery]);

//   const filteredStudents = useMemo(() => {
//     const query = searchQuery.trim().toLowerCase();
//     return students.filter(
//       student =>
//         student.student_name.toLowerCase().includes(query) ||
//         (student.roll_number && student.roll_number.toString().includes(query)),
//     );
//   }, [students, searchQuery]);

//   const handleCameraUpload = useCallback(photoUri => {
//     setCapturedMedia({ uri: photoUri });
//     setIsCameraVisible(false);
//   }, []);

//   const submitLogs = useCallback(
//     async student => {
//       if (logText !== null) {
//         try {
//           const formData = new FormData();

//           if (capturedMedia.uri != null) {
//             const filename = capturedMedia.uri.split('/').pop();
//             const mimeType = 'image/jpeg';
//             const uri =
//               Platform.OS === 'android' &&
//               !capturedMedia.uri.startsWith('file://')
//                 ? 'file://' + capturedMedia.uri
//                 : capturedMedia.uri;
//             formData.append('image', { uri, name: filename, type: mimeType });
//           }

//           formData.append('message', logText);
//           formData.append('parent', student.student);
//           formData.append('school', appUser?.school_id);
//           formData.append('branch', appUser?.branch_id);
//           formData.append('classroom', appUser?.class_id);
//           formData.append('staff', appUser?.id);

//           await axios.post(
//             `${BASEURL}/api/parent/update-student-log/`,
//             formData,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'multipart/form-data',
//               },
//             },
//           );

//           setCapturedMedia({ uri: null, type: null });
//           setLogText(null);
//           Alert.alert('Success', `Log Submitted`);
//         } catch (error) {
//           Alert.alert('Error', `Failed to upload image`);
//         }

//         setShowModal(false);
//       } else {
//         Alert.alert('Error', `Log is empty`);
//       }
//     },
//     [BASEURL, capturedMedia, logText, appUser, token],
//   );

//   const renderStudentCard = useCallback(
//     ({ item }) => (
//       <StudentCard
//         item={item}
//         onPress={() => {
//           fetchStudentsLogData(item.student);
//           setSelectedStudent(item);
//           if (selectedStudent) {
//             navigation.navigate('StudentLogsList', {
//               data: { logData, selectedStudent },
//             });
//           }

//           // setShowModal(true);
//         }}
//       />
//     ),
//     [fetchStudentsLogData],
//   );

//   const renderHealthItem = useCallback(
//     ({ item }) => <HealthItem item={item} />,
//     [],
//   );

//   if (loadingStudents) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#86b952" />
//         <Text style={styles.loadingText}>Loading students...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <TopBar />
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           paddingHorizontal: 10,
//           paddingBottom: 5,
//         }}
//       >
//         <BackButton />
//         <View style={[styles.searchContainer, { flex: 1 }]}>
//           <View style={styles.searchInputContainer}>
//             <Search size={24} color="#666" style={styles.searchIcon} />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search students by name"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               autoCapitalize="none"
//               autoCorrect={false}
//               returnKeyType="search"
//               underlineColorAndroid="transparent"
//             />

//             {searchQuery ? (
//               <TouchableOpacity
//                 style={styles.clearButton}
//                 onPress={() => setSearchQuery('')}
//               >
//                 <X size={20} color="#999" />
//               </TouchableOpacity>
//             ) : null}
//           </View>

//           {isSearching && (
//             <View style={styles.searchInfo}>
//               <Text style={styles.searchInfoText}>
//                 Found {filteredStudents.length} student(s) for "{searchQuery}"
//               </Text>
//               <TouchableOpacity
//                 onPress={() => setSearchQuery('')}
//                 style={styles.clearAllButton}
//               >
//                 <Text style={styles.clearAllText}>Clear</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>

//       <FlatList
//         data={filteredStudents}
//         renderItem={renderStudentCard}
//         keyExtractor={item => item.id.toString()}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No students found in this class</Text>
//         }
//       />

//       <Modal
//         visible={false}
//         animationType="fade"
//         presentationStyle="fullScreen"
//         onRequestClose={() => setIsCameraVisible(false)}
//       >
//         <View style={{ borderWidth: 2, backgroundColor: 'red' }}>
//           <FrontCamera
//             onPhotoCaptured={handleCameraUpload}
//             onClose={() => setIsCameraVisible(false)}
//           />
//         </View>
//       </Modal>

//       {/* <Modal
//         visible={showModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setShowModal(false);
//         }}
//       > */}
//       {showModal && (
//         // <View style={styles.modalOverlay}>

//         // </View>
//       )}
//       {/* </Modal> */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   logInputStyle: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1a1a1a',
//     padding: 24,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//     borderRadius: 16,
//     marginBottom: 20,
//     height: 50,
//   },
//   logCard: {
//     backgroundColor: 'white',
//     marginHorizontal: 1,
//     marginBottom: 16,
//     borderRadius: 20,
//     padding: 20,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FF',
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 12,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#86b952',
//     flex: 1,
//   },
//   studentCard: {
//     backgroundColor: 'white',
//     marginHorizontal: 16,
//     marginBottom: 16,
//     borderRadius: 20,
//     padding: 20,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     marginRight: 16,
//   },
//   avatar: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#86b952',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#86b952',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   avatarText: {
//     color: 'white',
//     fontSize: 22,
//     fontWeight: '800',
//   },
//   infoContainer: {
//     flex: 1,
//   },
//   studentName: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#1A1A1A',
//     marginBottom: 4,
//   },
//   rollNumber: {
//     fontSize: 15,
//     color: '#666',
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   classroom: {
//     fontSize: 14,
//     color: '#86b952',
//     fontWeight: '700',
//     backgroundColor: 'rgba(134, 185, 82, 0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   listContent: {
//     paddingBottom: 30,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//   },
//   emptyText: {
//     textAlign: 'center',
//     fontSize: 18,
//     color: '#999',
//     padding: 60,
//     fontWeight: '500',
//   },
//   modalOverlay: {
//     // flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//     justifyContent: 'flex-end',
//     borderWidth: 2,
//     height: '100%',
//     width: '100%',
//     position: 'absolute',
//   },
//   bottomSheet: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     height: '100%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 24,
//     elevation: 20,
//     borderWidth: 2,
//   },
//   sheetHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 32,
//     paddingHorizontal: 28,
//     paddingBottom: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   sheetTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#1E1E1E',
//     flex: 1,
//   },
//   closeButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#F8F9FA',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeText: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#666',
//   },
//   modalContent: {
//     flex: 1,
//     paddingHorizontal: 28,
//     paddingTop: 24,
//     paddingBottom: 28,
//   },
//   formSection: {
//     marginBottom: 32,
//   },
//   horizontalInputRow: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   inputGroup: {
//     flex: 1,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#1E1E1E',
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1E1E1E',
//     marginBottom: 12,
//   },
//   input: {
//     borderWidth: 2,
//     borderColor: '#E8E8E8',
//     borderRadius: 20,
//     paddingHorizontal: 24,
//     paddingVertical: 20,
//     fontSize: 18,
//     backgroundColor: '#FAFAFA',
//     fontWeight: '600',
//   },
//   inputLeft: {},
//   inputRight: {},
//   healthSection: {
//     flex: 1,
//     borderWidth: 2,
//     borderColor: 'blue',
//     padding: 8,
//     overflow: 'hidden',
//   },
//   healthList: {
//     // flex: 1,
//     borderWidth: 2,
//     // height: 200,
//     borderColor: 'red',
//     padding: 12,
//   },
//   healthRecord: {
//     backgroundColor: '#F8FAFC',
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: '#86b952',
//     height: 200,
//   },
//   healthRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },
//   healthLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#64748B',
//   },
//   healthValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1E1E1A',
//   },
//   bmiValue: {
//     color: '#86b952',
//   },
//   healthDate: {
//     fontSize: 13,
//     color: '#94A3B8',
//     marginTop: 8,
//   },
//   loadingHealthContainer: {
//     alignItems: 'center',
//     paddingVertical: 32,
//   },
//   loadingHealthText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
//   noHealthContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   noHealthText: {
//     fontSize: 16,
//     color: '#94A3B8',
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   noHealthSubtext: {
//     fontSize: 14,
//     color: '#A0AEC0',
//     textAlign: 'center',
//   },
//   sheetActions: {
//     flexDirection: 'row',
//     paddingVertical: 28,
//     gap: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//   },
//   cancelButton: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//     paddingVertical: 20,
//     borderRadius: 20,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#E0E0E0',
//   },
//   cancelText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#666',
//   },
//   submitButton: {
//     flex: 1,
//     backgroundColor: '#86b952',
//     paddingVertical: 20,
//     borderRadius: 20,
//     alignItems: 'center',
//     shadowColor: '#86b952',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.4,
//     shadowRadius: 16,
//     elevation: 12,
//   },
//   disabledButton: {
//     backgroundColor: '#B8D9B8',
//   },
//   submitText: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: 'white',
//   },
//   searchContainer: {
//     padding: 16,
//     paddingTop: 8,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   searchInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 16,
//     paddingHorizontal: 16,
//     height: 56,
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//   },
//   searchIcon: { marginRight: 12 },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1a1a1a',
//   },
//   clearButton: { padding: 8, justifyContent: 'center', borderRadius: 12 },
//   searchInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//   },
//   searchInfoText: { fontSize: 14, color: '#666', fontWeight: '500' },
//   clearAllButton: { paddingHorizontal: 12, paddingVertical: 6 },
//   clearAllText: { fontSize: 14, color: '#0066cc', fontWeight: '600' },
// });

// export default StaffBasedStudentsList;

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import { BASEURL } from '../../appurls';
import BackButton from '../../components/BackButton';
import { Search, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

/* ============ Student Card ============ */
const StudentCard = memo(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.studentCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.cardContent}>
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

      <View style={styles.infoContainer}>
        <Text style={styles.studentName} numberOfLines={1}>
          {item.student_name}
        </Text>
        <Text style={styles.rollNumber}>{item.roll_number}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.classroom}>{item.classroom_name}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

/* ============ Main Screen ============ */
const StaffBasedStudentsList = () => {
  const { appUser, token } = useUser();
  const navigation = useNavigation();

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(
        `${BASEURL}/api/parent/classroom-student-list/`,
        {
          params: { class_id: appUser?.class_id },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStudents(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  }, [BASEURL, appUser?.class_id, token]);

  useEffect(() => {
    if (!appUser) return;
    fetchStudents();
  }, [appUser, fetchStudents]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    setIsSearching(!!query);
  }, [searchQuery]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return students.filter(
      student =>
        student.student_name.toLowerCase().includes(query) ||
        (student.roll_number && student.roll_number.toString().includes(query)),
    );
  }, [students, searchQuery]);

  const renderStudentCard = useCallback(
    ({ item }) => (
      <StudentCard
        item={item}
        onPress={() => {
          // Navigate to the logs screen — pass the whole student object
          navigation.navigate('StudentLogsList', { student: item });
        }}
      />
    ),
    [navigation],
  );

  if (loadingStudents) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.searchRow}>
        <BackButton />
        <View style={[styles.searchContainer, { flex: 1 }]}>
          <View style={styles.searchInputContainer}>
            <Search size={24} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students by name"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              underlineColorAndroid="transparent"
            />
            {searchQuery ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <X size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>

          {isSearching && (
            <View style={styles.searchInfo}>
              <Text style={styles.searchInfoText}>
                Found {filteredStudents.length} student(s) for "{searchQuery}"
              </Text>
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearAllButton}
              >
                <Text style={styles.clearAllText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No students found in this class</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    padding: 60,
    fontWeight: '500',
  },
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
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { marginRight: 16 },
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
  avatarText: { color: 'white', fontSize: 22, fontWeight: '800' },
  infoContainer: { flex: 1 },
  studentName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  rollNumber: {
    fontSize: 15,
    color: '#666',
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsRow: { flexDirection: 'row', gap: 12 },
  classroom: {
    fontSize: 14,
    color: '#86b952',
    fontWeight: '700',
    backgroundColor: 'rgba(134, 185, 82, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listContent: { paddingBottom: 30 },
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
  searchInput: { flex: 1, fontSize: 16, color: '#1a1a1a' },
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

export default StaffBasedStudentsList;
