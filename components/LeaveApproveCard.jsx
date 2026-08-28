import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import { useNavigation } from "@react-navigation/native";

/* ---------- APPROVE / REJECT BUTTONS ---------- */
const ActionButtons = ({ onApprove, onReject }) => {
  return (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.approveBtn}
        onPress={onApprove}
      >
        <Text style={styles.actionText}>Approve</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.rejectBtn}
        onPress={onReject}
      >
        <Text style={styles.actionText}>Reject</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ---------- MAIN CARD ---------- */
const LeaveApproveCard = ({
  item,
  onApprove = () => console.log("Approved"),
  onReject = () => console.log("Rejected"),
}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("LeaveDetailsScreen", { item: item })}
    >
      <View style={styles.cardContainer}>
        {/* Title + Buttons in same row */}
        <View style={styles.headerRow}>
          <Text style={styles.leaveType} numberOfLines={1}>
            {item.leave_type_name}
            {/* {leaveType} */}
          </Text>

          <ActionButtons onApprove={onApprove} onReject={onReject} />
        </View>

        {/* <Text style={styles.reason} numberOfLines={2}>
          {item.reason} 
        </Text> */}
        <Text style={styles.reason} numberOfLines={2}>
          From {item.student_name}
        </Text>

        <View style={styles.cardBottom}>
          <Text style={styles.date}>
            {/* {dayjs(start_date).format("DD MMM")} -{" "}
            {dayjs(end_date).format("DD MMM")} */}
            {dayjs(item.start_date).format("DD MMM")} -{" "}
            {dayjs(item.end_date).format("DD MMM")}
          </Text>

          <Text style={styles.applyed_date}>
            {dayjs(item.created_at).format("DD-MM-YYYY HH:MM")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LeaveApproveCard;

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    marginTop: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    width: "100%",
  },

  /* --- Header Row --- */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  leaveType: {
    fontWeight: "600",
    fontSize: 15,
    flex: 1, //  allows text to shrink
    marginRight: 10,
  },

  /* --- Buttons --- */
  actionContainer: {
    flexDirection: "row",
    gap: 8,
  },

  approveBtn: {
    backgroundColor: "green",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },

  rejectBtn: {
    backgroundColor: "red",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },

  actionText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },

  /* --- Body --- */
  reason: {
    color: "gray",
    fontSize: 13,
    marginBottom: 10,
    width: "85%",
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    color: "#1E7F43",
  },

  applyed_date: {
    fontSize: 12,
    color: "gray",
  },
});
