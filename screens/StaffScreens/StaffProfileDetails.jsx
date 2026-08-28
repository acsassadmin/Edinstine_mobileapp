import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import dayjs from 'dayjs';
import TopBar from '../../components/ParentTobBar';
import { BASEURL } from '../../appurls';
import BackButton from '../../components/BackButton';
import {
  AlertCircle,
  Contact,
  User,
  Calendar,
  MapPin,
  PhoneCall,
  Droplet,
  Phone,
  School,
  Layers,
  Building2,
  ArrowLeftRight,
  ChevronUp,
  ChevronDown,
  Check,
  ShieldCheck,
} from 'lucide-react-native';

const DropdownItem = memo(({ item, selectedClass, onSelect }) => (
  <TouchableOpacity
    style={styles.dropdownItemRow}
    onPress={() => onSelect(item)}
  >
    <Text style={styles.dropdownItemText}>{item.class_name || item.name}</Text>
    {selectedClass?.id === item.id && <Check size={16} color="#86b952" />}
  </TouchableOpacity>
));

const StaffProfileDetails = () => {
  const navigation = useNavigation();
  const { token, switchClass, appUser } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const safeValue = (value, fallback = 'N/A') => value ?? fallback;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/api/common/biodata/?staff_id=${appUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProfileData(response.data);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [appUser.id, token]);

  const handleClassSelect = useCallback(
    item => {
      setSelectedClass(item);
      setIsOpen(false);
      switchClass(item.id);
    },
    [switchClass],
  );

  const handleToggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleResetPassword = useCallback(() => {
    navigation.navigate('ResetPassword');
  }, [navigation]);

  const renderDropdownItem = useCallback(
    item => (
      <DropdownItem
        key={item.id}
        item={item}
        selectedClass={selectedClass}
        onSelect={handleClassSelect}
      />
    ),
    [selectedClass, handleClassSelect],
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const classList = profileData?.metadata?.class_name_with_id || [];
    const initialClass = classList.find(
      item => item.id === appUser?.class_id || classList[0],
    );
    setSelectedClass(initialClass);
  }, [profileData, appUser?.class_id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>
          {error || 'No profile data available'}
        </Text>
      </View>
    );
  }

  const staff = profileData.staff_details || {};
  const academic = profileData.academic_details?.results?.[0] || {};

  return (
    <>
      <TopBar />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <BackButton />
        <View style={styles.heroHeader}>
          <Image source={{ uri: appUser?.profile_pic }} style={styles.avatar} />
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{academic.staff_name}</Text>
            <Text style={styles.heroDesignation}>{academic.designation}</Text>
            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Contact size={24} color="#86b952" />
                <Text style={styles.statValue}>{academic.employee_id}</Text>
                <Text style={styles.statLabel}>Employee ID</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <User size={24} color="#86b952" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.listItem}>
            <Calendar size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>
                {dayjs(staff.date_of_birth).format('DD MMM YYYY')}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <MapPin size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{safeValue(staff.address_line1)}</Text>
              <Text style={styles.subValue}>{safeValue(staff.city)}</Text>
              <Text style={styles.subValue}>
                {safeValue(staff.state)} - {safeValue(staff.zip_code)}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <PhoneCall size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{safeValue(staff.phone_number)}</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Droplet size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.value}>{safeValue(staff.blood_group)}</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Phone size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Emergency Contact</Text>
              <Text style={styles.value}>
                {safeValue(staff.emergency_contact)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <School size={24} color="#86b952" />
            <Text style={styles.sectionTitle}>Academic Details</Text>
          </View>

          <View style={styles.listItem}>
            <Layers size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Section</Text>
              <Text style={styles.value}>
                {safeValue(academic.section_name)}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Calendar size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Academic Year</Text>
              <Text style={styles.value}>
                {safeValue(academic.academic_year_name)}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Building2 size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Reporting To</Text>
              <Text style={styles.value}>Admin</Text>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <ArrowLeftRight size={24} color="#86b952" />
            <Text style={styles.sectionTitle}>Switch Class</Text>
          </View>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={handleToggleDropdown}
          >
            <Text style={styles.dropdownTriggerText}>
              {selectedClass ? selectedClass.name : 'Select a Class'}
            </Text>
            {isOpen ? (
              <ChevronUp size={18} color="#666" />
            ) : (
              <ChevronDown size={18} color="#666" />
            )}
          </TouchableOpacity>

          {isOpen && (
            <View style={styles.dropdownTray}>
              {profileData.metadata.class_name_with_id.map(renderDropdownItem)}
            </View>
          )}
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={24} color="#86b952" />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.bottomText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  heroHeader: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 10,
  },
  heroImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#86b952',
    marginBottom: 16,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroDesignation: {
    fontSize: 16,
    color: '#86b952',
    fontWeight: '600',
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#86b952',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  listSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 1,
  },
  value: {
    fontSize: 15,
    color: '#2d3748',
    fontWeight: '600',
    flex: 1,
  },
  subValue: {
    fontSize: 13,
    color: '#4a5568',
    marginTop: 1,
  },
  button: {
    backgroundColor: '#86b952',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  bottomText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
  },
  dropdownTriggerText: { fontSize: 14, color: '#444' },
  dropdownTray: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopWidth: 0,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: 2,
    overflow: 'hidden',
  },
  dropdownItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: { fontSize: 14, color: '#555' },
});

export default StaffProfileDetails;
