import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useUser } from "../context/UserContext";
import BackButton from "./BackButton";

import MedicalInstruction from "../screens/ParentScreens/MedicalInstruction";
import ViewHealthUpdate from "../screens/ParentScreens/ViewHealthUpdate";

import UpdateHealth from "../screens/StaffScreens/UpdateHealth";
import ViewMedicalInstruction from "../screens/StaffScreens/ViewMedicalInstruction";

const MedicalHealthScreen = () => {
  const [activeTab, setActiveTab] = useState("Medical");
  const { user } = useUser();
  // console.log("user", user);
  //
  const role = user?.role;

  const renderContent = () => {
    if (role === "staff") {
      return activeTab === "Medical" ? (
        <ViewMedicalInstruction showBackButton={false} />
      ) : (
        <UpdateHealth />
      );
    }

    if (role === "student") {
      return activeTab === "Medical" ? (
        <MedicalInstruction showBackButton={false} />
      ) : (
        <ViewHealthUpdate showBackButton={false} />
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No content available for this role.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <BackButton />
        <Text style={{ fontSize: 16 }}>Medical & Health</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Medical" && styles.activeTab]}
          onPress={() => setActiveTab("Medical")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Medical" && styles.activeTabText,
            ]}
          >
            Medical
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "Health" && styles.activeTab]}
          onPress={() => setActiveTab("Health")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Health" && styles.activeTabText,
            ]}
          >
            Health
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
};

export default MedicalHealthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    // borderWidth: 1,
    // marginTop: 10,
  },

  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: "#e9e9e988",
    borderRadius: 12,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: "#86b952",
  },

  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
