// import React, { useEffect, useState, useCallback, memo } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   ScrollView,
//   KeyboardAvoidingView,
// } from 'react-native';
// import axios from 'axios';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import TopBar from '../../components/ParentTobBar';
// import BackButton from '../../components/BackButton';
// import { useUser } from '../../context/UserContext';
// import CustomDatePicker from '../../components/CustomeDatePicker';
// import { BASEURL } from '../../appurls';

// const ClassCard = memo(({ item, active, onSelect }) => (
//   <TouchableOpacity
//     style={[styles.classCard, active && styles.classActive]}
//     onPress={() => onSelect(item)}
//   >
//     <Text style={styles.className}>{item.name}</Text>
//     <Text style={styles.classSub}>
//       {item.standard_name} - {item.section_name}
//     </Text>
//     <Text style={styles.classSub}>{item.branch_name}</Text>
//   </TouchableOpacity>
// ));

// const Homework = () => {
//   const { token, appUser } = useUser();

//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState(null);

//   const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [loadingSubjects, setLoadingSubjects] = useState(false);

//   const [submitting, setSubmitting] = useState(false);

//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [pdfFile, setPdfFile] = useState(null);
//   const [dueDate, setDueDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const fetchClasses = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         `${BASEURL}/api/common/classrooms-staff/`,
//         {
//           params: { staff_id: appUser?.id },
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       setClasses(response.data?.results || []);
//     } catch (error) {
//     } finally {
//       setLoading(false);
//     }
//   }, [appUser?.id, token]);

//   const fetchSubjects = useCallback(async () => {
//     setLoadingSubjects(true);
//     try {
//       const response = await axios.get(`${BASEURL}/api/common/subjects/`, {
//         params: { school_id: appUser?.school_id },
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSubjects(response.data?.results || response.data || []);
//     } catch (error) {
//       setSubjects([]);
//     } finally {
//       setLoadingSubjects(false);
//     }
//   }, [appUser?.school_id, token]);

//   useEffect(() => {
//     fetchClasses();
//   }, [fetchClasses]);

//   useEffect(() => {
//     if (selectedClass) {
//       fetchSubjects();
//       setSelectedSubject(null);
//       setShowSubjectDropdown(false);
//     }
//   }, [selectedClass, fetchSubjects]);

//   const pickPdf = useCallback(async () => {
//     try {
//       const result = await DocumentPicker.pick({
//         type: [DocumentPicker.types.pdf],
//       });
//       setPdfFile(result);
//     } catch (error) {
//       if (!DocumentPicker.isCancel(error)) {
//         Alert.alert('Error', 'Failed to pick PDF');
//       }
//     }
//   }, []);

//   const onChangeDate = useCallback(
//     (event, selectedDate) => {
//       const currentDate = selectedDate || dueDate;
//       setShowDatePicker(Platform.OS === 'ios');
//       setDueDate(currentDate);
//     },
//     [dueDate],
//   );

//   const handleSubjectSelect = useCallback(subject => {
//     setSelectedSubject(subject);
//     setShowSubjectDropdown(false);
//   }, []);

//   const submitHomework = useCallback(async () => {
//     if (submitting) return;

//     if (!title.trim() || !description.trim()) {
//       Alert.alert('Missing Data', 'Enter title and handbook');
//       return;
//     }

//     if (!selectedClass) {
//       Alert.alert('Select Class', 'Please select a class');
//       return;
//     }

//     setSubmitting(true);

//     const formData = new FormData();
//     formData.append('classroom', selectedClass.id);
//     formData.append('teacher', appUser.id);
//     formData.append('title', title);
//     formData.append('description', description);
//     formData.append('due_date', dueDate.toISOString().split('T')[0]);

//     if (selectedSubject) {
//       formData.append('subject', selectedSubject.id);
//     }

//     if (pdfFile) {
//       let localUri = pdfFile[0].uri;
//       let filename = pdfFile[0].name || localUri.split('/').pop();
//       let match = /\.(\w+)$/.exec(filename);
//       let type = match ? `application/${match[1]}` : 'application/pdf';

//       formData.append('attachment', {
//         uri: localUri,
//         name: filename,
//         type: type,
//       });
//     }

//     try {
//       await axios.post(`${BASEURL}/api/homework/homework/`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       Alert.alert('Handbook Added', `Handbook added for ${selectedClass.name}`);

//       setTitle('');
//       setDescription('');
//       setSelectedSubject(null);
//       setSelectedClass(null);
//       setPdfFile(null);
//       setDueDate(new Date());
//     } catch (error) {
//       Alert.alert('Error', 'Failed to submit handbook');
//     } finally {
//       setSubmitting(false);
//     }
//   }, [
//     submitting,
//     title,
//     description,
//     selectedClass,
//     appUser,
//     dueDate,
//     selectedSubject,
//     pdfFile,
//     token,
//   ]);

