import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Bell, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PRIMARY = '#86b952';
const WHITE = '#ffffff';

const NotificationCardView = memo(
  ({ title, message, timeText, handleClose }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handleClose}
      style={styles.card}
    >
      <View style={styles.accentBar} />

      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>
          <Bell size={20} color={WHITE} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          <Text style={styles.time}>{timeText}</Text>

          <TouchableOpacity onPress={handleClose}>
            <View style={styles.closeButton}>
              <X size={16} color={PRIMARY} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ),
);

const NotificationPopUp = ({
  visible = false,
  title = 'New Message',
  message = 'You have a new message!',
  onClose = () => {},
  timeText = 'Now',
  autoClose = 4000,
}) => {
  const [show, setShow] = useState(visible);

  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShow(false);
      onClose();
    });
  }, [translateY, opacity, onClose]);

  useEffect(() => {
    if (visible) {
      setShow(true);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
          tension: 80,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [visible, handleClose, autoClose, translateY, opacity]);

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <NotificationCardView
        title={title}
        message={message}
        timeText={timeText}
        handleClose={handleClose}
      />
    </Animated.View>
  );
};

export default NotificationPopUp;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: PRIMARY,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
