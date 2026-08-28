import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  Keyboard,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useCallback, useState, useEffect } from 'react';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import axios from 'axios';
import { BASEURL } from '../../appurls';
import { WebView } from 'react-native-webview';
import { useUser } from '../../context/UserContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  FileQuestionMark,
  Send,
  ChevronDown,
  ChevronUp,
  Edit, // <--- ADDED IMPORT
} from 'lucide-react-native';

const ConcernScreen = () => {
  const navigation = useNavigation();
  const { appUser, user, token } = useUser();
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [concernReplies, setConcernReplies] = useState({});
  const [inputText, setInputText] = useState({});
  const [sendingId, setSendingId] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);

  const getRepliesForConcern = async concernId => {
    try {
      const response = await axios.get(
        `${BASEURL}/api/parent/concern-replies/?concern_id=${concernId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setConcernReplies(prev => ({
        ...prev,
        [concernId]: response.data.results || [],
      }));
    } catch (error) {
      // console.log(`Error fetching replies for ${concernId}:`, error);
    }
  };

  const getConcerns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASEURL}/api/parent/ParentConcernView/?student_id=${appUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const concernsData = response.data.results;
      setConcerns(concernsData);

      if (concernsData && concernsData.length > 0) {
        concernsData.forEach(concern => {
          getRepliesForConcern(concern.id);
        });
      }
    } catch (error) {
      // console.log("Error fetching concerns:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = id => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id],
    );
  };

  const handleSendReply = async concernId => {
    const message = inputText[concernId];
    if (!message || !message.trim()) return;

    Keyboard.dismiss();
    setSendingId(concernId);

    try {
      const payload = { concern: concernId, message: message };
      await axios.post(`${BASEURL}/api/parent/concern-replies/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInputText(prev => ({ ...prev, [concernId]: '' }));
      await getRepliesForConcern(concernId);
      Alert.alert('Success', 'Reply sent successfully.');
    } catch (error) {
      // console.log("Error sending reply:", error);
      Alert.alert('Error', 'Failed to send reply.');
    } finally {
      setSendingId(null);
    }
  };

  // NEW: Navigation handler to edit screen
  const handleEditPress = item => {
    navigation.navigate('RaiseConcernScreen', { concernData: item });
  };

  useFocusEffect(
    useCallback(() => {
      getConcerns();
      setConcernReplies({});
      setInputText({});
      setExpandedIds([]);
    }, [user]),
  );

  const renderConcerns = ({ item }) => {
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: sans-serif; font-size: 14px; color: #333; padding: 5px; margin: 0; background-color: white; }
          </style>
        </head>
        <body>${item.content}</body>
      </html>
    `;

    const replies = concernReplies[item.id] || [];
    const isExpanded = expandedIds.includes(item.id);

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.tagContainer}>
              <Text style={styles.categoryText}>
                {item.category_name || 'N/A'}
              </Text>
            </View>
            <Text style={styles.subjectText}>
              {item.subject || 'No Subject'}
            </Text>
          </View>

          {/* EDIT BUTTON */}
          {/* You can wrap this in a condition if you want, e.g., item.created_by === user.id */}
          <TouchableOpacity
            onPress={() => handleEditPress(item)}
            style={styles.editButton}
          >
            <Edit size={18} color="#86b952" />
          </TouchableOpacity>
        </View>

        {/* Description Body */}
        <View style={styles.webViewContainer}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            scrollEnabled={false}
            style={{ height: 100, backgroundColor: 'transparent' }}
          />
        </View>

        {/* --- REPLIES SECTION --- */}
        <View style={styles.repliesSection}>
          <TouchableOpacity
            onPress={() => toggleExpand(item.id)}
            style={styles.repliesHeaderRow}
          >
            <Text style={styles.repliesHeader}>
              {replies.length > 0
                ? `Conversation (${replies.length})`
                : 'No replies yet'}
            </Text>
            {isExpanded ? (
              <ChevronUp size={20} color="#555" />
            ) : (
              <ChevronDown size={20} color="#555" />
            )}
          </TouchableOpacity>

          {isExpanded && (
            <ScrollView
              style={styles.chatScrollArea}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {replies.map(reply => {
                const isMe = reply.created_by === appUser?.id;
                return (
                  <View
                    key={reply.id}
                    style={[
                      styles.messageRow,
                      isMe ? styles.rowMe : styles.rowAdmin,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMe ? styles.bubbleMe : styles.bubbleAdmin,
                      ]}
                    >
                      <Text
                        style={[
                          styles.senderName,
                          isMe ? { color: '#a4d65e' } : { color: '#666' },
                        ]}
                      >
                        {isMe ? 'You' : reply.created_by_name || 'Admin'}
                      </Text>
                      <Text
                        style={[
                          styles.messageText,
                          isMe ? { color: '#fff' } : { color: '#333' },
                        ]}
                      >
                        {reply.message}
                      </Text>
                      <Text
                        style={[
                          styles.timeText,
                          isMe ? { color: '#e8f5e9' } : { color: '#999' },
                        ]}
                      >
                        {new Date(reply.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={inputText[item.id] || ''}
              onChangeText={text =>
                setInputText(prev => ({ ...prev, [item.id]: text }))
              }
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                sendingId === item.id && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSendReply(item.id)}
              disabled={sendingId === item.id}
            >
              {sendingId === item.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={18} color="white" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text
            style={[
              styles.statusBadge,
              item.status === 'OPEN' ? styles.statusOpen : styles.statusClosed,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <TopBar />
      <View style={styles.topHeader}>
        <BackButton />
        <Text style={styles.headerTitle}>Concerns</Text>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="large" color="#86b952" />
          </View>
        ) : (
          <FlatList
            data={concerns}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderConcerns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <FileQuestionMark size={48} color="#ccc" />
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 20,
                    color: '#999',
                    fontSize: 16,
                  }}
                >
                  No concerns found.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {!user?.is_superuser && (
        <TouchableOpacity
          onPress={() => navigation.navigate('RaiseConcernScreen')}
          style={styles.fab}
        >
          <FileQuestionMark color={'white'} size={20} />
          <Text style={styles.fabText}>Raise Concern</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ConcernScreen;

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginLeft: 10,
    color: '#2C3E50',
  },
  listContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#86b952',
    backgroundColor: '#EDF7E4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  subjectText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  webViewContainer: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
    height: 100,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusOpen: {
    backgroundColor: '#FFF3E0',
    color: '#EF6C00',
  },
  statusClosed: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  repliesSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  repliesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginLeft: 4,
    paddingVertical: 4,
  },
  repliesHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  chatScrollArea: {
    maxHeight: 250,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowAdmin: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    position: 'relative',
  },
  bubbleMe: {
    backgroundColor: '#86b952',
    borderBottomRightRadius: 4,
  },
  bubbleAdmin: {
    backgroundColor: '#F2F2F2',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9F9F9',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    maxHeight: 80,
    fontSize: 14,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  sendBtn: {
    backgroundColor: '#86b952',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#ccc',
  },
  fab: {
    backgroundColor: '#86b952',
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  fabText: {
    fontWeight: '700',
    color: 'white',
    fontSize: 15,
  },
});
