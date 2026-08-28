import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import dayjs from 'dayjs';
import { BASEURL } from '../../appurls';
import { Search, X } from 'lucide-react-native';

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

const HealthItem = memo(({ item }) => (
  <View style={styles.healthRecord}>
    <View style={styles.healthRow}>
      <Text style={styles.healthLabel}>Height:</Text>
      <Text style={styles.healthValue}>{item.height} cm</Text>
    </View>
    <View style={styles.healthRow}>
      <Text style={styles.healthLabel}>Weight:</Text>
      <Text style={styles.healthValue}>{item.weight} kg</Text>
    </View>
    <View style={styles.healthRow}>
      <Text style={styles.healthLabel}>Blood group:</Text>
      <Text style={styles.healthValue}>{item.blood_group}</Text>
    </View>
    <View style={styles.healthRow}>
      <Text style={styles.healthLabel}>BMI:</Text>
      <Text style={[styles.healthValue, styles.bmiValue]}>
        {item.bmi} {item.bmi_status || ''}
      </Text>
    </View>
    <Text style={styles.healthDate}>
      Checkup: {new Date(item.checkup_date).toLocaleDateString()} |
    </Text>
  </View>
));

const UpdateHealth = () => {
  const { appUser, token } = useUser();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [healthData, setHealthData] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [shoeField, setShowField] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [height, setHeight] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [weight, setWeight] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const API_BASE_URL = `${BASEURL}/api/parent`;

  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API_BASE_URL}/classroom-student-list/`, {
        params: { class_id: appUser?.class_id },
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  }, [API_BASE_URL, appUser?.class_id, token]);

  const fetchHealthData = useCallback(
    async studentId => {
      try {
        setLoadingHealth(true);
        const response = await fetch(
          `${BASEURL}/api/parent/health-update/?student_id=${parseInt(
            studentId,
          )}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        setHealthStatus(data.status);
        setHealthData(data.results || []);
      } catch (error) {
      } finally {
        setLoadingHealth(false);
      }
    },
    [BASEURL, token],
  );

  const submitHealthUpdate = useCallback(async () => {
    if (!height || !weight) {
      Alert.alert('Error', 'Please fill height and weight');
      return;
    }

    try {
      setLoadingSubmit(true);
      await axios.post(
        `${API_BASE_URL}/health-update/`,
        {
          student: selectedStudent.student,
          height: parseFloat(height),
          weight: parseFloat(weight),
          classroom: selectedStudent.classroom,
          checkup_date: dayjs().format('YYYY-MM-DD'),
          branch: appUser?.branch_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      Alert.alert('Success', 'Health data updated successfully');
      setHeight('');
      setWeight('');
      setShowModal(false);
      fetchHealthData(selectedStudent.student);
    } catch (e) {
      setHeight('');
      setWeight('');
      setShowModal(false);
      Alert.alert('Error', 'Failed to update health data');
    } finally {
      setLoadingSubmit(false);
    }
  }, [
    API_BASE_URL,
    height,
    weight,
    selectedStudent,
    appUser?.branch_id,
    token,
    fetchHealthData,
  ]);

  useEffect(() => {
    if (selectedStudent?.student) {
      fetchHealthData(selectedStudent.student);
    }
  }, [selectedStudent, fetchHealthData]);

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
          fetchHealthData(item.student);
          setSelectedStudent(item);
          setShowModal(true);
        }}
      />
    ),
    [fetchHealthData],
  );

  const renderHealthItem = useCallback(
    ({ item }) => <HealthItem item={item} />,
    [],
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
      <View style={styles.searchContainer}>
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

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
          setLoadingSubmit(false);
          setHeight(null);
          setWeight(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {selectedStudent?.student_name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  setLoadingSubmit(false);
                  setHeight(null);
                  setWeight(null);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {healthStatus ? (
                <></>
              ) : (
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Update Health Data</Text>

                  <View style={styles.horizontalInputRow}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Height (cm)</Text>
                      <TextInput
                        style={[styles.input, styles.inputLeft]}
                        value={height}
                        onChangeText={setHeight}
                        placeholder="120.5"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Weight (kg)</Text>
                      <TextInput
                        style={[styles.input, styles.inputRight]}
                        value={weight}
                        onChangeText={setWeight}
                        placeholder="20.5"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.healthSection}>
                <Text style={styles.sectionTitle}>Health Records</Text>
                {loadingHealth ? (
                  <View style={styles.loadingHealthContainer}>
                    <ActivityIndicator size="small" color="#86b952" />
                    <Text style={styles.loadingHealthText}>
                      Loading health data...
                    </Text>
                  </View>
                ) : healthData.length > 0 ? (
                  <FlatList
                    data={healthData.slice(0, 5)}
                    renderItem={renderHealthItem}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    style={styles.healthList}
                  />
                ) : (
                  <View style={styles.noHealthContainer}>
                    <Text style={styles.noHealthText}>
                      No health records found
                    </Text>
                    <Text style={styles.noHealthSubtext}>
                      Add first health record using form above
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              {healthStatus ? (
                <></>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loadingSubmit && styles.disabledButton,
                  ]}
                  onPress={submitHealthUpdate}
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.submitText}>Update Health</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
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
  studentCard: {
    backgroundColor: 'white',
    marginHorizontal: 2,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
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
    paddingHorizontal: 28,
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
    paddingTop: 8,
    backgroundColor: 'white',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
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

export default UpdateHealth;
