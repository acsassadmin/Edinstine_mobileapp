import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import TopBar from "../../components/ParentTobBar";
import { useUser } from "../../context/UserContext";
import dayjs from "dayjs";
import { BASEURL } from "../../appurls";

const SubjectRemards = () => {
  const route = useRoute();
  const { item } = route.params || {};
  const [classSubjects, setClassSubjects] = useState([]);
  const [studentRatings, setStudentRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tempRating, setTempRating] = useState(0);
  const { appUser, token } = useUser();

  useEffect(() => {
    if (item?.student && item?.classroom) {
      fetchClassData(item.student, item.classroom);
    }
  }, [item]);

  const fetchClassData = async (studentId, classId) => {
    try {
      setLoading(true);

      // Fetch both APIs concurrently
      const [subjectsResponse, ratingsResponse] = await Promise.all([
        fetch(`${BASEURL}/api/common/class-subjects/?classroom_id=${classId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(
          `${BASEURL}/api/common/student-enrollments/?student_id=${studentId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        ),
      ]);

      if (!subjectsResponse.ok || !ratingsResponse.ok) {
        throw new Error(
          `HTTP error! status: ${subjectsResponse.status || ratingsResponse.status}`,
        );
      }

      const subjectsData = await subjectsResponse.json();
      const ratingsData = await ratingsResponse.json();

      // console.log("Class Subjects:", subjectsData);
      // console.log("Student Ratings:", ratingsData);

      // Merge subjects with ratings (match by subject_id)
      const mergedData = subjectsData.results.map((subject) => {
        const rating = ratingsData.results.find(
          (r) => r.subject === subject.subject,
        );
        return {
          ...subject,
          rating_score: rating ? rating.rating_score : 0,
          max_rating: rating ? rating.max_rating : 5,
          rating: rating ? rating.rating : "0/5",
          enrollment_id: rating ? rating.id : null,
          has_rating: !!rating,
          updated_at: rating ? rating.updated_at : null,
        };
      });

      setClassSubjects(mergedData);
      setStudentRatings(ratingsData.results);
    } catch (error) {
      console.error("Error fetching class data:", error);
      Alert.alert("Error", "Failed to load subjects and ratings");
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (
    enrollmentId,
    newRating,
    subjectId,
    classroomId,
  ) => {
    try {
      let response;

      if (enrollmentId) {
        // Update existing rating
        response = await fetch(
          `${BASEURL}/api/common/student-enrollments/?id=${enrollmentId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rating_score: newRating,
            }),
          },
        );
      } else {
        // Create new rating
        response = await fetch(`${BASEURL}/api/common/student-enrollments/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student: item.student,
            classroom: classroomId,
            subject: subjectId,
            rating_score: newRating,
            academic_year: 1, // Adjust as needed
            branch: 1, // Adjust as needed
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`Update failed! status: ${response.status}`);
      }

      const updatedData = await response.json();

      // Refresh data
      fetchClassData(item.student, item.classroom);

      setEditingId(null);
      setTempRating(0);
      Alert.alert("Success", "Rating updated successfully!");
    } catch (error) {
      console.error("Error updating rating:", error);
      Alert.alert("Error", "Failed to update rating. Please try again.");
    }
  };

  const getRatingRemark = (score, maxRating) => {
    if (score === 0) return "Not Rated Yet";
    const percentage = (score / maxRating) * 100;
    if (percentage >= 90) return "Excellent!";
    if (percentage >= 80) return "Outstanding!";
    if (percentage >= 70) return "Very Good!";
    if (percentage >= 60) return "Good!";
    if (percentage >= 50) return "Fair";
    return "Needs Improvement";
  };

  const startEditing = (subject) => {
    setEditingId(subject.id);
    setTempRating(subject.rating_score || 0);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempRating(0);
  };

  const renderStars = (rating, maxRating = 5, editable = false) => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.starTouchable,
            editable && styles.editableStarTouchable,
          ]}
          onPress={editable ? () => setTempRating(i) : undefined}
          disabled={!editable}
        >
          <Text
            style={[
              styles.star,
              {
                color: i <= rating ? "#FFD700" : "#E0E0E0",
                opacity: editable ? 1 : 0.6,
              },
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  const renderSubjectItem = ({ item: subject }) => {
    const isEditing = editingId === subject.id;
    const currentRating = isEditing ? tempRating : subject.rating_score || 0;

    return (
      <View style={styles.enrollmentCard}>
        <View style={styles.headerRow}>
          <View style={styles.starsContainer}>
            {renderStars(currentRating, subject.max_rating, isEditing)}
            <Text
              style={[
                styles.ratingNumber,
                isEditing && styles.editingRatingNumber,
              ]}
            >
              ({currentRating}/{subject.max_rating})
            </Text>
          </View>
        </View>

        <Text style={styles.subjectText}>{subject.subject_name}</Text>
        <Text
          style={[
            styles.remarkText,
            subject.rating_score === 0 && styles.notRatedRemark,
            isEditing && styles.editingRemarkText,
          ]}
        >
          {getRatingRemark(currentRating, subject.max_rating)}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.dateText} numberOfLines={1}>
            {subject.updated_at
              ? `${dayjs(subject.updated_at).format("MMM DD")}`
              : "Not rated yet"}
          </Text>

          {!isEditing ? (
            <TouchableOpacity
              style={[
                styles.updateButton,
                subject.rating_score === 0 && styles.rateNowButton,
              ]}
              onPress={() => startEditing(subject)}
            >
              <Text style={styles.updateButtonText}>
                {subject.has_rating ? "Update Mark" : "Remark"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={() =>
                  updateRating(
                    subject.enrollment_id,
                    currentRating,
                    subject.subject,
                    subject.classroom,
                  )
                }
              >
                <Text style={styles.buttonText}>✓ Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={cancelEditing}
              >
                <Text style={styles.buttonText}>✕ Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading subjects...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.content}>
        <Text style={styles.title}>{item?.student_name} Subject Remarks</Text>
        {classSubjects.length > 0 ? (
          <FlatList
            data={classSubjects}
            renderItem={renderSubjectItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subjects available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#86b952",
    marginBottom: 10,
    textAlign: "center",
  },
  enrollmentCard: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  classroomText: {
    fontSize: 14,
    color: "#666",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  starTouchable: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  editableStarTouchable: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  star: {
    fontSize: 26,
    lineHeight: 26,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 12,
  },
  editingRatingNumber: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  subjectText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 8,
  },
  remarkText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FF9800",
    marginBottom: 12,
    textAlign: "center",
  },
  notRatedRemark: {
    color: "#999",
  },
  editingRemarkText: {
    color: "#2196F3",
    fontSize: 17,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  updateButton: {
    backgroundColor: "#86b952",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rateNowButton: {
    backgroundColor: "#86b952",
  },
  updateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 30,
  },
});

export default SubjectRemards;
