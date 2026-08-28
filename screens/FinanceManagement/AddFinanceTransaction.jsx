import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';

import { launchImageLibrary } from 'react-native-image-picker';
import TopBar from '../../components/ParentTobBar';
import axios from 'axios';
import { BASEURL } from '../../appurls';
import dayjs from 'dayjs';
import { useUser } from '../../context/UserContext';
import {
  Upload,
  CheckCircle,
  Trash2,
  Image as ImageIcon,
  FileText,
  Camera,
  X,
} from 'lucide-react-native';
import FrontCamera from '../../components/FrontCamera';
import Header from '../../components/Header';
import { Picker } from '@react-native-picker/picker';

const AddFinanceTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    subCategory: null,
    transaction_type: 'INCOME',
    amount: '',
    description: '',
    created_by: '',
    invoice: null,
  });
  const { appUser, token } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const currentSelection = categories.find(
    c => c.id.toString() === formData.subCategory?.toString(),
  );
  const getCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/api/finance/categories/?branch=${
          appUser?.branch_id
        }&month=${dayjs().format('YYYY-MM')}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          category: response.data[0].id.toString(),
          created_by: appUser?.id?.toString() || '1',
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    }
  }, [appUser?.branch_id, appUser?.id, token]);

  const getFinanceCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/api/finance/finance-sub-category/?branch_id=${appUser?.branch_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCategories(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    }
  }, [appUser?.branch_id, token]);

  useEffect(() => {
    if (token) {
      getCategories();
      getFinanceCategories();
    }
  }, [token, getCategories, getFinanceCategories]);

  const pickFromGallery = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || result.errorCode) {
        setShowFileOptions(false);
        return;
      }

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        setFormData(prev => ({
          ...prev,
          invoice: {
            uri: file.uri,
            name: `image_${Date.now()}.jpg`,
            type: file.type || 'image/jpeg',
            size: file.fileSize || 0,
          },
        }));
      }
      setShowFileOptions(false);
    } catch (error) {
      setShowFileOptions(false);
    }
  }, []);

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      if (result && result[0]) {
        const file = result[0];
        setFormData(prev => ({
          ...prev,
          invoice: {
            uri: file.uri,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
          },
        }));
      }
      setShowFileOptions(false);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        setShowFileOptions(false);
      }
    }
  }, []);

  const takePicture = useCallback(photoUri => {
    setFormData(prev => ({
      ...prev,
      invoice: {
        uri: photoUri,
        name: `receipt_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: 0,
      },
    }));
    setShowCamera(false);
  }, []);

  const removeFile = useCallback(() => {
    setFormData(prev => ({ ...prev, invoice: null }));
  }, []);

  const submitTransaction = useCallback(async () => {
    console.log('form data', formData);

    if (!formData.category || !formData.amount || !formData.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category);
      formDataToSend.append('sub_category', formData.subCategory);
      formDataToSend.append('transaction_type', formData.transaction_type);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('created_by', appUser?.id?.toString() || '1');

      if (formData.invoice) {
        let uploadUri = formData.invoice.uri;

        if (Platform.OS === 'android') {
          if (
            !uploadUri.startsWith('file://') &&
            !uploadUri.startsWith('content://')
          ) {
            uploadUri = 'file://' + uploadUri;
          }
        }

        formDataToSend.append('invoice', {
          uri: uploadUri,
          type: formData.invoice.type || 'image/jpeg',
          name: formData.invoice.name,
        });
      }

      const response = await fetch(
        `${BASEURL}/api/finance/categories/add-transaction/${formData.category}/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      Alert.alert('Success', 'Transaction added successfully!');

      setFormData(prev => ({
        ...prev,
        transaction_type: 'INCOME',
        amount: '',
        description: '',
        invoice: null,
        subCategory: null,
        category: '',
      }));
      setSelectedCategory(null);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  }, [formData, appUser?.id, token]);
  console.log('log data', categories);

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Add Transaction" />

        {/* <View style={styles.inputGroup}> */}
        <Text style={styles.label}>Finance Category *</Text>

        {/* <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={categories}
            dropdownIconColor="#86b952"
            mode="dialog"
            style={{
              height: 55,
              color: formData.category ? '#2c3e50' : '#000000',
              backgroundColor: 'white',
              borderWidth: 2,
            }}
            onValueChange={itemValue => {
              setFormData(prev => ({
                ...prev,
                subCategory: itemValue,
                form
              }));

              const selected = categories.find(c => c.id === itemValue);
              setSelectedCategory(selected || null);
            }}
          >
            <Picker.Item label="Select Category" value="" color="black" />

            {categories.map(item => (
              <Picker.Item
                key={item.id}
                label={item.category_name}
                value={item.id.toString()}
              />
            ))}
          </Picker>
        </View> */}
        <View style={styles.containerpop}>
          {/* Dropdown Header Trigger */}
          <TouchableOpacity
            style={styles.pickerWrapper}
            activeOpacity={0.7}
            onPress={() => setIsOpen(!isOpen)}
          >
            <Text
              style={[
                styles.selectedText,
                { color: formData.subCategory ? '#2c3e50' : '#a1a1a1' },
              ]}
            >
              {currentSelection
                ? currentSelection.category_name
                : 'Select Category'}
            </Text>
            {/* Visual Indicator Arrow */}
            <Text style={styles.arrowIcon}>{isOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {/* Dropdown List Items */}
          {isOpen && (
            <View style={styles.dropdownList}>
              <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                {categories.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        subCategory: item.id.toString(),
                        category: item.id.toString(),
                      }));
                      setSelectedCategory(item);
                      setIsOpen(false); // Close dropdown after selection
                    }}
                  >
                    <Text style={styles.itemText}>{item.category_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        {/* list */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.typeContainer}>
            {['INCOME', 'EXPENSE'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.transaction_type === type && styles.typeButtonActive,
                ]}
                onPress={() =>
                  setFormData(prev => ({ ...prev, transaction_type: type }))
                }
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.transaction_type === type &&
                      styles.typeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            value={formData.amount}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, amount: text }))
            }
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            placeholderTextColor="#95a5a6"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, description: text }))
            }
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#95a5a6"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Invoice/Receipt (Optional)</Text>

          {!formData.invoice ? (
            <TouchableOpacity
              style={styles.fileOptionsButton}
              onPress={() => setShowFileOptions(true)}
            >
              <Upload size={20} color="white" />
              <Text style={styles.fileOptionsButtonText}>
                Choose File or Take Picture
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedFileContainer}>
              <View style={styles.selectedFileIcon}>
                <CheckCircle size={20} color="#27ae60" />
              </View>
              <Text style={styles.selectedFileText} numberOfLines={1}>
                {formData.invoice.name}
              </Text>
              <TouchableOpacity
                style={styles.removeFileButton}
                onPress={removeFile}
              >
                <Trash2 size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}

          <Modal
            visible={showFileOptions}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFileOptions(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowFileOptions(false)}
            >
              <View style={styles.fileOptionsModal}>
                <Text style={styles.modalTitle}>Select Option</Text>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={pickFromGallery}
                >
                  <ImageIcon
                    size={24}
                    color="#3498db"
                    style={styles.modalIcon}
                  />
                  <Text style={styles.modalOptionText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={pickDocument}
                >
                  <FileText
                    size={24}
                    color="#86b952"
                    style={styles.modalIcon}
                  />
                  <Text style={styles.modalOptionText}>Document</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setShowFileOptions(false);
                    setShowCamera(true);
                  }}
                >
                  <Camera size={24} color="#e74c3c" style={styles.modalIcon} />
                  <Text style={styles.modalOptionText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowFileOptions(false)}
                >
                  <X size={20} color="#7f8c8d" />
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={showCamera}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => setShowCamera(false)}
          >
            <FrontCamera
              onPhotoCaptured={takePicture}
              onClose={() => setShowCamera(false)}
            />
          </Modal>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={submitTransaction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Add Transaction</Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerpop: {
    width: '100%',
    zIndex: 1000,
  },
  pickerWrapper: {
    height: 45,
    borderWidth: 2,
    borderColor: '#86b952',
    borderRadius: 8,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  dropdownList: {
    position: 'absolute',
    top: 40, // Sits directly below the header wrapper
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  selectedText: {
    fontSize: 16,
  },
  arrowIcon: {
    fontSize: 14,
    color: '#86b952',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  inputGroup: {
    marginBottom: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  pickerInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholder: {
    color: '#95a5a6',
  },
  categoryList: {
    maxHeight: 120,
    marginTop: 10,
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  categoryItemSelected: {
    backgroundColor: '#e6f4ea',
    borderColor: '#86b952',
  },
  categoryText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#86b952',
    borderColor: '#86b952',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    color: '#2c3e50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fileOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  fileIcon: {},
  fileOptionsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  selectedFileContainer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedFileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFileText: {
    flex: 1,
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '500',
  },
  removeFileButton: {
    backgroundColor: '#e74c3c',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileOptionsModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 16,
  },
  modalIcon: {},
  modalOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
  },
  modalCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    gap: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#86b952',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  spacing: {
    height: 100,
  },
});

export default AddFinanceTransaction;

// -------

// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Platform,
// } from 'react-native';
// import { pick, types, isCancel } from '@react-native-documents/picker';
// import { launchImageLibrary } from 'react-native-image-picker';
// import TopBar from '../../components/ParentTobBar';
// import axios from 'axios';
// import { BASEURL } from '../../appurls';
// import dayjs from 'dayjs';
// import { useUser } from '../../context/UserContext';
// import {
//   Upload,
//   CheckCircle,
//   Trash2,
//   Image as ImageIcon,
//   FileText,
//   Camera,
//   X,
// } from 'lucide-react-native';
// import FrontCamera from '../../components/FrontCamera';
// import Header from '../../components/Header';
// import { Picker } from '@react-native-picker/picker';

// const AddFinanceTransaction = () => {
//   const [loading, setLoading] = useState(false);
//   const [showFileOptions, setShowFileOptions] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [formData, setFormData] = useState({
//     category: '',
//     subCategory: null,
//     transaction_type: 'INCOME',
//     amount: '',
//     description: '',
//     created_by: '',
//     invoice: null,
//   });
//   const { appUser, token } = useUser();

//   const getCategories = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         `${BASEURL}/api/finance/categories/?branch=${
//           appUser?.branch_id
//         }&month=${dayjs().format('YYYY-MM')}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       if (response.data.length > 0) {
//         setFormData(prev => ({
//           ...prev,
//           category: response.data[0].id.toString(),
//           created_by: appUser?.id?.toString() || '1',
//         }));
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load categories');
//     }
//   }, [appUser?.branch_id, appUser?.id, token]);

//   const getFinanceCategories = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         `${BASEURL}/api/finance/finance-sub-category/?branch_id=${appUser?.branch_id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       setCategories(response.data || []);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load categories');
//     }
//   }, [appUser?.branch_id, token]);

//   useEffect(() => {
//     if (token) {
//       getCategories();
//       getFinanceCategories();
//     }
//   }, [token, getCategories, getFinanceCategories]);

//   const pickFromGallery = useCallback(async () => {
//     try {
//       const result = await launchImageLibrary({
//         mediaType: 'photo',
//         quality: 0.8,
//         selectionLimit: 1,
//       });

//       if (result.didCancel || result.errorCode) {
//         setShowFileOptions(false);
//         return;
//       }

//       if (result.assets && result.assets[0]) {
//         const file = result.assets[0];
//         setFormData(prev => ({
//           ...prev,
//           invoice: {
//             uri: file.uri,
//             name: `image_${Date.now()}.jpg`,
//             type: file.type || 'image/jpeg',
//             size: file.fileSize || 0,
//           },
//         }));
//       }
//       setShowFileOptions(false);
//     } catch (error) {
//       setShowFileOptions(false);
//     }
//   }, []);

//   const pickDocument = useCallback(async () => {
//     try {
//       // Using the new @react-native-documents/picker API
//       const [file] = await pick({
//         type: [types.allFiles],
//         allowMultiSelection: false,
//       });

//       if (file) {
//         setFormData(prev => ({
//           ...prev,
//           invoice: {
//             uri: file.uri,
//             name: file.name,
//             type: file.type || 'application/octet-stream',
//             size: file.size,
//           },
//         }));
//       }
//       setShowFileOptions(false);
//     } catch (error) {
//       if (!isCancel(error)) {
//         setShowFileOptions(false);
//       }
//     }
//   }, []);

//   const takePicture = useCallback(photoUri => {
//     setFormData(prev => ({
//       ...prev,
//       invoice: {
//         uri: photoUri,
//         name: `receipt_${Date.now()}.jpg`,
//         type: 'image/jpeg',
//         size: 0,
//       },
//     }));
//     setShowCamera(false);
//   }, []);

//   const removeFile = useCallback(() => {
//     setFormData(prev => ({ ...prev, invoice: null }));
//   }, []);

//   const submitTransaction = useCallback(async () => {
//     if (!formData.category || !formData.amount || !formData.description) {
//       Alert.alert('Error', 'Please fill all required fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append('category', formData.category);
//       formDataToSend.append('sub_category', formData.subCategory);
//       formDataToSend.append('transaction_type', formData.transaction_type);
//       formDataToSend.append('amount', formData.amount);
//       formDataToSend.append('description', formData.description);
//       formDataToSend.append('created_by', appUser?.id?.toString() || '1');

//       if (formData.invoice) {
//         let uploadUri = formData.invoice.uri;

//         if (Platform.OS === 'android') {
//           if (
//             !uploadUri.startsWith('file://') &&
//             !uploadUri.startsWith('content://')
//           ) {
//             uploadUri = 'file://' + uploadUri;
//           }
//         }

//         formDataToSend.append('invoice', {
//           uri: uploadUri,
//           type: formData.invoice.type || 'image/jpeg',
//           name: formData.invoice.name,
//         });
//       }

//       const response = await fetch(
//         `${BASEURL}/api/finance/categories/add-transaction/${formData.category}/`,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formDataToSend,
//         },
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP ${response.status}: ${errorText}`);
//       }

//       Alert.alert('Success', 'Transaction added successfully!');

//       setFormData(prev => ({
//         ...prev,
//         transaction_type: 'INCOME',
//         amount: '',
//         description: '',
//         invoice: null,
//         subCategory: null,
//         category: '',
//       }));
//       setSelectedCategory(null);
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to add transaction');
//     } finally {
//       setLoading(false);
//     }
//   }, [formData, appUser?.id, token]);

//   return (
//     <View style={styles.container}>
//       <TopBar />
//       <ScrollView
//         style={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//       >
//         <Header title="Add Transaction" />

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Finance Category *</Text>

//           <View style={styles.pickerWrapper}>
//             {/* <Picker
//               selectedValue={formData.category}
//               dropdownIconColor="#86b952"
//               mode="dropdown"
//               style={{
//                 height: 55,
//                 color: formData.category ? '#2c3e50' : '#000000',
//                 backgroundColor: 'white',
//               }}
//               onValueChange={itemValue => {
//                 setFormData(prev => ({
//                   ...prev,
//                   subCategory: itemValue,
//                 }));

//                 const selected = categories.find(c => c.id === itemValue);
//                 setSelectedCategory(selected || null);
//               }}
//             >
//               <Picker.Item label="Select Category" value="" color="black" />

//               {categories.map(item => (
//                 <Picker.Item
//                   key={item.id}
//                   label={item.category_name}
//                   value={item.id.toString()}
//                 />
//               ))}
//             </Picker> */}
//             <View style={styles.pickerWrapper}>
//               <Picker
//                 // selectedValue={formData.category}
//                 dropdownIconColor="#86b952"
//                 mode="dropdown"
//                 style={{
//                   height: 55,
//                   color: formData.category ? '#2c3e50' : '#888888',
//                   backgroundColor: 'white',
//                 }}
//                 onValueChange={itemValue => {
//                   setFormData(prev => ({
//                     ...prev,
//                     category: itemValue,
//                     subCategory: '',
//                   }));

//                   const selected = categories.find(
//                     c => c.id.toString() === itemValue.toString(),
//                   );
//                   setSelectedCategory(selected || null);
//                 }}
//               >
//                 <Picker.Item label="Select Category" value="" color="#888888" />

//                 {categories.map(item => (
//                   <Picker.Item
//                     key={item.id}
//                     label={item.category_name}
//                     value={item.id.toString()}
//                     color="black"
//                   />
//                 ))}
//               </Picker>
//             </View>
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Transaction Type</Text>
//           <View style={styles.typeContainer}>
//             {['INCOME', 'EXPENSE'].map(type => (
//               <TouchableOpacity
//                 key={type}
//                 style={[
//                   styles.typeButton,
//                   formData.transaction_type === type && styles.typeButtonActive,
//                 ]}
//                 onPress={() =>
//                   setFormData(prev => ({ ...prev, transaction_type: type }))
//                 }
//               >
//                 <Text
//                   style={[
//                     styles.typeButtonText,
//                     formData.transaction_type === type &&
//                       styles.typeButtonTextActive,
//                   ]}
//                 >
//                   {type}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Amount *</Text>
//           <TextInput
//             style={styles.input}
//             value={formData.amount}
//             onChangeText={text =>
//               setFormData(prev => ({ ...prev, amount: text }))
//             }
//             placeholder="Enter amount"
//             keyboardType="decimal-pad"
//             placeholderTextColor="#95a5a6"
//           />
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Description *</Text>
//           <TextInput
//             style={[styles.input, styles.textArea]}
//             value={formData.description}
//             onChangeText={text =>
//               setFormData(prev => ({ ...prev, description: text }))
//             }
//             placeholder="Enter description"
//             multiline
//             numberOfLines={4}
//             textAlignVertical="top"
//             placeholderTextColor="#95a5a6"
//           />
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Invoice/Receipt (Optional)</Text>

//           {!formData.invoice ? (
//             <TouchableOpacity
//               style={styles.fileOptionsButton}
//               onPress={() => setShowFileOptions(true)}
//             >
//               <Upload size={20} color="white" />
//               <Text style={styles.fileOptionsButtonText}>
//                 Choose File or Take Picture
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             <View style={styles.selectedFileContainer}>
//               <View style={styles.selectedFileIcon}>
//                 <CheckCircle size={20} color="#27ae60" />
//               </View>
//               <Text style={styles.selectedFileText} numberOfLines={1}>
//                 {formData.invoice.name}
//               </Text>
//               <TouchableOpacity
//                 style={styles.removeFileButton}
//                 onPress={removeFile}
//               >
//                 <Trash2 size={16} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}

//           <Modal
//             visible={showFileOptions}
//             transparent
//             animationType="fade"
//             onRequestClose={() => setShowFileOptions(false)}
//           >
//             <TouchableOpacity
//               style={styles.modalOverlay}
//               activeOpacity={1}
//               onPress={() => setShowFileOptions(false)}
//             >
//               <View style={styles.fileOptionsModal}>
//                 <Text style={styles.modalTitle}>Select Option</Text>

//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={pickFromGallery}
//                 >
//                   <ImageIcon
//                     size={24}
//                     color="#3498db"
//                     style={styles.modalIcon}
//                   />
//                   <Text style={styles.modalOptionText}>Gallery</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={pickDocument}
//                 >
//                   <FileText
//                     size={24}
//                     color="#86b952"
//                     style={styles.modalIcon}
//                   />
//                   <Text style={styles.modalOptionText}>Document</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={() => {
//                     setShowFileOptions(false);
//                     setShowCamera(true);
//                   }}
//                 >
//                   <Camera size={24} color="#e74c3c" style={styles.modalIcon} />
//                   <Text style={styles.modalOptionText}>Camera</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.modalCancel}
//                   onPress={() => setShowFileOptions(false)}
//                 >
//                   <X size={20} color="#7f8c8d" />
//                   <Text style={styles.modalCancelText}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </TouchableOpacity>
//           </Modal>

//           <Modal
//             visible={showCamera}
//             animationType="slide"
//             presentationStyle="fullScreen"
//             onRequestClose={() => setShowCamera(false)}
//           >
//             <FrontCamera
//               onPhotoCaptured={takePicture}
//               onClose={() => setShowCamera(false)}
//             />
//           </Modal>
//         </View>

//         <TouchableOpacity
//           style={[styles.submitButton, loading && styles.submitButtonDisabled]}
//           onPress={submitTransaction}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="white" />
//           ) : (
//             <Text style={styles.submitButtonText}>Add Transaction</Text>
//           )}
//         </TouchableOpacity>

//         <View style={styles.spacing} />
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   scrollContainer: {
//     flex: 1,
//     padding: 20,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#2c3e50',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#7f8c8d',
//   },
//   inputGroup: {
//     marginBottom: 20,
//     paddingTop: 10,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2c3e50',
//     marginBottom: 8,
//   },
//   pickerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#e1e8ed',
//   },
//   pickerInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#2c3e50',
//   },
//   placeholder: {
//     color: '#95a5a6',
//   },
//   categoryList: {
//     maxHeight: 120,
//     marginTop: 10,
//   },
//   categoryItem: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     backgroundColor: 'white',
//     borderRadius: 8,
//     marginBottom: 4,
//     borderWidth: 1,
//     borderColor: '#e1e8ed',
//   },
//   categoryItemSelected: {
//     backgroundColor: '#e6f4ea',
//     borderColor: '#86b952',
//   },
//   categoryText: {
//     fontSize: 16,
//     color: '#2c3e50',
//   },
//   typeContainer: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   typeButton: {
//     flex: 1,
//     paddingVertical: 12,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   typeButtonActive: {
//     backgroundColor: '#86b952',
//     borderColor: '#86b952',
//   },
//   typeButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#7f8c8d',
//   },
//   typeButtonTextActive: {
//     color: 'white',
//   },
//   input: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#e1e8ed',
//     color: '#2c3e50',
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   fileOptionsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#3498db',
//     padding: 16,
//     borderRadius: 12,
//     gap: 10,
//   },
//   fileIcon: {},
//   fileOptionsButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'center',
//   },
//   selectedFileContainer: {
//     backgroundColor: '#e8f5e8',
//     padding: 16,
//     borderRadius: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   selectedFileIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: 'rgba(39, 174, 96, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectedFileText: {
//     flex: 1,
//     fontSize: 16,
//     color: '#27ae60',
//     fontWeight: '500',
//   },
//   removeFileButton: {
//     backgroundColor: '#e74c3c',
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   fileOptionsModal: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 24,
//     width: '85%',
//     maxWidth: 350,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#2c3e50',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   modalOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     gap: 16,
//   },
//   modalIcon: {},
//   modalOptionText: {
//     fontSize: 16,
//     color: '#2c3e50',
//     fontWeight: '500',
//     flex: 1,
//   },
//   modalCancel: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 16,
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     justifyContent: 'center',
//     gap: 8,
//   },
//   modalCancelText: {
//     fontSize: 16,
//     color: '#7f8c8d',
//     fontWeight: '600',
//   },
//   submitButton: {
//     backgroundColor: '#86b952',
//     paddingVertical: 16,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#bdc3c7',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   spacing: {
//     height: 100,
//   },
//   pickerWrapper: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e1e8ed',
//     overflow: 'hidden',
//   },
// });

// export default AddFinanceTransaction;
