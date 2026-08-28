// import React, { useState, useEffect, useCallback, memo } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   FlatList,
// } from 'react-native';
// import TopBar from '../../components/ParentTobBar';
// import BackButton from '../../components/BackButton';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { useUser } from '../../context/UserContext';
// import { BASEURL } from '../../appurls';
// import axios from 'axios';
// import { Checkbox } from 'react-native-paper';
// import { ChevronUp, ChevronDown } from 'lucide-react-native';

// const ActivityItem = memo(
//   ({
//     item,
//     index,
//     formData,
//     handleUpdate,
//     openItems,
//     toggleOpen,
//     isSubActivity,
//     submitMainActivity,
//   }) => {
//     const isOpen = openItems[item.id];

//     return (
//       <View style={styles.cardContent}>
//         <View style={styles.infoContainer}>
//           {item.is_have_sub_activity ? (
//             isOpen ? (
//               <View
//                 style={[styles.flipContainerSubActivity, { marginTop: 10 }]}
//               >
//                 <View
//                   style={[
//                     styles.flipContainerRowSubActivity,
//                     { marginTop: 10 },
//                   ]}
//                 >
//                   <Text style={styles.subActivityName} numberOfLines={1}>
//                     {`${index + 1}.${item.name}`}
//                   </Text>
//                   <TouchableOpacity onPress={() => toggleOpen(item.id)}>
//                     {isOpen ? (
//                       <ChevronUp size={24} color="white" />
//                     ) : (
//                       <ChevronDown size={24} color="white" />
//                     )}
//                   </TouchableOpacity>
//                 </View>

//                 {item.response_type === 'option' ? (
//                   <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//                     {item.options.map(opt => {
//                       const currentValues =
//                         formData[item.id] ??
//                         item.recorded_value?.option_ids ??
//                         [];
//                       const isChecked = currentValues.includes(opt.id);

//                       return (
//                         <View
//                           key={opt.order}
//                           style={{
//                             flexDirection: 'row',
//                             alignItems: 'center',
//                             marginRight: 15,
//                           }}
//                         >
//                           <Checkbox
//                             status={isChecked ? 'checked' : 'unchecked'}
//                             onPress={() => {
//                               let newValues;
//                               if (isChecked) {
//                                 newValues = currentValues.filter(
//                                   val => val !== opt.id,
//                                 );
//                               } else {
//                                 newValues = [...currentValues, opt.id];
//                               }
//                               handleUpdate(item.id, newValues, item.plan_id);
//                             }}
//                           />
//                           <Text style={{ marginLeft: 8 }}>{opt.label}</Text>
//                         </View>
//                       );
//                     })}
//                   </View>
//                 ) : item.response_type === 'check_box' ? (
//                   <Checkbox
//                     status={
//                       formData[item.id] ??
//                       item.recorded_value?.is_completed === true
//                         ? 'checked'
//                         : 'unchecked'
//                     }
//                     onPress={() =>
//                       handleUpdate(item.id, !formData[item.id], item.plan_id)
//                     }
//                   />
//                 ) : (
//                   <TextInput
//                     style={styles.logInputStyle}
//                     placeholder="Enter details..."
//                     placeholderTextColor="#ccc"
//                     value={String(
//                       formData[item.id] ??
//                         item.recorded_value?.text ??
//                         item.recorded_value?.number ??
//                         '',
//                     )}
//                     onChangeText={text =>
//                       handleUpdate(item.id, text, item.plan_id)
//                     }
//                   />
//                 )}

