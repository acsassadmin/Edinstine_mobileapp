import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { X, SwitchCamera, RotateCcw } from 'lucide-react-native';
// here i used
const FrontCamera = ({ onPhotoCaptured, onClose }) => {
  const cameraRef = useRef(null);

  const [cameraType, setCameraType] = useState('Front');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(false);

  const capture = async () => {
    try {
      const result = await cameraRef.current.capture();
      if (result?.uri) {
        setPhoto(result.uri);
        setPreview(true);
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to capture photo');
    }
  };

  const switchCamera = () => {
    setCameraType(
      cameraType === CameraType.Front ? CameraType.Back : CameraType.Front,
    );
  };

  const usePhoto = () => {
    if (photo) {
      onPhotoCaptured(photo);
    }
    setPhoto(null);
    setPreview(false);
    onClose();
  };

  if (preview && photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />

        <TouchableOpacity
          onPress={() => {
            setPreview(false);
            setPhoto(null);
          }}
          style={styles.button}
        >
          <RotateCcw color="white" />
          <Text style={styles.text}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={usePhoto} style={styles.useButton}>
          <Text style={styles.text}>Use Photo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        cameraType={cameraType}
        flashMode="auto"
        scanBarcode={false}
      />

      <View style={styles.controls}>
        <TouchableOpacity onPress={onClose} style={styles.button}>
          <X color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={capture} style={styles.capture} />

        <TouchableOpacity onPress={switchCamera} style={styles.button}>
          <SwitchCamera color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FrontCamera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  camera: {
    flex: 1,
  },

  preview: {
    flex: 1,
  },

  controls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  capture: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: 'white',
  },

  useButton: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    backgroundColor: '#86b952',
    padding: 15,
    borderRadius: 30,
  },

  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});
