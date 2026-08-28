// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
// } from 'react-native';
// import TopBar from '../../components/ParentTobBar';
// import BackButton from '../../components/BackButton';
// import { Upload } from 'lucide-react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { useUser } from '../../context/UserContext';

// import { BASEURL } from '../../appurls';
// import axios from 'axios';
// import { Picker } from '@react-native-picker/picker';

// const OtherPayments = () => {
//   const { appUser, token } = useUser();
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { feeId, amount } = route.params;

//   const [paymentMethod, setPaymentMethod] = useState('');
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');

//   const [transactionId, setTransactionId] = useState('');
//   const [description, setDescription] = useState('');

//   const [bankName, setBankName] = useState('');
//   const [ifsc, setIfsc] = useState('');
//   const [accountNumber, setAccountNumber] = useState('');

//   const [selectedFile, setSelectedFile] = useState(null);
//   const [loadingSubmit, setLoadingSubmit] = useState(false);

//   useEffect(() => {
//     if (appUser) {
//       setName(appUser.name || '');
//       setEmail(appUser.email || '');
//       setPhone(appUser.phone || '');
//     }
//   }, [appUser]);

//   const pickFile = useCallback(async () => {
//     try {
//       const result = await DocumentPicker.pick({
//         type: [DocumentPicker.types.allFiles],
//         allowMultiSelection: false,
//       });

//       if (result && result[0]) {
//         const asset = result[0];
//         setSelectedFile({
//           uri: asset.uri,
//           type: asset.type,
//           name: asset.name,
//         });
//         Alert.alert('Success', `File Selected: ${asset.name}`);
//       }
//     } catch (error) {
//       if (!DocumentPicker.isCancel(error)) {
//         Alert.alert('Error', 'Something went wrong while picking file');
//       }
//     }
//   }, []);

//   const validate = useCallback(() => {
//     if (!name.trim()) {
//       Alert.alert('Missing Information', 'Please enter your name.');
//       return false;
//     }

//     if (!phone.trim()) {
//       Alert.alert('Missing Information', 'Please enter your phone number.');
//       return false;
//     }
//     const cleanPhone = phone.replace(/\D/g, '');
//     if (cleanPhone.length !== 10) {
//       Alert.alert('Invalid Phone', 'Phone number must be exactly 10 digits.');
//       return false;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (email && !emailRegex.test(email)) {
//       Alert.alert('Invalid Email', 'Please enter a valid email address.');
//       return false;
//     }

//     if (!paymentMethod) {
//       Alert.alert('Missing Information', 'Please select a payment method.');
//       return false;
//     }

//     if (paymentMethod === 'upi') {
//       if (!transactionId.trim()) {
//         Alert.alert(
//           'Missing Information',
//           'Please enter the UPI Transaction ID.',
//         );
//         return false;
//       }
//     }

//     if (paymentMethod === 'bank_transfer') {
//       if (!transactionId.trim()) {
//         Alert.alert('Missing Information', 'Please enter the Transaction ID.');
//         return false;
//       }
//       if (!bankName.trim()) {
//         Alert.alert('Missing Information', 'Please enter the Bank Name.');
//         return false;
//       }
//       if (!ifsc.trim()) {
//         Alert.alert('Missing Information', 'Please enter the IFSC Code.');
//         return false;
//       }
//       if (!accountNumber.trim()) {
//         Alert.alert('Missing Information', 'Please enter the Account Number.');
//         return false;
//       }
//     }

//     if (paymentMethod === 'cheque') {
//       if (!transactionId.trim()) {
//         Alert.alert('Missing Information', 'Please enter the Cheque Number.');
//         return false;
//       }
//     }

//     if (!selectedFile) {
//       Alert.alert(
//         'Missing Information',
//         'Please upload the payment proof attachment.',
//       );
//       return false;
//     }

//     return true;
//   }, [
//     name,
//     phone,
//     email,
//     paymentMethod,
//     transactionId,
//     bankName,
//     ifsc,
//     accountNumber,
//     selectedFile,
//   ]);

