import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import CustomeDatePicker from '../../components/CustomeDatePicker';
import CustomeTimePicker from '../../components/CustomeTimePicker';
import StudentLeaveHistoryServices from '../../services/StudentLeaveHistoryService';
import { useUser } from '../../context/UserContext';
import { useStorage } from '../../context/StorageContext';
import CustomSnackbar from '../../components/CustomSnackbar';
import dayjs from 'dayjs';
import BackButton from '../../components/BackButton';

const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [reason, setReason] = useState('');
  const [start_date, setStart_Date] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const { appUser, token } = useUser();
  const { leaves, setLeaves } = useStorage();
  const [leaveData, setLeaveData] = useState(null);
  const animation = useRef(new Animated.Value(0)).current;
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');

  const DROPDOWN_HEIGHT = leaves.length * 50;

  const getLeaves = useCallback(async () => {
    const response = await StudentLeaveHistoryServices.getLeaveTypes(
      token,
      appUser?.school_id,
    );
    setLeaves(response);
  }, [token, appUser?.school_id, setLeaves]);

  useEffect(() => {
    getLeaves();
  }, [getLeaves]);

  const toggleDropdown = useCallback(() => {
    Animated.timing(animation, {
      toValue: showDropdown ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    setShowDropdown(!showDropdown);
  }, [showDropdown, animation]);

  const handleSubmit = useCallback(async () => {
    const payload = {
      student: appUser?.id,
      class_id: appUser?.class_id,
      student_leave_type: leaveType,
      start_date: dayjs(start_date).format('YYYY-MM-DD'),
      end_date: dayjs(endDate).format('YYYY-MM-DD'),
      reason: reason,
      created_by: appUser?.id,
    };

    try {
      const response = await StudentLeaveHistoryServices.applyLeave(
        token,
        payload,
      );

      if (response?.success || response?.status === 201) {
        Alert.alert('Success 🎉', 'Leave applied successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setLeaveType('');
              setReason('');
              setStart_Date(null);
              setEndDate(null);
            },
          },
        ]);
      } else {
        Alert.alert('Error ❌', response?.message || 'Something went wrong', [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      Alert.alert('Network Error ❌', 'Failed to apply leave', [
        { text: 'OK' },
      ]);
    }
  }, [appUser, leaveType, start_date, endDate, reason, token]);

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, DROPDOWN_HEIGHT],
  });

  const dropdownOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const arrowRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      scrollIndicatorInsets={false}
      style={styles.mainContainer}
    >
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMsg}
        type={snackbarType}
        onDismiss={() => setSnackbarVisible(false)}
      />
      <View
        style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}
      >
        <BackButton />
        <Text style={styles.title}>Apply Leave</Text>
      </View>

      <View style={styles.applyLeaveForm}>
        <Text style={styles.label}>Leave Type</Text>

        <Pressable
          style={[
            styles.dropdownHeader,
            showDropdown && styles.dropdownHeaderActive,
          ]}
          onPress={toggleDropdown}
        >
          <Text
            style={[styles.dropdownText, !leaveType && styles.placeholderText]}
          >
            {leaveType
              ? leaves.find(item => item.id === leaveType)?.leave_name
              : 'Select Leave Type'}
          </Text>

          <Animated.Text
            style={[styles.arrow, { transform: [{ rotate: arrowRotate }] }]}
          >
            <ChevronDown size={24} color="black" />
          </Animated.Text>
        </Pressable>

        <Animated.View
          style={[
            styles.dropdownList,
            {
              height: dropdownHeight,
              opacity: dropdownOpacity,
            },
          ]}
        >
          {leaves.map(item => {
            const isSelected = item.id === leaveType;

            return (
              <Pressable
                key={item.id}
                style={[styles.dropdownItem, isSelected && styles.selectedItem]}
                onPress={() => {
                  setLeaveType(item.id);
                  setLeaveData(item);
                  toggleDropdown();
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    isSelected && styles.selectedItemText,
                  ]}
                >
                  {item.leave_name}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        <Text style={styles.label}>Reason</Text>
        <TextInput
          style={[styles.textField, styles.reasonBox]}
          placeholder="Enter reason for leave"
          multiline
          value={reason}
          onChangeText={setReason}
        />
        {leaveData?.is_permission !== true ? (
          <>
            <Text style={styles.label}>Leave Date</Text>

            <View style={styles.dateBoxContainer}>
              <View style={styles.dateBox}>
                <Text>From</Text>
                <CustomeDatePicker
                  date={start_date}
                  show={showStartDate}
                  setShow={setShowStartDate}
                  setDate={setStart_Date}
                />
              </View>
              <View style={styles.dateBox}>
                <Text>To</Text>
                <CustomeDatePicker
                  date={endDate}
                  show={showStartDate}
                  setShow={setShowStartDate}
                  setDate={setEndDate}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Permission Date</Text>

            <View style={styles.dateBoxContainer}>
              <View style={styles.permissionDate}>
                <CustomeDatePicker
                  date={start_date}
                  show={showStartDate}
                  setShow={setShowStartDate}
                  setDate={setStart_Date}
                />
              </View>
            </View>

            <View style={styles.mainTimeContainer}>
              <View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    marginTop: 12,
                    fontWeight: '500',
                  }}
                >
                  Start Time
                </Text>
                <View style={styles.timeConteiner}>
                  <View style={styles.permissionTime}>
                    <CustomeTimePicker />
                  </View>
                </View>
              </View>
              <View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    marginTop: 12,
                    fontWeight: '500',
                  }}
                >
                  End Time
                </Text>
                <View style={styles.timeConteiner}>
                  <View style={styles.permissionTime}>
                    <CustomeTimePicker />
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={styles.submitButtonContainer}>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.buttonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ApplyLeave;

const styles = StyleSheet.create({
  dateBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    textAlignVertical: 'top',
    backgroundColor: '#faf8f6',
    width: '45%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingStart: 10,
  },
  dateBoxContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '5%',
  },
  mainContainer: {
    marginTop: 5,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  applyLeaveForm: {
    padding: 12,
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 10,
    backgroundColor: '#faf8f6',
    elevation: 2,
  },
  dropdownHeaderActive: {
    borderColor: 'green',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111',
  },
  placeholderText: {
    color: '#999',
  },
  arrow: {
    fontSize: 14,
    color: '#555',
  },
  dropdownList: {
    overflow: 'hidden',
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownItem: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#111',
  },
  selectedItem: {
    backgroundColor: '#86b952',
  },
  selectedItemText: {
    color: 'white',
    fontWeight: '600',
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
  reasonBox: {
    height: 110,
  },
  submitButton: {
    padding: 10,
    paddingHorizontal: 100,
    borderRadius: 50,
    backgroundColor: '#86b952',
    color: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonContainer: {
    marginTop: 25,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionDate: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    textAlignVertical: 'top',
    backgroundColor: '#faf8f6',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingStart: 10,
  },
  permissionTime: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    textAlignVertical: 'top',
    backgroundColor: '#faf8f6',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  timeConteiner: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: '5%',
    justifyContent: 'center',
  },
  mainTimeContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
});
