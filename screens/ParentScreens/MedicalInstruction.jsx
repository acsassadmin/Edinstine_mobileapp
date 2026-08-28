// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   Pressable,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import React, { useState, useCallback } from 'react';
// import { Upload } from 'lucide-react-native';
// import BackButton from '../../components/BackButton';
// import { useUser } from '../../context/UserContext';
// import { BASEURL } from '../../appurls';

// const MedicalInstruction = ({ showBackButton = true }) => {
//   const { appUser, token } = useUser();

//   const [instruction, setInstruction] = useState('');
//   const [condition, setCondition] = useState('');
//   const [uploadSuccess, setUploadSuccess] = useState(false);
//   const [file, setFile] = useState(null);

//   const handleUpload = useCallback(async () => {
//     try {
//       const result = await DocumentPicker.pick({
//         type: [DocumentPicker.types.images],
//       });

//       if (result && result[0]) {
//         setFile(result[0]);
//       }
//     } catch (error) {
//       if (!DocumentPicker.isCancel(error)) {
//       }
//     }
//   }, []);

//   const submitMedicalInstruction = useCallback(async () => {
//     try {
//       if (!appUser?.id) {
//         Alert.alert('Error', 'No student ID available');
//         return;
//       }

//       if (!condition.trim() || !instruction.trim()) {
//         Alert.alert('Error', 'Please fill condition and instruction');
//         return;
//       }

//       const formData = new FormData();

//       formData.append('student', String(appUser.id));
//       formData.append('condition', condition.trim());
//       formData.append('instruction', instruction.trim());

//       if (file) {
//         let fileUri = file.uri;
//         if (
//           !fileUri.startsWith('file://') &&
//           !fileUri.startsWith('content://')
//         ) {
//           fileUri = `file://${fileUri}`;
//         }

//         formData.append('prescription', {
//           uri: fileUri,
//           name: file.name || 'prescription.jpg',
//           type: file.type || 'image/jpeg',
//         });
//       }

