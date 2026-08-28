import React, { memo, useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const NoticeBoardBanner = () => {
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    navigation.navigate('NoticeScreen');
  }, [navigation]);

  return (
    <TouchableOpacity
      style={{
        height: 150,
        flex: 1,
        borderRadius: 10,
        borderColor: 'rgb(2,4,5)',
      }}
      onPress={handlePress}
    >
      <LinearGradient
        colors={['#89d3fb23', '#ffffff']}
        style={{
          flex: 1,
          borderRadius: 18,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image source={require('../assets/Cards/Noticeboard.png')} />
        <Text style={{ fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
          Notice board announcements
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default memo(NoticeBoardBanner);

const styles = StyleSheet.create({});
