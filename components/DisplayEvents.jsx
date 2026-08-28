import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { BASEURL } from '../appurls';
import ImagePreviewModel from './ImagePreviewModel';
import BackButton from './BackButton';
import TopBar from './ParentTobBar';

const DisplayEvents = () => {
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const [activeImage, setActiveImage] = useState(null);

  const { token, appUser } = useUser();
  const navigation = useNavigation();

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // The API call uses the state 'selectedType'
      const response = await axios.get(`${BASEURL}/api/common/events/`, {
        params: {
          branch_id: appUser.branch_id,
          type: selectedType?.id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data.results || []);
    } catch (error) {
      // console.log("Events Error:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const response = await axios.get(`${BASEURL}/api/common/event-types/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEventTypes(response.data || []);
    } catch (error) {
      // console.log("Event Types Error:", error?.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  // Fetch events whenever the selectedType changes
  useEffect(() => {
    fetchEvents();
  }, [selectedType]);

  const renderEvent = ({ item }) => {
    console.log('data', item);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('EventBoard', {
            data: item,
          })
        }
      >
        {item.image && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setActiveImage(item.image)}
          >
            <Image source={{ uri: item.image }} style={styles.eventImage} />
          </TouchableOpacity>
        )}
        <Text style={styles.eventName}>{item.eventName || 'Title'}</Text>
        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.eventInfo}>
          📅 {item.startDate || 'N/A'}
          {item.endDate ? ` - ${item.endDate}` : ''}
        </Text>
        <Text style={styles.eventInfo}>
          ⏰ {item.startTime || 'N/A'}
          {item.endTime ? ` - ${item.endTime}` : ''}
        </Text>
        <Text style={styles.eventInfo}>📍 {item.location || 'N/A'}</Text>
        <Text style={styles.eventInfo}>🎫 {item.event_type || 'N/A'}</Text>
        <Text style={styles.eventInfo}>🌟 {item.chiefGuest || 'N/A'}</Text>
        {item.class_details?.length > 0 && (
          <Text style={styles.eventInfo}>
            🏫 {item.class_details.join(', ')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#86b952" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TopBar />
      <View
        style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}
      >
        <BackButton />
        <Text style={{ fontWeight: '800', fontSize: 18 }}>Circulars</Text>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(!showFilter)}
        >
          <View style={styles.filterLeft}>
            <Ionicons name="filter" size={18} color="#fff" />
            <Text style={styles.filterButtonText}>
              {selectedType ? selectedType.name : 'All Event Types'}
            </Text>
          </View>
          <Ionicons
            name={showFilter ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>

        {showFilter && (
          <View style={styles.dropdown}>
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={{
                maxHeight: 250,
              }}
            >
              {/* All Events Option */}
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedType(null); // Clears the filter
                  setShowFilter(false);
                }}
              >
                <Text style={styles.dropdownText}>All Events</Text>
              </TouchableOpacity>

              {/* Dynamic Event Types */}
              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedType(type); // Sets the object with ID
                    setShowFilter(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View
            style={{
              padding: 30,
              alignItems: 'center',
              marginTop: 50,
            }}
          >
            <Text>No Events Found</Text>
          </View>
        )}
        // Added to prevent keyboard issues or layout shifting
        keyboardShouldPersistTaps="handled"
      />
      <ImagePreviewModel
        imageUrl={activeImage}
        onClose={() => setActiveImage(null)}
      />
    </View>
  );
};

export default DisplayEvents;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 12,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },

  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    flex: 1,
  },

  filterContainer: {
    marginHorizontal: 16,
    marginTop: 15,
    zIndex: 999, // Essential for dropdown to appear above other elements
    position: 'relative',
  },

  filterButton: {
    backgroundColor: '#86b952',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 14,
    position: 'absolute',
    top: 60, // Adjust based on filterButton height + padding
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(180, 180, 180, 0.52)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },

  dropdownText: {
    fontSize: 15,
    color: '#333',
  },

  eventCard: {
    width: '100%', // Changed to 100% for vertical list, or use specific width if you want horizontal
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16, // Changed from marginRight for vertical list
    padding: 16,
    borderWidth: 0.4,
    borderColor: 'rgba(182, 182, 182, 0.38)',
    // Shadow for card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  eventImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
  },

  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },

  eventDescription: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500', // Changed from 700 for better readability of body text
    lineHeight: 20,
    marginBottom: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginVertical: 12,
  },

  eventInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
});