//       const response = await fetch(
//         `${BASEURL}/api/parent/medical-instruction/`,
//         {
//           method: 'POST',
//           body: formData,
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Server error ${response.status}: ${errorText}`);
//       }

//       await response.json();

//       Alert.alert('Success', 'Medical instruction sent successfully');

//       setCondition('');
//       setInstruction('');
//       setFile(null);
//       setUploadSuccess(true);
//     } catch (error) {
//       let errorMsg = 'Failed to send medical instruction';
//       if (
//         error.message.includes('Network') ||
//         error.message.includes('Failed to fetch')
//       ) {
//         errorMsg = 'Network error. Check server connection.';
//       } else if (error.message.includes('timeout')) {
//         errorMsg = 'Request timeout. Try again.';
//       } else {
//         errorMsg = error.message;
//       }

//       Alert.alert('Error', errorMsg);
//     }
//   }, [appUser?.id, condition, instruction, file, token]);

//   return (
//     <View style={{ flex: 1, backgroundColor: 'white', padding: 18 }}>
//       <View style={styles.titleContainer}>
//         {showBackButton && <BackButton />}

//         <Text style={styles.title}>Medical Instruction</Text>
//       </View>

//       <ScrollView style={styles.formContainer}>
//         <Text style={styles.label}>Medical Condition *</Text>
//         <TextInput
//           style={styles.textField}
//           placeholder="Enter the medical condition"
//           multiline
//           value={condition}
//           onChangeText={setCondition}
//         />

//         <Text style={styles.label}>Instruction *</Text>
//         <TextInput
//           style={[styles.textField, styles.instructionBox]}
//           placeholder="Enter the medical instruction"
//           multiline
//           value={instruction}
//           onChangeText={setInstruction}
//         />

//         <Text style={styles.label}>Upload Medical Prescription (Optional)</Text>
//         <Pressable style={styles.uploadContainer}>
//           <TouchableOpacity
//             onPress={handleUpload}
//             style={styles.uploadButton}
//             activeOpacity={0.8}
//           >
//             {file ? (
//               <Text style={styles.uploadText}>
//                 ✓ {file.name || 'File Selected'}
//               </Text>
//             ) : (
//               <>
//                 <Upload size={24} color="white" />
//                 <Text style={styles.uploadText}>Upload Prescription</Text>
//               </>
//             )}
//           </TouchableOpacity>
//         </Pressable>

//         <TouchableOpacity
//           style={[
//             styles.submitButton,
//             uploadSuccess && styles.submitButtonSuccess,
//             (!condition.trim() || !instruction.trim()) &&
//               styles.submitButtonDisabled,
//           ]}
//           onPress={submitMedicalInstruction}
//           disabled={!condition.trim() || !instruction.trim()}
//         >
//           <Text style={styles.buttonText}>Send Medical Instruction</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

// export default MedicalInstruction;

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#000000',
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   formContainer: {
//     marginTop: 10,
//   },
//   label: {
//     fontSize: 16,
//     marginTop: 12,
//     fontWeight: '500',
//     color: '#333',
//   },
//   textField: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 15,
//     borderRadius: 10,
//     marginTop: 10,
//     textAlignVertical: 'top',
//     backgroundColor: '#faf8f6',
//   },
//   instructionBox: {
//     height: 100,
//   },
//   uploadContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     marginTop: 10,
//     paddingVertical: 20,
//     backgroundColor: '#faf8f6',
//   },
//   uploadText: {
//     marginLeft: 10,
//     fontSize: 16,
//     color: 'white',
//     fontWeight: '600',
//   },
//   submitButton: {
//     padding: 15,
//     marginTop: 20,
//     borderRadius: 10,
//     backgroundColor: '#86b952',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   submitButtonSuccess: {
//     backgroundColor: '#4CAF50',
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//     opacity: 0.6,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   uploadButton: {
//     flexDirection: 'row',
//     backgroundColor: '#86b952',
//     padding: 18,
//     paddingHorizontal: 25,
//     borderRadius: 15,
//   },
// });

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react-native';
import { pick, types, isCancel } from '@react-native-documents/picker';
import BackButton from '../../components/BackButton';
import { useUser } from '../../context/UserContext';
import { BASEURL } from '../../appurls';

const MedicalInstruction = ({ showBackButton = true }) => {
  const { appUser, token } = useUser();

  const [instruction, setInstruction] = useState('');
  const [condition, setCondition] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [file, setFile] = useState(null);

  const handleUpload = useCallback(async () => {
    try {
      // Using the new @react-native-documents/picker API
      const [result] = await pick({
        type: [types.images],
      });

      if (result) {
        setFile(result);
      }
    } catch (error) {
      if (!isCancel(error)) {
        // Handle other errors
      }
    }
  }, []);

  const submitMedicalInstruction = useCallback(async () => {
    try {
      if (!appUser?.id) {
        Alert.alert('Error', 'No student ID available');
        return;
      }

      if (!condition.trim() || !instruction.trim()) {
        Alert.alert('Error', 'Please fill condition and instruction');
        return;
      }

      const formData = new FormData();

      formData.append('student', String(appUser.id));
      formData.append('condition', condition.trim());
      formData.append('instruction', instruction.trim());

      if (file) {
        let fileUri = file.uri;
        if (
          !fileUri.startsWith('file://') &&
          !fileUri.startsWith('content://')
        ) {
          fileUri = `file://${fileUri}`;
        }

        formData.append('prescription', {
          uri: fileUri,
          name: file.name || 'prescription.jpg',
          type: file.type || 'image/jpeg',
        });
      }

      const response = await fetch(
        `${BASEURL}/api/parent/medical-instruction/`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      await response.json();

      Alert.alert('Success', 'Medical instruction sent successfully');

      setCondition('');
      setInstruction('');
      setFile(null);
      setUploadSuccess(true);
    } catch (error) {
      let errorMsg = 'Failed to send medical instruction';
      if (
        error.message.includes('Network') ||
        error.message.includes('Failed to fetch')
      ) {
        errorMsg = 'Network error. Check server connection.';
      } else if (error.message.includes('timeout')) {
        errorMsg = 'Request timeout. Try again.';
      } else {
        errorMsg = error.message;
      }

      Alert.alert('Error', errorMsg);
    }
  }, [appUser?.id, condition, instruction, file, token]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 18 }}>
      <View style={styles.titleContainer}>
        {showBackButton && <BackButton />}

        <Text style={styles.title}>Medical Instruction</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Medical Condition *</Text>
        <TextInput
          style={styles.textField}
          placeholder="Enter the medical condition"
          multiline
          value={condition}
          onChangeText={setCondition}
        />

        <Text style={styles.label}>Instruction *</Text>
        <TextInput
          style={[styles.textField, styles.instructionBox]}
          placeholder="Enter the medical instruction"
          multiline
          value={instruction}
          onChangeText={setInstruction}
        />

        <Text style={styles.label}>Upload Medical Prescription (Optional)</Text>
        <Pressable style={styles.uploadContainer}>
          <TouchableOpacity
            onPress={handleUpload}
            style={styles.uploadButton}
            activeOpacity={0.8}
          >
            {file ? (
              <Text style={styles.uploadText}>
                ✓ {file.name || 'File Selected'}
              </Text>
            ) : (
              <>
                <Upload size={24} color="white" />
                <Text style={styles.uploadText}>Upload Prescription</Text>
              </>
            )}
          </TouchableOpacity>
        </Pressable>

        <TouchableOpacity
          style={[
            styles.submitButton,
            uploadSuccess && styles.submitButtonSuccess,
            (!condition.trim() || !instruction.trim()) &&
              styles.submitButtonDisabled,
          ]}
          onPress={submitMedicalInstruction}
          disabled={!condition.trim() || !instruction.trim()}
        >
          <Text style={styles.buttonText}>Send Medical Instruction</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MedicalInstruction;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
    color: '#333',
  },
  textField: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    textAlignVertical: 'top',
    backgroundColor: '#faf8f6',
  },
  instructionBox: {
    height: 100,
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 10,
    paddingVertical: 20,
    backgroundColor: '#faf8f6',
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#86b952',
    alignItems: 'center',
    zIndex: 1000,
  },
  submitButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#86b952',
    padding: 18,
    paddingHorizontal: 25,
    borderRadius: 15,
  },
});
