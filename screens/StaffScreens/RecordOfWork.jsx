import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import { BASEURL } from '../../appurls';
import BackButton from '../../components/BackButton';
import axios from 'axios';

import { Checkbox, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const RecordOfWork = () => {
  const API_BASE_URL = `${BASEURL}/api/parent`;
  const navigation = useNavigation();
  const { appUser, token } = useUser();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentActivity, setStudentActivity] = useState([]);
  const [formData, setFormData] = useState({});

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API_BASE_URL}/classroom-student-list/`, {
        params: { class_id: appUser?.class_id },
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(`Url is : ${API_BASE_URL}/classroom-student-list/`);
      // console.log(`Response Students List : ${res.data}`);

      setStudents(res.data);
      setLoadingStudents(false);
    } catch (e) {
      // console.log('Error fetching students:', e);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentActivity = async () => {
    try {
      const res = await axios.get(
        `${BASEURL}/api/curriculum/school/1/activities/`,
        {
          params: { class_id: appUser?.class_id },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // (`Url is : ${BASEURL}/api/curriculum/school/1/activities/`);
      // coconsole.lognsole.log(`Response Student Activities List : ${res.data}`);

      setStudentActivity(res.data);
    } catch (e) {
      // console.log('Error fetching students:', e);
      Alert.alert('Error', 'Failed to load activities');
    }
  };

  useEffect(() => {
    if (!appUser) return;
    fetchStudents();
    fetchStudentActivity();
  }, [appUser]);

  const renderStudentCard = ({ item }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => {
        setSelectedStudent(item);
        //setShowModal(true);
        navigation.navigate('RecordOfWorkForm', {
          studentId: item.student,
          studentName: item.student_name,
        });
      }}
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
  );

  //update form
  const handleUpdate = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const renderActivityItem = ({ item }) => {
    const currentValue = formData[item.id];
    return (
      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.activityName} numberOfLines={1}>
            {item.name}
          </Text>
          <View>
            {item.response_type === 'option' ? (
              <RadioButton.Group
                onValueChange={newValue => handleUpdate(item.id, newValue)}
                value={formData[item.id]}
              >
                {item.options.map(opt => (
                  <View
                    key={opt.order}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <RadioButton value={opt.label} />
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            ) : item.response_type === 'check_box' ? (
              <Checkbox
                status={formData[item.id] ? 'checked' : 'unchecked'}
                onPress={() => {
                  // Toggle the boolean value in your state
                  handleUpdate(item.id, !formData[item.id]);
                }}
              />
            ) : (
              <TextInput
                style={styles.logInputStyle}
                placeholder="Add Logs"
                keyboardType={item.response_type}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                underlineColorAndroid="transparent"
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderActivityList = ({ item }) => (
    <View style={styles.cardContent}>
      <View style={styles.infoContainer}>
        <Text style={styles.activityName} numberOfLines={1}>
          {item.name}
        </Text>

        <FlatList
          data={item.activities}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No students found in this class
            </Text>
          }
        />
      </View>
    </View>
  );

  if (loadingStudents) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text style={styles.loadingText}>Loading activities...</Text>
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
          Record of Works
        </Text>
      </View>

      <FlatList
        data={students}
        renderItem={renderStudentCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No students found in this class</Text>
        }
      />

      {/*  TALL 95% BOTTOM SHEET: INPUTS FIRST → RECORDS BELOW */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {selectedStudent?.student_name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <FlatList
              data={studentActivity}
              renderItem={renderActivityList}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No students found in this class
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  activityName: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
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
    backgroundColor: '#F8F9FF',
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
    marginHorizontal: 20,
    marginVertical: 5,
  },
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
    justifyContent: 'flex-end',
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
export default RecordOfWork;
