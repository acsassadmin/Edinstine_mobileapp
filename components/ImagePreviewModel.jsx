import React, { memo } from 'react';
import { Modal, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

const ImagePreviewModel = ({ imageUrl, onClose }) => {
  return (
    <Modal
      visible={imageUrl !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={style.modalBackground}>
        <TouchableOpacity style={style.closeButton} onPress={onClose}>
          <X size={30} color="#ffffff" />
        </TouchableOpacity>

        {imageUrl && (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={style.fullScreenImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
};

export default memo(ImagePreviewModel);

const style = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 25,
  },
  fullScreenImage: {
    width: '100%',
    height: '85%',
  },
});
