// import {
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   TouchableOpacity,
//   Platform,
//   Image,
//   ActivityIndicator,
//   RefreshControl,
//   Keyboard,
//   Pressable,
//   Alert,
// } from 'react-native';
// import RNFS from 'react-native-fs';
// import Share from 'react-native-share';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
//   useMemo,
//   memo,
// } from 'react';
// import {
//   Image as ImageIcon,
//   FileText,
//   Video,
//   Music,
//   XCircle,
//   CheckCheck,
//   Forward,
//   DownloadCloud,
//   X,
// } from 'lucide-react-native';
// import dayjs from 'dayjs';
// import { useUser } from '../context/UserContext';
// import ChatTopBar from '../components/ChatTopBar';
// import { BASEURL, scoketUrl } from '../appurls';
// import { useNavigation } from '@react-navigation/native';

// const VideoPreview = ({ fileUri }) => null;

// const MessageCard = memo(
//   ({
//     item,
//     isSelectionMode,
//     selectedMessages,
//     setIsSelectionMode,
//     setSelectedMessages,
//     viewDocument,
//     downloadDocument,
//   }) => {
//     const formatTime = useCallback(
//       timeStr => dayjs(timeStr).format('h:mm A'),
//       [],
//     );

//     const getFileType = useCallback(fileUri => {
//       if (!fileUri) return null;
//       const extension = fileUri.split('.').pop()?.toLowerCase();
//       const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'jfif'];
//       const videoTypes = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv'];
//       const docTypes = [
//         'pdf',
//         'doc',
//         'docx',
//         'txt',
//         'xls',
//         'xlsx',
//         'ppt',
//         'pptx',
//       ];
//       if (imageTypes.includes(extension)) return 'image';
//       if (videoTypes.includes(extension)) return 'video';
//       if (docTypes.includes(extension)) return 'document';
//       return 'unknown';
//     }, []);

//     const fileType = item.file ? getFileType(item.file) : null;
//     const isSelected = !!selectedMessages[item.id];

//     const handleLongPress = useCallback(() => {
//       setIsSelectionMode(true);
//       setSelectedMessages(prev => {
//         const next = { ...prev };
//         if (next[item.id]) {
//           delete next[item.id];
//         } else {
//           next[item.id] = {
//             id: item.id,
//             text: item.text,
//             file: item.file,
//             sender: item.sender,
//             rawTime: item.rawTime,
//             isOwn: item.isOwn,
//           };
//         }
//         return next;
//       });
//     }, [item, setIsSelectionMode, setSelectedMessages]);

//     const handlePress = useCallback(() => {
//       if (isSelectionMode) {
//         handleLongPress();
//       }
//     }, [isSelectionMode, handleLongPress]);

