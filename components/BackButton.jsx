import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

const BackButton = ({ color = 'black' }) => {
  const navigation = useNavigation();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <>
      {navigation.canGoBack() ? (
        <TouchableOpacity activeOpacity={0.8} onPress={handleGoBack}>
          <ChevronLeft size={28} color={color} />
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </>
  );
};

export default BackButton;

const styles = StyleSheet.create({});
