import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Megaphone, Users } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import BackButton from './BackButton';

const Avatar = memo(({ endUser }) => {
  if (endUser?.avatarUrl) {
    return (
      <Image source={{ uri: endUser.avatarUrl }} style={styles.headerAvatar} />
    );
  }

  if (endUser?.type === 'broadcast') {
    return (
      <View style={[styles.headerAvatar, styles.broadcastAvatar]}>
        <Megaphone size={24} color="white" />
      </View>
    );
  } else if (endUser?.type === 'group') {
    return (
      <View style={[styles.headerAvatar, styles.groupAvatar]}>
        <Users size={24} color="white" />
      </View>
    );
  } else {
    const name = endUser?.name || '';
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();

    return (
      <View style={[styles.headerAvatar, styles.defaultAvatar]}>
        <Text style={styles.initialsText}>{initials || 'U'}</Text>
      </View>
    );
  }
});

const ChatTopBar = ({ endUser, renderHelper }) => {
  const navigation = useNavigation();
  const { appUser } = useUser();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <BackButton color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.7}>
            <Avatar endUser={endUser} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>
              {endUser?.name || 'Loading...'}
            </Text>
            <Text style={styles.headerStatus}>
              {renderHelper(endUser?.type)}
              {endUser?.type === 'broadcast' ? ` (${endUser?.helper})` : ''}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatTopBar;

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#86b952',
  },
  header: {
    backgroundColor: '#86b952',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  broadcastAvatar: {
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatar: {
    backgroundColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatar: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  initialsText: {
    color: '#86b952',
    fontSize: 16,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
});
