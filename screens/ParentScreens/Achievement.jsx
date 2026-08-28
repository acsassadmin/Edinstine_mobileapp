import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import {
  BadgeCheck,
  FileText,
  ChevronRight,
  Trophy,
} from 'lucide-react-native';
import BackButton from '../../components/BackButton';
import { BASEURL } from '../../appurls';

const { width: screenWidth } = Dimensions.get('window');

const Achievement = () => {
  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { appUser, token } = useUser();

  const API_BASE_URL = `${BASEURL}/api/common/save-issued-certificate/?user_id=${appUser?.id}`;

  const fetchCertificates = useCallback(
    async (url = API_BASE_URL) => {
      if (loadingMore) return;

      setLoading(true);
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (url === API_BASE_URL) {
          setCertificates(data.results || []);
        } else {
          setCertificates(prev => [...prev, ...(data.results || [])]);
        }

        setPagination({
          next: data.links?.next,
          previous: data.links?.previous,
          count: data.count || 0,
        });
      } catch (error) {
        Alert.alert('Error', `Failed to load certificates: ${error.message}`);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [API_BASE_URL, loadingMore, token],
  );

  const viewCertificate = useCallback(pdfUrl => {
    Linking.openURL(pdfUrl).catch(() => {
      Alert.alert('Error', 'Cannot open PDF. Install a PDF viewer.');
    });
  }, []);

  const loadMore = useCallback(() => {
    if (pagination.next && !loadingMore) {
      setLoadingMore(true);
      fetchCertificates(pagination.next);
    }
  }, [pagination.next, loadingMore, fetchCertificates]);

  useEffect(() => {
    if (appUser?.id) {
      fetchCertificates();
    }
  }, [appUser?.id, fetchCertificates]);

  const renderCertificate = useCallback(
    ({ item }) => (
      <TouchableOpacity style={styles.certificateCard} activeOpacity={0.9}>
        <View style={[styles.gradientBackground, styles.linearGradient]}>
          <View style={styles.gradientOverlay} />

          <View style={styles.cardInner}>
            <View style={styles.badgeContainer}>
              <View style={styles.goldBadge}>
                <BadgeCheck size={20} color="#FFD700" />
              </View>
            </View>

            <View style={styles.content}>
              <View style={styles.headerRow}>
                <View style={styles.textContainer}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {item.student_name}
                  </Text>
                  <Text style={styles.issuedDate} numberOfLines={1}>
                    {new Date(item.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <FileText size={28} color="#86b952" />
              </View>

              <Text style={styles.templateTitle} numberOfLines={2}>
                {item.template_title}
              </Text>

              <View style={styles.statusBar}>
                <View style={[styles.statusFill, styles.activeFill]} />
                <View style={[styles.statusFill, styles.activeFill]} />
                <View style={styles.statusFill} />
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => viewCertificate(item.certificate)}
              >
                <Text style={styles.actionText}>View Certificate</Text>
                <ChevronRight size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [viewCertificate],
  );

  if (loading && certificates.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading certificates...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              marginBottom: 12,
            }}
          >
            <BackButton />
            <Text style={styles.headerTitle}>Achievements</Text>
          </View>
        </View>

        <FlatList
          data={certificates}
          renderItem={renderCertificate}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footerLoader} color="#667eea" />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Trophy size={64} color="#ddd" />
              <Text style={styles.emptyTitle}>No Achievements Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your certificates will appear here once earned
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  mainContent: { flex: 1, padding: 20 },
  header: { marginBottom: 30 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  headerStats: { flexDirection: 'row', alignItems: 'center' },
  statsNumber: { fontSize: 28, fontWeight: '900', color: '#86b952' },
  statsLabel: { fontSize: 16, color: '#666', marginLeft: 8, fontWeight: '600' },
  listContainer: { paddingBottom: 40 },
  certificateCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#86b952',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  gradientBackground: {
    padding: 24,
    backgroundColor: '#86b952',
  },
  linearGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
  },
  cardInner: {
    position: 'relative',
    zIndex: 1,
  },
  badgeContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
  },
  goldBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  content: { marginTop: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: { flex: 1 },
  studentName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
    flexShrink: 1,
  },
  issuedDate: {
    fontSize: 14,
    color: '#4a4a4a',
    fontWeight: '600',
  },
  templateTitle: {
    fontSize: 16,
    color: '#2d2d2d',
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 20,
  },
  statusBar: { flexDirection: 'row', marginBottom: 20 },
  statusFill: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(134, 185, 82, 0.6)',
    borderRadius: 2,
    marginRight: 4,
  },
  activeFill: {
    backgroundColor: '#86b952',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#86b952',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: '#86b952',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  footerLoader: { marginVertical: 30 },
  pdfIconContainer: {
    padding: 8,
    backgroundColor: 'rgba(134, 185, 82, 0.2)',
    borderRadius: 12,
  },
});

export default Achievement;