//   const submitPaymentDetails = useCallback(async () => {
//     if (!validate()) return;

//     try {
//       setLoadingSubmit(true);

//       const formData = new FormData();

//       formData.append('name', name);
//       formData.append('phone', phone);
//       formData.append('payment_method', paymentMethod);
//       formData.append('fee_id', feeId);
//       formData.append('amount', amount);
//       formData.append('school', appUser?.school_id);
//       formData.append('branch', appUser?.branch_id);
//       if (email) formData.append('email', email);

//       if (transactionId) {
//         formData.append('transaction_id', transactionId);
//       }

//       if (paymentMethod === 'upi' && description) {
//         formData.append('description', description);
//       }

//       if (paymentMethod === 'bank_transfer') {
//         formData.append('sender_bank_name', bankName);
//         formData.append('sender_ifsc', ifsc);
//         formData.append('sender_account_number', accountNumber);
//       }

//       if (selectedFile) {
//         formData.append('proof', {
//           uri: selectedFile.uri,
//           type: selectedFile.type || 'application/octet-stream',
//           name: selectedFile.name || 'file',
//         });
//       }

//       await axios.post(
//         `${BASEURL}/api/finance/pay-via-other-source/`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//           },
//         },
//       );

//       Alert.alert('Success', 'Payment submitted successfully!');
//       navigation.canGoBack();

//       setPaymentMethod('');
//       setName(appUser?.name || '');
//       setEmail(appUser?.email || '');
//       setPhone(appUser?.phone || '');
//       setTransactionId('');
//       setDescription('');
//       setBankName('');
//       setIfsc('');
//       setAccountNumber('');
//       setSelectedFile(null);
//     } catch (error) {
//       Alert.alert('Error', 'Submission failed. Please check your connection.');
//     } finally {
//       setLoadingSubmit(false);
//     }
//   }, [
//     validate,
//     name,
//     phone,
//     paymentMethod,
//     feeId,
//     amount,
//     appUser,
//     email,
//     transactionId,
//     description,
//     bankName,
//     ifsc,
//     accountNumber,
//     selectedFile,
//     token,
//     navigation,
//   ]);

//   return (
//     <View style={styles.container}>
//       <TopBar />

//       <View style={styles.header}>
//         <BackButton />
//         <Text style={styles.title}>Other Payments</Text>
//       </View>

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContainer}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Text style={styles.label}>
//             Name <Text style={styles.required}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.input}
//             value={name}
//             onChangeText={setName}
//             placeholder="Enter full name"
//           />

//           <Text style={styles.label}>Email</Text>
//           <TextInput
//             style={styles.input}
//             value={email}
//             onChangeText={setEmail}
//             placeholder="email@example.com"
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />

//           <Text style={styles.label}>
//             Phone Number <Text style={styles.required}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.input}
//             value={phone}
//             onChangeText={setPhone}
//             placeholder="10-digit mobile number"
//             keyboardType="number-pad"
//             maxLength={10}
//           />

//           <Text style={styles.label}>
//             Amount <Text style={styles.required}>*</Text>
//           </Text>
//           <TextInput
//             style={[styles.input, { backgroundColor: '#eee' }]}
//             value={amount}
//             keyboardType="numeric"
//             editable={false}
//           />

//           <Text style={styles.label}>
//             Payment Method <Text style={styles.required}>*</Text>
//           </Text>
//           <View style={styles.dropdownContainer}>
//             <Picker
//               selectedValue={paymentMethod}
//               onValueChange={itemValue => setPaymentMethod(itemValue)}
//             >
//               <Picker.Item label="Select Payment Method" value="" />
//               <Picker.Item label="UPI" value="upi" />
//               <Picker.Item label="Bank Transfer" value="bank_transfer" />
//               <Picker.Item label="Cash" value="cash" />
//               <Picker.Item label="Cheque" value="cheque" />
//             </Picker>
//           </View>

