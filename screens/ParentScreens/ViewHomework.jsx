import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import BackButton from '../../components/BackButton';
import { Paperclip, Clock, AlertCircle, FileText } from 'lucide-react-native';
import { BASEURL } from '../../appurls';

const HomeworkItem = memo(({ homework, onAttachmentPress }) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Text style={styles.title} numberOfLines={2}>
        {homework.title}
      </Text>
      {homework.attachment && (
        <TouchableOpacity
          style={styles.attachmentIcon}
          onPress={() => onAttachmentPress(homework)}
          accessibilityLabel="Open attachment"
        >
          <Paperclip size={20} color="#86b952" />
        </TouchableOpacity>
      )}
    </View>

    {homework.description ? (
      <Text style={styles.description} numberOfLines={2}>
        {homework.description}
      </Text>
    ) : null}

    <View style={styles.footer}>
      <View style={styles.dueContainer}>
        <Clock size={14} color="#86b952" />
        <Text style={styles.dueText}>Due {homework.due_date}</Text>
      </View>
      <Text style={styles.teacherText}>By {homework.teacher_name}</Text>
    </View>

    {homework.attachment && !onAttachmentPress && (
      <TouchableOpacity style={styles.attachmentLink}>
        <Text style={styles.attachmentText}>{homework.attachment_name}</Text>
      </TouchableOpacity>
    )}
  </View>
));

const ViewHomework = () => {
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { appUser, token } = useUser();

  const url = `${BASEURL}/api/homework/homework/?class_id=${appUser?.class_id}`;

  const fetchHomework = useCallback(async () => {
    try {
      setLoading(refreshing ? false : true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      };

      const response = await axios.get(url, config);

      setHomeworkList(response.data);
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, token, url]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const formatDate = useCallback(isoDateStr => {
    const date = new Date(isoDateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const groupByDate = useCallback(
    items => {
      const groups = {};
      items.forEach(item => {
        const dateKey = item.created_at.split('T')[0];
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(item);
      });
      return Object.entries(groups).map(([key, homeworks]) => ({
        id: key,
        dateStr: formatDate(key),
        data: homeworks,
      }));
    },
    [formatDate],
  );

  const groupedData = groupByDate(homeworkList);

  const handleAttachmentPress = useCallback(homework => {
    Linking.openURL(homework.attachment);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomework();
  }, [fetchHomework]);

  const renderHomeworkItem = useCallback(
    ({ item: homework }) => (
      <HomeworkItem
        homework={homework}
        onAttachmentPress={handleAttachmentPress}
      />
    ),
    [handleAttachmentPress],
  );

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.dateStr}</Text>
        <View style={styles.sectionDivider} />
      </View>
    ),
    [],
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.headerRow}>
          <BackButton />
          <Text style={styles.header}>Handbook</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading homebook...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerRow}>
        <BackButton />
        <Text style={styles.header}>Handbook</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color="#86b952" />
          <Text style={styles.errorText}>Failed to load handbook</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHomework}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={item => item.id}
          renderItem={({ item: section }) => (
            <View>
              {renderSectionHeader({ section })}
              <FlatList
                data={section.data}
                renderItem={renderHomeworkItem}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                style={styles.homeworkList}
              />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#86b952']}
              tintColor="#86b952"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileText size={48} color="#86b952" />
              <Text style={styles.emptyText}>No handbook assignments</Text>
              <Text style={styles.emptySubtext}>Pull to refresh</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default ViewHomework;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    backgroundColor: 'white',
    marginTop: 18,
    borderWidth: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  sectionDivider: {
    height: 3,
    backgroundColor: '#86b952',
    borderRadius: 2,
  },
  homeworkList: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#86b952',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    flex: 1,
    lineHeight: 22,
  },
  attachmentIcon: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#86b95220',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#86b952',
  },
  teacherText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  attachmentLink: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#86b95210',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86b95240',
  },
  attachmentText: {
    fontSize: 13,
    color: '#86b952',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#faeedd',
  },
  loadingText: {
    fontSize: 16,
    color: '#4a5568',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#86b952',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#718096',
  },
});
