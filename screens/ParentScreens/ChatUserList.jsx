import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { Users, User, MessageCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASEURL } from '../../appurls';
import { getFeatures } from '../../features.service';

const { width } = Dimensions.get('window');
const BASE_URL = BASEURL;

const MemoizedCard = memo(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <View style={styles.avatarContainer}>
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      ) : item.type === 'group' ? (
        <View style={[styles.avatar, styles.groupAvatar]}>
          <Users size={24} color="white" />
        </View>
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <User size={24} color="#999" />
        </View>
      )}
    </View>

    <View style={styles.userInfo}>
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      {item.helper && <Text style={styles.helper}>{item.helper}</Text>}
      <Text style={styles.role}>
        {item.type === 'group' ? 'Group Chat' : item.role || 'User'}
      </Text>
    </View>
  </TouchableOpacity>
));

const ChatUserList = () => {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [TABS, setTabs] = useState(['Inbox']);
  const { appUser, token } = useUser();

  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [tabsData, setTabsData] = useState({
    0: {
      data: [],
      loading: true,
      refreshing: false,
      loadingMore: false,
      nextUrl: null,
    },
    1: {
      data: [],
      loading: false,
      refreshing: false,
      loadingMore: false,
      nextUrl: null,
    },
    2: {
      data: [],
      loading: false,
      refreshing: false,
      loadingMore: false,
      nextUrl: null,
    },
  });

  const TAB_WIDTH = tabContainerWidth > 0 ? tabContainerWidth / TABS.length : 0;

  const fetchTabData = useCallback(
    async (tabIndex, url = null, append = false) => {
      try {
        const currentTabData = tabsData[tabIndex];

        if (url === null) {
          setTabsData(prev => ({
            ...prev,
            [tabIndex]: { ...prev[tabIndex], loading: true },
          }));
        } else {
          setTabsData(prev => ({
            ...prev,
            [tabIndex]: { ...prev[tabIndex], loadingMore: true },
          }));
        }

        let fetchUrl = url;
        if (!url) {
          if (tabIndex === 0) {
            fetchUrl = `${BASE_URL}/api/common/chatuserlist/?page=1&user_id=${
              appUser.id
            }${
              appUser.role === 'student' ? `&class_id=${appUser.class_id}` : ''
            }`;
          } else if (tabIndex === 1) {
            fetchUrl = `${BASE_URL}/api/common/branchdata/?page=1&branch_id=${appUser.branch_id}`;
          } else {
            fetchUrl = `${BASE_URL}/api/common/group-chat-classrooms/?user_id=${appUser.id}`;
          }
        }

        const response = await axios.get(fetchUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data = response.data;
        let newData = [];

        if (tabIndex === 1) {
          newData = data || [];
        } else {
          newData = data.results || [];
        }

        if (tabIndex === 0) {
          newData = newData.map(user => ({
            ...user,
            avatarUrl: user.avatar ? `${user.avatar}` : null,
            name: user.name || user.username || 'Unknown User',
          }));
        } else if (tabIndex === 2) {
          newData = newData.map(group => ({
            ...group,
            name: group.name || 'Unnamed Group',
            avatarUrl: null,
            type: 'group',
          }));
        } else if (tabIndex === 1) {
          newData = newData.map(branch => ({
            ...branch,
            name: branch.name || 'Unnamed Branch',
            helper: branch.helper || 'Branch Location',
            role: 'Broadcast',
            type: 'broadcast',
            avatarUrl: null,
          }));
        }

        setTabsData(prev => ({
          ...prev,
          [tabIndex]: {
            ...prev[tabIndex],
            data: append ? [...prev[tabIndex].data, ...newData] : newData,
            nextUrl: data.links?.next,
            loading: false,
            loadingMore: false,
            refreshing: false,
          },
        }));
      } catch (error) {
        setTabsData(prev => ({
          ...prev,
          [tabIndex]: {
            ...prev[tabIndex],
            loading: false,
            loadingMore: false,
            refreshing: false,
          },
        }));
      }
    },
    [
      appUser?.id,
      appUser?.branch_id,
      appUser?.role,
      appUser?.class_id,
      token,
      tabsData,
    ],
  );

  useEffect(() => {
    if (getFeatures().chat.broadcast) {
      setTabs(prev =>
        prev.includes('Broadcast') ? prev : [...prev, 'Broadcast'],
      );
    }
    if (getFeatures().chat.group) {
      setTabs(prev => (prev.includes('Chats') ? prev : [...prev, 'Chats']));
    }

    if (appUser?.id && tabsData[0].loading) {
      fetchTabData(0);
    }
    if (appUser?.branch_id && tabsData[2].loading) {
      fetchTabData(1);
    }
  }, [appUser?.id, appUser?.branch_id]);

  const handleScroll = useCallback(
    event => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / width);
      const tempIndexData = TABS[index];

      if (index !== activeTab && index >= 0 && index < TABS.length) {
        if (!tabsData[index]?.data?.length && !tabsData[index]?.loading) {
          if (index === 1 && tempIndexData === 'Chats') {
            setActiveTab(index + 1);
            fetchTabData(index + 1);
          } else {
            setActiveTab(index);
            fetchTabData(index);
          }
        }
      }
    },
    [activeTab, tabsData, width],
  );

  const onTabPress = useCallback(
    index => {
      if (index === 1 && TABS[index] === 'Chats') {
        setActiveTab(index + 1);
      } else {
        setActiveTab(index);
      }
      scrollRef.current?.scrollTo({
        x: index * width,
        animated: true,
      });
      if (!tabsData[index]?.data?.length && !tabsData[index]?.loading) {
        if (index === 1 && TABS[index] === 'Chats') {
          fetchTabData(index + 1);
        } else {
          fetchTabData(index);
        }
      }
    },
    [tabsData],
  );

  const onRefresh = useCallback(
    tabIndex => {
      if (tabIndex === 1 && TABS[tabIndex] === 'Chats') {
        fetchTabData(tabIndex + 1, null, false);
      } else {
        fetchTabData(tabIndex, null, false);
      }
    },
    [fetchTabData],
  );

  const loadMore = useCallback(
    tabIndex => {
      const nextUrl = tabsData[tabIndex]?.nextUrl;
      if (nextUrl && !tabsData[tabIndex]?.loadingMore) {
        fetchTabData(tabIndex, nextUrl, true);
      }
    },
    [tabsData, fetchTabData],
  );

  const openChat = useCallback(
    async item => {
      let type;
      if (activeTab === 0) type = 'inbox';
      else if (activeTab === 1) type = 'broadcast';
      else if (activeTab === 2) type = 'group';

      const userData = {
        ...item,
        type: type,
      };

      await AsyncStorage.setItem('chatUser', JSON.stringify(userData));

      if (type === 'inbox') {
        navigation.navigate('ChatScreen', { user: userData });
      } else if (type === 'group') {
        navigation.navigate('GroupChatScreen', { user: userData });
      } else if (type === 'broadcast') {
        navigation.navigate('BroadcastScreen', { user: userData });
      }
    },
    [activeTab, navigation],
  );

  const renderItem = useCallback(
    ({ item }) => {
      return <MemoizedCard item={item} onPress={openChat} />;
    },
    [openChat],
  );

  const renderTabContent = useCallback(
    tabIndex => {
      const tabData = tabsData[tabIndex] || { data: [], loading: false };

      if (tabData.loading && tabData.data.length === 0) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#86b952" />
            <Text style={styles.loadingText}>Loading {TABS[tabIndex]}...</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={tabData.data}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index}`}
          refreshControl={
            <RefreshControl
              refreshing={tabData.refreshing}
              onRefresh={() => onRefresh(tabIndex)}
              colors={['#86b952']}
              tintColor="#86b952"
            />
          }
          onEndReached={() => loadMore(tabIndex)}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            tabData.loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#86b952" />
                <Text style={styles.footerText}>Loading more...</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageCircle size={64} color="#ccc" />
              <Text style={styles.emptyText}>No {TABS[tabIndex]} found</Text>
              <Text style={styles.emptySubtext}>Content will appear here</Text>
            </View>
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      );
    },
    [tabsData, renderItem, onRefresh, loadMore, TABS],
  );

  const translateX = scrollX.interpolate({
    inputRange: [0, width * (TABS.length - 1)],
    outputRange: [0, TAB_WIDTH * (TABS.length - 1)],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabContainerMain}>
        <View
          style={styles.tabContainer}
          onLayout={e => setTabContainerWidth(e.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[
              styles.activeBackground,
              { width: TAB_WIDTH, transform: [{ translateX }] },
            ]}
          />

          {TABS.map((tab, index) => {
            const color = scrollX.interpolate({
              inputRange: [
                Math.max(0, (index - 1) * width),
                index * width,
                (index + 1) * width,
              ],
              outputRange: ['#777', '#fff', '#777'],
              extrapolate: 'clamp',
            });

            return (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => onTabPress(index)}
                activeOpacity={0.7}
              >
                <Animated.Text style={[styles.tabText, { color }]}>
                  {tab === 'Inbox' ? 'Chat' : tab === 'Chats' ? 'Groups' : tab}
                </Animated.Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
        onMomentumScrollEnd={handleScroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
      >
        {TABS.map((_, index) => (
          <View key={`tab-${index}`} style={styles.page}>
            {getFeatures().chat.group &&
            getFeatures().chat.broadcast &&
            getFeatures().chat.inbox
              ? renderTabContent(index)
              : getFeatures().chat.inbox && getFeatures().chat.broadcast
              ? renderTabContent(index)
              : getFeatures().chat.inbox &&
                getFeatures().chat.group &&
                index == 1
              ? renderTabContent(index + 1)
              : renderTabContent(index)}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

export default ChatUserList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabContainerMain: {
    padding: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#faeedd',
    borderRadius: 24,
    overflow: 'hidden',
  },
  activeBackground: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: '#86b952',
    borderRadius: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontWeight: '500',
    fontSize: 16,
  },
  page: {
    width,
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatar: {
    backgroundColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  helper: {
    fontSize: 12,
    color: '#86b952',
    marginTop: 2,
    fontWeight: '500',
  },
  role: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
