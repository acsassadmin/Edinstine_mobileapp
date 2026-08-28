import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import { useUser } from '../../context/UserContext'; // adjust the path if needed
import { useNavigation } from '@react-navigation/native';
import CustomeTab from '../../components/CustomeTab';
import StudentLeaves from './StudentLeaves';
import ApplyLeave from './ApplyLeave';
import { useStorage } from '../../context/StorageContext';

const StudentLeaveHistory = () => {
  const { selectedTab, setSelectedTab } = useStorage();
  const navigation = useNavigation();
  const { appUser } = useUser();
  // console.log("tab index", selectedTab);
  useEffect(() => {
    return () => {};
  }, [appUser]);

  const tabs = ['My Leave', 'Request Leave'];
  const handleOnPress = index => {
    setSelectedTab(index);
  };
  const renderTabUI = () => {
    if (selectedTab === 0) {
      return <StudentLeaves />;
    } else if (selectedTab === 1) {
      return <ApplyLeave />;
    }
  };
  return (
    <View style={styles.mainContainer}>
      {/* <BackButton/> */}
      <View>
        <CustomeTab tabs={tabs} onTabPress={index => handleOnPress(index)} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* <BackButton /> */}
        </View>
      </View>
      {renderTabUI(selectedTab)}
    </View>
  );
};

export default StudentLeaveHistory;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    padding: 10,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
