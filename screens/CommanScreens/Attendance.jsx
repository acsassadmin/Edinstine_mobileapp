import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  LogBox,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import AppFeatures from '../../Features';
import { getFeatures } from '../../features.service';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import { BASEURL } from '../../appurls';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const { width } = Dimensions.get('window');

const MonthScrollList = ({ monthlyBreakdown }) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(
    monthlyBreakdown?.[0]?.month_name || null,
  );
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Access context data
  const { appUser, user, token } = useUser();
  // console.log("user", user);

  const convertMonthStringToDateStr = dateString => {
    if (!dateString) return '';
    const [monthName, year] = dateString.split(' ');
    const monthMap = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };
    const monthNumber = monthMap[monthName];
    return monthNumber ? `${year}-${monthNumber}` : '';
  };

  const fetchAttendanceList = async month => {
    // Ensure required data is available
    if (!appUser?.id || !token || !month) return;

    setLoading(true);
    setError(null);
    setAttendance([]);

    try {
      const monthKey = convertMonthStringToDateStr(month);

      const roleType = user.is_student ? 'parent' : 'staff';
      const paramKey = user.is_student ? 'student_id' : 'staff_id';

      const url = `${BASEURL}/api/${roleType}/get-monthly-attendance/?${paramKey}=${appUser.id}&month_key=${monthKey}`;
      // console.log("url key", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.days) {
        setAttendance(response.data.days);
      } else {
        setAttendance([]);
      }
    } catch (e) {
      setError('Failed to fetch attendance profile data');
      // console.log("Attendance API Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      fetchAttendanceList(selectedMonth);
    }
  }, [selectedMonth]);

  const renderMonthButton = ({ item, index }) => {
    const isSelected = index === selectedMonthIndex;

    return (
      <TouchableOpacity
        style={[
          styles.monthButton,
          isSelected ? styles.selectedButton : styles.unselectedButton,
        ]}
        onPress={() => {
          setSelectedMonthIndex(index);
          setSelectedMonth(item.month_name);
        }}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.monthText, isSelected && styles.selectedMonthText]}
        >
          {item.month_name
            ? `${item.month_name.slice(0, 3)} ${item.month_name.split(' ')[1]}`
            : 'N/A'}
        </Text>

        <View
          style={[
            styles.pill,
            isSelected ? styles.selectedPill : styles.unselectedPill,
          ]}
        >
          <Text
            style={[styles.pillText, isSelected && styles.selectedPillText]}
          >
            {Math.round(item.percentage)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusStyle = status => {
    switch (status) {
      case 'Present':
        return {
          badgeColor: styles.badgePresent,
          textColor: styles.textPresent,
        };
      case 'Absent':
        return {
          badgeColor: styles.badgeAbsent,
          textColor: styles.textAbsent,
        };
      default: // Weekend or Holiday
        return {
          badgeColor: styles.badgeWeekend,
          textColor: styles.textWeekend,
        };
    }
  };

  return (
    <View style={styles.scrollContainer}>
      {/* 1. Horizontal Month List */}
      <View style={styles.monthListContainer}>
        <FlatList
          data={monthlyBreakdown}
          renderItem={renderMonthButton}
          keyExtractor={item => item.month_name}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#86b952" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          style={styles.logsList}
          data={attendance}
          keyExtractor={(item, index) => item.date || index.toString()}
          renderItem={({ item }) => {
            const { badgeColor, textColor } = getStatusStyle(item.status);

            console.log('lod data', item);

            return (
              <View style={[styles.logCard, { borderWidth: 1 }]}>
                <View style={styles.logLeft}>
                  <Text style={styles.logDate}>{item.date}</Text>
                  <Text style={styles.logDay}>{item.day_name}</Text>
                </View>

                <View style={styles.logRight}>
                  <View style={[styles.statusBadge, badgeColor]}>
                    <Text style={[styles.statusText, textColor]}>
                      {item.status}
                    </Text>
                  </View>

                  {(item.check_in || item.check_out) && (
                    <View>
                      <Text style={styles.timeText}>
                        checkIn: {item.check_in || '—'}
                      </Text>
                      <Text style={styles.timeText}>
                        checkOut: {item.check_out || '—'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No attendance records found.</Text>
          }
        />
      )}
    </View>
  );
};

const AttendanceList = () => {
  const navigation = useNavigation();
  const { appUser, token, user } = useUser(); // Added user here for consistency, though currently only used in MonthScrollList
  const [attanceMonthsList, setAttanceMonthsList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttanceMonthList = async () => {
    if (!appUser?.id || !token) return;
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASEURL}/api/parent/get-student-attendance/?student_id=${appUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAttanceMonthsList(response.data);
      // console.log("Attendance Month List", response.data);
    } catch (err) {
      setError('Failed to load attendance data');
      // console.log("Attendance API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttanceMonthList();
  }, [appUser?.id, token]);

  // console.log('moth data', attanceMonthsList);

  return (
    <View style={styles.container}>
      <TopBar />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 15,
          paddingVertical: 15,
          paddingHorizontal: 10,
          backgroundColor: '#ffffff',
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#000000' }}>
          Attendance
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#86b952"
          style={{ marginTop: 40 }}
        />
      ) : (
        attanceMonthsList && (
          <>
            {/* Summary Container - Fixed Height */}
            <View style={styles.cardContent}>
              <Text style={styles.titleText}>Summary</Text>
              <View style={styles.horizontalRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {attanceMonthsList.summary.total_days}
                  </Text>
                  <Text style={styles.metricLabel}>Total Days</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: '#2ecc71' }]}>
                    {attanceMonthsList.summary.total_present}
                  </Text>
                  <Text style={styles.metricLabel}>Present</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: '#e74c3c' }]}>
                    {attanceMonthsList.summary.total_absent}
                  </Text>
                  <Text style={styles.metricLabel}>Absent</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: '#3498db' }]}>
                    {attanceMonthsList.summary.overall_percentage}%
                  </Text>
                  <Text style={styles.metricLabel}>Attendance</Text>
                </View>
              </View>
            </View>

            {/* Month List - Fills remaining height */}
            <MonthScrollList
              monthlyBreakdown={attanceMonthsList.monthly_breakdown}
            />
          </>
        )
      )}
    </View>
  );
};

