import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import { BASEURL } from '../../appurls';
import BackButton from '../../components/BackButton';

const StudentCheckinCheckout = () => {
  const { appUser, token } = useUser();

  const [attendanceByDay, setAttendanceByDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  IMAGE VIEWER STATES
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const url = `${BASEURL}/api/parent/student-attendance/?student_id=${appUser.id}`;

  useEffect(() => {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(url, { headers })
      .then(response => {
        const results = response.data.results;

        if (!Array.isArray(results) || results.length === 0) {
          setAttendanceByDay([]);
          setLoading(false);
          return;
        }

        const studentAttendance = results[0].attendance_data;
        const grouped = groupByDate(studentAttendance);
        setAttendanceByDay(grouped);
        setLoading(false);
      })
      .catch(err => {
        const msg = err.response?.data?.detail || err.message;
        setError(msg || 'Failed to load data');
        setLoading(false);
      });
  }, [token]);

  const formatDate = isoStr => {
    const [year, month, day] = isoStr.split('T')[0].split('-');
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = isoStr => {
    const [timePart] = isoStr.split('T')[1].split('.');
    return timePart;
  };

  const groupByDate = items => {
    const groups = {};

    items.forEach(item => {
      const dateStr = item.timestamp.split('T')[0];

      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          checkIn: null,
          checkOut: null,
        };
      }

      if (item.type === 'check_in') {
        groups[dateStr].checkIn = item;
      } else if (item.type === 'check_out') {
        groups[dateStr].checkOut = item;
      }
    });

    return Object.values(groups).sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  };

  //  OPEN IMAGE
  const openImage = uri => {
    setSelectedImage(uri);
    setImageModalVisible(true);
  };

  const renderAttendanceItem = ({ item }) => {
    const dateLabel = formatDate(item.date);

    const checkInPhotoUri = item.checkIn?.photo || null;
    const checkOutPhotoUri = item.checkOut?.photo || null;

    return (
      <View style={styles.cardContainer}>
        <Text style={styles.dayTitle}>{dateLabel}</Text>

        <View style={styles.timeRow}>
          {/* Check-in */}
          <View style={styles.timeCard}>
            {checkInPhotoUri ? (
              <TouchableOpacity onPress={() => openImage(checkInPhotoUri)}>
                <Image
                  source={{ uri: checkInPhotoUri }}
                  style={styles.timeImage}
                />
              </TouchableOpacity>
            ) : (
              <Text style={styles.notTaken}>No photo</Text>
            )}
            <Text style={styles.timeLabel}>Check-in</Text>
            <Text style={styles.time}>
              {item.checkIn ? formatTime(item.checkIn.timestamp) : '--:--'}
            </Text>
          </View>

          {/* Check-out */}
          <View style={styles.timeCard}>
            {checkOutPhotoUri ? (
              <TouchableOpacity onPress={() => openImage(checkOutPhotoUri)}>
                <Image
                  source={{ uri: checkOutPhotoUri }}
                  style={styles.timeImage}
                />
              </TouchableOpacity>
            ) : (
              <Text style={styles.notTaken}>No photo</Text>
            )}
            <Text style={styles.timeLabel}>Check-out</Text>
            <Text style={styles.time}>
              {item.checkOut ? formatTime(item.checkOut.timestamp) : '--:--'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 6,
          // justifyContent: "center",
        }}
      >
        <BackButton />
        <Text style={styles.header}>Check-in / Check-out</Text>
      </View>

      <FlatList
        data={attendanceByDay}
        keyExtractor={item => item.date}
        renderItem={renderAttendanceItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={{ fontSize: 14 }}>No data</Text>}
      />

      {/*  IMAGE FULLSCREEN MODAL */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default StudentCheckinCheckout;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    // marginBottom: 10,
  },
  listContainer: { padding: 12 },

  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
  },
  dayTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },

  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeCard: { flex: 1, alignItems: 'center', marginHorizontal: 4 },

  timeImage: {
    width: 140,
    height: 140,
    borderRadius: 6,
    marginBottom: 4,
  },

  notTaken: { fontSize: 12, color: '#999', marginVertical: 6 },
  timeLabel: { fontSize: 12, color: '#555' },
  time: { fontSize: 14, fontWeight: '500' },

  /*  MODAL STYLES */
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '95%',
    height: '80%',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
