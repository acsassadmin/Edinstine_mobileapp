import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import BackButton from '../../components/BackButton';
import FrontCamera from '../../components/FrontCamera';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import { BASEURL } from '../../appurls';
import { useRoute } from '@react-navigation/native';

/* ============ Health Item ============ */
const HealthItem = memo(({ item }) => (
  <View style={styles.logCard}>
    <Text style={styles.logDate}>
      Date:{' '}
      <Text style={styles.logDateValue}>
        {item.created_at.substring(0, 10)}
      </Text>{' '}
      Time:{' '}
      <Text style={styles.logDateValue}>
        {item.created_at.substring(11, 19)}
      </Text>
    </Text>
    <Text style={styles.logMessage}>{item.message}</Text>
  </View>
));

/* ============ Student Logs Screen ============ */
const StudentLogsList = () => {
  const route = useRoute();
  const { student } = route.params;
  const { appUser, token } = useUser();

  const [logData, setLogData] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [logText, setLogText] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState({ uri: null, type: null });
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  /* ---------- Fetch logs ---------- */
  const fetchStudentsLogData = useCallback(
    async studentId => {
      try {
        setLoadingHealth(true);
        const response = await fetch(
          `${BASEURL}/api/parent/update-student-log/?student_id=${parseInt(
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
        setLogData(data.results || []);
      } catch (error) {
        // silent
      } finally {
        setLoadingHealth(false);
      }
    },
    [BASEURL, token],
  );

  /* ---------- Fetch on mount ---------- */
  useEffect(() => {
    if (student?.student) {
      setLogText(null);
      setCapturedMedia({ uri: null, type: null });
      fetchStudentsLogData(student.student);
    }
  }, [student, fetchStudentsLogData]);

  /* ---------- Camera handlers ---------- */
  const handleCameraUpload = useCallback(photoUri => {
    setCapturedMedia({ uri: photoUri });
    setIsCameraVisible(false);
  }, []);

  /* ---------- Submit log ---------- */
  const submitLogs = useCallback(async () => {
    if (logText === null || logText.trim() === '') {
      Alert.alert('Error', 'Log is empty');
      return;
    }

    try {
      const formData = new FormData();

      if (capturedMedia.uri != null) {
        const filename = capturedMedia.uri.split('/').pop();
        const mimeType = 'image/jpeg';
        const uri =
          Platform.OS === 'android' && !capturedMedia.uri.startsWith('file://')
            ? 'file://' + capturedMedia.uri
            : capturedMedia.uri;
        formData.append('image', { uri, name: filename, type: mimeType });
      }

      formData.append('message', logText);
      formData.append('parent', student.student);
      formData.append('school', appUser?.school_id);
      formData.append('branch', appUser?.branch_id);
      formData.append('classroom', appUser?.class_id);
      formData.append('staff', appUser?.id);

      await axios.post(`${BASEURL}/api/parent/update-student-log/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setCapturedMedia({ uri: null, type: null });
      setLogText(null);
      Alert.alert('Success', 'Log Submitted');

      // Refresh logs after submit
      fetchStudentsLogData(student.student);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload log');
    }
  }, [
    BASEURL,
    capturedMedia,
    logText,
    appUser,
    token,
    student,
    fetchStudentsLogData,
  ]);

  const renderHealthItem = useCallback(
    ({ item }) => <HealthItem item={item} />,
    [],
  );

  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {student?.student_name}
        </Text>
      </View>

      {/* ===== Content ===== */}
      <ScrollView
        style={styles.modalContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>Students Logs</Text>

          {loadingHealth ? (
            <View style={styles.loadingHealthContainer}>
              <ActivityIndicator size="small" color="#86b952" />
              <Text style={styles.loadingHealthText}>
                Loading health data...
              </Text>
            </View>
          ) : (
            <View>
              {/* ===== Log input + actions ===== */}
              <View>
                <TextInput
                  style={styles.logInputStyle}
                  placeholder="Add Logs"
                  value={logText}
                  onChangeText={setLogText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  underlineColorAndroid="transparent"
                  multiline
                />

                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsCameraVisible(true)}
                  >
                    <Text style={styles.cancelText}>
                      {capturedMedia.uri != null ? 'Image Added' : 'Add Image'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={submitLogs}
                  >
                    <Text style={styles.submitText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ===== Logs list (first 5) ===== */}
              <View style={styles.logsList}>
                {logData.slice(0, 5).map((item, index) => (
                  <HealthItem key={index.toString()} item={item} />
                ))}
                {logData.length === 0 && (
                  <Text style={styles.noLogsText}>No logs found</Text>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ===== Camera Modal ===== */}
      <Modal
        visible={isCameraVisible}
        animationType="fade"
        transparent={false}
        presentationStyle="fullScreen"
        onRequestClose={() => setIsCameraVisible(false)}
      >
        <View style={styles.cameraContainer}>
          <FrontCamera
            onPhotoCaptured={handleCameraUpload}
            onClose={() => setIsCameraVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1E1E',
    flex: 1,
    marginLeft: 10,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  healthSection: {
    flex: 1,
    // borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1E1E',
    marginBottom: 20,
  },
  logInputStyle: {
    fontSize: 16,
    color: '#1a1a1a',
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    marginBottom: 20,
    minHeight: 50,
    backgroundColor: '#FAFAFA',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
    paddingBottom: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 18,
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
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#86b952',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  logsList: {
    marginTop: 20,
  },
  noLogsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    padding: 30,
  },
  logCard: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  logDate: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  logDateValue: {
    color: 'green',
  },
  logMessage: {
    color: '#000',
    fontSize: 17,
    marginTop: 10,
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default StudentLogsList;
