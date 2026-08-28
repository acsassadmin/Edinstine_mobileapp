import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useUser } from '../../context/UserContext'; // adjust path
import TopBar from '../../components/ParentTobBar';
import { BASEURL } from '../../appurls';
import { useNavigation } from '@react-navigation/native';

const DriverProfileDetail = ({ driverId }) => {
  const navigation = useNavigation();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, appUser } = useUser(); // get token from context

  // Fetch driver data with token header
  const fetchDriver = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASEURL}/api/common/biodata/?driver_id=${appUser?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token here
          },
        },
      );

      if (response.data.driver_details) {
        setDriver(response.data.driver_details);
      } else {
        Alert.alert('Error', 'Driver data not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch driver data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [driverId, token]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text style={{ marginTop: 10 }}>Loading Driver Profile...</Text>
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={styles.loaderContainer}>
        <Text>No Driver Data Available</Text>
      </View>
    );
  }

  return (
    <>
      <TopBar />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: appUser?.profile_pic }} style={styles.avatar} />
        {/* <EditableAvatar url={driver.profile_pic} onSuccess={() => fetchDriver()} /> */}

        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.role}>Driver</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{driver.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mobile:</Text>
            <Text style={styles.value}>{driver.mobile_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{driver.dob}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{driver.gender}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{driver.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Pincode:</Text>
            <Text style={styles.value}>{driver.pincode}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>License Number:</Text>
            <Text style={styles.value}>{driver.license_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Experience (years):</Text>
            <Text style={styles.value}>{driver.no_of_exp}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date of Joining:</Text>
            <Text style={styles.value}>{driver.date_of_joining}</Text>
          </View>
        </View>

        <View style={styles.listSection}>
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

export default DriverProfileDetail;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicContainer: {
    marginBottom: 20,
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#86b952',
  },
  profilePic: {
    width: 120,
    height: 120,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 16,
    color: '#86b952',
    marginBottom: 20,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listSection: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16, // ↓ 20→16
    padding: 20, // ↓ 24→20
    marginBottom: 16, // ↓ 20→16
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // ↓ 2→1
    shadowOpacity: 0.03, // ↓ 0.04→0.03
    shadowRadius: 6, // ↓ 8→6
    elevation: 3,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // ↓ 12→10
    marginBottom: 20, // ↓ 24→20
    paddingBottom: 12, // ↓ 16→12
    borderBottomWidth: 1.5, // ↓ 2→1.5
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18, // ↓ 22→18
    fontWeight: '700',
    color: '#2d3748',
    flex: 1,
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
  label: {
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontWeight: '500',
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
