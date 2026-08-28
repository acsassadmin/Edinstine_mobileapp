import React, { useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppFeatures from '../../Features';
import { getFeatures } from '../../features.service';
import {
  Mail,
  Book,
  BriefcaseMedical,
  FileText,
  Calendar,
  ChevronRight,
  Package,
  LineChart,
  Briefcase,
  FilePen,
  ShieldEllipsis,
  User,
  Bell,
} from 'lucide-react-native';

const AVATAR_SIZE = 120;

const ProfileListItem = memo(({ onPress, icon, label }) => (
  <TouchableOpacity onPress={onPress} style={styles.listItem}>
    <View style={styles.listLeft}>
      {icon}
      <Text style={styles.listText}>{label}</Text>
    </View>
    <ChevronRight size={20} color="#999" />
  </TouchableOpacity>
));

const StaffProfile = () => {
  const navigation = useNavigation();
  const { appUser } = useUser();

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        },
      },
    ]);
  }, [navigation]);

  const handleNavigateHomework = useCallback(() => {
    navigation.navigate('Homework');
  }, [navigation]);

  const handleNavigateMedicalInstruction = useCallback(() => {
    navigation.navigate('ViewMedicalInstruction');
  }, [navigation]);

  const handleNavigateUpdateReportCard = useCallback(() => {
    navigation.navigate('UpdateReportCard');
  }, [navigation]);

  const handleNavigateAttendanceList = useCallback(() => {
    navigation.navigate('AttandanceList');
  }, [navigation]);

  const handleNavigateInventoryManagement = useCallback(() => {
    navigation.navigate('InventoryManagement');
  }, [navigation]);

  const handleNavigateFinanceManagement = useCallback(() => {
    navigation.navigate('FinanceManagement');
  }, [navigation]);

  const handleNavigateMonthlyWorkPlan = useCallback(() => {
    navigation.navigate('MonthlyWorkPlan');
  }, [navigation]);

  const handleNavigateRecordOfWork = useCallback(() => {
    navigation.navigate('RecordOfWork');
  }, [navigation]);

  const handleNavigateSchoolPolicies = useCallback(() => {
    navigation.navigate('SchoolPolicies');
  }, [navigation]);

  const handleNavigateStaffProfileDetails = useCallback(() => {
    navigation.navigate('StaffProfileDetailsScreen');
  }, [navigation]);

  const handleNavigateNotification = useCallback(() => {
    navigation.navigate('Notification');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 80 }}
      >
        <View style={styles.profileCard}>
          <Image source={{ uri: appUser?.profile_pic }} style={styles.avatar} />

          <View style={styles.info}>
            <Text style={styles.name}>{appUser?.name}</Text>
            <Text style={styles.role}>Class Teacher</Text>

            <View style={styles.row}>
              <Mail size={16} color="#555" />
              <Text style={styles.rowText}>{appUser?.email}</Text>
            </View>

            <View style={styles.row}></View>
          </View>

          <View style={{ marginTop: 20 }}>
            {(getFeatures()?.certificate_management ||
              getFeatures()?.homework ||
              getFeatures()?.medical_instruction ||
              getFeatures()?.report_card_management) && (
              <Text style={styles.subheading}>Student</Text>
            )}

            <View style={styles.listContainer}>
              {getFeatures()?.homework && (
                <ProfileListItem
                  onPress={handleNavigateHomework}
                  icon={<Book size={24} color="black" />}
                  label="Handbook"
                />
              )}

              {getFeatures()?.medical_instruction && (
                <ProfileListItem
                  onPress={handleNavigateMedicalInstruction}
                  icon={
                    <BriefcaseMedical
                      size={20}
                      color="black"
                      style={{ marginRight: 12 }}
                    />
                  }
                  label="Medical Condition"
                />
              )}

              {getFeatures()?.report_card_management && (
                <ProfileListItem
                  onPress={handleNavigateUpdateReportCard}
                  icon={
                    <FileText
                      size={24}
                      color="black"
                      style={{ marginRight: 12 }}
                    />
                  }
                  label="Report Card"
                />
              )}

              <ProfileListItem
                onPress={handleNavigateAttendanceList}
                icon={<Calendar size={20} color="black" />}
                label="My Attendance"
              />
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            {(getFeatures()?.inventory_management ||
              getFeatures()?.finance_management ||
              getFeatures()?.record_of_work) && (
              <Text style={styles.subheading}>More</Text>
            )}

            <View style={styles.listContainer}>
              {getFeatures()?.finance_management && (
                <ProfileListItem
                  onPress={handleNavigateInventoryManagement}
                  icon={<Package size={24} color="black" />}
                  label="Inventory Management"
                />
              )}

              {getFeatures()?.finance_management && (
                <ProfileListItem
                  onPress={handleNavigateFinanceManagement}
                  icon={<LineChart size={24} color="black" />}
                  label="Finance Management"
                />
              )}

              {getFeatures()?.record_of_work && (
                <>
                  <ProfileListItem
                    onPress={handleNavigateMonthlyWorkPlan}
                    icon={<Briefcase size={24} color="black" />}
                    label="Monthly Work Plan"
                  />
                  <ProfileListItem
                    onPress={handleNavigateRecordOfWork}
                    icon={<FilePen size={22} color="black" />}
                    label="Record of work"
                  />
                </>
              )}

              <ProfileListItem
                onPress={handleNavigateSchoolPolicies}
                icon={<ShieldEllipsis size={24} color="black" />}
                label="School policies"
              />
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.subheading}>Account</Text>

            <View style={styles.listContainer}>
              <ProfileListItem
                onPress={handleNavigateStaffProfileDetails}
                icon={<User size={22} color="black" />}
                label="Profile Details"
              />

              <ProfileListItem
                onPress={handleNavigateNotification}
                icon={<Bell size={22} color="black" />}
                label="Notification"
              />
            </View>
          </View>

          <View style={{ marginTop: 30, marginBottom: 50 }}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebf4d7',
  },
  profileCard: {
    backgroundColor: '#fff',
    flex: 1,
    borderTopRightRadius: 80,
    borderTopLeftRadius: 80,
    paddingTop: AVATAR_SIZE / 2 + 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    position: 'absolute',
    top: -AVATAR_SIZE / 2,
    left: '55%',
    transform: [{ translateX: -(AVATAR_SIZE / 2) }],
    borderWidth: 8,
    borderColor: '#fff',
  },
  info: {
    alignItems: 'center',
    marginTop: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  role: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  subheading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContainer: {
    backgroundColor: '#ddead0',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
