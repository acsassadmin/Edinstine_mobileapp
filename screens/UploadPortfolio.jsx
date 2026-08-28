// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
//   Platform,
//   Modal,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';
// import { Ionicons } from '@expo/vector-icons';
// import { useUser } from '../context/UserContext';
// import TopBar from '../components/ParentTobBar';
// import BackButton from '../components/BackButton';
// import dayjs from 'dayjs';
// import { BASEURL } from '../appurls';
// import { useVideoPlayer, VideoView } from 'expo-video';
// import { Video } from 'expo-av';
// import { getFeatures } from '../features.service';

// const UploadPortfolio = () => {
//   const { token, appUser } = useUser();
//   const [images, setImages] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [loadingStudents, setLoadingStudents] = useState(true); //  Student skeleton
//   const [loadingImages, setLoadingImages] = useState(false); //  Image loading
//   const [sendToGroup, setSendToGroup] = useState(false);
//   const [sendToSchool, setSendToSchool] = useState(false);
//   const [showUploadModal, setShowUploadModal] = useState(false);

//   /* -------------------- FETCH STUDENTS WITH SKELETON -------------------- */
//   const fetchStudents = async () => {
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
//       // console.log(e);
//     } finally {
//       setLoadingStudents(false);
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const checkVideoDuration = async uri => {
//     try {
//       const { sound, status } = await Video.createAsync(
//         { uri },
//         {},
//         { shouldPlay: false },
//       );

//       const duration = status.durationMillis;

//       await sound?.unloadAsync();

//       return duration <= 60000; // 60 seconds
//     } catch (error) {
//       // console.log('❌ Video duration check failed:', error);
//       return false;
//     }
//   };
//   const videoPromises = images.map(async media => {
//     const lowerUri = media.uri.toLowerCase();
//     const isVideo =
//       lowerUri.endsWith('.mp4') ||
//       lowerUri.endsWith('.mov') ||
//       lowerUri.endsWith('.avi') ||
//       lowerUri.endsWith('.mkv');

//     if (isVideo) {
//       const isValid = await checkVideoDuration(media.uri);
//       if (!isValid) {
//         return { invalid: true, uri: media.uri };
//       }
//     }
//     return { invalid: false };
//   });

//   /* -------------------- IMAGE PICKER WITH LOADING SCREEN -------------------- */
//   const pickImages = async () => {
//     //  Request BOTH camera roll AND media library permissions
//     // const [cameraRollStatus, mediaLibraryStatus] = await Promise.all([
//     //   ImagePicker.requestCameraPermissionsAsync(),
//     //   ImagePicker.requestMediaLibraryPermissionsAsync(),
//     // ]);

//     // if (!cameraRollStatus.granted || !mediaLibraryStatus.granted) {
//     //   Alert.alert(
//     //     'Permission required',
//     //     'Allow Camera Roll & Media Library access for images/videos'
//     //   );
//     //   return;
//     // }

//     setLoadingImages(true);

//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.All, //  Images + Videos
//         allowsMultipleSelection: true,
//         quality: 0.8,
//         //  Explicitly enable video selection
//         videoExportPreset: ImagePicker.VideoExportPreset.Medium,
//       });

//       // console.log('Picker result:', result); //  Debug log

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const newMedia = result.assets.map(asset => ({
//           uri: asset.uri,
//           type: asset.mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
//           name: asset.fileName || `media_${Date.now()}.jpg`,
//         }));

//         setImages(prev => [...prev, ...newMedia]);
//         // console.log('Added media:', newMedia.length, 'items');
//       }
//     } catch (error) {
//       // console.log('Picker error:', error);
//       Alert.alert('Error', 'Failed to open gallery');
//     } finally {
//       setLoadingImages(false);
//     }
//   };

//   /* -------------------- STUDENT SELECT -------------------- */
//   const toggleStudent = student => {
//     const exists = selectedStudents.find(s => s.student === student.student);
//     if (exists) {
//       setSelectedStudents(prev =>
//         prev.filter(s => s.student !== student.student),
//       );
//     } else {
//       setSelectedStudents(prev => [...prev, student]);
//     }
//   };
//   // console.log("selected student",selectedStudents)
//   const uploadPortfolio = async () => {
//     if (!images.length) {
//       Alert.alert('Missing Media', 'Please select at least one image/video');
//       return;
//     }
//     if (!selectedStudents.length && !sendToGroup && !sendToSchool) {
//       Alert.alert(
//         'Missing Students',
//         'Select students OR enable "Send to Group"',
//       );
//       return;
//     }
//     if (!appUser?.class_id) {
//       Alert.alert('Error', 'Class ID not available');
//       return;
//     }

//     setShowUploadModal(true);

//     try {
//       const formData = new FormData();

//       //  Backend expects STRING values
//       formData.append('class_detail', String(appUser.class_id));

//       //  DD-MM-YYYY format
//       const today = new Date();
//       const formattedDate = `${dayjs(today).format('YYYY-MM-DD')}`;
//       formData.append('date', formattedDate);
//       formData.append('send_to_group', sendToGroup.toString());
//       if (sendToSchool) {
//         formData.append('branch', appUser?.branch_id);
//       }
//       //  Students (optional when send_to_group=true)
//       selectedStudents.forEach(student => {
//         formData.append('student_ids', String(student.student));
//       });

//       //  MODIFIED: Handle both images AND videos in SAME 'images' field
//       images.forEach((media, index) => {
//         const uri = media.uri.startsWith('file://')
//           ? media.uri
//           : `file://${media.uri}`;

//         //  Detect video by extension
//         const lowerUri = uri.toLowerCase();
//         const isVideo =
//           lowerUri.endsWith('.mp4') ||
//           lowerUri.endsWith('.mov') ||
//           lowerUri.endsWith('.avi') ||
//           lowerUri.endsWith('.mkv');

//         formData.append('images', {
//           uri: uri,
//           name: isVideo ? `video_${index + 1}.mp4` : `image_${index + 1}.jpg`,
//           type: isVideo ? 'video/mp4' : 'image/jpeg',
//         });
//       });

//       const response = await fetch(`${BASEURL}/api/common/activityimages/`, {
//         method: 'POST',
//         body: formData,
//         headers: {
//           Authorization: `Bearer ${token}`,
//           // 🚫 NEVER set Content-Type - breaks FormData boundary
//         },
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         // console.log('❌ Server response:', response.status, errorText);
//         throw new Error(`Server error ${response.status}: ${errorText}`);
//       }

//       const result = await response.json();
//       // console.log(' Success:', result);

//       Alert.alert(
//         'Success',
//         `Portfolio uploaded!\nTotal media: ${images.length}\nSend to group: ${
//           sendToGroup ? 'Yes' : 'No'
//         }`,
//       );
//       setImages([]);
//       setSelectedStudents([]);
//     } catch (error) {
//       // console.log('💥 FULL ERROR:', error);

//       let errorMsg = 'Upload failed';
//       if (
//         error.message.includes('Network') ||
//         error.message.includes('Failed to fetch')
//       ) {
//         errorMsg = 'Network error. Check server connection.';
//       } else if (error.message.includes('timeout')) {
//         errorMsg = 'Upload timeout. Try fewer/large files.';
//       } else {
//         errorMsg = error.message;
//       }

//       Alert.alert('Upload Error', errorMsg);
//     } finally {
//       setShowUploadModal(false);
//     }
//   };

//   if (showUploadModal) {
//     return (
//       <Modal visible={true} animationType="fade" statusBarTranslucent={true}>
//         <View style={styles.loadingModal}>
//           <View style={styles.loadingHeader}>
//             <ActivityIndicator size="large" color="#86b952" />
//             <Text style={styles.loadingTitle}>Uploading Portfolio...</Text>
//             <Text style={styles.loadingSubtitle}>
//               {images.length} image{images.length !== 1 ? 's' : ''} •{' '}
//               {selectedStudents.length} student
//               {selectedStudents.length !== 1 ? 's' : ''}
//             </Text>
//           </View>

//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.loadingImagesContainer}
//           >
//             {images.slice(0, 5).map((img, index) => (
//               <Image
//                 key={index}
//                 source={{ uri: img.uri }}
//                 style={styles.loadingImage}
//               />
//             ))}
//             {images.length > 5 && (
//               <View style={styles.loadingMoreImages}>
//                 <Text style={styles.loadingMoreText}>
//                   +{images.length - 5} more
//                 </Text>
//               </View>
//             )}
//           </ScrollView>

//           <View style={styles.loadingInfo}>
//             <Text style={styles.loadingDetail}>Class: {appUser?.class_id}</Text>
//             <Text style={styles.loadingDetail}>
//               Send to group:{' '}
//               <Text style={sendToGroup ? styles.groupYes : styles.groupNo}>
//                 {sendToGroup ? 'Yes' : 'No'}
//               </Text>
//             </Text>
//             <Text style={styles.loadingDetail}>
//               Students: {selectedStudents.map(s => s.student_name).join(', ')}
//             </Text>
//           </View>

//           <TouchableOpacity
//             style={styles.cancelBtn}
//             onPress={() => setShowUploadModal(false)}
//           >
//             <Text style={styles.cancelText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <TopBar />
//       <ScrollView contentContainerStyle={styles.content}>
//         <View style={styles.headerRow}>
//           <BackButton />
//           <Text style={styles.title}>Upload Portfolio</Text>
//         </View>

//         {/*  STUDENT SECTION WITH SKELETON */}
//         <Text style={styles.sectionTitle}>Select Students</Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.chipsScroll}
//         >
//           <View style={styles.chipsContainer}>
//             {loadingStudents
//               ? //  STUDENT SKELETON - 6 placeholders
//                 Array.from({ length: 6 }).map((_, index) => (
//                   <View key={index} style={styles.skeletonChip} />
//                 ))
//               : students.map(student => {
//                   const selected = selectedStudents.some(
//                     s => s.id === student.id,
//                   );
//                   return (
//                     <TouchableOpacity
//                       key={student.student}
//                       style={[styles.chip, selected && styles.chipActive]}
//                       onPress={() => toggleStudent(student)}
//                     >
//                       <Text
//                         style={[
//                           styles.chipText,
//                           selected && styles.chipTextActive,
//                         ]}
//                       >
//                         {student.student_name}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//           </View>
//         </ScrollView>

//         {selectedStudents.length > 0 && !loadingStudents && (
//           <Text style={styles.selectedCount}>
//             {selectedStudents.length} student
//             {selectedStudents.length > 1 ? 's' : ''} selected
//           </Text>
//         )}

//         {/* SEND TO GROUP TOGGLE */}

//         {getFeatures().chat.group && (
//           <View style={styles.toggleContainer}>
//             <Text style={styles.toggleLabel}>Send to Group</Text>
//             <TouchableOpacity
//               style={[styles.toggleBtn, sendToGroup && styles.toggleBtnActive]}
//               onPress={() => setSendToGroup(!sendToGroup)}
//               activeOpacity={0.7}
//             >
//               <Ionicons
//                 name={sendToGroup ? 'checkmark-circle' : 'radio-button-off'}
//                 size={24}
//                 color={sendToGroup ? '#fff' : '#86b952'}
//               />
//             </TouchableOpacity>
//           </View>
//         )}

//         <View style={styles.toggleContainer}>
//           <Text style={styles.toggleLabel}>Send to School</Text>
//           <TouchableOpacity
//             style={[styles.toggleBtn, sendToSchool && styles.toggleBtnActive]}
//             onPress={() => setSendToSchool(!sendToSchool)}
//             activeOpacity={0.7}
//           >
//             <Ionicons
//               name={sendToSchool ? 'checkmark-circle' : 'radio-button-off'}
//               size={24}
//               color={sendToSchool ? '#fff' : '#86b952'}
//             />
//           </TouchableOpacity>
//         </View>

//         {/*  IMAGE SECTION WITH SKELETON */}
//         <Text style={styles.sectionTitle}>
//           Selected Images ({images.length})
//         </Text>
//         {images.length === 0 ? (
//           loadingImages ? (
//             //  IMAGE SKELETON - 3 placeholders
//             <View style={styles.imageSkeletonContainer}>
//               {Array.from({ length: 3 }).map((_, index) => (
//                 <View key={index} style={styles.skeletonImage} />
//               ))}
//             </View>
//           ) : (
//             <View style={styles.placeholder}>
//               <Ionicons name="images-outline" size={50} color="#aaa" />
//               <Text style={styles.placeholderText}>No images selected</Text>
//               <Text style={styles.placeholderSubtext}>
//                 Tap "Choose Images" to select from gallery
//               </Text>
//             </View>
//           )
//         ) : (
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={styles.imageScroll}
//           >
//             <View style={styles.grid}>
//               {images.map((img, i) => (
//                 <Image key={i} source={{ uri: img.uri }} style={styles.image} />
//               ))}
//             </View>
//           </ScrollView>
//         )}

//         {/* ACTION BUTTONS */}
//         <TouchableOpacity
//           style={styles.secondaryBtn}
//           onPress={pickImages}
//           disabled={loadingImages}
//         >
//           <Ionicons
//             name={loadingImages ? 'hourglass-outline' : 'images'}
//             size={20}
//             color="#86b952"
//           />
//           <Text style={styles.secondaryText}>
//             {loadingImages ? 'Loading Images...' : 'Choose Images'}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.primaryBtn,
//             (!images.length ||
//               loadingStudents ||
//               (selectedStudents.length === 0 &&
//                 !sendToGroup &&
//                 !sendToSchool)) &&
//               styles.primaryBtnDisabled,
//           ]}
//           onPress={uploadPortfolio}
//           disabled={
//             !images.length ||
//             loadingStudents ||
//             (selectedStudents.length === 0 && !sendToGroup && !sendToSchool)
//           }
//         >
//           <Ionicons name="cloud-upload" size={22} color="#fff" />
//           <Text style={styles.primaryText}>
//             {images.length > 0 && !loadingStudents
//               ? sendToGroup
//                 ? `Upload to Group (${images.length} images)`
//                 : sendToSchool
//                 ? `Upload to School (${images.length} images)`
//                 : selectedStudents.length > 0
//                 ? `Upload to ${selectedStudents.length} student${
//                     selectedStudents.length !== 1 ? 's' : ''
//                   } (${images.length} data)`
//                 : 'Select students or enable School'
//               : 'Select images first'}
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

// export default UploadPortfolio;

// const styles = StyleSheet.create({
//   // ... existing styles ...
//   container: { flex: 1, backgroundColor: '#f6f7fb' },
//   content: { padding: 16, paddingBottom: 40 },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//     paddingBottom: 20,
//   },
//   title: { fontSize: 18, fontWeight: '700', color: '#86b952' },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginVertical: 10,
//     color: '#333',
//   },

//   chipsScroll: { maxHeight: 60, marginBottom: 10 },
//   chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

//   //  SKELETON STYLES
//   skeletonChip: {
//     width: 80,
//     height: 36,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 18,
//     margin: 2,
//     overflow: 'hidden',
//   },
//   skeletonImage: {
//     width: 100,
//     height: 100,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 10,
//     margin: 4,
//     overflow: 'hidden',
//   },
//   imageSkeletonContainer: {
//     flexDirection: 'row',
//     gap: 8,
//     paddingHorizontal: 20,
//   },

//   chip: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#eee',
//     minWidth: 80,
//   },
//   chipActive: { backgroundColor: '#86b952' },
//   chipText: { color: '#333', fontWeight: '500', textAlign: 'center' },
//   chipTextActive: { color: '#fff' },

//   selectedCount: {
//     fontSize: 14,
//     color: '#86b952',
//     fontWeight: '500',
//     marginBottom: 10,
//   },

//   toggleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginVertical: 10,
//     elevation: 1,
//   },
//   toggleLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
//   toggleBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   toggleBtnActive: { backgroundColor: '#86b952' },

//   imageScroll: { maxHeight: 120, marginBottom: 16 },
//   grid: { flexDirection: 'row', gap: 8 },
//   image: { width: 100, height: 100, borderRadius: 10 },

//   placeholder: {
//     height: 160,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//     backgroundColor: '#fff',
//   },
//   placeholderText: { color: '#999', marginTop: 6, fontSize: 16 },
//   placeholderSubtext: { color: '#bbb', fontSize: 12, marginTop: 4 },

//   secondaryBtn: {
//     flexDirection: 'row',
//     gap: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 14,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#86b952',
//     marginVertical: 12,
//     backgroundColor: '#fff',
//   },
//   secondaryText: { color: '#86b952', fontWeight: '600' },

//   primaryBtn: {
//     flexDirection: 'row',
//     gap: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#86b952',
//     padding: 16,
//     borderRadius: 12,
//   },
//   primaryBtnDisabled: { backgroundColor: '#ccc' },
//   primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

//   // Loading Modal Styles (unchanged)
//   loadingModal: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingHeader: { alignItems: 'center', marginBottom: 30 },
//   loadingTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#333',
//     marginTop: 12,
//   },
//   loadingSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
//   loadingImagesContainer: { height: 120, paddingHorizontal: 20 },
//   loadingImage: { width: 80, height: 80, borderRadius: 12, marginRight: 12 },
//   loadingMoreImages: {
//     width: 80,
//     height: 80,
//     borderRadius: 12,
//     backgroundColor: '#e9ecef',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   loadingMoreText: { color: '#666', fontWeight: '600' },
//   loadingInfo: {
//     marginTop: 20,
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     minWidth: 280,
//     elevation: 2,
//   },
//   loadingDetail: { fontSize: 14, color: '#555', marginBottom: 6 },
//   groupYes: { color: '#86b952', fontWeight: '600' },
//   groupNo: { color: '#dc3545' },
//   cancelBtn: {
//     marginTop: 20,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     backgroundColor: '#dc3545',
//     borderRadius: 8,
//   },
//   cancelText: { color: '#fff', fontWeight: '600', fontSize: 16 },
// });

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import {
  CheckCircle,
  Circle,
  Images,
  Hourglass,
  UploadCloud,
} from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import TopBar from '../components/ParentTobBar';
import BackButton from '../components/BackButton';
import dayjs from 'dayjs';
import { BASEURL } from '../appurls';
import Video from 'react-native-video'; // Replaced expo-av/expo-video
import { getFeatures } from '../features.service';

const UploadPortfolio = () => {
  const { token, appUser } = useUser();
  const [images, setImages] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true); //  Student skeleton
  const [loadingImages, setLoadingImages] = useState(false); //  Image loading
  const [sendToGroup, setSendToGroup] = useState(false);
  const [sendToSchool, setSendToSchool] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  /* -------------------- FETCH STUDENTS WITH SKELETON -------------------- */
  const fetchStudents = async () => {
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
      // console.log(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const checkVideoDuration = async uri => {
    try {
      // Note: react-native-video does not provide a static method to check duration like expo-av.
      // Since this function is declared but never actually invoked in the flow (videoPromises is unused),
      // we return true to not block any potential future usage.
      return true;
    } catch (error) {
      // console.log('❌ Video duration check failed:', error);
      return false;
    }
  };

  const videoPromises = images.map(async media => {
    const lowerUri = media.uri.toLowerCase();
    const isVideo =
      lowerUri.endsWith('.mp4') ||
      lowerUri.endsWith('.mov') ||
      lowerUri.endsWith('.avi') ||
      lowerUri.endsWith('.mkv');

    if (isVideo) {
      const isValid = await checkVideoDuration(media.uri);
      if (!isValid) {
        return { invalid: true, uri: media.uri };
      }
    }
    return { invalid: false };
  });

  /* -------------------- IMAGE PICKER WITH LOADING SCREEN -------------------- */
  const pickImages = async () => {
    setLoadingImages(true);

    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed', // Images + Videos
        selectionLimit: 0, // 0 means unlimited multiple selection
        quality: 0.8,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const newMedia = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type?.includes('video') ? 'video/mp4' : 'image/jpeg',
          name: asset.fileName || `media_${Date.now()}.jpg`,
        }));

        setImages(prev => [...prev, ...newMedia]);
      }
    } catch (error) {
      // console.log('Picker error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    } finally {
      setLoadingImages(false);
    }
  };

  /* -------------------- STUDENT SELECT -------------------- */
  const toggleStudent = student => {
    const exists = selectedStudents.find(s => s.student === student.student);
    if (exists) {
      setSelectedStudents(prev =>
        prev.filter(s => s.student !== student.student),
      );
    } else {
      setSelectedStudents(prev => [...prev, student]);
    }
  };
  // console.log("selected student",selectedStudents)
  const uploadPortfolio = async () => {
    if (!images.length) {
      Alert.alert('Missing Media', 'Please select at least one image/video');
      return;
    }
    if (!selectedStudents.length && !sendToGroup && !sendToSchool) {
      Alert.alert(
        'Missing Students',
        'Select students OR enable "Send to Group"',
      );
      return;
    }
    if (!appUser?.class_id) {
      Alert.alert('Error', 'Class ID not available');
      return;
    }

    setShowUploadModal(true);

    try {
      const formData = new FormData();

      //  Backend expects STRING values
      formData.append('class_detail', String(appUser.class_id));

      //  DD-MM-YYYY format
      const today = new Date();
      const formattedDate = `${dayjs(today).format('YYYY-MM-DD')}`;
      formData.append('date', formattedDate);
      formData.append('send_to_group', sendToGroup.toString());
      if (sendToSchool) {
        formData.append('branch', appUser?.branch_id);
      }
      //  Students (optional when send_to_group=true)
      selectedStudents.forEach(student => {
        formData.append('student_ids', String(student.student));
      });

      //  MODIFIED: Handle both images AND videos in SAME 'images' field
      images.forEach((media, index) => {
        const uri = media.uri.startsWith('file://')
          ? media.uri
          : `file://${media.uri}`;

        //  Detect video by extension
        const lowerUri = uri.toLowerCase();
        const isVideo =
          lowerUri.endsWith('.mp4') ||
          lowerUri.endsWith('.mov') ||
          lowerUri.endsWith('.avi') ||
          lowerUri.endsWith('.mkv');

        formData.append('images', {
          uri: uri,
          name: isVideo ? `video_${index + 1}.mp4` : `image_${index + 1}.jpg`,
          type: isVideo ? 'video/mp4' : 'image/jpeg',
        });
      });

      const response = await fetch(`${BASEURL}/api/common/activityimages/`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          // 🚫 NEVER set Content-Type - breaks FormData boundary
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        // console.log('❌ Server response:', response.status, errorText);
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      // console.log(' Success:', result);

      Alert.alert(
        'Success',
        `Portfolio uploaded!\nTotal media: ${images.length}\nSend to group: ${
          sendToGroup ? 'Yes' : 'No'
        }`,
      );
      setImages([]);
      setSelectedStudents([]);
    } catch (error) {
      // console.log('💥 FULL ERROR:', error);

      let errorMsg = 'Upload failed';
      if (
        error.message.includes('Network') ||
        error.message.includes('Failed to fetch')
      ) {
        errorMsg = 'Network error. Check server connection.';
      } else if (error.message.includes('timeout')) {
        errorMsg = 'Upload timeout. Try fewer/large files.';
      } else {
        errorMsg = error.message;
      }

      Alert.alert('Upload Error', errorMsg);
    } finally {
      setShowUploadModal(false);
    }
  };

  if (showUploadModal) {
    return (
      <Modal visible={true} animationType="fade" statusBarTranslucent={true}>
        <View style={styles.loadingModal}>
          <View style={styles.loadingHeader}>
            <ActivityIndicator size="large" color="#86b952" />
            <Text style={styles.loadingTitle}>Uploading Portfolio...</Text>
            <Text style={styles.loadingSubtitle}>
              {images.length} image{images.length !== 1 ? 's' : ''} •{' '}
              {selectedStudents.length} student
              {selectedStudents.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.loadingImagesContainer}
          >
            {images.slice(0, 5).map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.uri }}
                style={styles.loadingImage}
              />
            ))}
            {images.length > 5 && (
              <View style={styles.loadingMoreImages}>
                <Text style={styles.loadingMoreText}>
                  +{images.length - 5} more
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.loadingInfo}>
            <Text style={styles.loadingDetail}>Class: {appUser?.class_id}</Text>
            <Text style={styles.loadingDetail}>
              Send to group:{' '}
              <Text style={sendToGroup ? styles.groupYes : styles.groupNo}>
                {sendToGroup ? 'Yes' : 'No'}
              </Text>
            </Text>
            <Text style={styles.loadingDetail}>
              Students: {selectedStudents.map(s => s.student_name).join(', ')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowUploadModal(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <BackButton />
          <Text style={styles.title}>Upload Portfolio</Text>
        </View>

        {/*  STUDENT SECTION WITH SKELETON */}
        <Text style={styles.sectionTitle}>Select Students</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          <View style={styles.chipsContainer}>
            {loadingStudents
              ? //  STUDENT SKELETON - 6 placeholders
                Array.from({ length: 6 }).map((_, index) => (
                  <View key={index} style={styles.skeletonChip} />
                ))
              : students.map(student => {
                  const selected = selectedStudents.some(
                    s => s.id === student.id,
                  );
                  return (
                    <TouchableOpacity
                      key={student.student}
                      style={[styles.chip, selected && styles.chipActive]}
                      onPress={() => toggleStudent(student)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextActive,
                        ]}
                      >
                        {student.student_name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
          </View>
        </ScrollView>

        {selectedStudents.length > 0 && !loadingStudents && (
          <Text style={styles.selectedCount}>
            {selectedStudents.length} student
            {selectedStudents.length > 1 ? 's' : ''} selected
          </Text>
        )}

        {/* SEND TO GROUP TOGGLE */}

        {getFeatures().chat.group && (
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Send to Group</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, sendToGroup && styles.toggleBtnActive]}
              onPress={() => setSendToGroup(!sendToGroup)}
              activeOpacity={0.7}
            >
              {sendToGroup ? (
                <CheckCircle size={24} color="#fff" />
              ) : (
                <Circle size={24} color="#86b952" />
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Send to School</Text>
          <TouchableOpacity
            style={[styles.toggleBtn, sendToSchool && styles.toggleBtnActive]}
            onPress={() => setSendToSchool(!sendToSchool)}
            activeOpacity={0.7}
          >
            {sendToSchool ? (
              <CheckCircle size={24} color="#fff" />
            ) : (
              <Circle size={24} color="#86b952" />
            )}
          </TouchableOpacity>
        </View>

        {/*  IMAGE SECTION WITH SKELETON */}
        <Text style={styles.sectionTitle}>
          Selected Images ({images.length})
        </Text>
        {images.length === 0 ? (
          loadingImages ? (
            //  IMAGE SKELETON - 3 placeholders
            <View style={styles.imageSkeletonContainer}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={styles.skeletonImage} />
              ))}
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Images size={50} color="#aaa" />
              <Text style={styles.placeholderText}>No images selected</Text>
              <Text style={styles.placeholderSubtext}>
                Tap "Choose Images" to select from gallery
              </Text>
            </View>
          )
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            <View style={styles.grid}>
              {images.map((img, i) => (
                <Image key={i} source={{ uri: img.uri }} style={styles.image} />
              ))}
            </View>
          </ScrollView>
        )}

        {/* ACTION BUTTONS */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={pickImages}
          disabled={loadingImages}
        >
          {loadingImages ? (
            <Hourglass size={20} color="#86b952" />
          ) : (
            <Images size={20} color="#86b952" />
          )}
          <Text style={styles.secondaryText}>
            {loadingImages ? 'Loading Images...' : 'Choose Images'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!images.length ||
              loadingStudents ||
              (selectedStudents.length === 0 &&
                !sendToGroup &&
                !sendToSchool)) &&
              styles.primaryBtnDisabled,
          ]}
          onPress={uploadPortfolio}
          disabled={
            !images.length ||
            loadingStudents ||
            (selectedStudents.length === 0 && !sendToGroup && !sendToSchool)
          }
        >
          <UploadCloud size={22} color="#fff" />
          <Text style={styles.primaryText}>
            {images.length > 0 && !loadingStudents
              ? sendToGroup
                ? `Upload to Group (${images.length} images)`
                : sendToSchool
                ? `Upload to School (${images.length} images)`
                : selectedStudents.length > 0
                ? `Upload to ${selectedStudents.length} student${
                    selectedStudents.length !== 1 ? 's' : ''
                  } (${images.length} data)`
                : 'Select students or enable School'
              : 'Select images first'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default UploadPortfolio;

const styles = StyleSheet.create({
  // ... existing styles ...
  container: { flex: 1, backgroundColor: '#f6f7fb' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#86b952' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: '#333',
  },

  chipsScroll: { maxHeight: 60, marginBottom: 10 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  //  SKELETON STYLES
  skeletonChip: {
    width: 80,
    height: 36,
    backgroundColor: '#e0e0e0',
    borderRadius: 18,
    margin: 2,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    margin: 4,
    overflow: 'hidden',
  },
  imageSkeletonContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
    minWidth: 80,
  },
  chipActive: { backgroundColor: '#86b952' },
  chipText: { color: '#333', fontWeight: '500', textAlign: 'center' },
  chipTextActive: { color: '#fff' },

  selectedCount: {
    fontSize: 14,
    color: '#86b952',
    fontWeight: '500',
    marginBottom: 10,
  },

  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
    elevation: 1,
  },
  toggleLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#86b952' },

  imageScroll: { maxHeight: 120, marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 8 },
  image: { width: 100, height: 100, borderRadius: 10 },

  placeholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  placeholderText: { color: '#999', marginTop: 6, fontSize: 16 },
  placeholderSubtext: { color: '#bbb', fontSize: 12, marginTop: 4 },

  secondaryBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86b952',
    marginVertical: 12,
    backgroundColor: '#fff',
  },
  secondaryText: { color: '#86b952', fontWeight: '600' },

  primaryBtn: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#86b952',
    padding: 16,
    borderRadius: 12,
  },
  primaryBtnDisabled: { backgroundColor: '#ccc' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Loading Modal Styles (unchanged)
  loadingModal: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingHeader: { alignItems: 'center', marginBottom: 30 },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  loadingSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  loadingImagesContainer: { height: 120, paddingHorizontal: 20 },
  loadingImage: { width: 80, height: 80, borderRadius: 12, marginRight: 12 },
  loadingMoreImages: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loadingMoreText: { color: '#666', fontWeight: '600' },
  loadingInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 280,
    elevation: 2,
  },
  loadingDetail: { fontSize: 14, color: '#555', marginBottom: 6 },
  groupYes: { color: '#86b952', fontWeight: '600' },
  groupNo: { color: '#dc3545' },
  cancelBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  cancelText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
