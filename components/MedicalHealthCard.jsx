import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const MedicalHealthCard = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("MedicalHealthScreen")}
      style={{
        width: 160,
        height: 160,
        padding: 16,
        borderRadius: 16,
        overflow: "hidden",
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        borderWidth: 0,
        // Shadow for Android
        elevation: 2,
        // flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        backgroundColor: "rgb(243, 197, 137)",
        // borderWidth: 1,
      }}
    >
      <View style={styles.cardContainer}>
        <Image
          source={require("../assets/Cards/medical.png")}
          style={styles.medicalCard}
        />

        <Image
          source={require("../assets/Cards/health.png")}
          style={styles.healthCard}
        />
      </View>

      <Text style={{ fontSize: 14, fontWeight: "700" }}>
        Medical & Health Details
      </Text>
    </TouchableOpacity>
  );
};

export default MedicalHealthCard;
const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // marginVertical: 20,
  },

  medicalCard: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    transform: [{ rotate: "-12deg" }],
    zIndex: 2,
  },

  healthCard: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginLeft: -25,
    transform: [{ rotate: "12deg" }],
  },
});
