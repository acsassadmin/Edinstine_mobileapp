import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  User,
  School,
  Users,
  Bell,
  BellRing,
  BellOff,
} from 'lucide-react-native';
import { useSocket } from '../context/SocketContext';

const getTypeColor = type => {
  switch (type) {
    case 'private':
      return '#3b82f6';
    case 'classroom':
      return '#10b981';
    case 'common-room':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const formatTime = timestamp => {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const NotificationItem = memo(({ item }) => {
  const renderIcon = () => {
    const color = getTypeColor(item.type);
    switch (item.type) {
      case 'private':
        return <User size={20} color={color} style={styles.icon} />;
      case 'classroom':
        return <School size={20} color={color} style={styles.icon} />;
      case 'common-room':
        return <Users size={20} color={color} style={styles.icon} />;
      default:
        return <Bell size={20} color={color} style={styles.icon} />;
    }
  };

  return (
    <View style={styles.notificationItem}>
      {renderIcon()}
      <View style={styles.content}>
        <Text style={styles.title}>
          {item.last_sender || item.type.toUpperCase()}
        </Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.last_message || 'New notification'}
        </Text>
        <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );
});

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, isConnected, clearNotifications } = useSocket();
  const unreadCount = notifications.length;

  const handleToggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const handleClearNotifications = useCallback(() => {
    clearNotifications();
  }, [clearNotifications]);

  const renderNotification = useCallback(
    ({ item }) => <NotificationItem item={item} />,
    [],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.bellButton}
        onPress={handleToggleDropdown}
        activeOpacity={0.7}
      >
        {isConnected ? (
          <BellRing size={24} color="#86b952" />
        ) : (
          <BellOff size={24} color="#86b952" />
        )}
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {showDropdown && notifications.length > 0 && (
        <View style={styles.dropdown}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Notifications ({notifications.length})
            </Text>
            <TouchableOpacity
              onPress={handleClearNotifications}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={item => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  bellButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 340,
    maxHeight: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  clearButton: {
    padding: 6,
  },
  clearText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  list: {
    maxHeight: 300,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default NotificationBell;