//                 <View style={{ alignItems: 'flex-end' }}>
//                   <TouchableOpacity
//                     style={{
//                       backgroundColor: 'white',
//                       paddingHorizontal: 20,
//                       paddingVertical: 8,
//                       borderRadius: 5,
//                     }}
//                     onPress={() =>
//                       submitMainActivity(
//                         item.id,
//                         item.plan_id,
//                         formData[item.id],
//                         isSubActivity,
//                       )
//                     }
//                   >
//                     <Text style={{ color: '#86b952' }}>submit</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ) : (
//               <View style={[styles.flipContainer, { marginTop: 10 }]}>
//                 <Text style={styles.subActivityName} numberOfLines={1}>
//                   {`${index + 1}.${item.name}`}
//                 </Text>
//                 <TouchableOpacity onPress={() => toggleOpen(item.id)}>
//                   {isOpen ? (
//                     <ChevronUp size={24} color="white" />
//                   ) : (
//                     <ChevronDown size={24} color="white" />
//                   )}
//                 </TouchableOpacity>
//               </View>
//             )
//           ) : (
//             <View
//               style={{
//                 borderColor: '#b8e18f',
//                 borderWidth: 1,
//                 padding: 20,
//                 borderRadius: 8,
//                 marginTop: 10,
//               }}
//             >
//               <Text style={styles.activityName} numberOfLines={1}>
//                 {`${index + 1}.${item.name}`}
//               </Text>
//               {item.response_type === 'option' ? (
//                 <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//                   {item.options.map(opt => {
//                     const currentValues =
//                       formData[item.id] ??
//                       item.recorded_value?.option_ids ??
//                       [];
//                     const isChecked = currentValues.includes(opt.id);

//                     return (
//                       <View
//                         key={opt.order}
//                         style={{
//                           flexDirection: 'row',
//                           alignItems: 'center',
//                           marginRight: 15,
//                         }}
//                       >
//                         <Checkbox
//                           status={isChecked ? 'checked' : 'unchecked'}
//                           onPress={() => {
//                             let newValues;
//                             if (isChecked) {
//                               newValues = currentValues.filter(
//                                 val => val !== opt.id,
//                               );
//                             } else {
//                               newValues = [...currentValues, opt.id];
//                             }
//                             handleUpdate(item.id, newValues, item.plan_id);
//                           }}
//                         />
//                         <Text style={{ marginLeft: 8 }}>{opt.label}</Text>
//                       </View>
//                     );
//                   })}
//                 </View>
//               ) : item.response_type === 'check_box' ? (
//                 <Checkbox
//                   status={
//                     formData[item.id] ??
//                     item.recorded_value?.is_completed === true
//                       ? 'checked'
//                       : 'unchecked'
//                   }
//                   onPress={() =>
//                     handleUpdate(item.id, !formData[item.id], item.plan_id)
//                   }
//                 />
//               ) : (
//                 <TextInput
//                   style={styles.logInputStyle}
//                   placeholder="Enter details..."
//                   value={String(
//                     formData[item.id] ??
//                       item.recorded_value?.text ??
//                       item.recorded_value?.number ??
//                       '',
//                   )}
//                   onChangeText={text =>
//                     handleUpdate(item.id, text, item.plan_id)
//                   }
//                 />
//               )}
//               <View style={{ alignItems: 'flex-end' }}>
//                 <TouchableOpacity
//                   style={{
//                     backgroundColor: '#86b952',
//                     paddingHorizontal: 20,
//                     paddingVertical: 8,
//                     borderRadius: 5,
//                   }}
//                   onPress={() =>
//                     submitMainActivity(
//                       item.id,
//                       item.plan_id,
//                       formData[item.id],
//                       isSubActivity,
//                     )
//                   }
//                 >
//                   <Text style={{ color: 'white' }}>submit</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {isOpen && item.is_have_sub_activity && (
//             <View style={{ marginLeft: 10, marginTop: 10 }}>
//               <FlatList
//                 data={item.sub_activities}
//                 renderItem={({ item: subItem, index: subIndex }) => (
//                   <ActivityItem
//                     item={subItem}
//                     index={subIndex}
//                     formData={formData}
//                     handleUpdate={handleUpdate}
//                     openItems={openItems}
//                     toggleOpen={toggleOpen}
//                     isSubActivity={true}
//                     submitMainActivity={submitMainActivity}
//                   />
//                 )}
//                 keyExtractor={subItem => subItem.id.toString()}
//               />
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   },
// );

// const ActivityRow = memo(
//   ({
//     item,
//     index,
//     formData,
//     handleUpdate,
//     openItems,
//     toggleOpen,
//     submitMainActivity,
//   }) => {
//     const [isCategoryOpen, setIsCategoryOpen] = useState(false);

//     return (
//       <View style={styles.cardContent}>
//         <View style={styles.infoContainer}>
//           <View style={styles.flipContainer}>
//             <Text
//               style={[styles.subActivityName, { flex: 1 }]}
//               numberOfLines={1}
//             >
//               {`${index + 1}.${item.name}`}
//             </Text>
//             <TouchableOpacity
//               onPress={() => setIsCategoryOpen(!isCategoryOpen)}
//             >
//               {isCategoryOpen ? (
//                 <ChevronUp size={24} color="white" />
//               ) : (
//                 <ChevronDown size={24} color="white" />
//               )}
//             </TouchableOpacity>
//           </View>

