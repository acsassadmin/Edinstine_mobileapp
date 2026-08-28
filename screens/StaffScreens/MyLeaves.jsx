import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LeaveHistoryCard from '../../components/LeaveHistoryCard';
import StudentLeaveHistoryServices, {
  InvalidTokenError,
} from '../../services/StudentLeaveHistoryService';
import { useUser } from '../../context/UserContext';
import dayjs from 'dayjs';
import SkeletonLeaveCard from '../../loadingScreens/LeaveHistoryCardLoading';
import LeaveManagementServices from '../../services/LeaveManagementService';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [page, setPage] = useState(1); // current page
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // to know if more data exists
  const { appUser, token, logout } = useUser();
  // console.log(token);
  const fetchLeaves = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await LeaveManagementServices.myLeaves(
        token,
        appUser?.id,
      );

      // API returns results inside response.results
      const newLeaves = response.results || [];
      setLeaves(prev => [...prev, ...newLeaves]);

      // If links.next is null, no more data
      if (!response.links?.next) {
        setHasMore(false);
      } else {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        logout();
      }
      console.error('Error fetching leave history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const renderFooter = () => {
    if (!loading) return null;
    return <SkeletonLeaveCard />;
  };

  return (
    <View style={styles.mainContainer}>
      {leaves.length === 0 ? (
        <>
          <View
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text>No Data Found</Text>
          </View>
        </>
      ) : (
        <FlatList
          style={{ padding: 5 }}
          data={leaves}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <LeaveHistoryCard
              leaveType={item.leave_type_name}
              reason={item.reason}
              start_date={item.start_date}
              end_date={item.end_date}
              status={item.status.toLowerCase()} // normalize to match your RenderStatus checks
              applyed_date={
                item.created_at
                  ? dayjs(item.created_at).format('DD-MM-YYYY HH:mm')
                  : '-'
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReached={fetchLeaves} // load next page when scroll reaches end
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default MyLeaves;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 10,
  },
});
