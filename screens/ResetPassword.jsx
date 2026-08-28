import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import TopBar from '../components/ParentTobBar';
import { appUrls } from '../appurls';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import { ActivityIndicator } from 'react-native-paper';
import BackButton from '../components/BackButton';

const { width } = Dimensions.get('window');

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [buttonClickLoading, setButtonClickLoading] = useState(false);

  const route = useRoute();
  const { token, appUser } = useUser();

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both field');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password match successfully');
      return;
    }

    try {
      setButtonClickLoading(true);

      const response = await axios.post(
        appUrls.reset_password,
        {
          email: appUser?.email,
          password: password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // console.log(`Reset Response`, response.data);
      // console.log(`Reset Params`, response.config.params);

      Alert.alert('Success', `${response.data.message}`);

      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      // console.log(appUrls.reset_password);
      console.error(`Reset Response Error:`, error);
      Alert.alert('Error', `${error}`);
    } finally {
      setButtonClickLoading(false);
    }
  };

  const [resetPasswordLoading, setResetPasswordLoading] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TopBar />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', columnGap: 5 }}
        >
          <BackButton />
          <Text style={styles.title}>Reset Password</Text>
        </View>

        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter new password"
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {buttonClickLoading ? (
          <ActivityIndicator size="large" color="#86b952" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.bottomText}>Submit</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    gap: 15,
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
    paddingBottom: 20,
    color: '#000000',
  },
  button: {
    backgroundColor: '#86b952',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  bottomText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
