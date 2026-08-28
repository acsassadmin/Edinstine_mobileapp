import React, { useState, useEffect, useCallback } from 'react';
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
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import { Cake, MessageCircle, X } from 'lucide-react-native';
import BackButton from '../../components/BackButton';
import { BASEURL } from '../../appurls';

const { width: screenWidth } = Dimensions.get('window');

const StudentUpcomingBirthday = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { token, appUser } = useUser();

  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  const API_BASE_URL = `${BASEURL}/api/common/student-upcoming-birthdays/?class_id=${appUser?.class_id}`;

  const fetchBirthdays = useCallback(
    async (url = API_BASE_URL, isRefresh = false) => {
      if (loadingMore && !isRefresh) return;

      if (url === API_BASE_URL) {
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

        const response = await fetch(url, { headers });
        const data = await response.json();

        if (url === API_BASE_URL || isRefresh) {
          setBirthdays(data.results || []);
        } else {
          setBirthdays(prev => [...prev, ...data.results]);
        }

        setPagination({
          next: data.links?.next,
          previous: data.links?.previous,
          count: data.count,
        });
      } catch (err) {
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [API_BASE_URL, loadingMore, token],
  );

  useEffect(() => {
    fetchBirthdays();
  }, [fetchBirthdays]);

  const loadMore = useCallback(() => {
    if (pagination.next && !loadingMore) {
      fetchBirthdays(pagination.next);
    }
  }, [pagination.next, loadingMore, fetchBirthdays]);

  const onRefresh = useCallback(() => {
    fetchBirthdays(API_BASE_URL, true);
  }, [fetchBirthdays, API_BASE_URL]);

  const birthdayTemplates = useCallback(
    item => [
      `🎉 Happy Birthday ${item.student_name}! 🎂\n\nMay your day be filled with happiness and success.\n\nBest wishes from our school family! 🎈`,
      `🎂 Birthday Wishes!\n\nDear ${item.student_name},\n\nWishing you a wonderful birthday and a fantastic year ahead!\n\nStay happy and keep shining 🌟`,
      `🎉 Many Happy Returns of the Day!\n\nDear ${item.student_name},\n\nMay your birthday bring lots of joy, success, and good health.\n\nHave a great celebration 🎂`,
    ],
    [],
  );

  const sendToWhatsApp = useCallback(() => {
    if (!customMessage) return;

    const url = `whatsapp://send?text=${encodeURIComponent(customMessage)}`;

    Linking.openURL(url).catch(() => {
      alert('WhatsApp not installed');
    });

    setTemplateModalVisible(false);
  }, [customMessage]);

  const getDaysColor = useCallback(days => {
    if (days <= 7) return '#FF6B6B';
    if (days <= 30) return '#FFA726';
    return '#86b952';
  }, []);

  const renderBirthdayCard = useCallback(
    ({ item }) => {
      const daysColor = getDaysColor(item.days_remaining);

      return (
        <TouchableOpacity style={styles.birthdayCard} activeOpacity={0.9}>
          <View style={styles.cardHeader}>
            <View style={styles.profileImageContainer}>
              {item.profile_image ? (
                <Image
                  source={{ uri: `${BASEURL}${item.profile_image}` }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Cake size={32} color="#86b952" />
                </View>
              )}
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.studentName}>{item.student_name}</Text>

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
              onPress={() => {
                setSelectedStudent(item);
                setCustomMessage(birthdayTemplates(item)[0]);
                setTemplateModalVisible(true);
              }}
            >
              <MessageCircle size={24} color="#86b952" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [getDaysColor, birthdayTemplates],
  );

  if (loading && birthdays.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading birthdays...</Text>
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
          <Text style={styles.headerTitle}>Upcoming Birthdays</Text>
        </View>

        <FlatList
          data={birthdays}
          renderItem={renderBirthdayCard}
          keyExtractor={item => item.student_id.toString()}
          contentContainerStyle={styles.listContainer}
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
          showsVerticalScrollIndicator={false}
        />
      </View>

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
                  {selectedStudent &&
                    birthdayTemplates(selectedStudent).map(
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff' },
  mainContent: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#86b952',
    marginLeft: 10,
  },
  birthdayCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 6,
  },
  cardHeader: { flexDirection: 'row' },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: { marginRight: 15 },
  nameContainer: { flex: 1 },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
  },
  remainingDaysContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  remainingDaysText: {
    fontSize: 22,
    fontWeight: '900',
    marginRight: 4,
  },
  remainingDaysLabel: {
    fontSize: 12,
    color: '#666',
  },
  dobText: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10 },
  listContainer: { paddingBottom: 40 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  templateCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  templateText: {
    fontSize: 14,
  },
  customLabel: {
    marginTop: 10,
    fontWeight: '600',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    height: 120,
    marginTop: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelBtn: {
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 8,
  },
  sendBtn: {
    backgroundColor: '#86b952',
    padding: 12,
    borderRadius: 8,
  },
});

export default StudentUpcomingBirthday;
