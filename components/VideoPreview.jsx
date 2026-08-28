import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import { Play } from 'lucide-react-native';

const VideoPreview = ({ fileUri }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: fileUri }}
        style={styles.videoPlayer}
        resizeMode="cover"
        paused={!isPlaying}
        controls={true}
        pictureInPicture={true}
        playInBackground={false}
        onEnd={handleVideoEnd}
        poster={fileUri}
        posterResizeMode="cover"
      />

      {!isPlaying && (
        <TouchableOpacity
          style={styles.videoOverlay}
          onPress={togglePlay}
          activeOpacity={0.9}
        >
          <Play size={36} color="white" fill="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    position: 'relative',
    marginVertical: 8,
  },
  videoPlayer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
});

export default memo(VideoPreview);
