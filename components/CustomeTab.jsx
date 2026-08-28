import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useStorage } from "../context/StorageContext";
import { useNavigation, useNavigationState } from "@react-navigation/native";

const CustomeTab = ({ tabs = [], onTabPress }) => {
  const { selectedTab } = useStorage();
  const navigation = useNavigation();

  const currentRouteName = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  // console.log("Current screen:", currentRouteName);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePress = (index) => {
    setActiveIndex(index);
    if (onTabPress) {
      onTabPress(index);
    }
  };

  useEffect(() => {
    if (currentRouteName === "StudentLeaveHistory") {
      if (selectedTab != null) {
        setActiveIndex(selectedTab);
      }
    }
  }, [selectedTab, currentRouteName]);

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.tab, activeIndex === index && styles.activeTab]}
          onPress={() => handlePress(index)}
        >
          <Text
            style={[
              styles.tabText,
              activeIndex === index && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CustomeTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#faeedd",
    marginVertical: 10,
    borderRadius: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  activeTab: {
    backgroundColor: "#86b952",
    borderRadius: 30,
  },
  tabText: {
    fontSize: 11,
    color: "black",
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
});
