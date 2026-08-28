import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Edit2 } from 'lucide-react-native';
import axios from 'axios';
import { BASEURL } from '../appurls';
import { launchImageLibrary } from 'react-native-image-picker';
import { useUser } from '../context/UserContext';
import { ActivityIndicator } from 'react-native-paper';

const EditableAvatar = ({ url, onSuccess }) => {
  const { updateProfilePic, token } = useUser();
  const [loading, setLoading] = useState(false);

  const uploadProfile = useCallback(
    async imageUri => {
      try {
        setLoading(true);

        const filename = imageUri.split('/').pop();
        const mimeType = `image/${
          filename.split('.').pop()?.toLowerCase() || 'jpeg'
        }`;
        const uri =
          Platform.OS === 'android' && !imageUri.startsWith('file://')
            ? 'file://' + imageUri
            : imageUri;

        const formData = new FormData();
        formData.append('profile_image', {
          uri,
          name: filename,
          type: mimeType,
        });

        const response = await axios.put(
          `${BASEURL}/api/core/update-profile/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        onSuccess();
        updateProfilePic(response.data?.user?.profile_pic);
        Alert.alert('Success', `Uploaded successfully!`);
      } catch (error) {
        Alert.alert(
          'Error',
          `Failed to upload: ${error.response?.data?.error || error.message}`,
        );
      } finally {
        setLoading(false);
      }
    },
    [token, onSuccess, updateProfilePic],
  );

  const handleUploadFromGallery = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (asset?.uri) {
        uploadProfile(asset.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  }, [uploadProfile]);

  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" color="#86b952" />
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: url }} style={styles.avatar} />

          <Pressable
            style={styles.imageEditButton}
            onPress={handleUploadFromGallery}
          >
            <Edit2 size={14} color={'#FFF'} />
          </Pressable>
        </View>
      )}
    </>
  );
};

export default EditableAvatar;

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },
  imageEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#86b952',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
