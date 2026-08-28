import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const cardColors = [
  "#F8FAFC",
  "#EEF2FF",
  "#ECFDF5",
  "#FFF7ED",
  "#FDF2F8",
  "#F3E8FF",
];

const NoticeBoardCard = ({
  message = "N/A",
  date = "N/A",
  time = "N/A",
  index = 0,
  data,
}) => {
  const navigation = useNavigation();

  const backgroundColor = cardColors[index % cardColors.length];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate("NoticeBoard", {
          data: {
            message,
            date,
            time,
            index,
            data,
          },
        })
      }
    >
      <View
        style={[
          styles.content,
          {
            backgroundColor,
          },
        ]}
      >
        <Text style={styles.messageText} numberOfLines={5} ellipsizeMode="tail">
          {message}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NoticeBoardCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: "48%",
    marginVertical: 6,
  },

  content: {
    minHeight: 140,
    padding: 16,
    borderRadius: 18,

    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 1,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#1E293B",
    fontWeight: "700",
  },

  footer: {
    marginTop: 14,
  },

  dateText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  timeText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
});
