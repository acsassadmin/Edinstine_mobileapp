import React, { useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Camera, X } from 'lucide-react-native';
import axios from 'axios';
import { pick, types, isCancel } from '@react-native-documents/picker';
import { useUser } from '../context/UserContext';
import { appUrls } from '../appurls';
import FrontCamera from './FrontCamera';

const CheckInCheckOutCard = memo(({ student, fetchStudents }) => {
  const { appUser, token } = useUser();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const checkInData = student.attendance_data.find(a => a.type === 'check_in');
  const checkOutData = student.attendance_data.find(
    a => a.type === 'check_out',
  );

  const openImagePreview = useCallback(imageUri => {
    setSelectedImage(imageUri);
    setIsImageModalVisible(true);
  }, []);

  const uploadPhoto = useCallback(
    async (photoUri, type) => {
      try {
        const filename = photoUri.split('/').pop();
        const mimeType = 'image/jpeg';
        const uri =
          Platform.OS === 'android' && !photoUri.startsWith('file://')
            ? 'file://' + photoUri
            : photoUri;

        const formData = new FormData();
        formData.append('student', student.student_id);
        formData.append('type', type);
        formData.append('class_id', appUser?.class_id);
        formData.append('photo', { uri, name: filename, type: mimeType });

        await axios.post(appUrls.check_in_check_out, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        fetchStudents();
      } catch (error) {
        Alert.alert('Error', `Failed to upload ${type} image`);
      }
    },
    [student.student_id, appUser?.class_id, token, fetchStudents],
  );

  const handleCameraUpload = useCallback(
    (photoUri, type) => {
      uploadPhoto(photoUri, type);
      setIsCameraVisible(false);
    },
    [uploadPhoto],
  );

  const handleGalleryUpload = useCallback(
    async type => {
      try {
        const result = await pick({
          type: [types.images],
        });

        const asset = result[0];
        if (!asset || !asset.uri) {
          Alert.alert('Error', 'No file selected');
          return;
        }

        uploadPhoto(asset.uri, type);
      } catch (error) {
        if (!isCancel(error)) {
          Alert.alert('Error', 'Failed to select photo');
        }
      }
    },
    [uploadPhoto],
  );

  const handleUpload = useCallback(type => {
    setUploadType(type);
    setIsChoiceModalVisible(true);
  }, []);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.studentInfo}>
        <Image
          source={{
            uri: student.profile_image || 'https://via.placeholder.com/150',
          }}
          style={styles.profileImage}
        />
        <Text style={styles.studentName}>{student.name}</Text>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          {checkInData ? (
            <TouchableOpacity
              onPress={() => openImagePreview(checkInData.photo)}
              style={styles.imageContainer}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: checkInData.photo }}
                style={styles.timeImage}
              />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={() => handleUpload('check_in')}>
                <Camera size={40} color="#007bff" />
              </TouchableOpacity>
              <Text style={styles.helperText}>Tap for Check-In</Text>
            </>
          )}
          <Text style={styles.timeLabel}>Check-In</Text>
          <Text style={styles.time}>
            {checkInData
              ? new Date(checkInData.timestamp).toLocaleTimeString()
              : '--:--'}
          </Text>
        </View>

        <View style={styles.timeItem}>
          {checkOutData ? (
            <TouchableOpacity
              onPress={() => openImagePreview(checkOutData.photo)}
              style={styles.imageContainer}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: checkOutData.photo }}
                style={styles.timeImage}
              />
            </TouchableOpacity>
          ) : checkInData ? (
            <>
              <TouchableOpacity onPress={() => handleUpload('check_out')}>
                <Camera size={40} color="#28a745" />
              </TouchableOpacity>
              <Text style={styles.helperText}>Tap for Check-Out</Text>
            </>
          ) : (
            <Camera size={40} color="#aaa" style={{ opacity: 0.3 }} />
          )}
          <Text style={styles.timeLabel}>Check-Out</Text>
          <Text style={styles.time}>
            {checkOutData
              ? new Date(checkOutData.timestamp).toLocaleTimeString()
              : '--:--'}
          </Text>
        </View>
      </View>

      <Modal
        visible={isChoiceModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsChoiceModalVisible(false)}
      >
        <View style={styles.choiceModalOverlay}>
          <View style={styles.choiceModalContainer}>
            <Text style={styles.choiceModalTitle}>Choose an option</Text>

            <TouchableOpacity
              style={styles.choiceButton}
              onPress={() => {
                setIsChoiceModalVisible(false);
                setIsCameraVisible(true);
              }}
            >
              <Camera size={50} color="#007bff" />
              <Text style={styles.choiceButtonText}>Take Picture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsChoiceModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCameraVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsCameraVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <FrontCamera
            onPhotoCaptured={photoUri =>
              handleCameraUpload(photoUri, uploadType)
            }
            onClose={() => setIsCameraVisible(false)}
          />
        </View>
      </Modal>

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalContainer}
            activeOpacity={1}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeImageButton}
            onPress={() => setIsImageModalVisible(false)}
          >
            <X size={32} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
});

export default CheckInCheckOutCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  timeImage: {
    width: 140,
    height: 140,
    marginBottom: 4,
    borderRadius: 8,
  },
  viewImageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  helperText: {
    fontSize: 10,
    color: '#007bff',
    marginTop: 2,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  closeImageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  choiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  choiceModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
});