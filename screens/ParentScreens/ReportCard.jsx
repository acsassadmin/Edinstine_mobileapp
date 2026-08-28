import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import TopBar from "../../components/ParentTobBar";
import { useUser } from "../../context/UserContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import BackButton from "../../components/BackButton";
import { BASEURL } from "../../appurls";

const ReportCard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const { appUser, token } = useUser();

  const API_BASE_URL = `${BASEURL}/api/common/student-report/?user_id=${40}`;

  const fetchReport = async () => {
    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // console.log("Fetching report from:", API_BASE_URL);

      const response = await fetch(API_BASE_URL, { headers });

      const data = await response.json();
      // console.log("report card", data);

      const singleReport = Array.isArray(data) ? data[0] : data;
      setReport(singleReport);
    } catch (error) {
      // console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = () => {
    if (report) {
      // console.log("report url", report);

      Linking.openURL(report.report_url || report.report).catch((err) => {
        Alert.alert("Error", "Cannot open PDF. Install a PDF viewer.");
      });
    }
  };

  useEffect(() => {
    if (appUser?.id) {
      fetchReport();
    }
  }, [appUser?.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading report card...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}> Report Card</Text>
        </View>

        {/* Single Report Card */}
        {report ? (
          <TouchableOpacity style={styles.reportCard} activeOpacity={0.9}>
            <View style={[styles.gradientBackground, styles.linearGradient]}>
              <View style={styles.gradientOverlay} />

              <View style={styles.cardInner}>
                {/* Report Badge */}

                {/* Main Content */}
                <View style={styles.content}>
                  <View style={styles.headerRow}>
                    <View style={styles.textContainer}>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {report.user_name || report.user || "Student"}
                      </Text>
                      <View style={styles.branchInfo}>
                        <Icon name="location-on" size={14} color="#86b952" />
                        <Text style={styles.branchName}>
                          {report.branch_name || "Branch"}
                        </Text>
                      </View>
                    </View>
                    <Icon name="picture-as-pdf" size={28} color="#86b952" />
                  </View>

                  <Text style={styles.reportTitle}>Academic Report Card</Text>

                  {/* Date & Creator */}
                  <View style={styles.metaInfo}>
                    <View style={styles.metaItem}>
                      <Icon name="event" size={14} color="#4a4a4a" />
                      <Text style={styles.metaText}>
                        {new Date(report.issued_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </Text>
                    </View>
                    <View style={styles.metaItem}></View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={viewReport}
                  >
                    <Text style={styles.actionText}>View Report Card</Text>
                    <Icon name="arrow-forward-ios" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="description" size={64} color="#ddd" />
            <Text style={styles.emptyTitle}>No Report Card</Text>
            <Text style={styles.emptySubtitle}>
              Your latest academic report will appear here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20, // Reduced from 28
    fontWeight: "800",
    color: "#000000",
  },
  headerStats: {
    alignItems: "center",
  },
  statsLabel: {
    fontSize: 14, // Reduced from 16
    color: "#666",
    fontWeight: "600",
  },

  //  COMPACT CARD - Fixed height ~280px
  reportCard: {
    height: 280, // Fixed compact height
    borderRadius: 20, // Slightly smaller radius
    overflow: "hidden",
    shadowColor: "#86b952",
    shadowOffset: { width: 0, height: 8 }, // Reduced shadow
    shadowOpacity: 0.25,
    shadowRadius: 16, // Reduced shadow radius
    elevation: 10, // Reduced elevation
  },

  gradientBackground: {
    height: "100%", // Fill card height
    padding: 20, // Reduced from 32
    backgroundColor: "#86b952",
  },
  linearGradient: {
    position: "relative",
    overflow: "hidden",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
  },

  cardInner: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    paddingTop: 16, // Reduced top padding
    justifyContent: "space-between",
  },
  badgeContainer: {
    position: "absolute",
    top: 12, // Reduced from 24
    right: 16, // Reduced from 24
    zIndex: 2,
  },
  reportBadge: {
    width: 40, // Reduced from 48
    height: 40, // Reduced from 48
    borderRadius: 20, // Reduced from 24
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8, // Reduced from 16
  },
  textContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 20, // Reduced from 24
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4, // Reduced from 8
  },
  branchInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  branchName: {
    fontSize: 13, // Reduced from 15
    color: "#4a4a4a",
    fontWeight: "600",
    marginLeft: 4, // Reduced from 6
  },
  reportTitle: {
    fontSize: 16, // Reduced from 20
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: 12, // Reduced from 20
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12, // Reduced from 24
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12, // Reduced from 14
    color: "#4a4a4a",
    marginLeft: 4, // Reduced from 6
    fontWeight: "500",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#86b952",
    paddingVertical: 12, // Reduced from 16
    paddingHorizontal: 24, // Reduced from 32
    borderRadius: 22, // Reduced from 28
    shadowColor: "#86b952",
    shadowOffset: { width: 0, height: 4 }, // Reduced from 6
    shadowOpacity: 0.4,
    shadowRadius: 8, // Reduced from 12
    elevation: 8, // Reduced from 10
    marginTop: 8, // Reduced from 12
  },
  actionText: {
    color: "white",
    fontSize: 15, // Reduced from 17
    fontWeight: "700",
    marginRight: 6, // Reduced from 8
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60, // Reduced from 80
  },
  emptyTitle: {
    fontSize: 20, // Reduced from 24
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15, // Reduced from 16
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default ReportCard;
