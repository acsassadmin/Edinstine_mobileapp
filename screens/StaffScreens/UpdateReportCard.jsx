import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useUser } from "../../context/UserContext";
import TopBar from "../../components/ParentTobBar";
import BackButton from "../../components/BackButton";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { BASEURL } from "../../appurls";

const UpdateReportCard = () => {
  const { appUser, token } = useUser();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigation = useNavigation();
  const API_BASE_URL = `${BASEURL}/api/parent`;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/classroom-student-list/`,
        {
          params: { class_id: appUser?.class_id },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // console.log("Url is :", `${API_BASE_URL}/classroom-student-list/`);
      // console.log(`class_id: ${appUser?.class_id}`);
      // console.log("Response data is :", response.data);

      setStudents(response.data || []);
    } catch (error) {
      // console.log("Error fetching students:", error);
      Alert.alert("Error", "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appUser?.class_id) {
      fetchStudents();
    }
  }, [appUser]);

  const renderStudentCard = ({ item }) => {
    //  Check if avatar image exists, fallback to initials
    const hasAvatar = item.avatar || item.profile_image || item.image;
    const avatarUrl = item.avatar || item.profile_image || item.image;

    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() => {
          if (item) {
            navigation.navigate("SubjectRemards", { item });
          }
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {hasAvatar ? (
                //  DISPLAY IMAGE if available
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                //  FALLBACK to initials
                <Text style={styles.avatarText}>
                  {item.student_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.student_name || "Unknown Student"}
            </Text>
            <Text style={styles.rollNumber}>{item.roll_number || "N/A"}</Text>

            {/* <View style={styles.detailsRow}>
              <View style={styles.gradeContainer}>
                <Text style={styles.gradeLabel}>Grade:</Text>
              </View>
              <View style={styles.statusContainer}></View>
            </View> */}
          </View>

          {selectedStudent?.id === item.id && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>SELECTED</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.headerContainer}>
        <BackButton />
        <View>
          <Text style={styles.title}>Report Cards</Text>
          <Text style={styles.subtitle}>
            Select student to update report card
          </Text>
        </View>
      </View>

      <FlatList
        data={students}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📚</Text>
            </View>
            <Text style={styles.emptyTitle}>No students found</Text>
            <Text style={styles.emptySubtitle}>
              Students will appear here once assigned to your class
            </Text>
          </View>
        }
        ListFooterComponent={
          selectedStudent && (
            <View style={styles.actionFooter}>
              <TouchableOpacity
                style={[styles.actionButton, styles.updateButton]}
                onPress={() => {
                  if (selectedStudent) {
                    Alert.alert(
                      "Update Report Card",
                      `Update report card for ${selectedStudent.student_name}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Update",
                          style: "default",
                          onPress: () => {
                            // Navigate to report card update screen
                            // console.log(
                            //   "Navigate to report card update for:",
                            //   selectedStudent,
                            // );
                          },
                        },
                      ],
                    );
                  }
                }}
              >
                <Text style={styles.updateButtonText}>
                  📝 Update Report Card
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#86b952",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#86b952",
  },
  pendingStat: {
    color: "#f59e0b",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: "white",
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25, // Match your avatar radius
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#86b952",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", //  Important for circular image
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  avatarText: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },
  infoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  rollNumber: {
    fontSize: 16,
    color: "#666",
    fontWeight: "700",
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gradeContainer: {
    flexDirection: "row",
    gap: 4,
  },
  gradeLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statusContainer: {},
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
  pendingStatus: {
    color: "#f59e0b",
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#86b952",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  actionFooter: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  actionButton: {
    backgroundColor: "#86b952",
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#86b952",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  updateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  selectedStudentBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#86b952",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedStudentText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  clearSelection: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  clearText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default UpdateReportCard;
