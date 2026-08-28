import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { ChevronUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');

const CRESCENT_SIZE = width * 2;

const GRID_DATA = [
  {
    id: '1',
    icon: require('../assets/splash material/Frame 9246.png'),
  },
  {
    id: '2',
    icon: require('../assets/splash material/Frame 9247.png'),
  },
  {
    id: '3',
    icon: require('../assets/splash material/Frame 9249.png'),
  },
  {
    id: '4',
    icon: require('../assets/splash material/Frame 9248.png'),
  },
];

const GetStartMenu = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const nextRoute = route.params?.nextRoute || 'Login';

  const handleBottomPress = useCallback(() => {
    navigation.replace(nextRoute);
  }, [navigation, nextRoute]);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      handleBottomPress();
    }, 3000);

    return () => clearTimeout(timer);
  }, [handleBottomPress, slideAnim, fadeAnim]);

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.scrollContainer}
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <Image
            resizeMode="contain"
            source={require('../assets/splash material/Lillel edinstine 1.png')}
            style={styles.topImage}
          />
        </View>
        <Animated.View
          style={[
            styles.gridContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >
          <View style={styles.gridContainer}>
            {GRID_DATA.map(item => (
              <View key={item.id} style={[styles.gridCard]}>
                <Image
                  source={item.icon}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
      <View style={styles.bottomWrapper}>
        <View style={styles.crescentBackground} />

        <Text style={styles.swipeText}>swipe up!</Text>

        <Pressable style={styles.arrowCircle} onPress={handleBottomPress}>
          <ChevronUp size={24} color="#FFF" />
        </Pressable>

        <Text style={styles.getStartedText} onPress={handleBottomPress}>
          Get Started
        </Text>
      </View>
    </View>
  );
};

export default GetStartMenu;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 320,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  topImage: {
    width: width - 80,
    height: 180,
  },
  textBodyContainer: {
    padding: 24,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4000,
    zIndex: 2,
  },
  bottomWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    height: 240,
    backgroundColor: 'transparent',
  },
  crescentBackground: {
    position: 'absolute',
    width: CRESCENT_SIZE,
    height: CRESCENT_SIZE,
    borderRadius: CRESCENT_SIZE / 2,
    backgroundColor: '#CCFBF1',
    top: 75,
    left: width / 2 - CRESCENT_SIZE / 2,
    zIndex: 1,
  },
  swipeText: {
    fontSize: 15,
    color: '#A0A0A0',
    textTransform: 'lowercase',
    fontWeight: '500',
    marginBottom: 12,
    zIndex: 2,
  },
  arrowCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  getStartedText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 35,
    zIndex: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    width: '100%',
    columnGap: 16,
    rowGap: 16,
  },
  gridCard: {
    width: (width - 40 - 60) / 2,
    aspectRatio: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
});