//   const renderClassItem = useCallback(
//     ({ item }) => (
//       <ClassCard
//         item={item}
//         active={selectedClass?.id === item.id}
//         onSelect={setSelectedClass}
//       />
//     ),
//     [selectedClass],
//   );

//   const handleChangeClass = useCallback(() => {
//     setSelectedClass(null);
//     setSelectedSubject(null);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <TopBar />
//       <View style={styles.header}>
//         <BackButton />
//         <Text style={styles.title}>Add Handbook</Text>
//       </View>

//       {loading ? (
//         <View style={{ flex: 1, justifyContent: 'center' }}>
//           <ActivityIndicator size="large" color="#86b952" />
//         </View>
//       ) : !selectedClass ? (
//         <FlatList
//           data={classes}
//           keyExtractor={item => item.id.toString()}
//           renderItem={renderClassItem}
//           contentContainerStyle={{ padding: 16 }}
//           ListHeaderComponent={
//             <Text style={styles.sectionTitle}>Select Class</Text>
//           }
//         />
//       ) : (
//         <ScrollView
//           style={styles.formScrollView}
//           contentContainerStyle={styles.formContainer}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Text style={styles.selectedClass}>{selectedClass.name}</Text>

//           <Text style={styles.label}>Handbook Title</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter title"
//             value={title}
//             onChangeText={setTitle}
//           />

//           <Text style={styles.label}>Subject</Text>
//           <View style={styles.pickerContainer}>
//             <TouchableOpacity
//               style={styles.dropdownButton}
//               onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
//             >
//               <Text style={styles.dropdownText}>
//                 {selectedSubject ? selectedSubject.name : 'Select Subject'}
//               </Text>
//               <Text
//                 style={[
//                   styles.dropdownIcon,
//                   showSubjectDropdown && styles.iconRotated,
//                 ]}
//               >
//                 {showSubjectDropdown ? '▲' : '▼'}
//               </Text>
//             </TouchableOpacity>

//             {showSubjectDropdown && (
//               <View style={styles.subjectListContainer}>
//                 {loadingSubjects ? (
//                   <ActivityIndicator
//                     size="small"
//                     color="#86b952"
//                     style={{ padding: 10 }}
//                   />
//                 ) : (
//                   <ScrollView
//                     nestedScrollEnabled={true}
//                     style={{ maxHeight: 150 }}
//                   >
//                     {subjects.length > 0 ? (
//                       subjects.map(sub => (
//                         <TouchableOpacity
//                           key={sub.id}
//                           style={[
//                             styles.subjectItem,
//                             selectedSubject?.id === sub.id &&
//                               styles.subjectItemSelected,
//                           ]}
//                           onPress={() => handleSubjectSelect(sub)}
//                         >
//                           <Text
//                             style={[
//                               styles.subjectItemText,
//                               selectedSubject?.id === sub.id &&
//                                 styles.subjectTextSelected,
//                             ]}
//                           >
//                             {sub.name}
//                           </Text>
//                         </TouchableOpacity>
//                       ))
//                     ) : (
//                       <Text style={styles.subjectItemText}>
//                         No subjects found
//                       </Text>
//                     )}
//                   </ScrollView>
//                 )}
//               </View>
//             )}
//           </View>

//           <Text style={styles.label}>Handbook Description</Text>
//           <TextInput
//             style={[styles.input, styles.textArea]}
//             placeholder="Enter handbook"
//             multiline
//             value={description}
//             onChangeText={setDescription}
//           />

