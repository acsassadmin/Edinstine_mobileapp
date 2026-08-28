import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import { Circle, CircleDot, BellOff } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import TopBar from '../components/ParentTobBar';
import BackButton from '../components/BackButton';
import { BASEURL } from '../appurls';
import { useSocket } from '../context/SocketContext';
import { useNavigation } from '@react-navigation/native';

const NotificationCard = memo(({ item, onPress }) => (
  <TouchableOpacity style={styles.notificationCard} onPress={onPress}>
    <View style={styles.notificationIcon}>
      {item.read ? (
        <Circle size={24} color="white" />
      ) : (
        <CircleDot size={24} color="#86b952" />
      )}
    </View>

    <View style={styles.notificationContent}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage} numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={styles.notificationTime}>
        {item.created_at
          ? new Date(item.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : 'Just now'}
      </Text>
    </View>

    {!item.read && <View style={styles.unreadBadge} />}
  </TouchableOpacity>
));

const Notification = () => {
  const { appUser, token } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const flatListRef = useRef(null);
  const { notificationCount, setNotificationCount } = useSocket();
  const navigation = useNavigation();

  const fetchNotifications = useCallback(
    async (url = null, append = false) => {
      try {
        if (url === null) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        if (!appUser?.id || !token) {
          return;
        }
        const fetchUrl =
          url ||
          `${BASEURL}/api/common/notifications/?user_id=${appUser.id}&school_id=${appUser?.school_id}`;
        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();

        const newNotifications = data.results || [];

        setNotifications(prev =>
          append ? [...prev, ...newNotifications] : newNotifications,
        );
        setNextUrl(data.links?.next);
        setUnreadCount(data.unread_count || 0);
      } catch (error) {
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [appUser?.id, appUser?.school_id, token],
  );

  const readNotifications = useCallback(
    async (url = null, append = false) => {
      try {
        if (!appUser?.id || !token) {
          return;
        }

        const fetchUrl =
          url || `${BASEURL}/api/common/notifications/?user_id=${appUser.id}`;

        const response = await fetch(fetchUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            read: true,
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch notifications');

        const data = await response.json();
        setNotificationCount(0);
      } catch (error) {
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [appUser?.id, token, setNotificationCount],
  );

  useEffect(() => {
    readNotifications();
    fetchNotifications();
  }, [notificationCount, readNotifications, fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNextUrl(null);
    setNotifications([]);
    fetchNotifications(null, false);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (nextUrl && !loadingMore) {
      fetchNotifications(nextUrl, true);
    }
  }, [nextUrl, loadingMore, fetchNotifications]);

  const handleNotificationPress = useCallback(
    item => {
      const routeName = item?.mobile_action_link;
      const routes = navigation.getState()?.routeNames || [];

      if (routes.includes(routeName)) {
        navigation.navigate(routeName, {
          id: item?.navigate_id,
        });
      } else {
        ToastAndroid.show('Navigation Not Found', ToastAndroid.SHORT);
      }
    },
    [navigation],
  );

  const renderNotification = useCallback(
    ({ item }) => (
      <NotificationCard
        item={item}
        onPress={() => handleNotificationPress(item)}
      />
    ),
    [handleNotificationPress],
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#86b952" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 15,
          paddingVertical: 15,
          paddingHorizontal: 10,
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 18, fontWeight: 700, color: '#86b952' }}>
          Notifications
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={notifications}
        keyExtractor={item => `notif-${item.id}`}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#86b952']}
            tintColor="#86b952"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BellOff size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You’re all caught up!</Text>
          </View>
        }
      />
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#86b952',
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    backgroundColor: '#ff4444',
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  unreadBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#86b952',
    marginTop: 4,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    marginLeft: 8,
    color: '#86b952',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
