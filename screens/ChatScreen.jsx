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
  Pressable,
  Modal,
  PermissionsAndroid,
} from 'react-native';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pick, types, isCancel } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
const drive = React.lazy('../');
import {
  Image as ImageIcon,
  FileText,
  Video as VideoIcon,
  Music,
  XCircle,
  CheckCheck,
  Forward,
  DownloadCloud,
  X,
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
import { useNavigation, useRoute } from '@react-navigation/native';

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
  const [playTime, setPlayTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
    };
  }, []);

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await Sound.pausePlayer();
        setIsPlaying(false);
      } else {
        // Set up playback progress listener
        Sound.addPlayBackListener(e => {
          setPlayTime(Sound.mmssss(Math.floor(e.currentPosition)));
          setDuration(Sound.mmssss(Math.floor(e.duration)));
        });

        // Set up playback end listener
        Sound.addPlaybackEndListener(() => {
          setIsPlaying(false);
          setPlayTime('00:00:00');
          Sound.stopPlayer();
          Sound.removePlayBackListener();
          Sound.removePlaybackEndListener();
        });

        // Start player with URI (base64 string or file path)
        await Sound.startPlayer(uri);
        setIsPlaying(true);
      }
    } catch (error) {
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
    isSelectionMode,
    selectedMessages,
    setIsSelectionMode,
    setSelectedMessages,
    viewDocument,
    downloadDocument,
    setSelectedImage,
    setImagePreview,
  }) => {
    const formatTime = useCallback(
      timeStr => dayjs(timeStr).format('h:mm A'),
      [],
    );

    const getFileType = useCallback(fileUri => {
      if (!fileUri) return null;

      // Check for base64 audio payload or audio extensions
      if (fileUri.startsWith('data:audio')) return 'audio';

      const extension = fileUri.split('.').pop()?.toLowerCase();
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
    const isSelected = !!selectedMessages[item.id];

    const handleLongPress = useCallback(() => {
      setIsSelectionMode(true);
      setSelectedMessages(prev => {
        const next = { ...prev };
        if (next[item.id]) {
          delete next[item.id];
        } else {
          next[item.id] = {
            id: item.id,
            text: item.text,
            file: item.file,
            sender: item.sender,
            rawTime: item.rawTime,
            isOwn: item.isOwn,
          };
        }
        return next;
      });
    }, [item, setIsSelectionMode, setSelectedMessages]);

    const handlePress = useCallback(() => {
      if (isSelectionMode) {
        handleLongPress();
      }
    }, [isSelectionMode, handleLongPress]);

    return isSelectionMode ? (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          item.sender === 'me'
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
          isSelectionMode && isSelected && styles.messageSelected,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.9}
      >
        <View
          style={[
            styles.messageBubble,
            item.sender === 'me' ? styles.myMessage : styles.otherMessage,
            isSelectionMode && isSelected && styles.messageBubbleSelected,
          ]}
        >
          {item.file ? (
            <View style={styles.fileMessageContainer}>
              <View style={styles.fileContainer}>
                {fileType === 'image' ? (
                  <Image
                    source={{ uri: item.file }}
                    style={styles.messageImage}
                  />
                ) : fileType === 'video' ? (
                  <VideoPreview fileUri={item.file} />
                ) : fileType === 'audio' ? (
                  <AudioMessage uri={item.file} isOwn={item.isOwn} />
                ) : (
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
                {item.isOwn && <CheckCheck size={14} color="#86b952" />}
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
                {item.isOwn && <CheckCheck size={14} color="#86b952" />}
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    ) : (
      <Pressable
        style={[
          styles.messageContainer,
          item.sender === 'me'
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
          isSelectionMode && isSelected && styles.messageSelected,
        ]}
        onLongPress={handleLongPress}
        activeOpacity={1}
      >
        <View
          style={[
            styles.messageBubble,
            item.sender === 'me' ? styles.myMessage : styles.otherMessage,
            isSelectionMode && isSelected && styles.messageBubbleSelected,
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
                {item.isOwn && <CheckCheck size={14} color="#86b952" />}
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
                {item.isOwn && <CheckCheck size={14} color="#86b952" />}
              </View>
            </>
          )}
        </View>
      </Pressable>
    );
  },
);

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [senderId, setSenderId] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endUser, setEndUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [keyboardBehavior, setKeyboardBehavior] = useState(undefined);
  const [selectedFile, setSelectedFile] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [selectedMessages, setSelectedMessages] = useState({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [recordedBase64, setRecordedBase64] = useState(null);

  const flatListRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { appUser, token } = useUser();
  const navigation = useNavigation();
  const staffId = useRoute().params?.staffId;
  const [showImagePreview, setImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState();

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

  useEffect(() => {
    if (!senderId || !receiverId || !token) return;

    const wsUrl = `${scoketUrl}chat/${senderId}/${receiverId}/`;

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
            const newMessage = {
              id: data.id?.toString() || Date.now().toString(),
              text: data.message || data.content,
              file: data.file || null,
              sender: data.sender === senderId ? 'me' : 'other',
              senderName: data.sender_name || endUser?.name,
              time: dayjs().format('h:mm A'),
              date: dayjs().format('YYYY-MM-DD'),
              rawTime: new Date().toISOString(),
              isOwn: data.sender === senderId,
            };
            setChatHistory(prev => [...prev, newMessage]);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        } catch (error) {}
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
  }, [senderId, receiverId, token, endUser?.name]);

  useEffect(() => {
    const loadData = async () => {
      const chatData = await AsyncStorage.getItem('chatUser');
      if (chatData) {
        const parsedChatData = JSON.parse(chatData);
        setEndUser(parsedChatData);
        setSenderId(appUser.id);
        setReceiverId(staffId ?? parsedChatData.id);
      }
    };
    loadData();
  }, [appUser.id, staffId]);

  const fetchChatHistory = useCallback(
    async (pageUrl = null, isRefresh = false) => {
      if ((loading && !isRefresh) || !senderId || !receiverId) return;

      if (isRefresh) setRefreshing(true);
      else if (
        pageUrl &&
        pageUrl !==
          `${BASEURL}/chat-history/?sender_id=${senderId}&receiver_id=${receiverId}&page=1`
      )
        setLoadingMore(true);
      else setLoading(true);

      try {
        const url =
          pageUrl ||
          `${BASEURL}/chat-history/?sender_id=${senderId}&receiver_id=${receiverId}&page=1`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setNextPageUrl(data.links?.next || null);

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
            isOwn: item.isOwn,
          }))
          .reverse();

        if (isRefresh || !pageUrl) {
          setChatHistory(transformedMessages);
          setCurrentPage(1);
        } else {
          setChatHistory(prev => [...transformedMessages, ...prev]);
          setCurrentPage(prev => prev + 1);
        }

        setHasMore(!!data.links?.next);
      } catch (error) {
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [loading, senderId, receiverId, token],
  );

  const pickFile = useCallback(async () => {
    try {
      const [asset] = await pick({
        type: [types.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (asset) {
        setSelectedFile({
          uri: asset.uri,
          mimeType: asset.type,
          name: asset.name,
          size: asset.size,
        });
      }
    } catch (error) {
      if (!isCancel(error)) {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  }, []);

  const viewDocument = useCallback(async fileUri => {
    try {
      const fileName = fileUri.split('/').pop();
      const localUri = `${RNFS.CachesDirectoryPath}/${fileName}`;

      await RNFS.downloadFile({ fromUrl: fileUri, toFile: localUri }).promise;
      await Share.open({ url: localUri });
    } catch (error) {
      Alert.alert('Error', 'Cannot open document');
    }
  }, []);

  const save = useCallback(uri => {
    Share.open({ url: uri });
  }, []);

  const downloadDocument = useCallback(
    async (fileUri, fileName) => {
      if (!fileUri || !fileName) {
        Alert.alert('Error', 'Invalid file.');
        return;
      }

      try {
        const localUri = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        await RNFS.downloadFile({ fromUrl: fileUri, toFile: localUri }).promise;
        save(localUri);
        Alert.alert('Success', `File saved locally at:\n${localUri}`);
      } catch (error) {
        Alert.alert('Error', 'Download failed');
      }
    },
    [save],
  );

  const loadMoreMessages = useCallback(() => {
    if (!loadingMore && hasMore && nextPageUrl && senderId && receiverId) {
      fetchChatHistory(nextPageUrl);
    }
  }, [
    loadingMore,
    hasMore,
    nextPageUrl,
    senderId,
    receiverId,
    fetchChatHistory,
  ]);

  const handleRefresh = useCallback(() => {
    if (senderId && receiverId) {
      fetchChatHistory(null, true);
    }
  }, [senderId, receiverId, fetchChatHistory]);

  useEffect(() => {
    if (senderId && receiverId && token) {
      fetchChatHistory();
    }
  }, [senderId, receiverId, token, fetchChatHistory]);

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
    return true; // iOS handles permissions natively when accessing the mic
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
          setRecordTime(Sound.mmssss(Math.floor(e.currentPosition)));
        });

        await Sound.startRecorder();
        setIsRecording(true);
        setRecordedBase64(null);
        setRecordTime('00:00:00');
      }
    } catch (error) {
      Alert.alert('Recording Error', 'Could not start/stop audio recording.');
    }
  }, [isRecording]);

  const sendVoiceMessage = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const payload = {
      file: `data:audio/mp3;base64,${recordedBase64}`,
    };

    wsRef.current.send(JSON.stringify(payload));
    setRecordedBase64(null);
    setRecordTime('00:00:00');
  }, [recordedBase64]);

  const sendMessage = useCallback(async () => {
    if (!message.trim() && !selectedFile) return;

    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'application/octet-stream',
          name: selectedFile.name || 'file',
        });
        formData.append('chat_type', 'private');
        formData.append('receiver_id', receiverId);

        await axios.post(`${BASEURL}/upload-file/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        setSelectedFile(null);
        handleRefresh();
      } catch (err) {
        Alert.alert('Error', 'Failed to upload file');
      }
    } else {
      const payload = { message: message.trim() };
      console.log('message only');

      wsRef.current.send(JSON.stringify(payload));
      setMessage('');
    }
  }, [message, selectedFile, receiverId, token, handleRefresh]);

  const renderFilePreview = useCallback(() => {
    if (!selectedFile) return null;

    let IconComponent = FileText;
    if (selectedFile.mimeType?.includes('image')) IconComponent = ImageIcon;
    else if (selectedFile.mimeType?.includes('pdf')) IconComponent = FileText;
    else if (selectedFile.mimeType?.includes('video'))
      IconComponent = VideoIcon;
    else if (selectedFile.mimeType?.includes('audio')) IconComponent = Music;

    return (
      <TouchableOpacity
        style={styles.filePreview}
        onPress={() => {
          setSelectedFile(null);
        }}
      >
        {selectedFile.mimeType?.includes('image') ? (
          <Image
            source={{ uri: selectedFile.uri }}
            style={styles.filePreviewImage}
          />
        ) : (
          <View style={styles.fileIconContainer}>
            <IconComponent size={24} color="#86b952" />
            <Text style={styles.fileNamePreview} numberOfLines={1}>
              {selectedFile.name}
            </Text>
          </View>
        )}
        <XCircle size={20} color="#666" style={styles.closeIcon} />
      </TouchableOpacity>
    );
  }, [selectedFile]);

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
      if (type === 'group') return 'Group Chat';
      return '';
    },
    [endUser],
  );

  const handleForward = useCallback(() => {
    navigation.navigate('SelectedChatUser', {
      selectedMessageIds: selectedMessages,
    });
  }, [selectedMessages, navigation]);

  const handleDownloadSelected = useCallback(async () => {
    const selectedIds = Object.keys(selectedMessages);
    const selectedItems = chatHistory.filter(m => selectedIds.includes(m.id));
    const fileItems = selectedItems.filter(m => m.file);

    if (fileItems.length === 0) {
      Alert.alert('Info', 'No files selected to download.');
      return;
    }

    try {
      setLoading(true);

      const downloadPromises = fileItems.map(async item => {
        const fileName = item.file.split('/').pop();
        await downloadDocument(item.file, fileName);
      });

      await Promise.all(downloadPromises);

      Alert.alert(
        'Success',
        `${fileItems.length} file${
          fileItems.length > 1 ? 's' : ''
        } downloaded successfully!`,
      );
    } catch (error) {
      Alert.alert('Error', 'Download failed for some files.');
    } finally {
      setLoading(false);
    }
  }, [selectedMessages, chatHistory, downloadDocument]);

  const handleCloseSelection = useCallback(() => {
    setSelectedMessages({});
    setIsSelectionMode(false);
  }, []);

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
        {isSelectionMode && Object.keys(selectedMessages).length > 0 && (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionText}>
              Selected: {Object.keys(selectedMessages).length}
            </Text>
            <View style={styles.selectionActions}>
              <TouchableOpacity
                style={styles.selectionAction}
                onPress={handleForward}
              >
                <Forward size={18} color="#86b952" />
                <Text style={styles.selectionActionText}>Forward</Text>
              </TouchableOpacity>

              {Object.keys(selectedMessages).length <= 1 && (
                <TouchableOpacity
                  style={styles.selectionAction}
                  onPress={handleDownloadSelected}
                >
                  <DownloadCloud size={18} color="#86b952" />
                  <Text style={styles.selectionActionText}>Download</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseSelection}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color="#86b952" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messageSections}
          keyExtractor={(item, index) => `section-${index}`}
          renderItem={({ item }) => (
            <View>
              {renderSectionHeader({ section: item })}
              {item.data.map(msg => (
                <View key={`msg-${msg.id}`}>
                  <MessageCard
                    item={msg}
                    isSelectionMode={isSelectionMode}
                    selectedMessages={selectedMessages}
                    setIsSelectionMode={setIsSelectionMode}
                    setSelectedMessages={setSelectedMessages}
                    viewDocument={viewDocument}
                    downloadDocument={downloadDocument}
                    setSelectedImage={setSelectedImage}
                    setImagePreview={setImagePreview}
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
          onEndReachedThreshold={0.05}
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
              style={[styles.sendButton, styles.sendButtonActive]}
              onPress={sendMessage}
            >
              <Send size={20} color="white" />
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
              <X color={'white'} size={28} />
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
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  selectionActionText: {
    fontSize: 14,
    color: '#86b952',
    marginLeft: 4,
    fontWeight: '600',
  },
  selectionDone: {
    fontSize: 14,
    color: '#86b952',
    fontWeight: '600',
  },
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
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  fileMessageContainer: {
    gap: 8,
  },
  fileContainer: {
    gap: 8,
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
  documentTouchable: {
    alignItems: 'center',
    padding: 8,
  },
  documentIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
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
  messageSelected: {
    backgroundColor: 'rgba(134, 185, 82, 0.15)',
    padding: 2,
    borderRadius: 8,
    marginVertical: 2,
  },
  messageBubbleSelected: {
    backgroundColor: 'rgba(134, 185, 82, 0.3)',
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
});

export default ChatScreen;
