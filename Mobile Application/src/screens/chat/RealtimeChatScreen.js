import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  getSocket,
  joinComplaintRoom,
  leaveComplaintRoom,
  sendTypingStart,
  sendTypingStop
} from '../../services/socketService';
import API from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  Check,
  CheckCheck,
  ShieldAlert,
  UserCheck
} from 'lucide-react-native';

export const RealtimeChatScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const { ticketId = 'TKT-9842', complaint } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const scrollViewRef = useRef();

  // Mock initial chat messages for offline preview capability
  const initialMockMessages = [
    {
      _id: 'm_1',
      sender: { _id: 'admin_1', name: 'Lab Admin (Dave)', role: 'ADMIN' },
      content: `Hello ${user?.name || 'Student'}, I received your high-priority ticket ${ticketId}. An engineer has been dispatched to check the electrical socket.`,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: true,
    },
    {
      _id: 'm_2',
      sender: { _id: user?._id || 'std_101', name: user?.name || 'Alex Rivera', role: 'STUDENT' },
      content: 'Thank you! The presentation is scheduled for 2:00 PM, so we appreciate the fast resolution.',
      createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      read: true,
    },
  ];

  useEffect(() => {
    fetchChatHistory();

    // Socket joins room
    const socket = getSocket();
    if (complaint?._id) {
      joinComplaintRoom(complaint._id);
    }

    if (socket) {
      socket.on('NEW_CHAT_MESSAGE', (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      });

      socket.on('user_typing', ({ userName, isTyping }) => {
        setTypingUser(isTyping ? userName : null);
      });
    }

    return () => {
      if (complaint?._id) {
        leaveComplaintRoom(complaint._id);
      }
      if (socket) {
        socket.off('NEW_CHAT_MESSAGE');
        socket.off('user_typing');
      }
    };
  }, [ticketId]);

  const fetchChatHistory = async () => {
    if (complaint?._id) {
      try {
        const res = await API.get(`/messages/complaint/${complaint._id}`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setMessages(res.data);
          scrollToBottom();
          return;
        }
      } catch (e) {
        console.warn('Using local chat history fallback.');
      }
    }
    setMessages(initialMockMessages);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const pickImageAttachment = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedAttachment(result.assets[0].uri);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedAttachment) return;

    const messageText = inputMessage.trim();
    const attachmentUrl = selectedAttachment;

    setInputMessage('');
    setSelectedAttachment(null);

    const newMsgObj = {
      _id: 'm_' + Date.now(),
      sender: {
        _id: user?._id || 'std_101',
        name: user?.name || 'Student',
        role: 'STUDENT',
      },
      content: messageText,
      attachment: attachmentUrl,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, newMsgObj]);
    scrollToBottom();

    // Post to backend API
    if (complaint?._id) {
      try {
        await API.post('/messages', {
          complaintId: complaint._id,
          content: messageText,
          attachment: attachmentUrl,
        });
      } catch (e) {
        console.warn('Socket message emission handled locally.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Chat Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Support Chat • {ticketId}</Text>
            <View style={styles.onlineStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Department Admin Online</Text>
            </View>
          </View>
        </View>

        {/* Chat Messages Body */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesScroll}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.noticeBox}>
            <ShieldAlert size={16} color="#818cf8" />
            <Text style={styles.noticeText}>
              Official campus support channel. All communications are logged for quality & safety.
            </Text>
          </View>

          {messages.map((item) => {
            const isMe = item.sender?._id === user?._id || item.sender?.role === 'STUDENT';

            return (
              <View
                key={item._id}
                style={[
                  styles.messageBubbleWrapper,
                  isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
                ]}
              >
                {!isMe && (
                  <Text style={styles.senderLabel}>
                    {item.sender?.name || 'Admin'} (Department Officer)
                  </Text>
                )}

                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                  {item.attachment && (
                    <Image source={{ uri: item.attachment }} style={styles.attachedImage} />
                  )}
                  {item.content ? (
                    <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>
                      {item.content}
                    </Text>
                  ) : null}

                  <View style={styles.bubbleFooter}>
                    <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {isMe && (
                      <View style={{ marginLeft: 4 }}>
                        {item.read ? (
                          <CheckCheck size={14} color="#a5b4fc" />
                        ) : (
                          <Check size={14} color="#818cf8" />
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {typingUser && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>{typingUser} is typing...</Text>
            </View>
          )}
        </ScrollView>

        {/* Selected Attachment Preview */}
        {selectedAttachment && (
          <View style={styles.attachmentBar}>
            <Image source={{ uri: selectedAttachment }} style={styles.attachMiniPrev} />
            <Text style={styles.attachBarText}>Image attached</Text>
            <TouchableOpacity onPress={() => setSelectedAttachment(null)}>
              <Text style={styles.removeAttach}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input Box */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn} onPress={pickImageAttachment}>
            <ImageIcon size={20} color="#818cf8" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor="#64748b"
            value={inputMessage}
            onChangeText={(val) => {
              setInputMessage(val);
              if (val.length > 0 && complaint?._id) {
                sendTypingStart(complaint._id, user?.name);
              } else if (complaint?._id) {
                sendTypingStop(complaint._id);
              }
            }}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputMessage.trim() && !selectedAttachment) && styles.disabledSend,
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() && !selectedAttachment}
          >
            <Send size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  onlineText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '600',
  },
  messagesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4338ca',
    marginBottom: 16,
    gap: 10,
  },
  noticeText: {
    color: '#cbd5e1',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  messageBubbleWrapper: {
    marginBottom: 14,
    maxWidth: '82%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  senderLabel: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
  },
  myBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderBottomLeftRadius: 4,
  },
  attachedImage: {
    width: 200,
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMsgText: {
    color: '#ffffff',
  },
  theirMsgText: {
    color: '#f8fafc',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  timeText: {
    fontSize: 10,
  },
  myTimeText: {
    color: '#e0e7ff',
  },
  theirTimeText: {
    color: '#94a3b8',
  },
  typingIndicator: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  typingText: {
    color: '#818cf8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  attachmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 10,
  },
  attachMiniPrev: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  attachBarText: {
    color: '#cbd5e1',
    fontSize: 13,
    flex: 1,
  },
  removeAttach: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 10,
  },
  attachBtn: {
    padding: 8,
    backgroundColor: '#0f172a',
    borderRadius: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSend: {
    opacity: 0.4,
  },
});

export default RealtimeChatScreen;