//           {paymentMethod === 'upi' && (
//             <>
//               <Text style={styles.label}>
//                 Transaction ID <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={transactionId}
//                 onChangeText={setTransactionId}
//                 placeholder="Enter UPI Ref No."
//               />

//               <Text style={styles.label}>Description (Optional)</Text>
//               <TextInput
//                 style={styles.input}
//                 value={description}
//                 onChangeText={setDescription}
//                 placeholder="Any remarks?"
//               />
//             </>
//           )}

//           {paymentMethod === 'bank_transfer' && (
//             <>
//               <Text style={styles.label}>
//                 Transaction ID <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={transactionId}
//                 onChangeText={setTransactionId}
//                 placeholder="Enter Transaction Ref No."
//               />

//               <Text style={styles.label}>
//                 Bank Name <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={bankName}
//                 onChangeText={setBankName}
//                 placeholder="e.g. State Bank of India"
//               />

//               <Text style={styles.label}>
//                 IFSC Code <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={ifsc}
//                 onChangeText={setIfsc}
//                 placeholder="e.g. SBIN0001234"
//                 autoCapitalize="characters"
//               />

//               <Text style={styles.label}>
//                 Account Number <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={accountNumber}
//                 onChangeText={setAccountNumber}
//                 placeholder="Sender Account Number"
//                 keyboardType="number-pad"
//               />
//             </>
//           )}

//           {paymentMethod === 'cheque' && (
//             <>
//               <Text style={styles.label}>
//                 Cheque Number <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={transactionId}
//                 onChangeText={setTransactionId}
//                 placeholder="Enter Cheque No."
//                 keyboardType="number-pad"
//               />
//             </>
//           )}

//           {paymentMethod === 'cash' && (
//             <Text
//               style={{
//                 marginLeft: 12,
//                 marginTop: 10,
//                 color: 'gray',
//                 fontStyle: 'italic',
//               }}
//             >
//               No additional details required for cash payments.
//             </Text>
//           )}

//           <Text style={styles.label}>
//             Upload Proof <Text style={styles.required}>*</Text>
//           </Text>
//           <TouchableOpacity
//             onPress={pickFile}
//             style={[
//               styles.uploadBtn,
//               { backgroundColor: selectedFile ? '#86b952' : '#6c757d' },
//             ]}
//           >
//             <Upload size={24} color="white" />
//             <Text style={styles.uploadText}>
//               {selectedFile
//                 ? 'Proof Added: ' + selectedFile.name.substring(0, 15) + '...'
//                 : 'Upload Proof'}
//             </Text>
//           </TouchableOpacity>