//           <Text style={styles.label}>Due Date</Text>
//           <TouchableOpacity style={styles.dateButton}>
//             <CustomDatePicker date={dueDate} setDate={setDueDate} />
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.pdfButton} onPress={pickPdf}>
//             <Text style={styles.pdfButtonText}>
//               {pdfFile ? `Selected: ${pdfFile[0]?.name}` : 'Attach PDF'}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.submitButton, submitting && styles.disabledButton]}
//             onPress={submitHomework}
//             disabled={submitting}
//           >
//             {submitting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.submitText}>Submit Handbook</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.changeClass}
//             onPress={handleChangeClass}
//             disabled={submitting}
//           >
//             <Text style={styles.changeClassText}>Change Class</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// export default Homework;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#ffffff' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//     paddingHorizontal: 16,
//   },
//   title: { fontSize: 20, fontWeight: '600', marginLeft: 15, color: '#86b952' },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 0,
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   classCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   classActive: { borderWidth: 2, borderColor: '#86b952' },
//   className: { fontSize: 16, fontWeight: '700', color: '#333' },
//   classSub: { fontSize: 13, color: '#777', marginTop: 2 },
//   formScrollView: {
//     flex: 1,
//   },
//   formContainer: {
//     padding: 16,
//     paddingBottom: 30,
//   },
//   selectedClass: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 14,
//     color: '#333',
//   },
//   label: { fontSize: 14, fontWeight: '600', marginTop: 10, color: '#333' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 14,
//     marginTop: 8,
//     backgroundColor: '#fff',
//     fontSize: 16,
//   },
//   textArea: { height: 100, textAlignVertical: 'top' },
//   pickerContainer: {
//     marginTop: 8,
//     zIndex: 10,
//   },
//   dropdownButton: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 14,
//     height: 50,
//   },
//   dropdownText: {
//     color: '#333',
//     fontSize: 16,
//   },
//   dropdownIcon: {
//     color: '#999',
//     fontSize: 12,
//   },
//   iconRotated: {},
//   subjectListContainer: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     marginTop: 5,
//     maxHeight: 150,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     overflow: 'hidden',
//   },
//   subjectItem: {
//     padding: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     backgroundColor: '#fff',
//   },
//   subjectItemSelected: {
//     backgroundColor: '#e0f0d9',
//   },
//   subjectItemText: {
//     color: '#333',
//     fontSize: 16,
//   },
//   subjectTextSelected: {
//     color: '#86b952',
//     fontWeight: 'bold',
//   },
//   dateButton: {
//     backgroundColor: '#e0f0d9',
//     borderRadius: 10,
//     marginTop: 8,
//     alignItems: 'center',
//     padding: 12,
//   },
//   dateText: { color: '#333', fontWeight: '600' },
//   pdfButton: {
//     backgroundColor: '#d1e7c2',
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   pdfButtonText: { color: '#333', fontWeight: '600' },
//   submitButton: {
//     backgroundColor: '#86b952',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   disabledButton: {
//     backgroundColor: '#ccc',
//   },
//   submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
//   changeClass: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
//   changeClassText: { color: '#86b952', fontWeight: '600' },
// });

import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import { pick, types, isCancel } from '@react-native-documents/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import { useUser } from '../../context/UserContext';
import CustomDatePicker from '../../components/CustomeDatePicker';
import { BASEURL } from '../../appurls';

const ClassCard = memo(({ item, active, onSelect }) => (
  <TouchableOpacity
    style={[styles.classCard, active && styles.classActive]}
    onPress={() => onSelect(item)}
  >
    <Text style={styles.className}>{item.name}</Text>
    <Text style={styles.classSub}>
      {item.standard_name} - {item.section_name}
    </Text>
    <Text style={styles.classSub}>{item.branch_name}</Text>
  </TouchableOpacity>
));

