import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASEURL } from '../appurls';
import { useUser } from '../context/UserContext';
import { ActivityIndicator } from 'react-native-paper';

const ProfilePicture = ({ type, style = null }) => {
  const { appUser, token } = useUser();

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [image, setImage] = useState();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      var url = '/api/common/biodata/?staff_id=';
      if (type == 'staff') {
        url = '/api/common/biodata/?staff_id=';
      } else if (type == 'parent') {
        url = '/api/common/biodata/?user_id=';
      } else if (type == 'driver') {
        url = '/api/common/biodata/?driver_id=';
      }
      const response = await axios.get(`${BASEURL}${url}${appUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(response.data);
      if (type == 'staff') {
        const imagePath = response.data?.staff_details?.profile_image;
        setImage(imagePath);
      } else if (type == 'parent') {
        const imagePath = response.data?.student_details?.profile_image;
        setImage(imagePath);
      } else if (type == 'driver') {
        const imagePath = response.data?.driver_details?.profile_pic;
        setImage(imagePath);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [appUser, token]);

  return (
    <>
      {loading ? (
        <ActivityIndicator size="small" color="#86b952" />
      ) : style ? (
        <Image source={{ uri: image }} style={[style]} />
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={[styles.avatar]} />
        </View>
      )}
    </>
  );
};

export default ProfilePicture;

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
