import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "../../components/ParentTobBar";
import BackButton from "../../components/BackButton";
import { useUser } from "../../context/UserContext";
import { BASEURL } from "../../appurls";

const ViewMedicalInstruction = ({ showBackButton = true }) => {
  const { token, appUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState([]);

  /* ---------------- FETCH DATA ---------------- */
  const fetchMedicalInstructions = async () => {
    // console.log("Class Id :", appUser?.class_id);
    try {
      const response = await axios.get(
        `${BASEURL}/api/parent/medical-instruction/?class_id=${appUser?.class_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setInstructions(response.data?.results || []);
    } catch (error) {
      // console.log(
      //   "Medical instruction fetch error:",
      //   error.response?.data || error.message,
      // );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalInstructions();
  }, []);

  /* ---------------- RENDER ITEM ---------------- */
  const renderItem = ({ item }) => {
    const createdDate = new Date(item.created_at).toDateString();

    return (
      <View style={styles.card}>
        {/* Student */}
        <Text style={styles.studentName}>{item.student_name}</Text>

        {/* Condition */}
        <View style={styles.row}>
          <Text style={styles.label}>Condition:</Text>
          <Text style={styles.value}>{item.condition}</Text>
        </View>

        {/* Instruction */}
        <View style={styles.row}>
          <Text style={styles.label}>Instruction:</Text>
          <Text style={styles.value}>{item.instruction}</Text>
        </View>

        {/* Prescription */}
        {item.prescription ? (
          <TouchableOpacity style={styles.prescriptionBox}>
            <Image
              source={{
                uri: `${BASEURL}${item.prescription}`,
              }}
              style={styles.prescriptionImage}
            />
            <Text style={styles.prescriptionText}>View Prescription</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noPrescription}>No prescription attached</Text>
        )}

        {/* Date */}
        <Text style={styles.dateText}>Created on: {createdDate}</Text>
      </View>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      {/* <TopBar /> */}

      <View style={styles.header}>
        {showBackButton && <BackButton />}

        <Text style={styles.title}>Health Informations </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#86b952"
          style={{ marginTop: 40 }}
        />
      ) : instructions.length === 0 ? (
        <Text style={styles.emptyText}>No medical instructions found</Text>
      ) : (
        <FlatList
          data={instructions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

export default ViewMedicalInstruction;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    // borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 10,
    // paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    // marginLeft: 15,
    color: "#000000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  row: {
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  value: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
  prescriptionBox: {
    marginTop: 10,
    alignItems: "center",
  },
  prescriptionImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 6,
  },
  prescriptionText: {
    fontSize: 13,
    color: "#86b952",
    fontWeight: "600",
  },
  noPrescription: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#777",
    marginTop: 10,
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    fontSize: 15,
  },
});
