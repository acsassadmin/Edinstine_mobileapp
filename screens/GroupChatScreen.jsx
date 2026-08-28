import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Alert,
  Modal,
  PermissionsAndroid,
} from 'react-native';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pick, types, isCancel } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {
  Image as ImageIcon,
  FileText,
  Video as VideoIcon,
  Music,
  XCircle,
  CheckCheck,
  Send,
  Mic,
  Square,
  Play,
  Pause,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { useUser } from '../context/UserContext';
import ChatTopBar from '../components/ChatTopBar';
import axios from 'axios';
import VideoPreview from '../components/VideoPreview';
import { BASEURL, scoketUrl } from '../appurls';

// Import Nitro Sound
import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';

// --- Audio Player Component ---
const AudioMessage = ({ uri, isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
    };
  }, []);

  const formatAudioTime = ms => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await Sound.pausePlayer();
        setIsPlaying(false);
      } else {
        // Set up playback progress listener
        Sound.addPlayBackListener(e => {
          setPlayTime(formatAudioTime(e.currentPosition));
          setDuration(formatAudioTime(e.duration));
        });

        // Set up playback end listener
        Sound.addPlaybackEndListener(() => {
          setIsPlaying(false);
          setPlayTime('00:00');
          Sound.stopPlayer();
          Sound.removePlayBackListener();
          Sound.removePlaybackEndListener();
        });

        // Start player with URI (base64 string or file path)
        await Sound.startPlayer(uri);
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('playing error', error);
      Alert.alert('Error', 'Failed to play audio.');
    }
  };

  return (
    <TouchableOpacity style={styles.audioContainer} onPress={togglePlayback}>
      {isPlaying ? (
        <Pause
          size={24}
          color={isOwn ? 'white' : '#007AFF'}
          fill={isOwn ? 'white' : '#007AFF'}
        />
      ) : (
        <Play
          size={24}
          color={isOwn ? 'white' : '#007AFF'}
          fill={isOwn ? 'white' : '#007AFF'}
        />
      )}
      <View style={styles.audioWave}>
        <Text
          style={{
            color: isOwn ? 'white' : '#333',
            fontSize: 12,
            marginRight: 10,
          }}
        >
          {playTime} / {duration}
        </Text>
        <View
          style={[
            styles.bar,
            styles.bar1,
            { backgroundColor: isOwn ? 'rgba(255,255,255,0.8)' : '#007AFF' },
          ]}
        />
        <View
          style={[
            styles.bar,
            styles.bar2,
            { backgroundColor: isOwn ? 'rgba(255,255,255,0.8)' : '#007AFF' },
          ]}
        />
        <View
          style={[
            styles.bar,
            styles.bar3,
            { backgroundColor: isOwn ? 'rgba(255,255,255,0.8)' : '#007AFF' },
          ]}
        />
        <View
          style={[
            styles.bar,
            styles.bar4,
            { backgroundColor: isOwn ? 'rgba(255,255,255,0.8)' : '#007AFF' },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const MessageCard = memo(
  ({
    item,
    setSelectedImage,
    setImagePreview,
    viewDocument,
    downloadDocument,
  }) => {
    const formatTime = useCallback(
      timeStr => dayjs(timeStr).format('h:mm A'),
      [],
    );

    const getFileType = useCallback(fileUri => {
      if (!fileUri) return null;

      // Check for base64 audio payload
      if (fileUri.startsWith('data:audio')) return 'audio';

      const extension = fileUri.split('.').pop()?.toLowerCase();
      if (!extension) return 'unknown';

      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'jfif'];
      const videoTypes = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv'];
      const audioTypes = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];
      const docTypes = [
        'pdf',
        'doc',
        'docx',
        'txt',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
      ];

      if (imageTypes.includes(extension)) return 'image';
      if (videoTypes.includes(extension)) return 'video';
      if (audioTypes.includes(extension)) return 'audio';
      if (docTypes.includes(extension)) return 'document';
      return 'unknown';
    }, []);

    const fileType = item.file ? getFileType(item.file) : null;

    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === 'me'
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.sender === 'me' ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {item.file ? (
            <View style={styles.fileMessageContainer}>
              <View style={styles.fileContainer}>
                {fileType === 'image' ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(item.file);
                      setImagePreview(true);
                    }}
                  >
                    <Image
                      source={{ uri: item.file }}
                      style={styles.messageImage}
                    />
                  </TouchableOpacity>
                ) : fileType === 'video' ? (
                  <VideoPreview fileUri={item.file} />
                ) : fileType === 'audio' ? (
                  <AudioMessage uri={item.file} isOwn={item.isOwn} />
                ) : (
                  <View style={styles.documentContainer}>
                    <TouchableOpacity
                      style={styles.documentTouchable}
                      onPress={() => viewDocument(item.file)}
                      onLongPress={() =>
                        downloadDocument(item.file, item.file.split('/').pop())
                      }
                    >
                      <View style={styles.documentIcon}>
                        <FileText size={40} color="#007AFF" />
                      </View>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {item.file.split('/').pop()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.messageTimeContainer}>
                <Text
                  style={[
                    styles.messageTime,
                    item.sender === 'me'
                      ? styles.myMessageTime
                      : styles.otherMessageTime,
                  ]}
                >
                  {formatTime(item.rawTime)}
                </Text>
                {item.isOwn === true && (
                  <CheckCheck size={14} color="#86b952" />
                )}
              </View>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.messageText,
                  item.sender === 'me'
                    ? styles.myMessageText
                    : styles.otherMessageText,
                ]}
              >
                {item.text}
              </Text>
              <View style={styles.messageTimeContainer}>
                <Text
                  style={[
                    styles.messageTime,
                    item.sender === 'me'
                      ? styles.myMessageTime
                      : styles.otherMessageTime,
                  ]}
                >
                  {formatTime(item.rawTime)}
                </Text>
                {item.isOwn === true && (
                  <CheckCheck size={14} color="#86b952" />
                )}
              </View>
            </>
          )}
        </View>
      </View>
    );
  },
);

