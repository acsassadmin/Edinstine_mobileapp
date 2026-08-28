import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";

const SkeletonNoticeCard = ({ length }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { opacity: pulseAnim, width: length == 1 ? 140 : "45%" },
      ]}
    >
      <View style={styles.message} />
      <View style={styles.date} />
      <View style={styles.time} />
    </Animated.View>
  );
};

const NoticeBoardSkeleton = ({ length }) => {
  const skeletonArray = Array.from({ length: length ?? 6 });

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.scrollContainer}
      showsHorizontalScrollIndicator={false}
    >
      {skeletonArray.map((_, index) => (
        <SkeletonNoticeCard key={index} length={length} />
      ))}
    </ScrollView>
  );
};

export default NoticeBoardSkeleton;

const styles = StyleSheet.create({
  scrollContainer: {
    // padding: 16,
    width: "100%",
    flexDirection: "row",
    // borderWidth: 1,
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15,
    columnGap: 15,
    backgroundColor: "white",
    flex: 1,
  },
  cardContainer: {
    // width: 105,
    // height: 180,
    // flex: 1,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    // marginRight: 15,
    padding: 16,
    justifyContent: "space-between",
    // flexDirection: "column",
    rowGap: 10,
    // borderWidth: 1,
  },
  message: {
    height: 80,
    backgroundColor: "#cfcfcf",
    borderRadius: 6,
  },
  date: {
    width: 60,
    height: 12,
    backgroundColor: "#cfcfcf",
    borderRadius: 4,
  },
  time: {
    width: 40,
    height: 12,
    backgroundColor: "#cfcfcf",
    borderRadius: 4,
  },
});
