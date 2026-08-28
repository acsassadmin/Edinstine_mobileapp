import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useUser } from '../../context/UserContext';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import { BASEURL } from '../../appurls';
import { User, MessageCircle, X } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

const BirthdayCard = memo(({ item, getDaysColor, openTemplateModal }) => {
  const daysColor = getDaysColor(item.days_remaining);

  return (
    <TouchableOpacity style={styles.birthdayCard} activeOpacity={0.9}>
      <View style={styles.cardHeader}>
        <View style={styles.profileImageContainer}>
          {item.profile_image ? (
            <Image
              source={{ uri: `${item.profile_image}` }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <User size={32} color="#86b952" />
            </View>
          )}
        </View>

        <View style={styles.nameContainer}>
          <View style={styles.staffTypeContainer}>
            <Text style={styles.staffType}>{item.user_type || 'Staff'}</Text>
          </View>

          <Text style={styles.staffName} numberOfLines={2}>
            {item.staff_name}
          </Text>

          <View style={styles.remainingDaysContainer}>
            <Text style={[styles.remainingDaysText, { color: daysColor }]}>
              {item.days_remaining}
            </Text>
            <Text style={styles.remainingDaysLabel}>days left</Text>
          </View>

          <Text style={styles.dobText}>
            {new Date(item.date_of_birth).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => openTemplateModal(item)}
        >
          <MessageCircle size={24} color="#86b952" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const StaffUpcomingBirthday = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { appUser, token } = useUser();

  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  const getDaysColor = useCallback(days => {
    if (days <= 7) return '#FF6B6B';
    if (days <= 30) return '#FFA726';
    return '#86b952';
  }, []);

  const fetchBirthdays = useCallback(
    async (url = null, isRefresh = false) => {
      const baseUrl = `${BASEURL}/api/common/staff-upcoming-birthdays/?branch_id=${appUser?.branch_id}`;
      const fetchUrl = url || baseUrl;

      if (loadingMore && !isRefresh) return;
      if (fetchUrl === baseUrl) {
        setLoading(true);
        if (isRefresh) setRefreshing(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const response = await fetch(fetchUrl, { headers });
        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (fetchUrl === baseUrl || isRefresh) {
          setBirthdays(data.results || []);
        } else {
          setBirthdays(prev => {
            const newData = data.results || [];
            const uniqueData = newData.filter(
              newItem =>
                !prev.some(existing => existing.staff_id === newItem.staff_id),
            );
            return [...prev, ...uniqueData];
          });
        }

        setPagination({
          next: data.links?.next,
          previous: data.links?.previous,
          count: data.count || 0,
        });
      } catch (error) {
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [appUser?.branch_id, loadingMore, token],
  );

  const loadMore = useCallback(() => {
    if (pagination.next && !loadingMore) {
      fetchBirthdays(pagination.next);
    }
  }, [pagination.next, loadingMore, fetchBirthdays]);

  const onRefresh = useCallback(() => {
    fetchBirthdays(null, true);
  }, [fetchBirthdays]);

  useEffect(() => {
    fetchBirthdays();
  }, [fetchBirthdays]);

  const birthdayTemplates = useCallback(
    item => [
      `🎉 Happy Birthday ${item.staff_name}! 🎂\n\nWishing you a joyful day and continued success at work!\n🎈`,
      `🎂 Birthday Cheers!\n\nDear ${item.staff_name},\nHope your birthday is as amazing as you are!\n🌟`,
      `🎉 Many Happy Returns!\n\nDear ${item.staff_name},\nMay your day be filled with happiness, success, and good health!\n🎂`,
    ],
    [],
  );

  const openTemplateModal = useCallback(
    item => {
      setSelectedStaff(item);
      setCustomMessage(birthdayTemplates(item)[0]);
      setTemplateModalVisible(true);
    },
    [birthdayTemplates],
  );

  const sendToWhatsApp = useCallback(() => {
    if (!customMessage) return;

    const url = `whatsapp://send?text=${encodeURIComponent(customMessage)}`;
    Linking.openURL(url).catch(() => {
      alert('WhatsApp is not installed on this device');
    });
    setTemplateModalVisible(false);
  }, [customMessage]);

  const renderBirthdayCard = useCallback(
    ({ item }) => (
      <BirthdayCard
        item={item}
        getDaysColor={getDaysColor}
        openTemplateModal={openTemplateModal}
      />
    ),
    [getDaysColor, openTemplateModal],
  );

  if (loading && birthdays.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading staff birthdays...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Upcoming Staff Birthdays</Text>
        </View>

        <FlatList
          data={birthdays}
          renderItem={renderBirthdayCard}
          keyExtractor={item => item.staff_id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
        />

        <Modal visible={templateModalVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Birthday Message</Text>

                    <TouchableOpacity
                      onPress={() => setTemplateModalVisible(false)}
                    >
                      <X size={26} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {selectedStaff &&
                      birthdayTemplates(selectedStaff).map(
                        (template, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.templateCard}
                            onPress={() => setCustomMessage(template)}
                          >
                            <Text style={styles.templateText}>{template}</Text>
                          </TouchableOpacity>
                        ),
                      )}

                    <Text style={styles.customLabel}>Customize Message</Text>

                    <TextInput
                      style={styles.customInput}
                      multiline
                      value={customMessage}
                      onChangeText={setCustomMessage}
                      placeholder="Type your message..."
                    />
                  </ScrollView>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setTemplateModalVisible(false)}
                    >
                      <Text style={{ color: '#fff' }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sendBtn}
                      onPress={sendToWhatsApp}
                    >
                      <Text style={{ color: '#fff' }}>Send WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff' },
  mainContent: { flex: 1, padding: 20 },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#86b952' },
  listContainer: { paddingBottom: 40 },
  birthdayCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#86b952',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  profileImageContainer: { marginRight: 16 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#f0f0f0',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#86b95220',
  },
  nameContainer: { flex: 1 },
  staffTypeContainer: { marginBottom: 4 },
  staffType: {
    fontSize: 12,
    color: '#86b952',
    fontWeight: '700',
    backgroundColor: 'rgba(134,185,82,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  staffName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  remainingDaysContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 2,
  },
  remainingDaysText: { fontSize: 22, fontWeight: '900', marginRight: 4 },
  remainingDaysLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  dobText: { fontSize: 14, color: '#666', fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    zIndex: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  templateCard: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  templateText: { fontSize: 14 },
  customLabel: { marginTop: 10, fontWeight: '600' },
  customInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    height: 100,
    marginTop: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelBtn: { backgroundColor: '#999', padding: 10, borderRadius: 8 },
  sendBtn: { backgroundColor: '#86b952', padding: 10, borderRadius: 8 },
});

export default StaffUpcomingBirthday;