//     return isSelectionMode ? (
//       <TouchableOpacity
//         style={[
//           styles.messageContainer,
//           item.sender === 'me'
//             ? styles.myMessageContainer
//             : styles.otherMessageContainer,
//           isSelected && styles.messageSelected,
//         ]}
//         onPress={handlePress}
//         onLongPress={handleLongPress}
//         activeOpacity={0.9}
//       >
//         <View
//           style={[
//             styles.messageBubble,
//             item.sender === 'me' ? styles.myMessage : styles.otherMessage,
//             isSelected && styles.messageBubbleSelected,
//           ]}
//         >
//           {item.file ? (
//             <View style={styles.fileMessageContainer}>
//               <View style={styles.fileContainer}>
//                 {fileType === 'image' ? (
//                   <Image
//                     source={{ uri: item.file }}
//                     style={styles.messageImage}
//                   />
//                 ) : fileType === 'video' ? (
//                   <VideoPreview fileUri={item.file} />
//                 ) : (
//                   <TouchableOpacity
//                     style={styles.documentTouchable}
//                     onPress={() => viewDocument(item.file)}
//                     onLongPress={() =>
//                       downloadDocument(item.file, item.file.split('/').pop())
//                     }
//                   >
//                     <View style={styles.documentIcon}>
//                       <FileText size={40} color="#007AFF" />
//                     </View>
//                     <Text style={styles.fileName} numberOfLines={1}>
//                       {item.file.split('/').pop()}
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//               <View style={styles.messageTimeContainer}>
//                 <Text
//                   style={[
//                     styles.messageTime,
//                     item.sender === 'me'
//                       ? styles.myMessageTime
//                       : styles.otherMessageTime,
//                   ]}
//                 >
//                   {formatTime(item.rawTime)}
//                 </Text>
//                 {item.isOwn && <CheckCheck size={14} color="#86b952" />}
//               </View>
//             </View>
//           ) : (
//             <>
//               <Text
//                 style={[
//                   styles.messageText,
//                   item.sender === 'me'
//                     ? styles.myMessageText
//                     : styles.otherMessageText,
//                 ]}
//               >
//                 {item.text}
//               </Text>
//               <View style={styles.messageTimeContainer}>
//                 <Text
//                   style={[
//                     styles.messageTime,
//                     item.sender === 'me'
//                       ? styles.myMessageTime
//                       : styles.otherMessageTime,
//                   ]}
//                 >
//                   {formatTime(item.rawTime)}
//                 </Text>
//                 {item.isOwn && <CheckCheck size={14} color="#86b952" />}
//               </View>
//             </>
//           )}
//         </View>
//       </TouchableOpacity>
//     ) : (
//       <Pressable
//         style={[
//           styles.messageContainer,
//           item.sender === 'me'
//             ? styles.myMessageContainer
//             : styles.otherMessageContainer,
//           isSelected && styles.messageSelected,
//         ]}
//         onLongPress={handleLongPress}
//         activeOpacity={1}
//       >
//         <View
//           style={[
//             styles.messageBubble,
//             item.sender === 'me' ? styles.myMessage : styles.otherMessage,
//             isSelected && styles.messageBubbleSelected,
//           ]}
//         >
//           {item.file ? (
//             <View style={styles.fileMessageContainer}>
//               <View style={styles.fileContainer}>
//                 {fileType === 'image' ? (
//                   <Image
//                     source={{ uri: item.file }}
//                     style={styles.messageImage}
//                   />
//                 ) : fileType === 'video' ? (
//                   <VideoPreview fileUri={item.file} />
//                 ) : (
//                   <TouchableOpacity
//                     style={styles.documentTouchable}
//                     onPress={() => viewDocument(item.file)}
//                     onLongPress={() =>
//                       downloadDocument(item.file, item.file.split('/').pop())
//                     }
//                   >
//                     <View style={styles.documentIcon}>
//                       <FileText size={40} color="#007AFF" />
//                     </View>
//                     <Text style={styles.fileName} numberOfLines={1}>
//                       {item.file.split('/').pop()}
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//               <View style={styles.messageTimeContainer}>
//                 <Text
//                   style={[
//                     styles.messageTime,
//                     item.sender === 'me'
//                       ? styles.myMessageTime
//                       : styles.otherMessageTime,
//                   ]}
//                 >
//                   {formatTime(item.rawTime)}
//                 </Text>
//                 {item.isOwn && <CheckCheck size={14} color="#86b952" />}
//               </View>
//             </View>
//           ) : (
//             <>
//               <Text
//                 style={[
//                   styles.messageText,
//                   item.sender === 'me'
//                     ? styles.myMessageText
//                     : styles.otherMessageText,
//                 ]}
//               >
//                 {item.text}
//               </Text>
//               <View style={styles.messageTimeContainer}>
//                 <Text
//                   style={[
//                     styles.messageTime,
//                     item.sender === 'me'
//                       ? styles.myMessageTime
//                       : styles.otherMessageTime,
//                   ]}
//                 >
//                   {formatTime(item.rawTime)}
//                 </Text>
//                 {item.isOwn && <CheckCheck size={14} color="#86b952" />}
//               </View>
//             </>
//           )}
//         </View>
//       </Pressable>
//     );
//   },
// );

// const BroadcastScreen = () => {
//   const [message, setMessage] = useState('');
//   const [chatHistory, setChatHistory] = useState([]);
//   const [senderId, setSenderId] = useState(null);
//   const [receiverId, setReceiverId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [endUser, setEndUser] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [keyboardBehavior, setKeyboardBehavior] = useState(undefined);
//   const flatListRef = useRef(null);
//   const { appUser, token } = useUser();
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [showFilePreview, setShowFilePreview] = useState(false);
//   const [handleNext, setHandleNext] = useState(null);
//   const [wsConnected, setWsConnected] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState('Connecting...');
//   const [selectedMessages, setSelectedMessages] = useState({});
//   const [isSelectionMode, setIsSelectionMode] = useState(false);
//   const navigation = useNavigation();

