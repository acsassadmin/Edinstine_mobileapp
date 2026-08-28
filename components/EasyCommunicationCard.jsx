import React from "react";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

// 2 Get the device screen width
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 3 Create a helper function to scale the font
const scaleFont = (size) => (SCREEN_WIDTH / 375) * size;

const backgrounds = {
  0: require("../assets/Cards/Frame_266.png"),
  1: require("../assets/Cards/Frame_264.png"),
  2: require("../assets/Cards/Frame263.png"),
  3: require("../assets/Cards/Frame_265.png"),
  4: require("../assets/Cards/Frame_264.png"),
  5: require("../assets/Cards/Frame_264.png"),
};

const logos = {
  0: require("../assets/Cards/chat.png"),
  1: require("../assets/Cards/leave.png"),
  2: require("../assets/Cards/medical.png"),
  3: require("../assets/Cards/health.png"),
  4: require("../assets/bday.png"),
  5: require("../assets/Cards/2.png"),
};

const EasyCommunicationCard = ({
  title = "Easy Communication",
  image = 0, // dynamic index,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={() => onPress()} activeOpacity={1}>
      <ImageBackground
        source={backgrounds[image]} // dynamic background
        resizeMode="cover"
        imageStyle={{
          borderRadius: 16,
          width: 180,
          height: 180,
        }}
        style={styles.card}
      >
        <Image
          source={logos[image]} // dynamic icon
          style={styles.icon}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default EasyCommunicationCard;

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 160,
    padding: 16,
    borderRadius: 16, // overall card radius
    overflow: "hidden", // ensures image respects border radius
    marginRight: 12,
    justifyContent: "flex-end",
    alignItems: "center",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Shadow for Android
    elevation: 5,
  },
  icon: {
    width: 100,
    height: 80,
    // alignSelf: "flex-end",
  },
  textContainer: {
    marginTop: 12,
  },
  title: {
    // width: "75%",
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
});
