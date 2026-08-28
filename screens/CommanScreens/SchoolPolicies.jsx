import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import React, { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import { BASEURL } from '../../appurls';
import { useUser } from '../../context/UserContext';
import BackButton from '../../components/BackButton';
import TopBar from '../../components/ParentTobBar';
import {
  AlertCircle,
  Inbox,
  FileText,
  ChevronRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SchoolPolicies = () => {
  const { user, appUser, token } = useUser();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolicies = useCallback(async () => {
    if (!appUser?.branch_id) {
      setError('Branch ID not found.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/api/common/school-policies/?branch_id=${appUser.branch_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const allPolicies = response.data;
      const userRole = user.role ? user.role.toLowerCase() : '';
      const filteredPolicies = allPolicies.filter(policy => {
        const target = policy.target_audience
          ? policy.target_audience.toLowerCase()
          : '';
        return target === userRole || target === 'all';
      });

      setPolicies(filteredPolicies);
    } catch (err) {
      setError('Failed to load school policies.');
    } finally {
      setLoading(false);
    }
  }, [appUser, token, user]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleOpenDocument = useCallback(url => {
    if (!url) return;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this document.');
      }
    });
  }, []);

  const PolicyCard = memo(({ item }) => {
    const formattedContent = item.content
      ? item.content.replace(/\\n/g, '\n')
      : '';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.policyTitle}>{item.title}</Text>
        </View>

        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        {formattedContent && (
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>{formattedContent}</Text>
          </View>
        )}

        {item.document_url && (
          <TouchableOpacity
            style={styles.documentButton}
            onPress={() => handleOpenDocument(item.document_url)}
          >
            <FileText size={20} color="#e74c3c" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.docTitle}>View Document</Text>
              <Text style={styles.docSub} numberOfLines={1}>
                {item.document.split('/').pop()}
              </Text>
            </View>
            <ChevronRight size={20} color="#bdc3c7" />
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Updated: {new Date(item.updated_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  });

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>School Policies</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#86b952" />
            <Text style={styles.loadingText}>Loading policies...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <AlertCircle size={40} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : policies.length === 0 ? (
          <View style={styles.centerContainer}>
            <Inbox size={40} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              No policies found for your role.
            </Text>
          </View>
        ) : (
          policies.map(item => <PolicyCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </View>
  );
};

export default SchoolPolicies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  centerContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eef2f5',
    shadowColor: '#86b952',
  },
  cardHeader: {
    marginBottom: 12,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2c3e50',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#57606f',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  contentBox: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#86b952',
  },
  contentText: {
    fontSize: 14,
    color: '#2f3542',
    lineHeight: 24,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeaea',
    marginBottom: 12,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c0392b',
  },
  docSub: {
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    paddingTop: 10,
    marginTop: 5,
  },
  footerText: {
    fontSize: 11,
    color: '#b2bec3',
    textAlign: 'right',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  emptyText: {
    color: '#95a5a6',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 15,
  },
});