//           {loadingSubmit ? (
//             <ActivityIndicator
//               size="large"
//               color="#86b952"
//               style={{ marginVertical: 20 }}
//             />
//           ) : (
//             <TouchableOpacity
//               style={styles.submitBtn}
//               onPress={submitPaymentDetails}
//             >
//               <Text style={styles.submitText}>Submit Payment</Text>
//             </TouchableOpacity>
//           )}
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// export default OtherPayments;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: 'white',
//     elevation: 2,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#86b952',
//     marginLeft: 12,
//   },
//   scrollContainer: {
//     paddingBottom: 30,
//   },
//   label: {
//     marginLeft: 12,
//     marginTop: 15,
//     fontSize: 14,
//     color: '#555',
//     fontWeight: '600',
//   },
//   required: {
//     color: 'red',
//   },
//   input: {
//     height: 50,
//     marginHorizontal: 12,
//     marginTop: 6,
//     borderWidth: 1,
//     padding: 12,
//     borderRadius: 12,
//     borderColor: 'lightgray',
//     backgroundColor: 'white',
//     fontSize: 15,
//     color: '#333',
//   },
//   dropdownContainer: {
//     marginHorizontal: 12,
//     marginTop: 6,
//     borderWidth: 1,
//     borderColor: 'lightgray',
//     borderRadius: 12,
//     overflow: 'hidden',
//     backgroundColor: 'white',
//   },
//   uploadBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: 12,
//     marginTop: 20,
//     padding: 15,
//     borderRadius: 12,
//   },
//   uploadText: {
//     color: 'white',
//     marginLeft: 10,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   submitBtn: {
//     backgroundColor: '#86b952',
//     margin: 12,
//     marginTop: 10,
//     padding: 15,
//     borderRadius: 12,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 3,
//   },
//   submitText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '700',
//   },
// });

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import { Upload } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { pick, types, isCancel } from '@react-native-documents/picker';
import { BASEURL } from '../../appurls';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const OtherPayments = () => {
  const { appUser, token } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const { feeId, amount } = route.params;

  const [paymentMethod, setPaymentMethod] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [transactionId, setTransactionId] = useState('');
  const [description, setDescription] = useState('');

  const [bankName, setBankName] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (appUser) {
      setName(appUser.name || '');
      setEmail(appUser.email || '');
      setPhone(appUser.phone || '');
    }
  }, [appUser]);

  const pickFile = useCallback(async () => {
    try {
      // Using the new @react-native-documents/picker API
      const [result] = await pick({
        type: [types.allFiles],
        allowMultiSelection: false,
      });

      if (result) {
        const asset = result;
        setSelectedFile({
          uri: asset.uri,
          type: asset.type,
          name: asset.name,
        });
        Alert.alert('Success', `File Selected: ${asset.name}`);
      }
    } catch (error) {
      if (!isCancel(error)) {
        Alert.alert('Error', 'Something went wrong while picking file');
      }
    }
  }, []);

  const validate = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name.');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number.');
      return false;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      Alert.alert('Invalid Phone', 'Phone number must be exactly 10 digits.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }

    if (!paymentMethod) {
      Alert.alert('Missing Information', 'Please select a payment method.');
      return false;
    }

    if (paymentMethod === 'upi') {
      if (!transactionId.trim()) {
        Alert.alert(
          'Missing Information',
          'Please enter the UPI Transaction ID.',
        );
        return false;
      }
    }

    if (paymentMethod === 'bank_transfer') {
      if (!transactionId.trim()) {
        Alert.alert('Missing Information', 'Please enter the Transaction ID.');
        return false;
      }
      if (!bankName.trim()) {
        Alert.alert('Missing Information', 'Please enter the Bank Name.');
        return false;
      }
      if (!ifsc.trim()) {
        Alert.alert('Missing Information', 'Please enter the IFSC Code.');
        return false;
      }
      if (!accountNumber.trim()) {
        Alert.alert('Missing Information', 'Please enter the Account Number.');
        return false;
      }
    }

    if (paymentMethod === 'cheque') {
      if (!transactionId.trim()) {
        Alert.alert('Missing Information', 'Please enter the Cheque Number.');
        return false;
      }
    }

    if (!selectedFile) {
      Alert.alert(
        'Missing Information',
        'Please upload the payment proof attachment.',
      );
      return false;
    }

    return true;
  }, [
    name,
    phone,
    email,
    paymentMethod,
    transactionId,
    bankName,
    ifsc,
    accountNumber,
    selectedFile,
  ]);

  const submitPaymentDetails = useCallback(async () => {
    if (!validate()) return;

    try {
      setLoadingSubmit(true);

      const formData = new FormData();

      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('payment_method', paymentMethod);
      formData.append('fee_id', feeId);
      formData.append('amount', amount);
      formData.append('school', appUser?.school_id);
      formData.append('branch', appUser?.branch_id);
      if (email) formData.append('email', email);

      if (transactionId) {
        formData.append('transaction_id', transactionId);
      }

      if (paymentMethod === 'upi' && description) {
        formData.append('description', description);
      }

      if (paymentMethod === 'bank_transfer') {
        formData.append('sender_bank_name', bankName);
        formData.append('sender_ifsc', ifsc);
        formData.append('sender_account_number', accountNumber);
      }

      if (selectedFile) {
        formData.append('proof', {
          uri: selectedFile.uri,
          type: selectedFile.type || 'application/octet-stream',
          name: selectedFile.name || 'file',
        });
      }

      await axios.post(
        `${BASEURL}/api/finance/pay-via-other-source/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      Alert.alert('Success', 'Payment submitted successfully!');
      navigation.canGoBack();

      setPaymentMethod('');
      setName(appUser?.name || '');
      setEmail(appUser?.email || '');
      setPhone(appUser?.phone || '');
      setTransactionId('');
      setDescription('');
      setBankName('');
      setIfsc('');
      setAccountNumber('');
      setSelectedFile(null);
    } catch (error) {
      Alert.alert('Error', 'Submission failed. Please check your connection.');
    } finally {
      setLoadingSubmit(false);
    }
  }, [
    validate,
    name,
    phone,
    paymentMethod,
    feeId,
    amount,
    appUser,
    email,
    transactionId,
    description,
    bankName,
    ifsc,
    accountNumber,
    selectedFile,
    token,
    navigation,
  ]);

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Other Payments</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit mobile number"
            keyboardType="number-pad"
            maxLength={10}
          />

          <Text style={styles.label}>
            Amount <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#eee' }]}
            value={amount}
            keyboardType="numeric"
            editable={false}
          />

          <Text style={styles.label}>
            Payment Method <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={itemValue => setPaymentMethod(itemValue)}
            >
              <Picker.Item label="Select Payment Method" value="" />
              <Picker.Item label="UPI" value="upi" />
              <Picker.Item label="Bank Transfer" value="bank_transfer" />
              <Picker.Item label="Cash" value="cash" />
              <Picker.Item label="Cheque" value="cheque" />
            </Picker>
          </View>

          {paymentMethod === 'upi' && (
            <>
              <Text style={styles.label}>
                Transaction ID <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="Enter UPI Ref No."
              />

              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Any remarks?"
              />
            </>
          )}

          {paymentMethod === 'bank_transfer' && (
            <>
              <Text style={styles.label}>
                Transaction ID <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="Enter Transaction Ref No."
              />

              <Text style={styles.label}>
                Bank Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="e.g. State Bank of India"
              />

              <Text style={styles.label}>
                IFSC Code <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={ifsc}
                onChangeText={setIfsc}
                placeholder="e.g. SBIN0001234"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>
                Account Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Sender Account Number"
                keyboardType="number-pad"
              />
            </>
          )}

          {paymentMethod === 'cheque' && (
            <>
              <Text style={styles.label}>
                Cheque Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="Enter Cheque No."
                keyboardType="number-pad"
              />
            </>
          )}

          {paymentMethod === 'cash' && (
            <Text
              style={{
                marginLeft: 12,
                marginTop: 10,
                color: 'gray',
                fontStyle: 'italic',
              }}
            >
              No additional details required for cash payments.
            </Text>
          )}

          <Text style={styles.label}>
            Upload Proof <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={pickFile}
            style={[
              styles.uploadBtn,
              { backgroundColor: selectedFile ? '#86b952' : '#6c757d' },
            ]}
          >
            <Upload size={24} color="white" />
            <Text style={styles.uploadText}>
              {selectedFile
                ? 'Proof Added: ' + selectedFile.name.substring(0, 15) + '...'
                : 'Upload Proof'}
            </Text>
          </TouchableOpacity>

          {loadingSubmit ? (
            <ActivityIndicator
              size="large"
              color="#86b952"
              style={{ marginVertical: 20 }}
            />
          ) : (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={submitPaymentDetails}
            >
              <Text style={styles.submitText}>Submit Payment</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OtherPayments;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#86b952',
    marginLeft: 12,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  label: {
    marginLeft: 12,
    marginTop: 15,
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  required: {
    color: 'red',
  },
  input: {
    height: 50,
    marginHorizontal: 12,
    marginTop: 6,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    borderColor: 'lightgray',
    backgroundColor: 'white',
    fontSize: 15,
    color: '#333',
  },
  dropdownContainer: {
    marginHorizontal: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  uploadText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#86b952',
    margin: 12,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