export default AttendanceList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  cardContent: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 25,
    textAlign: 'center',
  },
  horizontalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7f8c8d',
    textAlign: 'center',
  },

  // --- Fixed Height Styles ---
  scrollContainer: {
    flex: 1, // CRITICAL: Makes this view take all remaining space
    marginTop: 5,
  },
  monthListContainer: {
    // Container for the horizontal list
    paddingBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
  },
  unselectedButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  selectedButton: {
    backgroundColor: '#86b952',
    borderColor: '#86b952',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  selectedMonthText: {
    color: '#ffffff',
  },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  unselectedPill: {
    backgroundColor: '#e9ecef',
  },
  selectedPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c757d',
  },
  selectedPillText: {
    color: '#ffffff',
  },

  // Logs List Styles
  logsList: {
    flex: 1, // CRITICAL: Forces the list to fill the remaining height of the parent
    paddingHorizontal: 16,
  },
  logCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  logLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b2b2b',
  },
  logDay: {
    fontSize: 12,
    color: '#868e96',
  },
  logRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgePresent: { backgroundColor: '#e8f5e9' },
  badgeAbsent: { backgroundColor: '#ffebee' },
  badgeWeekend: { backgroundColor: '#f3f4f6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  textPresent: { color: '#2ecc71' },
  textAbsent: { color: '#e74c3c' },
  textWeekend: { color: '#9ca3af' },
  timeText: { fontSize: 11, color: '#495057', fontWeight: '500' },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 2,
  },
  errorText: { textAlign: 'center', color: 'red', marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
});
