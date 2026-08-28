import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Phone,
  Droplet,
  Users,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Layers,
  Home,
  ShieldCheck,
} from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import dayjs from 'dayjs';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import { BASEURL } from '../../appurls';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProfileDetails = () => {
  const navigation = useNavigation();

  const { appUser, token } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeValue = (value, fallback = 'N/A') => value ?? fallback;

  const fetchProfile = useCallback(async () => {
    if (!appUser?.id || !token) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/api/common/biodata/?user_id=${appUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setProfileData(response.data);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [appUser?.id, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const student = profileData.student_details || {};
  const parent = profileData.parent_details || {};
  const academic = profileData.academic_details?.[0] || {};

  return (
    <>
      <TopBar />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.titleContainer}>
          <View>
            <BackButton />
          </View>
          <Text style={styles.mainTitle}>Profile Details</Text>
        </View>
        <View style={styles.heroHeader}>
          <Image source={{ uri: appUser?.profile_pic }} style={styles.avatar} />

          <View style={styles.heroContent}>
            <Text style={styles.heroName}>
              {safeValue(academic.student_name)}
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {safeValue(academic.roll_number)}
                </Text>
                <Text style={styles.statLabel}>Roll No</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {safeValue(academic.registration_number)}
                </Text>
                <Text style={styles.statLabel}>Reg No</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <User size={24} color="#86b952" />
            <Text style={styles.sectionTitle}>Student Information</Text>
          </View>

          <View style={styles.listItem}>
            <Calendar size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>
                {dayjs(student.date_of_birth).format('DD MMM YYYY')}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <MapPin size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>
                {`${safeValue(student.address_line1)}, ${safeValue(
                  student.address_line2,
                )}`}
              </Text>
              <Text style={styles.subValue}>
                {`${safeValue(student.city)}, ${safeValue(
                  student.state,
                )} - ${safeValue(student.zip_code)}`}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Phone size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>
                {safeValue(student.phone_number)}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Droplet size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.value}>
                {safeValue(student?.blood_group)}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <AlertCircle size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Emergency Contact</Text>
              <Text style={styles.value}>
                {safeValue(student.emergency_contact)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Users size={24} color="#86b952" />
            <Text style={styles.sectionTitle}>Parent Information</Text>
          </View>

          <View style={styles.listItem}>
            <User size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Father</Text>
              <Text style={styles.value}>{safeValue(parent.father_name)}</Text>
              <Text style={styles.subValue}>
                {safeValue(parent.father_contact_number)} •{' '}
                {safeValue(parent.father_occupation)}
              </Text>
              <Text style={styles.subText}>
                {safeValue(parent.father_education_qualification)}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <User size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Mother</Text>
              <Text style={styles.value}>{safeValue(parent.mother_name)}</Text>
              <Text style={styles.subValue}>
                {safeValue(parent.mother_contact_number)} •{' '}
                {safeValue(parent.mother_occupation)}
              </Text>
              <Text style={styles.subText}>
                {safeValue(parent.mother_education_qualification)}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <TrendingUp size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Yearly Income</Text>
              <Text style={styles.value}>
                ₹{safeValue(parent.parent_yearly_income?.toLocaleString())}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={24} color="#86b952" />
            <Text style={styles.sectionTitle}>Academic Details</Text>
          </View>

          <View style={styles.listItem}>
            <BookOpen size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Standard</Text>
              <Text style={styles.value}>
                {safeValue(academic.standar_name)}
              </Text>
            </View>
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
                {safeValue(academic.academic_year_display)}
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Home size={20} color="#86b952" />
            <View>
              <Text style={styles.label}>Classroom</Text>
              <Text style={styles.value}>
                {safeValue(academic.classroom_name)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={24} color="#86b952" />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ResetPassword')}
          >
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
  titleContainer: {
    alignItems: 'start',
    paddingVertical: 12,
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a202c',
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
    marginBottom: 16,
    textAlign: 'center',
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
    borderBottomColor: '#f7fafc',
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
  subText: {
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
    marginTop: 2,
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
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },
  imageEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#86b952',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});

export default ProfileDetails;
