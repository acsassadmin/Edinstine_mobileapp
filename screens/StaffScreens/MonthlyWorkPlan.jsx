import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import { BASEURL } from '../../appurls';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';

const StudentCard = memo(({ item, onPress }) => (
  <TouchableOpacity style={styles.studentCard} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={styles.avatarContainer}>
        {item.profile_image ? (
          <Image source={{ uri: item.profile_image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.student_name
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase() || 'S'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.studentName} numberOfLines={1}>
          {item.student_name}
        </Text>
        <Text style={styles.rollNumber}>{item.roll_number}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.classroom}>{item.classroom_name}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

const MonthlyWorkPlan = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { appUser, token } = useUser();
  const navigation = useNavigation();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASEURL}/api/parent/classroom-student-list/?class_id=${appUser?.class_id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [appUser?.class_id, token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  }, [fetchStudents]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
      setIsSearching(false);
    } else {
      const filtered = students.filter(
        student =>
          student.student_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.roll_number
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.registration_number
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
      setFilteredStudents(filtered);
      setIsSearching(true);
    }
  }, [searchQuery, students]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleStudentPress = useCallback(
    item => {
      navigation.navigate('AllocatePlan', {
        studentId: item.student,
        class_id: item.classroom,
      });
    },
    [navigation],
  );

  const renderStudentCard = useCallback(
    ({ item }) => (
      <StudentCard item={item} onPress={() => handleStudentPress(item)} />
    ),
    [handleStudentPress],
  );

  if (loading && students.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />
      <BackButton />
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, roll number, or registration number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
            >
              <X size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {isSearching && (
          <View style={styles.searchInfo}>
            <Text style={styles.searchInfoText}>
              Found {filteredStudents.length} student(s) for "{searchQuery}"
            </Text>
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No students found' : 'No students available'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 8,
    justifyContent: 'center',
    borderRadius: 12,
  },
  searchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  searchInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  studentCard: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#86b952',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },
  infoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  rollNumber: {
    fontSize: 15,
    color: '#666',
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  classroom: {
    fontSize: 14,
    color: '#86b952',
    fontWeight: '700',
    backgroundColor: 'rgba(134, 185, 82, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  teacher: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MonthlyWorkPlan;
