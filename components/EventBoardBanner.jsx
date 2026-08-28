import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const EventBoardBanner = () => {
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    navigation.navigate('EventScreen');
  }, [navigation]);

  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={handlePress}>
      <LinearGradient
        colors={['#f77f531a', '#f77f5311', '#ffffff']}
        style={{
          flex: 1,
          padding: 14,
          height: 150,
          borderRadius: 18,
          borderColor: 'rgb(2,3,4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image source={require('../assets/Cards/Anouncement.png')} />
        <Text style={{ fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
          Circular announcements
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default memo(EventBoardBanner);
