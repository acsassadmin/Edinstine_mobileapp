import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import CustomeTab from "../../components/CustomeTab";
import StaffPortfolio from "./StaffPortfolio";
import SchoolFeeds from "../SchoolFeeds";

const StaffPortfolioLayout = () => {
  const [active, setActive] = useState(0);
  const handleActiveTab = (index) => {
    setActive(index);
  };
  // console.log("is active",active)
  const tabs = ["School Feeds", "Student Portfolio"];
  return (
    <>
      <View style={{ paddingHorizontal: 10, backgroundColor: "white" }}>
        <CustomeTab
          tabs={tabs}
          onTabPress={(index) => handleActiveTab(index)}
        />
      </View>
      {active === 0 ? <SchoolFeeds /> : <StaffPortfolio />}
    </>
  );
};

export default StaffPortfolioLayout;

const styles = StyleSheet.create({});
