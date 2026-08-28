import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useUser } from "../../context/UserContext";
import { BASEURL } from "../../appurls";
import axios from "axios";

const TripDetailsScreen = () => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, appUser } = useUser();

  useEffect(() => {
    const fetchTrip = async () => {
      // Check if bus_id exists before making API call
      if (!appUser?.bus_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `${BASEURL}/api/common/bus-routes/?bus_id=${appUser.bus_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = response.data;

        if (data.results && data.results.length > 0) {
          setTrip(data.results[0]);
          console.log("trip details response", data.results[0]);
        } else {
          Alert.alert("No data found for this bus");
        }
      } catch (error) {
        console.error(
          "Error fetching trip:",
          error.response?.data || error.message,
        );
        Alert.alert("Error", "Failed to fetch trip data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip(); //  UNCOMMENTED - Actually call the function
  }, [token, appUser?.bus_id, BASEURL]); //  ADDED dependencies

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#555" }}>No Trip Data Available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trip Details</Text>

      {/* Bus Info */}
      <View style={[styles.card, styles.headerCard]}>
        <Text style={styles.cardHeader}>Bus Info</Text>
        <Text style={styles.label}>Bus Number:</Text>
        <Text style={styles.value}>{trip.bus_number}</Text>
        <Text style={styles.label}>Branch:</Text>
        <Text style={styles.value}>{trip.branch_name}</Text>
        <Text style={styles.label}>Driver:</Text>
        <Text style={styles.value}>{trip.driver_name}</Text>
      </View>

      {/* Route Info */}
      <View style={[styles.card, styles.routeCard]}>
        <Text style={styles.cardHeader}>Route</Text>
        <Text style={styles.label}>Start Point:</Text>
        <Text style={styles.value}>{trip.start_point_name}</Text>
        <Text style={styles.label}>End Point:</Text>
        <Text style={styles.value}>{trip.end_point_name}</Text>
      </View>

      {/* Via Points */}
      <View style={[styles.card, styles.viaCard]}>
        <Text style={styles.cardHeader}>Via Points</Text>
        {trip.via_points?.map((point, index) => (
          <View key={index} style={styles.viaPointRow}>
            <Text style={styles.viaIndex}>{index + 1}.</Text>
            <Text style={styles.viaText}>
              {point.name} ({point.lat}, {point.lng})
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default TripDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4f7",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1E90FF",
    textAlign: "center",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: "#fff",
  },
  headerCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#1E90FF",
  },
  routeCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#32CD32",
  },
  viaCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#FFA500",
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 2,
    color: "#333",
  },
  viaPointRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  viaIndex: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
    color: "#555",
  },
  viaText: {
    fontSize: 14,
    color: "#555",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
