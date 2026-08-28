import { View, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import CustomeTab from '../../components/CustomeTab';
import { useUser } from '../../context/UserContext';
import ApplyLeave from './ApplyLeave';
import ApproveLeave from './ApproveLeave';
import MyLeaves from './MyLeaves';
import { getFeatures } from '../../features.service';

const LeaveManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [tabs, setTabs] = useState([]);
  const navigation = useNavigation();
  const { appUser } = useUser();

  // Store tab config with label + component
  const [tabConfig, setTabConfig] = useState([]);

  useEffect(() => {
    let tempTabs = [];

    if (getFeatures()?.student_leave_approval) {
      tempTabs.push({ label: 'Approve Leave', component: <ApproveLeave /> });
    }

    if (getFeatures()?.staff_leave_history) {
      tempTabs.push({ label: 'My Leave', component: <MyLeaves /> });
    }

    // Always available
    tempTabs.push({ label: 'Request Leave', component: <ApplyLeave /> });

    setTabConfig(tempTabs);
    setTabs(tempTabs.map(tab => tab.label));

    // Reset selected tab if needed
    setSelectedTab(0);
  }, [appUser]);

  const handleOnPress = index => {
    setSelectedTab(index);
  };

  return (
    <View style={styles.mainContainer}>
      <CustomeTab tabs={tabs} onTabPress={handleOnPress} />

      {/* Render based on dynamic config */}
      <View style={{ flex: 1 }}>{tabConfig[selectedTab]?.component}</View>
    </View>
  );
};

export default LeaveManagement;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    padding: 10,
    paddingBottom: 20,
    width: '100%',
  },
});