//           {isCategoryOpen && (
//             <View style={styles.listContent}>
//               {item.activities.map((subItem, subIndex) => (
//                 <ActivityItem
//                   key={subItem.id.toString()}
//                   item={subItem}
//                   index={subIndex}
//                   formData={formData}
//                   handleUpdate={handleUpdate}
//                   openItems={openItems}
//                   toggleOpen={toggleOpen}
//                   isSubActivity={false}
//                   submitMainActivity={submitMainActivity}
//                 />
//               ))}
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   },
// );

// const RecordOfWorkForm = () => {
//   const route = useRoute();
//   const { studentId, studentName } = route.params;
//   const [studentActivity, setStudentActivity] = useState([]);
//   const { appUser, token } = useUser();

//   const [formData, setFormData] = useState({});
//   const [openItems, setOpenItems] = useState({});

//   const navigation = useNavigation();

//   const fetchStudentActivity = useCallback(async () => {
//     try {
//       const now = new Date();
//       const currentYear = now.getFullYear();
//       const currentMonth = now.getMonth() + 1;
//       const res = await axios.get(
//         `${BASEURL}/api/curriculum/work-plan/student/${studentId}/?month=${currentMonth}&year=${currentYear}`,
//         {
//           params: { class_id: appUser?.class_id },
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );

//       const filteredData = res.data
//         .map(category => ({
//           ...category,
//           activities: category.activities.filter(
//             act => act.status !== 'pending_approval',
//           ),
//         }))
//         .filter(category => category.activities.length > 0);

//       setStudentActivity(filteredData);
//     } catch (e) {
//       Alert.alert('Error', 'Failed to load activities');
//     }
//   }, [studentId, appUser, token]);

//   const submitMainActivity = useCallback(
//     async (id, workId, value, isSubActivity) => {
//       try {
//         let payload = {};

//         if (Array.isArray(value)) {
//           payload = {
//             work_record_id: Number(workId),
//             is_completed: value.length > 0,
//             [isSubActivity ? 'sub_activity_id' : 'activity_id']: Number(id),
//             selected_option_ids: value,
//           };
//         } else if (typeof value === 'boolean') {
//           payload = {
//             work_record_id: Number(workId),
//             is_completed: value,
//             [isSubActivity ? 'sub_activity_id' : 'activity_id']: Number(id),
//           };
//         } else {
//           const isOnlyNumbers = val => !isNaN(val) && val.trim() !== '';
//           let finalNumberValue = null;
//           let finalTextValue = null;

//           if (typeof value === 'string') {
//             if (isOnlyNumbers(value)) {
//               finalNumberValue = Number(value);
//             } else {
//               finalTextValue = value;
//             }
//           }

//           payload = {
//             work_record_id: Number(workId),
//             is_completed: value.length > 0,
//             [isSubActivity ? 'sub_activity_id' : 'activity_id']: Number(id),
//             number_value: finalNumberValue,
//             text_value: finalTextValue,
//           };
//         }

//         await axios.post(
//           `${BASEURL}/api/curriculum/student-response/save/`,
//           payload,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           },
//         );

//         Alert.alert('Success', 'Form submitted');

//         await fetchStudentActivity();

//         setFormData(prev => {
//           const newState = { ...prev };
//           delete newState[id];
//           return newState;
//         });
//       } catch (e) {
//         console.log('data', e);

//         Alert.alert('Error', 'Something went wrong while saving.');

//         Alert.alert('Error', 'Failed to save activity');
//       }
//     },
//     [token, fetchStudentActivity],
//   );

//   useEffect(() => {
//     if (!appUser) return;
//     fetchStudentActivity();
//   }, [appUser, fetchStudentActivity]);

//   const handleUpdate = useCallback((id, value, workId) => {
//     setFormData(prev => ({ ...prev, [id]: value }));
//   }, []);

//   const toggleOpen = useCallback(id => {
//     setOpenItems(prev => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   }, []);