const GroupChatScreen = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [endUser, setEndUser] = useState(null);
  const [keyboardBehavior, setKeyboardBehavior] = useState(undefined);
  const flatListRef = useRef(null);
  const { appUser, token } = useUser();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [showImagePreview, setImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState();

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [recordedBase64, setRecordedBase64] = useState(null);

  // Hard lock to prevent overlapping fetches
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardBehavior(Platform.OS === 'ios' ? 'padding' : 'height');
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardBehavior(undefined);
      },
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const uriToBase64 = useCallback(async uri => {
    try {
      const base64 = await RNFS.readFile(uri, 'base64');
      return base64;
    } catch (error) {
      console.log('Base64 conversion error:', error);
      throw error;
    }
  }, []);

  const pickFile = useCallback(async () => {
    try {
      const [asset] = await pick({
        type: [types.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (asset) {
        // console.log("assets log",asset.uri);

        const base64 = await uriToBase64(asset.uri);
        // console.log("base64",base64);

        setSelectedFile({
          uri: asset.uri,
          // base64,
          mimeType: asset.type,
          name: asset.name,
          size: asset.size,
        });
      }
    } catch (error) {
      // console.log("document error",error);

      if (!isCancel(error)) {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  }, [uriToBase64]);

  const getFileIcon = useCallback(mimeType => {
    if (mimeType?.includes('image'))
      return <ImageIcon size={24} color="#86b952" />;
    if (mimeType?.includes('pdf'))
      return <FileText size={24} color="#86b952" />;
    if (mimeType?.includes('video'))
      return <VideoIcon size={24} color="#86b952" />;
    if (mimeType?.includes('audio')) return <Music size={24} color="#86b952" />;
    return <FileText size={24} color="#86b952" />;
  }, []);

  const renderFilePreview = useCallback(() => {
    if (!selectedFile) return null;

    return (
      <TouchableOpacity
        style={styles.filePreview}
        onPress={() => {
          setSelectedFile(null);
          setShowFilePreview(false);
        }}
      >
        {selectedFile.mimeType?.includes('image') ? (
          <Image
            source={{ uri: selectedFile.uri }}
            style={styles.filePreviewImage}
          />
        ) : (
          <View style={styles.fileIconContainer}>
            {getFileIcon(selectedFile.mimeType)}
            <Text style={styles.fileNamePreview} numberOfLines={1}>
              {selectedFile.name}
            </Text>
          </View>
        )}
        <XCircle size={20} color="#666" style={styles.closeIcon} />
      </TouchableOpacity>
    );
  }, [selectedFile, getFileIcon]);

  const viewDocument = useCallback(async fileUri => {
    try {
      const fileName = fileUri.split('/').pop();
      const localUri = `${RNFS.CachesDirectoryPath}/${fileName}`;

      await RNFS.downloadFile({ fromUrl: fileUri, toFile: localUri }).promise;
      await Share.open({ url: localUri });
    } catch (error) {
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Cannot open document');
      }
    }
  }, []);
  //
  const downloadDocument = useCallback(async (fileUri, fileName) => {
    try {
      const localUri = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.downloadFile({ fromUrl: fileUri, toFile: localUri }).promise;
      await Share.open({ url: localUri });
      Alert.alert('Success', `Downloaded to:\n${localUri}`);
    } catch (error) {
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Download failed');
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const wsUrl = `${scoketUrl}chat/classroom/${appUser?.class_id}/${appUser?.id}/`;

    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setConnectionStatus('Connected');
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat_message') {
            const messageId = data.id?.toString();
            const messageContent = data.message || data.content;
            const senderId = data.sender;

            setChatHistory(prev => {
              // Deduplicate: check if we already have this exact message
              const isDuplicate = prev.some(msg => {
                if (messageId && msg.id === messageId) return true;
                // Fallback for messages without ID: same content + same sender within 3 seconds
                if (
                  !messageId &&
                  msg.text === messageContent &&
                  msg.sender === (senderId === appUser?.id ? 'me' : 'other')
                ) {
                  return (
                    Math.abs(dayjs().diff(dayjs(msg.rawTime), 'second')) < 3
                  );
                }
                return false;
              });

              if (isDuplicate) return prev;

              const newMessage = {
                id: messageId || Date.now().toString(),
                text: messageContent,
                file: data.file || null,
                sender: senderId === appUser?.id ? 'me' : 'other',
                senderName: data.sender_name || endUser?.name,
                time: dayjs().format('h:mm A'),
                date: dayjs().format('YYYY-MM-DD'),
                rawTime: new Date().toISOString(),
                isOwn: senderId === appUser?.id,
              };

              return [...prev, newMessage];
            });

            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        } catch (error) {
          console.error('WS Error:', error);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
        setConnectionStatus('Connection Error');
      };

      ws.onclose = event => {
        setWsConnected(false);
        setConnectionStatus('Disconnected');

        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [token, appUser?.class_id, appUser?.id, endUser?.name]);

  useEffect(() => {
    const loadData = async () => {
      const chatData = await AsyncStorage.getItem('chatUser');
      if (chatData) {
        const parsedChatData = JSON.parse(chatData);
        setEndUser(parsedChatData);
      }
    };
    loadData();
  }, [appUser]);

  const fetchChatHistory = useCallback(
    async (url = null, isRefresh = false) => {
      if (isFetchingRef.current || !endUser) return;

      isFetchingRef.current = true;

      if (isRefresh) {
        setRefreshing(true);
        setNextPageUrl(null);
      } else if (url) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const apiUrl =
          url ||
          `${BASEURL}/class-room-history/?user_id=${appUser?.id}&classroom_id=${endUser?.id}&page=1`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const transformedMessages = data.results
          .map(item => ({
            id: item.id.toString(),
            text: item.content,
            file: item.file || null,
            sender: item.isOwn ? 'me' : 'other',
            senderName: item.sender_name,
            time: dayjs(item.time).format('h:mm A'),
            date: dayjs(item.time).format('YYYY-MM-DD'),
            rawTime: item.time,
          }))
          .reverse();

        if (url && !isRefresh) {
          setChatHistory(prev => [...transformedMessages, ...prev]);
        } else {
          setChatHistory(transformedMessages);
        }

        setNextPageUrl(data.links?.next || null);
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [endUser, appUser?.id, token],
  );

  const loadMoreMessages = useCallback(() => {
    if (!loadingMore && nextPageUrl && endUser) {
      fetchChatHistory(nextPageUrl);
    }
  }, [loadingMore, nextPageUrl, endUser, fetchChatHistory]);

  const handleRefresh = useCallback(() => {
    if (endUser) {
      fetchChatHistory(null, true);
    }
  }, [endUser, fetchChatHistory]);

  useEffect(() => {
    if (endUser && token) {
      fetchChatHistory();
    }
  }, [endUser, token, fetchChatHistory]);

  const getDateHeader = useCallback(timeString => {
    const messageDate = dayjs(timeString);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, 'day');

    if (messageDate.isSame(today, 'day')) return 'Today';
    if (messageDate.isSame(yesterday, 'day')) return 'Yesterday';
    return messageDate.format('MMM DD');
  }, []);

  const groupedMessages = useMemo(
    () =>
      chatHistory.reduce((acc, message) => {
        const dateKey = getDateHeader(message.rawTime);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(message);
        return acc;
      }, {}),
    [chatHistory, getDateHeader],
  );
  //
  const messageSections = useMemo(
    () =>
      Object.keys(groupedMessages)
        .map(dateKey => ({
          dateKey,
          data: groupedMessages[dateKey],
        }))
        .reverse(),
    [groupedMessages],
  );

  // --- Voice Recording Logic ---

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'This app needs access to your microphone to record voice messages.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleMicPress = useCallback(async () => {
    try {
      if (isRecording) {
        // Stop Recording
        const result = await Sound.stopRecorder();
        Sound.removeRecordBackListener();
        setIsRecording(false);

        // result is typically a file path. Read it as base64 for socket transfer
        if (result) {
          let base64Str = result;
          // If it's a file path, read it
          if (
            typeof result === 'string' &&
            (result.startsWith('/') || result.startsWith('file:'))
          ) {
            base64Str = await RNFS.readFile(result, 'base64');
          }
          setRecordedBase64(base64Str);
        }
      } else {
        // Request Permission First
        const hasPermission = await requestAudioPermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Microphone permission is required to record audio.',
          );
          return;
        }

        // Start Recording
        Sound.addRecordBackListener(e => {
          // Timer speed fix: calculate directly from currentPosition (ms)
          const minutes = Math.floor(e.currentPosition / 60000);
          const seconds = Math.floor((e.currentPosition % 60000) / 1000);
          setRecordTime(
            `${minutes.toString().padStart(2, '0')}:${seconds
              .toString()
              .padStart(2, '0')}`,
          );
        });

        await Sound.startRecorder();
        setIsRecording(true);
        setRecordedBase64(null);
        setRecordTime('00:00');
      }
    } catch (error) {
      Alert.alert('Recording Error', 'Could not start/stop audio recording.');
    }
  }, [isRecording]);

  const sendVoiceMessage = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Payload exactly as requested: data://voicerecors mapped to standard base64 string
    const payload = {
      file: `data:audio/mp3;base64,${recordedBase64}`,
    };

    wsRef.current.send(JSON.stringify(payload));
    setRecordedBase64(null);
    setRecordTime('00:00');
  }, [recordedBase64]);

  const sendMessage = useCallback(async () => {
    if (sending) return;

    const textToSend = message.trim();
    const fileToUpload = selectedFile;

    if (!textToSend && !fileToUpload) return;

    if (!wsConnected || !wsRef.current) {
      Alert.alert('Error', 'Not connected to chat server.');
      return;
    }

    // Clear inputs IMMEDIATELY to prevent double tapping the send button
    setMessage('');
    setSelectedFile(null);
    setShowFilePreview(false);
    setSending(true);

    if (fileToUpload) {
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: fileToUpload.uri,
          type: fileToUpload.mimeType || 'application/octet-stream',
          name: fileToUpload.name || 'file',
        });
        formData.append('chat_type', 'classroom');
        formData.append('classroom_id', endUser?.id);

        await axios.post(`${BASEURL}/upload-file/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        // DO NOT call handleRefresh() here.
        // The WebSocket will emit the new message automatically,
        // and our deduplication logic will handle the rest.
      } catch (err) {
        Alert.alert('Error', 'Failed to upload file');
      } finally {
        setSending(false);
      }
    } else {
      const payload = { message: textToSend };
      wsRef.current.send(JSON.stringify(payload));
      setSending(false);
    }
  }, [sending, wsConnected, message, selectedFile, endUser, token]);

  const renderSectionHeader = useCallback(
    ({ section: { dateKey } }) => (
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>{dateKey}</Text>
      </View>
    ),
    [],
  );

  const renderFooter = useCallback(
    () =>
      loadingMore ? (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#86b952" />
        </View>
      ) : null,
    [loadingMore],
  );

  const renderHelper = useCallback(
    type => {
      if (type === 'inbox') return endUser?.helper;
      else if (type === 'group') return 'Group Chat';
      return '';
    },
    [endUser],
  );

  if (loading && chatHistory.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#86b952" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <>
      <ChatTopBar endUser={endUser} renderHelper={renderHelper} />
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messageSections}
          keyExtractor={(item, index) => `${index}-${item.dateKey}`}
          renderItem={({ item }) => (
            <View>
              {renderSectionHeader({ section: item })}
              {item.data.map(msg => (
                <View key={`msg-${msg.id}`}>
                  <MessageCard
                    item={msg}
                    setSelectedImage={setSelectedImage}
                    setImagePreview={setImagePreview}
                    viewDocument={viewDocument}
                    downloadDocument={downloadDocument}
                  />
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          inverted
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#86b952']}
              tintColor="#86b952"
            />
          }
          ListFooterComponent={renderFooter}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.5}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        />

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.inputAction} onPress={pickFile}>
            <ImageIcon size={24} color="#86b952" />
          </TouchableOpacity>
          {renderFilePreview()}

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            blurOnSubmit={false}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />

          {/* Dynamic Voice/Send Button Logic */}
          {isRecording ? (
            <View style={styles.recordingWrapper}>
              <Text style={styles.timerText}>{recordTime}</Text>
              <TouchableOpacity
                style={[styles.sendButton, styles.sendButtonActive]}
                onPress={handleMicPress}
              >
                <Square size={18} color="white" fill="white" />
              </TouchableOpacity>
            </View>
          ) : recordedBase64 ? (
            <TouchableOpacity
              style={[styles.sendButton, styles.sendButtonActive]}
              onPress={sendVoiceMessage}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          ) : message.trim() || selectedFile ? (
            <TouchableOpacity
              style={[
                styles.sendButton,
                message.trim() || selectedFile
                  ? styles.sendButtonActive
                  : styles.sendButtonInactive,
              ]}
              onPress={sendMessage}
              disabled={(!message.trim() && !selectedFile) || sending}
            >
              <Send size={20} color={message.trim() ? 'white' : '#ccc'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleMicPress}
            >
              <Mic size={20} color="#86b952" />
            </TouchableOpacity>
          )}
        </View>

        <Modal visible={showImagePreview} transparent animationType="slide">
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.53)',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => setImagePreview(false)}
              style={{
                backgroundColor: 'rgba(12, 3, 3, 0.36)',
                padding: 10,
                borderRadius: 100,
                alignSelf: 'flex-end',
                position: 'absolute',
                zIndex: 1,
                top: '10%',
                right: '10%',
              }}
            >
              <XCircle color={'white'} size={28} />
            </TouchableOpacity>

            <Image
              source={{ uri: selectedImage }}
              style={{ width: '80%', aspectRatio: 1 }}
            />
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  flexContainer: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#86b952',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 8,
  },
  dateHeaderText: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: '#86b952',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  imageLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    minWidth: 150,
  },
  audioWave: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    height: 24,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  bar1: { height: 12 },
  bar2: { height: 20 },
  bar3: { height: 16 },
  bar4: { height: 24 },
  messageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.9)',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputAction: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    maxHeight: 120,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  recordingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    marginRight: 10,
    color: '#ff4444',
    fontWeight: '600',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#86b952',
  },
  sendButtonInactive: {
    backgroundColor: '#f0f0f0',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 200,
  },
  filePreviewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  fileIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  fileNamePreview: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  closeIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});

export default GroupChatScreen;
