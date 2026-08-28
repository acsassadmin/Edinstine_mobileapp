// screens/ApproveLeave.js
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { useUser } from "../../context/UserContext";
import SkeletonLeaveList from "../../loadingScreens/LeaveHistoryCardLoading";
import LeaveApproveCard from "../../components/LeaveApproveCard";
import LeaveManagementServices from "../../services/LeaveManagementService";
import BackButton from "../../components/BackButton";

const ApproveLeave = () => {
  const [data, setData] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const { token, appUser } = useUser();

  const loadLeaves = async (isLoadMore = false) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);

      const json = await LeaveManagementServices.getApplyedLeaves(
        token,
        appUser.id,
        appUser,
      );
      // console.log("load response", json);
      // Filter only pending leaves
      const pendingLeaves = json.results;

      setData((prev) =>
        isLoadMore ? [...prev, ...pendingLeaves] : pendingLeaves,
      );
      setNextUrl(json.links?.next || null);
    } catch (error) {
      // console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadLeaves(); // initial fetch
    // console.log("fetched");
  }, [appUser]);

  const handleLoadMore = () => {
    if (nextUrl && !loadingMore) {
      loadLeaves(nextUrl, true);
    }
  };

  const approveLeave = async (leave_id) => {
    const response = await LeaveManagementServices.updateLeaveStatus(
      token,
      leave_id,
      "Approved",
    );
    // console.log(response)
    if (response.status === 200) {
      loadLeaves();
    }
  };

  const rejectLeave = async (leave_id) => {
    const response = await LeaveManagementServices.updateLeaveStatus(
      token,
      leave_id,
      "Rejected",
    );
    if (response.status === 200) {
      loadLeaves();
    }
  };

  const renderItem = ({ item }) => (
    <LeaveApproveCard
      item={item}
      // leaveType={item.leave_type_name}
      // reason={item.reason}
      // start_date={item.start_date}
      // end_date={item.end_date}
      // applyed_date={item.created_at}
      // status={item.status}
      // from={item.student_name}
      onApprove={() => {
        approveLeave(item.id);
      }}
      onReject={() => {
        rejectLeave(item.id);
      }}
    />
  );

  return (
    <View style={styles.container}>
      <View
        style={{ flexDirection: "row", alignItems: "center", columnGap: 10 }}
      >
        <BackButton />
        <Text style={{ fontSize: 16 }}>Approve leave</Text>
      </View>
      {data.length === 0 ? (
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Text style={styles.emptyText}>No Data Found</Text>
        </View>
      ) : loading && !loadingMore ? (
        <SkeletonLeaveList size="large" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color="#86b952" size="small" />
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ApproveLeave;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    width: "100%",
  },
});