//   const renderActivityList = useCallback(
//     ({ item, index }) => (
//       <ActivityRow
//         item={item}
//         index={index}
//         formData={formData}
//         handleUpdate={handleUpdate}
//         openItems={openItems}
//         toggleOpen={toggleOpen}
//         submitMainActivity={submitMainActivity}
//       />
//     ),
//     [formData, handleUpdate, openItems, toggleOpen, submitMainActivity],
//   );

//   return (
//     <View style={{ flex: 1, backgroundColor: 'white' }}>
//       <TopBar />
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           paddingHorizontal: 10,
//           paddingVertical: 10,
//         }}
//       >
//         <BackButton />
//         <Text
//           style={{
//             fontSize: 18,
//             fontWeight: '800',
//             color: '#1A1A1A',
//             marginBottom: 4,
//             flex: 1,
//             textAlign: 'center',
//             marginRight: 40,
//           }}
//           numberOfLines={1}
//         >
//           {studentName}
//         </Text>
//       </View>

//       <FlatList
//         data={studentActivity}
//         renderItem={renderActivityList}
//         keyExtractor={item => item.id.toString()}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>
//             No activities found in this class
//           </Text>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   flipContainerRowSubActivity: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   flipContainerSubActivity: {
//     padding: 20,
//     backgroundColor: '#86b952',
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   flipContainer: {
//     padding: 20,
//     backgroundColor: '#86b952',
//     borderRadius: 12,
//     marginBottom: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   subActivityName: {
//     fontSize: 16,
//     color: '#F8F9FF',
//     fontWeight: '600',
//   },
//   activityName: {
//     fontSize: 16,
//     color: '#1a1a1a',
//     fontWeight: '600',
//     marginVertical: 20,
//   },
//   logInputStyle: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1a1a1a',
//     padding: 8,
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
//     marginHorizontal: 20,
//     marginVertical: 5,
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
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//     justifyContent: 'flex-end',
//   },
//   bottomSheet: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     height: '95%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 24,
//     elevation: 20,
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
//   },
//   healthList: {
//     flex: 1,
//   },
//   healthRecord: {
//     backgroundColor: '#F8FAFC',
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: '#86b952',
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

// export default RecordOfWorkForm;

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { BASEURL } from '../../appurls';
import axios from 'axios';
import { ChevronUp, ChevronDown, Check } from 'lucide-react-native';

/* ------------------------------------------------------------------
   Custom Checkbox (replaces react-native-paper Checkbox — always
   shows the check icon correctly and matches your green theme)
------------------------------------------------------------------- */
const CheckBox = ({ checked, onPress, label }) => (
  <TouchableOpacity
    style={styles.checkboxRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
      {checked ? <Check size={16} color="#fff" strokeWidth={3.5} /> : null}
    </View>
    {label ? <Text style={styles.checkboxLabel}>{label}</Text> : null}
  </TouchableOpacity>
);

/* ------------------------------------------------------------------
   Shared response block (options / checkbox / text) — used for both
   main activities and sub activities so the UI is consistent
------------------------------------------------------------------- */
const ActivityResponse = memo(
  ({ item, formData, handleUpdate, isSubActivity, submitMainActivity }) => {
    const workId = item.plan_id;

    // Always resolve a real value — never undefined (fixes the crash)
    const submitValue =
      item.response_type === 'option'
        ? formData[item.id] ?? item.recorded_value?.option_ids ?? []
        : item.response_type === 'check_box'
        ? formData[item.id] ?? item.recorded_value?.is_completed ?? false
        : formData[item.id] ??
          item.recorded_value?.text ??
          item.recorded_value?.number ??
          '';

    const renderSubmit = () => (
      <View style={styles.submitRow}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() =>
            submitMainActivity(item.id, workId, submitValue, isSubActivity)
          }
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    );

    // ---- option type (multi checkbox) ----
    if (item.response_type === 'option') {
      const currentValues =
        formData[item.id] ?? item.recorded_value?.option_ids ?? [];

      const toggleOption = optionId => {
        const next = currentValues.includes(optionId)
          ? currentValues.filter(v => v !== optionId)
          : [...currentValues, optionId];
        handleUpdate(item.id, next, workId);
      };

      return (
        <View>
          <View style={styles.optionsWrapper}>
            {(item.options ?? []).map(opt => (
              <CheckBox
                key={String(opt.id ?? opt.order)}
                checked={currentValues.includes(opt.id)}
                onPress={() => toggleOption(opt.id)}
                label={opt.label}
              />
            ))}
          </View>
          {renderSubmit()}
        </View>
      );
    }

    // ---- check_box type ----
    if (item.response_type === 'check_box') {
      const isChecked =
        formData[item.id] ?? item.recorded_value?.is_completed ?? false;

      return (
        <View>
          <CheckBox
            checked={isChecked}
            onPress={() => handleUpdate(item.id, !isChecked, workId)}
          />
          {renderSubmit()}
        </View>
      );
    }

    // ---- text / number type ----
    const textValue =
      formData[item.id] ??
      item.recorded_value?.text ??
      item.recorded_value?.number ??
      '';

    return (
      <View>
        <TextInput
          style={styles.logInputStyle}
          placeholder="Enter details..."
          placeholderTextColor="#aaa"
          value={String(textValue ?? '')}
          onChangeText={text => handleUpdate(item.id, text, workId)}
        />
        {renderSubmit()}
      </View>
    );
  },
);

const ActivityItem = memo(
  ({
    item,
    index,
    formData,
    handleUpdate,
    openItems,
    toggleOpen,
    isSubActivity,
    submitMainActivity,
  }) => {
    const isOpen = !!openItems[item.id];
    const Chevron = isOpen ? ChevronUp : ChevronDown;
    const hasSub = !!item.is_have_sub_activity;

    // ---- activity WITH sub activities (green collapsible header) ----
    if (hasSub) {
      return (
        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={styles.flipContainerSubActivity}
            onPress={() => toggleOpen(item.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.subActivityName, { flex: 1 }]}
              numberOfLines={1}
            >
              {`${index + 1}. ${item.name}`}
            </Text>
            <Chevron size={22} color="#fff" />
          </TouchableOpacity>

          {isOpen && (
            <View style={styles.subActivityBody}>
              <View style={styles.responseCard}>
                <ActivityResponse
                  item={item}
                  formData={formData}
                  handleUpdate={handleUpdate}
                  isSubActivity={isSubActivity}
                  submitMainActivity={submitMainActivity}
                />
              </View>

              {/* nested sub activities — .map() instead of nested FlatList */}
              {(item.sub_activities ?? []).map((subItem, subIndex) => (
                <ActivityItem
                  key={subItem.id.toString()}
                  item={subItem}
                  index={subIndex}
                  formData={formData}
                  handleUpdate={handleUpdate}
                  openItems={openItems}
                  toggleOpen={toggleOpen}
                  isSubActivity={true}
                  submitMainActivity={submitMainActivity}
                />
              ))}
            </View>
          )}
        </View>
      );
    }

    // ---- plain activity (no sub activities) ----
    return (
      <View style={styles.plainActivityCard}>
        <Text style={styles.activityName} numberOfLines={2}>
          {`${index + 1}. ${item.name}`}
        </Text>
        <ActivityResponse
          item={item}
          formData={formData}
          handleUpdate={handleUpdate}
          isSubActivity={isSubActivity}
          submitMainActivity={submitMainActivity}
        />
      </View>
    );
  },
);

const ActivityRow = memo(
  ({
    item,
    index,
    formData,
    handleUpdate,
    openItems,
    toggleOpen,
    submitMainActivity,
  }) => {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const Chevron = isCategoryOpen ? ChevronUp : ChevronDown;

    return (
      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={styles.flipContainer}
            onPress={() => setIsCategoryOpen(!isCategoryOpen)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.subActivityName, { flex: 1 }]}
              numberOfLines={1}
            >
              {`${index + 1}. ${item.name}`}
            </Text>
            <Chevron size={22} color="#fff" />
          </TouchableOpacity>

          {isCategoryOpen && (
            <View>
              {(item.activities ?? []).map((subItem, subIndex) => (
                <ActivityItem
                  key={subItem.id.toString()}
                  item={subItem}
                  index={subIndex}
                  formData={formData}
                  handleUpdate={handleUpdate}
                  openItems={openItems}
                  toggleOpen={toggleOpen}
                  isSubActivity={false}
                  submitMainActivity={submitMainActivity}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  },
);

const RecordOfWorkForm = () => {
  const route = useRoute();
  const { studentId, studentName } = route.params;
  const [studentActivity, setStudentActivity] = useState([]);
  const { appUser, token } = useUser();

  const [formData, setFormData] = useState({});
  const [openItems, setOpenItems] = useState({});

  const navigation = useNavigation();

  const fetchStudentActivity = useCallback(async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const res = await axios.get(
        `${BASEURL}/api/curriculum/work-plan/student/${studentId}/?month=${currentMonth}&year=${currentYear}`,
        {
          params: { class_id: appUser?.class_id },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const filteredData = (res.data ?? [])
        .map(category => ({
          ...category,
          activities: (category.activities ?? []).filter(
            act => act.status !== 'pending_approval',
          ),
        }))
        .filter(category => category.activities.length > 0);

      setStudentActivity(filteredData);
    } catch (e) {
      console.log('fetch error:', e?.response?.data ?? e.message);
      Alert.alert('Error', 'Failed to load activities');
    }
  }, [studentId, appUser, token]);

  const submitMainActivity = useCallback(
    async (id, workId, value, isSubActivity) => {
      try {
        const idField = isSubActivity ? 'sub_activity_id' : 'activity_id';
        let payload = {};

        if (Array.isArray(value)) {
          // ---- option type ----
          payload = {
            work_record_id: Number(workId),
            is_completed: value.length > 0,
            [idField]: Number(id),
            selected_option_ids: value,
          };
        } else if (typeof value === 'boolean') {
          // ---- check_box type ----
          payload = {
            work_record_id: Number(workId),
            is_completed: value,
            [idField]: Number(id),
          };
        } else {
          // ---- text / number type ----
          // value can be undefined — normalize BEFORE calling .length/.trim()
          const text =
            value === null || value === undefined ? '' : String(value);
          const isOnlyNumbers = text.trim() !== '' && !isNaN(text);

          payload = {
            work_record_id: Number(workId),
            is_completed: text.trim().length > 0,
            [idField]: Number(id),
            number_value: isOnlyNumbers ? Number(text) : null,
            text_value: !isOnlyNumbers && text.trim() !== '' ? text : null,
          };
        }

        await axios.post(
          `${BASEURL}/api/curriculum/student-response/save/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        Alert.alert('Success', 'Form submitted');

        await fetchStudentActivity();

        setFormData(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch (e) {
        console.log('submit error:', e?.response?.data ?? e.message);
        Alert.alert('Error', 'Something went wrong while saving.');
      }
    },
    [token, fetchStudentActivity],
  );

  useEffect(() => {
    if (!appUser) return;
    fetchStudentActivity();
  }, [appUser, fetchStudentActivity]);

  const handleUpdate = useCallback((id, value, workId) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }, []);

  const toggleOpen = useCallback(id => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const renderActivityList = useCallback(
    ({ item, index }) => (
      <ActivityRow
        item={item}
        index={index}
        formData={formData}
        handleUpdate={handleUpdate}
        openItems={openItems}
        toggleOpen={toggleOpen}
        submitMainActivity={submitMainActivity}
      />
    ),
    [formData, handleUpdate, openItems, toggleOpen, submitMainActivity],
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <TopBar />
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
            flex: 1,
            textAlign: 'center',
            marginRight: 40,
          }}
          numberOfLines={1}
        >
          {studentName}
        </Text>
      </View>

      <FlatList
        data={studentActivity}
        renderItem={renderActivityList}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No activities found in this class
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    padding: 60,
    fontWeight: '500',
  },

  // headers
  flipContainer: {
    padding: 16,
    backgroundColor: '#86b952',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flipContainerSubActivity: {
    padding: 16,
    backgroundColor: '#86b952',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subActivityName: {
    fontSize: 16,
    color: '#F8F9FF',
    fontWeight: '600',
  },
  subActivityBody: {
    marginTop: 10,
    marginLeft: 6,
  },
  plainActivityCard: {
    borderColor: '#b8e18f',
    borderWidth: 1,
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  responseCard: {
    borderColor: '#b8e18f',
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  activityName: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: 10,
  },
  logInputStyle: {
    fontSize: 16,
    color: '#1a1a1a',
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 10,
    height: 48,
    backgroundColor: '#fafafa',
  },

  // custom checkboxes
  optionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 10,
    paddingVertical: 2,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#86b952',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#86b952',
    borderColor: '#86b952',
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#1a1a1a',
    flexShrink: 1,
  },

  // submit button
  submitRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: '#86b952',
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default RecordOfWorkForm;
