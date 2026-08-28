import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';

const SkeletonLeaveCard = () => {
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
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.cardContainer, { opacity: pulseAnim }]}>
      <View style={styles.title} />
      <View style={styles.reason} />
      <View style={styles.status} />
      <View style={styles.bottomRow}>
        <View style={styles.date} />
        <View style={styles.applyDate} />
      </View>
    </Animated.View>
  );
};

const SkeletonLeaveList = () => {
  // render 5 skeleton cards
  const skeletonArray = Array.from({ length: 5 });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {skeletonArray.map((_, index) => (
        <SkeletonLeaveCard key={index} />
      ))}
    </ScrollView>
  );
};

export default SkeletonLeaveList;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
  },
  cardContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginTop: 10,
    padding: 15,
  },
  title: {
    width: '50%',
    height: 15,
    backgroundColor: '#cfcfcf',
    borderRadius: 4,
    marginBottom: 10,
  },
  reason: {
    width: '80%',
    height: 12,
    backgroundColor: '#cfcfcf',
    borderRadius: 4,
    marginBottom: 10,
  },
  status: {
    width: 80,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#cfcfcf',
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    width: 100,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#cfcfcf',
  },
  applyDate: {
    width: 60,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#cfcfcf',
  },
});