//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       () => {
//         setKeyboardBehavior(Platform.OS === 'ios' ? 'padding' : 'height');
//       },
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => {
//         setKeyboardBehavior(undefined);
//       },
//     );

//     return () => {
//       keyboardDidShowListener?.remove();
//       keyboardDidHideListener?.remove();
//     };
//   }, []);

//   const uriToBase64 = useCallback(uri => {
//     return new Promise((resolve, reject) => {
//       const xhr = new XMLHttpRequest();
//       xhr.onload = () => {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           const base64 = reader.result.split(',')[1];
//           resolve(base64);
//         };
//         reader.readAsDataURL(xhr.response);
//       };
//       xhr.onerror = reject;
//       xhr.open('GET', uri);
//       xhr.responseType = 'blob';
//       xhr.send();
//     });
//   }, []);

//   const pickFile = useCallback(async () => {
//     try {
//       const asset = await DocumentPicker.pickSingle({
//         type: [DocumentPicker.types.allFiles],
//         copyTo: 'cachesDirectory',
//       });

//       if (asset) {
//         const base64 = await uriToBase64(asset.uri);
//         setSelectedFile({
//           uri: asset.uri,
//           base64,
//           mimeType: asset.type,
//           name: asset.name,
//           size: asset.size,
//         });
//       }
//     } catch (error) {
//       if (!DocumentPicker.isCancel(error)) {
//         Alert.alert('Error', 'Failed to pick file');
//       }
//     }
//   }, [uriToBase64]);

//   const getFileIcon = useCallback(mimeType => {
//     if (mimeType?.includes('image'))
//       return <ImageIcon size={24} color="#86b952" />;
//     if (mimeType?.includes('pdf'))
//       return <FileText size={24} color="#86b952" />;
//     if (mimeType?.includes('video')) return <Video size={24} color="#86b952" />;
//     if (mimeType?.includes('audio')) return <Music size={24} color="#86b952" />;
//     return <FileText size={24} color="#86b952" />;
//   }, []);

//   const renderFilePreview = useCallback(() => {
//     if (!selectedFile) return null;
//     return (
//       <TouchableOpacity
//         style={styles.filePreview}
//         onPress={() => {
//           setSelectedFile(null);
//           setShowFilePreview(false);
//         }}
//       >
//         {selectedFile.mimeType?.includes('image') ? (
//           <Image
//             source={{ uri: selectedFile.uri }}
//             style={styles.filePreviewImage}
//           />
//         ) : (
//           <View style={styles.fileIconContainer}>
//             {getFileIcon(selectedFile.mimeType)}
//             <Text style={styles.fileNamePreview} numberOfLines={1}>
//               {selectedFile.name}
//             </Text>
//           </View>
//         )}
//         <XCircle size={20} color="#666" style={styles.closeIcon} />
//       </TouchableOpacity>
//     );
//   }, [selectedFile, getFileIcon]);

//   const viewDocument = useCallback(async fileUri => {
//     try {
//       const fileName = fileUri.split('/').pop();
//       const localUri = `${RNFS.CachesDirectoryPath}/${fileName}`;

//       await RNFS.downloadFile({ fromUrl: fileUri, toFile: localUri }).promise;
//       await Share.open({ url: localUri });
//     } catch (error) {
//       Alert.alert('Error', 'Cannot open document');
//     }
//   }, []);

//   const downloadDocument = useCallback(async (fileUri, fileName) => {
//     if (!fileUri || !fileName) {
//       Alert.alert('Error', 'Invalid file.');
//       return;
//     }

//     try {
//       const localUri = `${RNFS.DocumentDirectoryPath}/${fileName}`;
//       const result = await RNFS.downloadFile({
//         fromUrl: fileUri,
//         toFile: localUri,
//       }).promise;
//       await Share.open({ url: localUri });
//       Alert.alert('Success', `File saved locally at:\n${localUri}`);
//     } catch (error) {
//       Alert.alert('Error', 'Download failed');
//     }
//   }, []);

//   useEffect(() => {
//     if (!senderId || !receiverId || !token) return;
//     const wsUrl = `${scoketUrl}chat/common-room/${appUser.id}/`;
//     const connectWebSocket = () => {
//       const ws = new WebSocket(wsUrl);
//       wsRef.current = ws;
//       ws.onopen = () => {
//         setWsConnected(true);
//         setConnectionStatus('Connected');
//       };

//       ws.onmessage = event => {
//         try {
//           const data = JSON.parse(event.data);
//           if (data.type === 'chat_message') {
//             const newMessage = {
//               id: data.id?.toString() || Date.now().toString(),
//               text: data.message || data.content,
//               file: data.file || null,
//               sender: data.sender === senderId ? 'me' : 'other',
//               senderName: data.sender_name || endUser?.name,
//               time: dayjs().format('h:mm A'),
//               date: dayjs().format('YYYY-MM-DD'),
//               rawTime: new Date().toISOString(),
//               isOwn: data.sender === senderId,
//             };

//             setChatHistory(prev => [...prev, newMessage]);
//             flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//           }
//         } catch (error) {}
//       };

//       ws.onerror = () => {
//         setWsConnected(false);
//         setConnectionStatus('Connection Error');
//       };

//       ws.onclose = event => {
//         setWsConnected(false);
//         setConnectionStatus('Disconnected');

//         if (event.code !== 1000) {
//           reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
//         }
//       };
//     };

//     connectWebSocket();

//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close(1000, 'Component unmounting');
//       }
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//     };
//   }, [senderId, receiverId, token, appUser.id, endUser?.name]);

//   useEffect(() => {
//     const loadData = async () => {
//       const chatData = await AsyncStorage.getItem('chatUser');
//       if (chatData) {
//         const parsedChatData = JSON.parse(chatData);
//         setEndUser(parsedChatData);
//         setSenderId(appUser.id);
//         setReceiverId(parsedChatData.branch_id);
//       }
//     };
//     loadData();
//   }, [appUser]);

//   const fetchChatHistory = useCallback(
//     async (page = 1, isRefresh = false) => {
//       if ((loading && !isRefresh) || !senderId || !receiverId) return;

//       if (isRefresh) setRefreshing(true);
//       else if (page > 1) setLoadingMore(true);
//       else setLoading(true);

//       try {
//         const url = `${BASEURL}/common-room-history/?user_id=${appUser.id}&branch_id=${appUser.branch_id}`;
//         const response = await fetch(handleNext ? handleNext : url, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });
//         if (!response.ok)
//           throw new Error(`HTTP error! status: ${response.status}`);

//         const data = await response.json();
//         setHandleNext(data.links.next ? data.links.next : null);
//         const transformedMessages = data.results
//           .map(item => ({
//             id: item.id.toString(),
//             text: item.content,
//             file: item.file || null,
//             sender: item.isOwn ? 'me' : 'other',
//             senderName: item.sender_name,
//             time: dayjs(item.time).format('h:mm A'),
//             date: dayjs(item.time).format('YYYY-MM-DD'),
//             rawTime: item.time,
//           }))
//           .reverse();

//         if (page === 1 || isRefresh) {
//           setChatHistory(transformedMessages);
//         } else {
//           setChatHistory(prev => [...transformedMessages, ...prev]);
//         }
//         setHasMore(!!data.links?.next);
//       } catch (error) {
//       } finally {
//         setLoading(false);
//         setLoadingMore(false);
//         setRefreshing(false);
//       }
//     },
//     [loading, senderId, receiverId, handleNext, appUser, token],
//   );

//   const loadMoreMessages = useCallback(() => {
//     if (!loadingMore && hasMore && senderId && receiverId) {
//       fetchChatHistory(currentPage + 1);
//     }
//   }, [
//     loadingMore,
//     hasMore,
//     senderId,
//     receiverId,
//     currentPage,
//     fetchChatHistory,
//   ]);

//   const handleRefresh = useCallback(() => {
//     if (senderId && receiverId) {
//       fetchChatHistory(1, true);
//     }
//   }, [senderId, receiverId, fetchChatHistory]);

//   useEffect(() => {
//     if (senderId && receiverId && token) {
//       fetchChatHistory(1);
//     }
//   }, [senderId, receiverId, token, fetchChatHistory]);

//   const getDateHeader = useCallback(timeString => {
//     const messageDate = dayjs(timeString);
//     const today = dayjs();
//     const yesterday = dayjs().subtract(1, 'day');

//     if (messageDate.isSame(today, 'day')) return 'Today';
//     if (messageDate.isSame(yesterday, 'day')) return 'Yesterday';
//     return messageDate.format('MMM DD');
//   }, []);

//   const groupedMessages = useMemo(
//     () =>
//       chatHistory.reduce((acc, message) => {
//         const dateKey = getDateHeader(message.rawTime);
//         if (!acc[dateKey]) acc[dateKey] = [];
//         acc[dateKey].push(message);
//         return acc;
//       }, {}),
//     [chatHistory, getDateHeader],
//   );

//   const messageSections = useMemo(
//     () =>
//       Object.keys(groupedMessages)
//         .map(dateKey => ({
//           dateKey,
//           data: groupedMessages[dateKey],
//         }))
//         .reverse(),
//     [groupedMessages],
//   );

//   const sendMessage = useCallback(() => {
//     if (!wsConnected || !wsRef.current) return;

//     const payload = {};
//     if (message.trim()) payload.message = message.trim();

//     if (selectedFile?.base64) {
//       let cleanBase64 = selectedFile.base64;

//       cleanBase64 = cleanBase64
//         .replace(/^data:[^,]+,/, '')
//         .replace(/[\r\n\s]/g, '')
//         .replace(/[^A-Za-z0-9+/=]/g, '');

//       while (cleanBase64.length % 4) {
//         cleanBase64 += '=';
//       }

//       payload.file = cleanBase64;
//     }

//     wsRef.current.send(JSON.stringify(payload));
//     setMessage('');
//     setSelectedFile(null);
//   }, [wsConnected, message, selectedFile]);

//   const renderSectionHeader = useCallback(
//     ({ section: { dateKey } }) => (
//       <View style={styles.dateHeader}>
//         <Text style={styles.dateHeaderText}>{dateKey}</Text>
//       </View>
//     ),
//     [],
//   );

//   const renderFooter = useCallback(
//     () =>
//       loadingMore ? (
//         <View style={styles.loadingFooter}>
//           <ActivityIndicator size="small" color="#86b952" />
//         </View>
//       ) : null,
//     [loadingMore],
//   );

//   const renderHelper = useCallback(
//     type => {
//       if (type === 'inbox') return endUser?.helper;
//       else if (type === 'group') return 'Group Chat';
//       else if (type === 'broadcast') return 'Broadcast';
//       return '';
//     },
//     [endUser],
//   );

//   const handleForward = useCallback(() => {
//     navigation.navigate('SelectedChatUser', {
//       selectedMessageIds: selectedMessages,
//     });
//   }, [selectedMessages, navigation]);

//   const handleDownloadSelected = useCallback(async () => {
//     const selectedIds = Object.keys(selectedMessages);
//     const selectedItems = chatHistory.filter(m => selectedIds.includes(m.id));
//     const fileItems = selectedItems.filter(m => m.file);

//     if (fileItems.length === 0) {
//       Alert.alert('Info', 'No files selected to download.');
//       return;
//     }

//     try {
//       setLoading(true);
//       const downloadPromises = fileItems.map(async item => {
//         const fileName = item.file.split('/').pop();
//         await downloadDocument(item.file, fileName);
//       });

//       await Promise.all(downloadPromises);

//       Alert.alert(
//         'Success',
//         `${fileItems.length} file${
//           fileItems.length > 1 ? 's' : ''
//         } downloaded successfully!`,
//       );
//     } catch (error) {
//       Alert.alert('Error', 'Download failed for some files.');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedMessages, chatHistory, downloadDocument]);

//   const handleCloseSelection = useCallback(() => {
//     setSelectedMessages({});
//     setIsSelectionMode(false);
//   }, []);

//   if (loading && chatHistory.length === 0) {
//     return (
//       <View style={[styles.container, styles.centered]}>
//         <ActivityIndicator size="large" color="#86b952" />
//         <Text style={styles.loadingText}>Loading messages...</Text>
//       </View>
//     );
//   }

//   return (
//     <>
//       <ChatTopBar endUser={endUser} renderHelper={renderHelper} />
//       <View
//         style={styles.flexContainer}
//         behavior={keyboardBehavior}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//       >
//         {isSelectionMode && Object.keys(selectedMessages).length > 0 && (
//           <View style={styles.selectionBar}>
//             <Text style={styles.selectionText}>
//               Selected: {Object.keys(selectedMessages).length}
//             </Text>
//             <View style={styles.selectionActions}>
//               <TouchableOpacity
//                 style={styles.selectionAction}
//                 onPress={handleForward}
//               >
//                 <Forward size={18} color="#86b952" />
//                 <Text style={styles.selectionActionText}>Forward</Text>
//               </TouchableOpacity>

//               {Object.keys(selectedMessages).length <= 1 && (
//                 <TouchableOpacity
//                   style={styles.selectionAction}
//                   onPress={handleDownloadSelected}
//                 >
//                   <DownloadCloud size={18} color="#86b952" />
//                   <Text style={styles.selectionActionText}>Download</Text>
//                 </TouchableOpacity>
//               )}

//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={handleCloseSelection}
//                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//               >
//                 <X size={18} color="#86b952" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         <FlatList
//           ref={flatListRef}
//           data={messageSections}
//           keyExtractor={(item, index) => `${index}-${item.dateKey}`}
//           renderItem={({ item }) => (
//             <View>
//               {renderSectionHeader({ section: item })}
//               {item.data.map(msg => (
//                 <View key={`msg-${msg.id}`}>
//                   <MessageCard
//                     item={msg}
//                     isSelectionMode={isSelectionMode}
//                     selectedMessages={selectedMessages}
//                     setIsSelectionMode={setIsSelectionMode}
//                     setSelectedMessages={setSelectedMessages}
//                     viewDocument={viewDocument}
//                     downloadDocument={downloadDocument}
//                   />
//                 </View>
//               ))}
//             </View>
//           )}
//           contentContainerStyle={styles.messagesContainer}
//           showsVerticalScrollIndicator={false}
//           inverted
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={handleRefresh}
//               colors={['#86b952']}
//               tintColor="#86b952"
//             />
//           }
//           ListFooterComponent={renderFooter}
//           onEndReached={loadMoreMessages}
//           onEndReachedThreshold={0.05}
//           keyboardDismissMode="on-drag"
//           keyboardShouldPersistTaps="handled"
//           nestedScrollEnabled={true}
//         />

//         <View style={styles.inputBar}>
//           <Text
//             style={{
//               padding: 10,
//               textAlign: 'center',
//               width: '100%',
//               color: '#86b952',
//             }}
//           >
//             Only Admin can send the message
//           </Text>
//         </View>
//       </View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   selectionBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//     backgroundColor: '#f0f0f0',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   selectionText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },
//   selectionActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   selectionAction: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//   },
//   selectionActionText: {
//     fontSize: 14,
//     color: '#86b952',
//     marginLeft: 4,
//     fontWeight: '600',
//   },
//   selectionDone: {
//     fontSize: 14,
//     color: '#86b952',
//     fontWeight: '600',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   flexContainer: {
//     flex: 1,
//   },
//   centered: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   messagesContainer: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   loadingFooter: {
//     paddingVertical: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#666',
//   },
//   dateHeader: {
//     alignItems: 'center',
//     marginVertical: 12,
//     paddingVertical: 8,
//   },
//   dateHeaderText: {
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 16,
//     fontSize: 12,
//     color: '#666',
//     fontWeight: '600',
//   },
//   messageContainer: {
//     marginBottom: 12,
//   },
//   myMessageContainer: {
//     alignItems: 'flex-end',
//   },
//   otherMessageContainer: {
//     alignItems: 'flex-start',
//   },
//   messageBubble: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 20,
//     maxWidth: '80%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   myMessage: {
//     backgroundColor: '#86b952',
//     borderBottomRightRadius: 4,
//   },
//   otherMessage: {
//     backgroundColor: 'white',
//     borderBottomLeftRadius: 4,
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 20,
//   },
//   myMessageText: {
//     color: 'white',
//   },
//   otherMessageText: {
//     color: '#333',
//   },
//   messageImage: {
//     width: 200,
//     height: 150,
//     borderRadius: 12,
//     marginBottom: 4,
//   },
//   fileMessageContainer: {
//     gap: 8,
//   },
//   fileContainer: {
//     gap: 8,
//   },
//   documentTouchable: {
//     alignItems: 'center',
//     padding: 8,
//   },
//   documentIcon: {
//     width: 50,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f8ff',
//     borderRadius: 8,
//     marginBottom: 4,
//   },
//   fileName: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   messageTimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//   },
//   messageTime: {
//     fontSize: 12,
//     fontWeight: '500',
//     marginRight: 4,
//   },
//   myMessageTime: {
//     color: 'rgba(255,255,255,0.9)',
//   },
//   otherMessageTime: {
//     color: '#999',
//   },
//   inputBar: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: 'white',
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   inputAction: {
//     padding: 8,
//     marginRight: 8,
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#e5e5e5',
//     borderRadius: 24,
//     paddingHorizontal: 18,
//     paddingVertical: 14,
//     fontSize: 16,
//     maxHeight: 120,
//     backgroundColor: '#f8f9fa',
//     marginRight: 8,
//   },
//   sendButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButtonActive: {
//     backgroundColor: '#86b952',
//   },
//   sendButtonInactive: {
//     backgroundColor: '#f0f0f0',
//   },
//   filePreview: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     padding: 8,
//     borderRadius: 20,
//     marginRight: 8,
//     maxWidth: 200,
//   },
//   filePreviewImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     marginRight: 8,
//   },
//   fileIconContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   fileNamePreview: {
//     fontSize: 12,
//     color: '#333',
//     marginLeft: 8,
//     flex: 1,
//   },
//   closeIcon: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: 'white',
//     borderRadius: 10,
//   },
//   messageSelected: {
//     backgroundColor: 'rgba(134, 185, 82, 0.15)',
//     padding: 2,
//     borderRadius: 8,
//     marginVertical: 2,
//   },
//   messageBubbleSelected: {
//     backgroundColor: 'rgba(134, 185, 82, 0.3)',
//   },
//   closeButton: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#e0e0e0',
//   },
// });

// export default BroadcastScreen;

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Pressable,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pick, types, isCancel } from '@react-native-documents/picker';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  XCircle,
  CheckCheck,
  Forward,
  DownloadCloud,
  X,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { useUser } from '../context/UserContext';
import ChatTopBar from '../components/ChatTopBar';
import { BASEURL, scoketUrl } from '../appurls';
import { useNavigation } from '@react-navigation/native';

const VideoPreview = ({ fileUri }) => null;

const MessageCard = memo(
  ({
    item,
    isSelectionMode,
    selectedMessages,
    setIsSelectionMode,
    setSelectedMessages,
    viewDocument,
    downloadDocument,
  }) => {
    const formatTime = useCallback(
      timeStr => dayjs(timeStr).format('h:mm A'),
      [],
    );

    const getFileType = useCallback(fileUri => {
      if (!fileUri) return null;
      const extension = fileUri.split('.').pop()?.toLowerCase();
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'jfif'];
      const videoTypes = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv'];
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
          isSelected && styles.messageSelected,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.9}
      >
        <View
          style={[
            styles.messageBubble,
            item.sender === 'me' ? styles.myMessage : styles.otherMessage,
            isSelected && styles.messageBubbleSelected,
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
                {item && <CheckCheck size={14} color="#86b952" />}
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
          isSelected && styles.messageSelected,
        ]}
        onLongPress={handleLongPress}
        activeOpacity={1}
      >
        <View
          style={[
            styles.messageBubble,
            item.sender === 'me' ? styles.myMessage : styles.otherMessage,
            isSelected && styles.messageBubbleSelected,
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

const BroadcastScreen = () => {
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
  const [keyboardBehavior, setKeyboardBehavior] = useState(undefined);
  const flatListRef = useRef(null);
  const { appUser, token } = useUser();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [handleNext, setHandleNext] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [selectedMessages, setSelectedMessages] = useState({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const navigation = useNavigation();

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

  const uriToBase64 = useCallback(uri => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }, []);

  const pickFile = useCallback(async () => {
    try {
      // Using the new @react-native-documents/picker API
      const [asset] = await pick({
        type: [types.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (asset) {
        const base64 = await uriToBase64(asset.uri);
        setSelectedFile({
          uri: asset.uri,
          base64,
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
  }, [uriToBase64]);

  const getFileIcon = useCallback(mimeType => {
    if (mimeType?.includes('image'))
      return <ImageIcon size={24} color="#86b952" />;
    if (mimeType?.includes('pdf'))
      return <FileText size={24} color="#86b952" />;
    if (mimeType?.includes('video')) return <Video size={24} color="#86b952" />;
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
      Alert.alert('Error', 'Cannot open document');
    }
  }, []);

  const downloadDocument = useCallback(async (fileUri, fileName) => {
    if (!fileUri || !fileName) {
      Alert.alert('Error', 'Invalid file.');
      return;
    }

    try {
      const localUri = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      const result = await RNFS.downloadFile({
        fromUrl: fileUri,
        toFile: localUri,
      }).promise;
      await Share.open({ url: localUri });
      Alert.alert('Success', `File saved locally at:\n${localUri}`);
    } catch (error) {
      Alert.alert('Error', 'Download failed');
    }
  }, []);

  useEffect(() => {
    if (!senderId || !receiverId || !token) return;
    const wsUrl = `${scoketUrl}chat/common-room/${appUser.id}/`;
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
  }, [senderId, receiverId, token, appUser.id, endUser?.name]);

  useEffect(() => {
    const loadData = async () => {
      const chatData = await AsyncStorage.getItem('chatUser');
      if (chatData) {
        const parsedChatData = JSON.parse(chatData);
        setEndUser(parsedChatData);
        setSenderId(appUser.id);
        setReceiverId(parsedChatData.branch_id);
      }
    };
    loadData();
  }, [appUser]);

  const fetchChatHistory = useCallback(
    async (page = 1, isRefresh = false) => {
      if ((loading && !isRefresh) || !senderId || !receiverId) return;

      if (isRefresh) setRefreshing(true);
      else if (page > 1) setLoadingMore(true);
      else setLoading(true);

      try {
        const url = `${BASEURL}/common-room-history/?user_id=${appUser.id}&branch_id=${appUser.branch_id}`;
        const response = await fetch(handleNext ? handleNext : url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setHandleNext(data.links.next ? data.links.next : null);
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

        if (page === 1 || isRefresh) {
          setChatHistory(transformedMessages);
        } else {
          setChatHistory(prev => [...transformedMessages, ...prev]);
        }
        setHasMore(!!data.links?.next);
      } catch (error) {
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [loading, senderId, receiverId, handleNext, appUser, token],
  );

  const loadMoreMessages = useCallback(() => {
    if (!loadingMore && hasMore && senderId && receiverId) {
      fetchChatHistory(currentPage + 1);
    }
  }, [
    loadingMore,
    hasMore,
    senderId,
    receiverId,
    currentPage,
    fetchChatHistory,
  ]);

  const handleRefresh = useCallback(() => {
    if (senderId && receiverId) {
      fetchChatHistory(1, true);
    }
  }, [senderId, receiverId, fetchChatHistory]);

  useEffect(() => {
    if (senderId && receiverId && token) {
      fetchChatHistory(1);
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

  const sendMessage = useCallback(() => {
    if (!wsConnected || !wsRef.current) return;

    const payload = {};
    if (message.trim()) payload.message = message.trim();

    if (selectedFile?.base64) {
      let cleanBase64 = selectedFile.base64;

      cleanBase64 = cleanBase64
        .replace(/^data:[^,]+,/, '')
        .replace(/[\r\n\s]/g, '')
        .replace(/[^A-Za-z0-9+/=]/g, '');

      while (cleanBase64.length % 4) {
        cleanBase64 += '=';
      }

      payload.file = cleanBase64;
    }

    wsRef.current.send(JSON.stringify(payload));
    setMessage('');
    setSelectedFile(null);
  }, [wsConnected, message, selectedFile]);

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
      else if (type === 'broadcast') return 'Broadcast';
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
      <View
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
          keyExtractor={(item, index) => `${index}-${item.dateKey}`}
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
          <Text
            style={{
              padding: 10,
              textAlign: 'center',
              width: '100%',
              color: '#86b952',
            }}
          >
            Only Admin can send the message
          </Text>
        </View>
      </View>
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

export default BroadcastScreen;
