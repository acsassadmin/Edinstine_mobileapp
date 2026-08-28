import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MoreVertical } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import schoolLogo from '../assets/icon.png';
import { useSocket } from '../context/SocketContext';
import { getFeatures } from '../features.service';

const PopupMenuItem = memo(({ title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
));

const TopBar = () => {
  const navigation = useNavigation();
  const { appUser } = useUser();
  const { notificationCount } = useSocket();
  const [menuVisible, setMenuVisible] = useState(false);

  const renderRoute = useCallback(() => {
    const role = appUser?.role;
    if (role === 'staff') {
      return 'StaffProfileDetailsScreen';
    } else if (role === 'driver') {
      return 'DriverProfileDetail';
    } else {
      return 'ProfileDetailsScreen';
    }
  }, [appUser?.role]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('Notification');
  }, [navigation]);

  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleDailyLogsStaffPress = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('StaffBasedStudentsList');
  }, [navigation]);

  const handleDailyLogsPress = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('DailyLogsList');
  }, [navigation]);

  const handleMyProfilePress = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate(renderRoute());
  }, [navigation, renderRoute]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={
            appUser?.school_logo ? { uri: appUser?.school_logo } : schoolLogo
          }
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.topBarRight}>
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.notificationButton}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Bell size={26} color="#2d3748" />

              {notificationCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMenuPress}
            style={styles.menuTrigger}
          >
            <MoreVertical size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="none"
          onRequestClose={handleCloseMenu}
        >
          <Pressable style={styles.modalOverlay} onPress={handleCloseMenu}>
            <View style={styles.popupMenu}>
              {getFeatures()?.activity_log &&
                (appUser?.role === 'staff' ? (
                  <PopupMenuItem
                    title="Daily Logs"
                    onPress={handleDailyLogsStaffPress}
                  />
                ) : (
                  <PopupMenuItem
                    title="Daily Logs"
                    onPress={handleDailyLogsPress}
                  />
                ))}
              <PopupMenuItem
                title="My Profile"
                onPress={handleMyProfilePress}
              />
              <PopupMenuItem title="Close" onPress={handleCloseMenu} />
              <View style={styles.menuDivider} />
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default TopBar;

const styles = StyleSheet.create({
  safe: {
    backgroundColor: 'white',
  },
  container: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#faeedd',
    justifyContent: 'space-between',
  },
  logo: {
    width: 120,
    height: 40,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#86b95220',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#86b95215',
  },
  iconWrapper: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  menuTrigger: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  popupMenu: {
    position: 'absolute',
    top: 60,
    right: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginHorizontal: 8,
  },
});