const Homework = () => {
  const { token, appUser } = useUser();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/api/common/classrooms-staff/`,
        {
          params: { staff_id: appUser?.id },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setClasses(response.data?.results || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [appUser?.id, token]);

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const response = await axios.get(`${BASEURL}/api/common/subjects/`, {
        params: { school_id: appUser?.school_id },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(response.data?.results || response.data || []);
    } catch (error) {
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, [appUser?.school_id, token]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
      setSelectedSubject(null);
      setShowSubjectDropdown(false);
    }
  }, [selectedClass, fetchSubjects]);

  const pickPdf = useCallback(async () => {
    try {
      // Using the new @react-native-documents/picker API
      const result = await pick({
        type: [types.pdf],
      });
      setPdfFile(result);
    } catch (error) {
      if (!isCancel(error)) {
        Alert.alert('Error', 'Failed to pick PDF');
      }
    }
  }, []);

  const onChangeDate = useCallback(
    (event, selectedDate) => {
      const currentDate = selectedDate || dueDate;
      setShowDatePicker(Platform.OS === 'ios');
      setDueDate(currentDate);
    },
    [dueDate],
  );

  const handleSubjectSelect = useCallback(subject => {
    setSelectedSubject(subject);
    setShowSubjectDropdown(false);
  }, []);

  const submitHomework = useCallback(async () => {
    if (submitting) return;

    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Data', 'Enter title and handbook');
      return;
    }

    if (!selectedClass) {
      Alert.alert('Select Class', 'Please select a class');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('classroom', selectedClass.id);
    formData.append('teacher', appUser.id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('due_date', dueDate.toISOString().split('T')[0]);

    if (selectedSubject) {
      formData.append('subject', selectedSubject.id);
    }

    if (pdfFile && pdfFile.length > 0) {
      let localUri = pdfFile[0].uri;
      let filename = pdfFile[0].name || localUri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `application/${match[1]}` : 'application/pdf';

      formData.append('attachment', {
        uri: localUri,
        name: filename,
        type: type,
      });
    }

    try {
      await axios.post(`${BASEURL}/api/homework/homework/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Handbook Added', `Handbook added for ${selectedClass.name}`);

      setTitle('');
      setDescription('');
      setSelectedSubject(null);
      setSelectedClass(null);
      setPdfFile(null);
      setDueDate(new Date());
    } catch (error) {
      Alert.alert('Error', 'Failed to submit handbook');
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    title,
    description,
    selectedClass,
    appUser,
    dueDate,
    selectedSubject,
    pdfFile,
    token,
  ]);

  const renderClassItem = useCallback(
    ({ item }) => (
      <ClassCard
        item={item}
        active={selectedClass?.id === item.id}
        onSelect={setSelectedClass}
      />
    ),
    [selectedClass],
  );

  const handleChangeClass = useCallback(() => {
    setSelectedClass(null);
    setSelectedSubject(null);
  }, []);

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Add Handbook</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#86b952" />
        </View>
      ) : !selectedClass ? (
        <FlatList
          data={classes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderClassItem}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Select Class</Text>
          }
        />
      ) : (
        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.selectedClass}>{selectedClass.name}</Text>

          <Text style={styles.label}>Handbook Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Subject</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
            >
              <Text style={styles.dropdownText}>
                {selectedSubject ? selectedSubject.name : 'Select Subject'}
              </Text>
              <Text
                style={[
                  styles.dropdownIcon,
                  showSubjectDropdown && styles.iconRotated,
                ]}
              >
                {showSubjectDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showSubjectDropdown && (
              <View style={styles.subjectListContainer}>
                {loadingSubjects ? (
                  <ActivityIndicator
                    size="small"
                    color="#86b952"
                    style={{ padding: 10 }}
                  />
                ) : (
                  <ScrollView
                    nestedScrollEnabled={true}
                    style={{ maxHeight: 150 }}
                  >
                    {subjects.length > 0 ? (
                      subjects.map(sub => (
                        <TouchableOpacity
                          key={sub.id}
                          style={[
                            styles.subjectItem,
                            selectedSubject?.id === sub.id &&
                              styles.subjectItemSelected,
                          ]}
                          onPress={() => handleSubjectSelect(sub)}
                        >
                          <Text
                            style={[
                              styles.subjectItemText,
                              selectedSubject?.id === sub.id &&
                                styles.subjectTextSelected,
                            ]}
                          >
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.subjectItemText}>
                        No subjects found
                      </Text>
                    )}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          <Text style={styles.label}>Handbook Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter handbook"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity style={styles.dateButton}>
            <CustomDatePicker date={dueDate} setDate={setDueDate} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.pdfButton} onPress={pickPdf}>
            <Text style={styles.pdfButtonText}>
              {pdfFile && pdfFile.length > 0
                ? `Selected: ${pdfFile[0]?.name}`
                : 'Attach PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={submitHomework}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit Handbook</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeClass}
            onPress={handleChangeClass}
            disabled={submitting}
          >
            <Text style={styles.changeClassText}>Change Class</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

export default Homework;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  title: { fontSize: 20, fontWeight: '600', marginLeft: 15, color: '#86b952' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 10,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  classActive: { borderWidth: 2, borderColor: '#86b952' },
  className: { fontSize: 16, fontWeight: '700', color: '#333' },
  classSub: { fontSize: 13, color: '#777', marginTop: 2 },
  formScrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  selectedClass: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    color: '#333',
  },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: {
    marginTop: 8,
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    height: 50,
  },
  dropdownText: {
    color: '#333',
    fontSize: 16,
  },
  dropdownIcon: {
    color: '#999',
    fontSize: 12,
  },
  iconRotated: {},
  subjectListContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  subjectItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  subjectItemSelected: {
    backgroundColor: '#e0f0d9',
  },
  subjectItemText: {
    color: '#333',
    fontSize: 16,
  },
  subjectTextSelected: {
    color: '#86b952',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#e0f0d9',
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
    padding: 12,
  },
  dateText: { color: '#333', fontWeight: '600' },
  pdfButton: {
    backgroundColor: '#d1e7c2',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  pdfButtonText: { color: '#333', fontWeight: '600' },
  submitButton: {
    backgroundColor: '#86b952',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  changeClass: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
  changeClassText: { color: '#86b952', fontWeight: '600' },
});
