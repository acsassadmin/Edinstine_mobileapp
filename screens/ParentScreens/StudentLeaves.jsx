import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl, // 1. Imported RefreshControl
  StyleSheet,
  View,
} from 'react-native';
import LeaveHistoryCard from '../../components/LeaveHistoryCard';
import StudentLeaveHistoryServices, {
  InvalidTokenError,
} from '../../services/StudentLeaveHistoryService';
import { useUser } from '../../context/UserContext';
import dayjs from 'dayjs';
import SkeletonLeaveCard from '../../loadingScreens/LeaveHistoryCardLoading';
import BackButton from '../../components/BackButton';
import { Text } from 'react-native';

const StudentLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 2. Added refreshing state
  const [hasMore, setHasMore] = useState(true);
  const { appUser, token, logout } = useUser();

  const fetchLeaves = async (isRefreshing = false) => {
    // If regular loading or no more data, stop (unless pulling to refresh)
    if ((loading && !isRefreshing) || (!hasMore && !isRefreshing)) return;

    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Use page 1 if refreshing, otherwise use the current page tracker
      const targetPage = isRefreshing ? 1 : page;
      const response = await StudentLeaveHistoryServices.getLeaveHistory(
        appUser?.id,
        targetPage,
        token,
      );

      const newLeaves = response.results || [];

      // Overwrite data if refreshing, otherwise append it
      setLeaves(prev => (isRefreshing ? newLeaves : [...prev, ...newLeaves]));

      if (!response.links?.next) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setPage(isRefreshing ? 2 : prev => prev + 1);
      }
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // 3. Added refresh handler function
  const onRefresh = () => {
    fetchLeaves(true);
  };

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return <SkeletonLeaveCard />;
  };

  return (
    // REMOVED outer ScrollView wrapper so RefreshControl and scrolling function correctly
    <View style={styles.mainContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <BackButton />
        <Text style={{ fontSize: 16 }}>My leaves</Text>
      </View>
      <FlatList
        style={{ padding: 5 }}
        data={leaves}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <LeaveHistoryCard
            leaveType={item.leave_type_name}
            reason={item.reason}
            start_date={item.start_date}
            end_date={item.end_date}
            status={item.status.toLowerCase()}
            applyed_date={
              item.created_at
                ? dayjs(item.created_at).format('DD-MM-YYYY HH:mm')
                : '-'
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onEndReached={() => fetchLeaves(false)}
        ListFooterComponent={renderFooter}
        // 4. Added native refresh control layout properties
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default StudentLeaves;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 10,
    // borderWidth: 2,
  },
});
