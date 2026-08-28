import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { BASEURL } from '../../appurls';

const ViewHealthUpdate = () => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { appUser, token } = useUser();

  const API_URL = `${BASEURL}/api/parent/health-update/?user_id=${appUser?.id}`;

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setHealthData(data.results || []);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Unable to load health data');
    } finally {
      setLoading(false);
    }
  };

  const renderHealthItem = ({ item }) => (
    <View style={styles.certificateCard}>
      <View style={styles.gradientBackground}>
        <View style={styles.gradientOverlay} />

        <View style={styles.cardInner}>
          <View style={styles.headerRow}>
            <Image
              source={{ uri: item.profile_image }}
              style={styles.profileImage}
            />
            <View style={styles.infoSection}>
              <Text style={styles.studentName}>{item.student_name}</Text>
              <Text style={styles.classroomName}>{item.classroom_name}</Text>
            </View>
          </View>

          <View style={styles.measurementsRow}>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Height</Text>
              <Text style={styles.measurementValue}>{item.height} cm</Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Weight</Text>
              <Text style={styles.measurementValue}>{item.weight} kg</Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>BMI</Text>
              <Text style={[styles.measurementValue, getBmiColor(item.bmi)]}>
                {item.bmi}
              </Text>
            </View>
          </View>

          {/* Footer with dates */}
          <View style={styles.footerRow}>
            <Text style={styles.checkupDate}>
              Checkup: {new Date(item.checkup_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const getBmiColor = bmi => ({
    color: parseFloat(bmi) > 14 ? '#FF6B6B' : '#2E7D32',
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading health updates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchHealthData} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <TopBar /> */}
      <View style={styles.titleContainer}>
        {/* <BackButton /> */}
        <Text style={styles.title}>Health Updates</Text>
      </View>
      <FlatList
        data={healthData}
        renderItem={renderHealthItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No health updates found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },

  // Certificate card style from your reference
  certificateCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#86b952',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    // elevation: 12,
  },

  //  PERFECT GRADIENT using your reference technique
  gradientBackground: {
    padding: 20,
    backgroundColor: '#85b952', // Primary green base
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Perfect white overlay
    borderRadius: 24,
  },
  cardInner: {
    position: 'relative',
    zIndex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  infoSection: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  classroomName: {
    fontSize: 14,
    color: '#4a4a4a',
    fontWeight: '600',
  },

  measurementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  measurementItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    marginHorizontal: 3,
  },
  measurementLabel: {
    fontSize: 11,
    color: '#4A7C3D',
    marginBottom: 2,
    fontWeight: '600',
  },
  measurementValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3C14',
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkupDate: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  updatedDate: {
    fontSize: 13,
    color: 'rgba(26,60,20,0.9)',
    fontStyle: 'italic',
    fontWeight: '500',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    padding: 40,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default ViewHealthUpdate;
