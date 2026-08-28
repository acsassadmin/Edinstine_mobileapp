import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import { useUser } from '../../context/UserContext';
import {
  Calendar,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  Wallet,
  RefreshCw,
  CalendarDays,
  ChevronDown,
  ArrowLeft,
  X,
  Check,
  Tag,
  FileText,
  Receipt,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import RazorpayCheckout from 'react-native-razorpay';
import { BASEURL, scoketUrl } from '../../appurls';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import axios from 'axios';

const FeeScreen = () => {
  const navigation = useNavigation();
  const { appUser, token, user } = useUser();

  const [fees, setFees] = useState([]);
  const [installmentBreakdown, setInstallmentBreakdown] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState({});
  const [razorpayUrl, setRazorpayUrl] = useState(null);
  const [webviewVisible, setWebviewVisible] = useState(false);
  const [socket, setSocket] = useState(null);

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const fetchAcademicYears = useCallback(async () => {
    try {
      const schoolId = user?.school_id || 1;
      const response = await axios.get(
        `${BASEURL}/api/common/academic-years/?school_id=${schoolId}&dropdown=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const years = response.data;
      setAcademicYears(years);

      let selected = years.find(y => y.id === user?.academic_year_id);
      if (!selected) selected = years.find(y => y.is_active);
      if (!selected && years.length > 0) selected = years[0];

      if (selected) {
        setSelectedAcademicYear(selected);
      }
    } catch (error) {}
  }, [user?.school_id, user?.academic_year_id, token]);

  const setUpSocket = useCallback(async () => {
    if (!appUser?.id) return;
    const socketConnection = new WebSocket(
      scoketUrl + 'payment-status/' + appUser?.id + '/',
    );
    setSocket(socketConnection);
  }, [appUser?.id, scoketUrl]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const studentId = user?.user_id;

      let url = `${BASEURL}/api/finance/payment-transaction/?student_id=${studentId}`;
      const yearId = selectedAcademicYear
        ? selectedAcademicYear.id
        : user?.academic_year_id;

      if (yearId) {
        url += `&academic_year_id=${yearId}`;
      }

      if (selectedMonth) {
        url += `&due_month=${selectedMonth}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistoryData(response.data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Could not load payment history.';
      Alert.alert('Error', errorMsg);
    } finally {
      setHistoryLoading(false);
    }
  }, [
    user?.user_id,
    selectedAcademicYear,
    user?.academic_year_id,
    selectedMonth,
    token,
  ]);

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      if (!appUser?.id || !token) {
        throw new Error('Student data or token not available');
      }
      const response = await axios.get(
        `${BASEURL}/api/finance/student-fee/?student_id=${appUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = response.data;

      const results = Array.isArray(data) ? data : data.results || [];
      setFees(results);

      const breakdown = Array.isArray(data.installment_breakdown)
        ? data.installment_breakdown
        : [];

      setInstallmentBreakdown(breakdown);

      if (breakdown.length > 0) {
        const sorted = [...breakdown].sort(
          (a, b) => a.installment_number - b.installment_number,
        );
        setSelectedInstallment(sorted[0].installment_number.toString());
      } else {
        setSelectedInstallment('all');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to fetch fees';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [appUser?.id, token]);

  useFocusEffect(
    useCallback(() => {
      fetchFees();
      setUpSocket();
    }, [fetchFees, setUpSocket]),
  );

  useEffect(() => {
    fetchFees();
    setUpSocket();
  }, [webviewVisible, appUser, fetchFees, setUpSocket]);

  const openHistoryModal = useCallback(async () => {
    setHistoryModalVisible(true);
    setHistoryLoading(true);
    setHistoryData(null);

    if (academicYears.length === 0) {
      await fetchAcademicYears();
    }

    await fetchHistory();
  }, [academicYears.length, fetchAcademicYears, fetchHistory]);

  const getFilteredFees = useCallback(() => {
    if (selectedInstallment === 'all') {
      return fees;
    }
    return fees.filter(
      fee => fee.installment_number.toString() === selectedInstallment,
    );
  }, [fees, selectedInstallment]);

  const getFeeSummary = useCallback(() => {
    const currentFees = getFilteredFees();
    if (!currentFees.length) return { total: 0, paid: 0, pending: 0 };
    const total = currentFees.reduce(
      (sum, fee) => sum + parseFloat(fee.net_amount || 0),
      0,
    );
    const paid = currentFees.reduce(
      (sum, fee) => sum + parseFloat(fee.paid_amount || 0),
      0,
    );
    return { total, paid, pending: total - paid };
  }, [getFilteredFees]);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'payment_status_update') {
          setWebviewVisible(false);
        } else if (data.status === 'failed') {
          alert('Payment Failed. Please try again.');
        }
      } catch (error) {
        console.error('Error parsing socket message:', error);
      }
    };
    socket.onerror = error => console.error('WebSocket Error:', error);
    socket.onclose = () => console.log('Socket Disconnected');
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [socket]);

  const summary = getFeeSummary();

  const currentFees = getFilteredFees();
  const allPaid =
    summary.pending === 0 && currentFees.every(fee => fee.status === 'paid');

  const initiatePayment = useCallback(
    async fee => {
      try {
        setPayLoading(prev => ({ ...prev, [fee.id]: true }));

        const response = await fetch(
          `${BASEURL}/api/finance/payment/initiate/`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: Math.round(parseFloat(fee.balance_amount) * 100),
              fee_ids: [fee.id],
              student_id: appUser.id,
            }),
          },
        );

        if (response.status !== 201) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to initiate payment');
        }

        const razorpayOrder = await response.json();

        if (Platform.OS === 'android') {
          const options = {
            description: `${fee.category_name} - ${fee.Classroom_name}`,
            image: 'https://your-app-logo.com/logo.png',
            currency: razorpayOrder.currency || 'INR',
            key: razorpayOrder.key_id,
            amount: razorpayOrder.amount.toString(),
            order_id: razorpayOrder.order_id,
            name: 'School Fee Payment',
            prefill: {
              email: appUser.email || '',
              contact: appUser.phone || '9999999999',
              name: appUser.student_name || 'Parent',
            },
            theme: { color: '#86b952' },
            modal: {
              ondismiss: () =>
                Alert.alert('Payment Cancelled', 'Payment was cancelled'),
            },
          };

          RazorpayCheckout.open(options)
            .then(async data => {
              try {
                const verifyResponse = await fetch(
                  `${BASEURL}/api/finance/payment/verify/`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      razorpay_order_id: data.razorpay_order_id,
                      razorpay_payment_id: data.razorpay_payment_id,
                      razorpay_signature: data.razorpay_signature,
                    }),
                  },
                );

                const verifyData = await verifyResponse.json();

                if (verifyResponse.ok && verifyData.success !== false) {
                  Alert.alert(
                    'Payment Successful! ',
                    `Payment ID: ${data.razorpay_payment_id}\nOrder ID: ${data.razorpay_order_id}\nFee: ${fee.category_name}\n\n Verified by server`,
                    [{ text: 'OK', onPress: () => fetchFees() }],
                  );
                }
              } catch (verifyError) {
                Alert.alert(
                  'Payment Success ⚠️',
                  `Payment ID: ${data.razorpay_payment_id}\nFee: ${fee.category_name}\n\nServer verification failed. Please contact support.`,
                  [{ text: 'OK', onPress: () => fetchFees() }],
                );
              }
            })
            .catch(error => {});
        } else {
          const url = `${BASEURL}/api/finance/razorpay-web-checkout/?order_id=${razorpayOrder.order_id}`;
          setRazorpayUrl(url);
          setWebviewVisible(true);
        }
      } catch (error) {
      } finally {
        setPayLoading(prev => ({ ...prev, [fee.id]: false }));
      }
    },
    [token, appUser, fetchFees],
  );

  const onWebviewNavigationStateChange = useCallback(
    navState => {
      const { url } = navState;
      if (url.includes('payment-success')) {
        setWebviewVisible(false);
        Alert.alert('Payment Success ', 'Payment completed successfully!');
        fetchFees();
      }
      if (url.includes('payment-failure')) {
        setWebviewVisible(false);
      }
    },
    [fetchFees],
  );

  const getMonthList = useCallback(() => {
    const months = [];
    for (let i = -6; i <= 6; i++) {
      const date = dayjs().add(i, 'month');
      months.push({
        label: date.format('MMM YYYY'),
        value: date.format('YYYY-MM'),
      });
    }
    return months;
  }, []);

  const renderFeeItem = useCallback(
    ({ item }) => {
      const isOverdue =
        dayjs(item.due_date).isBefore(dayjs()) && item.status === 'unpaid';
      const balance = parseFloat(item.balance_amount || 0);
      const isUnpaid =
        item.status === 'overdue' || (item.status === 'unpaid' && balance > 0);
      const pending = item?.approval_status === 'Pending';

      const downloadInvoice = () => {
        try {
          const downloadUrl = `${BASEURL}/api/finance/download-invoice/?fee_id=${item.id}`;
          Linking.openURL(downloadUrl).catch(err => {
            Alert.alert('❌ Error', 'Failed to open invoice in browser.');
          });
        } catch (error) {
          Alert.alert('❌ Error', 'Failed to open invoice in browser.');
        }
      };

      return (
        <View
          style={[styles.feeCard, isOverdue ? styles.feeCardOverdue : null]}
        >
          <View style={styles.feeHeader}>
            <View>
              <Text style={styles.feeTitle}>{item.category_name}</Text>
              <Text style={styles.classroomText}>{item.Classroom_name}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                item.status === 'paid' ? styles.paidBadge : styles.unpaidBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.status === 'paid' ? styles.paidText : styles.unpaidText,
                ]}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.label}>Net Amount:</Text>
            <Text style={styles.amount}>
              ₹{parseFloat(item.net_amount).toLocaleString()}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Paid:</Text>
            <Text style={styles.amount}>
              ₹{parseFloat(item.paid_amount).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.amountRow, styles.balanceRow]}>
            <Text style={styles.label}>Balance:</Text>
            <Text
              style={[
                styles.amount,
                styles.balanceAmount,
                balance > 0 ? styles.pendingBalance : styles.paidBalance,
              ]}
            >
              ₹{parseFloat(item.balance_amount).toLocaleString()}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.dueContainer}>
              <Calendar size={16} color="#666" />
              <Text
                style={[styles.dueDate, isOverdue ? styles.overdueDate : null]}
              >
                {dayjs(item.due_date).format('DD MMM YYYY')}
                {isOverdue && ' (Overdue)'}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            {item.status === 'paid' && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={downloadInvoice}
                activeOpacity={0.8}
              >
                <Download size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>Download Invoice</Text>
              </TouchableOpacity>
            )}

            {isUnpaid && !pending && (
              <View style={styles.row}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#86b952',
                    padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    columnGap: 10,
                    borderRadius: 18,
                    width: 100,
                    flexDirection: 'row',
                  }}
                  onPress={() => initiatePayment(item)}
                  disabled={payLoading[item.id]}
                  activeOpacity={0.8}
                >
                  {payLoading[item.id] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CreditCard size={20} color="#fff" />
                      <Text style={styles.payButtonText}>
                        ₹{parseFloat(item.balance_amount).toLocaleString()}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('OtherPaymentsForms', {
                      feeId: item.id,
                      amount: item.balance_amount,
                    });
                  }}
                  style={{
                    backgroundColor: '#86b952',
                    padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    columnGap: 10,
                    borderRadius: 18,
                    width: 120,
                  }}
                >
                  <Text style={styles.payButtonText}>Other Payments</Text>
                </TouchableOpacity>
              </View>
            )}
            {pending && (
              <Text
                style={{
                  marginTop: 20,
                  alignSelf: 'center',
                  fontWeight: '600',
                  color: '#666',
                }}
              >
                Waiting for approval...
              </Text>
            )}
          </View>
        </View>
      );
    },
    [initiatePayment, payLoading, navigation],
  );

  const renderHistoryItem = useCallback(({ item }) => {
    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>{item.fee_category}</Text>
          <Text style={styles.historyAmount}>
            ₹{parseFloat(item.amount_paid).toLocaleString()}
          </Text>
        </View>

        <View style={styles.historyRow}>
          <Calendar size={14} color="#666" />
          <Text style={styles.historyText}>
            {dayjs(item.payment_date).format('DD MMM YYYY, hh:mm A')}
          </Text>
        </View>

        <View style={styles.historyRow}>
          <CreditCard size={14} color="#666" />
          <Text style={styles.historyText}>
            Mode: {item.payment_mode.toUpperCase()}
          </Text>
        </View>

        <View style={styles.historyRow}>
          <Tag size={14} color="#666" />
          <Text
            style={styles.historyText}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            ID: {item.transaction_id}
          </Text>
        </View>

        {item.notes && (
          <View style={styles.historyRow}>
            <FileText size={14} color="#666" />
            <Text style={styles.historyText}>{item.notes}</Text>
          </View>
        )}
      </View>
    );
  }, []);

  const renderInstallmentTabs = useCallback(() => {
    if (installmentBreakdown.length === 0) return null;

    return (
      <View style={styles.installmentContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.installmentScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.installmentTab,
              selectedInstallment === 'all' && styles.installmentTabActive,
            ]}
            onPress={() => setSelectedInstallment('all')}
          >
            <Text
              style={[
                styles.installmentTabText,
                selectedInstallment === 'all' &&
                  styles.installmentTabTextActive,
              ]}
            >
              View All
            </Text>
          </TouchableOpacity>

          {installmentBreakdown.map(item => (
            <TouchableOpacity
              key={item.installment_number}
              style={[
                styles.installmentTab,
                selectedInstallment === item.installment_number.toString() &&
                  styles.installmentTabActive,
              ]}
              onPress={() =>
                setSelectedInstallment(item.installment_number.toString())
              }
            >
              <Text
                style={[
                  styles.installmentTabText,
                  selectedInstallment === item.installment_number.toString() &&
                    styles.installmentTabTextActive,
                ]}
              >
                Inst {item.installment_number}
              </Text>
              <Text style={styles.installmentDueDate}>
                {dayjs(item.due_date).format('MMM DD')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }, [installmentBreakdown, selectedInstallment]);

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>Fee Status</Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading fee details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Fee Status</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={openHistoryModal}
        >
          <Clock size={20} color="#fff" />
          <Text style={styles.historyButtonText}>Fee History</Text>
        </TouchableOpacity>
      </View>

      {renderInstallmentTabs()}

      <FlatList
        data={
          currentFees.length > 0
            ? [{ summary: true }, ...currentFees]
            : [{ empty: true }]
        }
        keyExtractor={(item, index) => `fee-${item.id || index}`}
        renderItem={({ item }) => {
          if (item.summary) {
            return (
              <View
                style={[
                  styles.summaryCard,
                  allPaid ? styles.summaryCardPaid : styles.summaryCardPending,
                ]}
              >
                {allPaid ? (
                  <CheckCircle size={36} color="#4CAF50" />
                ) : (
                  <Clock size={36} color="#ff9800" />
                )}
                <View style={styles.summaryText}>
                  <Text style={styles.summaryTitle}>
                    {allPaid
                      ? 'All Fees Paid ✓'
                      : `${currentFees.length} Fee${
                          currentFees.length !== 1 ? 's' : ''
                        }`}
                  </Text>
                  <View style={styles.summaryAmounts}>
                    <Text style={styles.summaryAmount}>
                      Total: ₹{summary.total.toLocaleString()}
                    </Text>
                    <Text
                      style={[
                        styles.summaryAmount,
                        styles.summaryPendingAmount,
                      ]}
                    >
                      Balance: ₹{summary.pending.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }

          if (item.empty) {
            return (
              <View style={styles.emptyState}>
                <Wallet size={64} color="#86b952" />
                <Text style={styles.emptyTitle}>No fees found</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedInstallment === 'all'
                    ? 'All fees are up to date'
                    : 'No dues for this installment'}
                </Text>
              </View>
            );
          }

          return renderFeeItem({ item });
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          currentFees.length > 0 && (
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
              Fee Details
            </Text>
          )
        }
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.refreshBtn, { marginTop: 20 }]}
            onPress={fetchFees}
            activeOpacity={0.8}
          >
            <RefreshCw size={20} color="#86b952" />
            <Text style={styles.refreshText}>Refresh Fees</Text>
          </TouchableOpacity>
        }
      />

      <Modal
        visible={webviewVisible}
        animationType="slide"
        onRequestClose={() => setWebviewVisible(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}
        >
          <View
            style={{
              height: 56,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#111',
              }}
            >
              Payment
            </Text>

            <TouchableOpacity
              onPress={() => setWebviewVisible(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#f2f2f2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: '#333',
                  fontWeight: '600',
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <WebView
            source={{ uri: razorpayUrl }}
            onNavigationStateChange={onWebviewNavigationStateChange}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            style={{ flex: 1 }}
          />
        </SafeAreaView>
      </Modal>

      <Modal
        visible={historyModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <SafeAreaView style={styles.historyModalContainer}>
          <View style={styles.historyModalHeader}>
            <TouchableOpacity
              onPress={() => setHistoryModalVisible(false)}
              style={styles.closeButton}
            >
              <ArrowLeft size={24} color="#86b952" />
            </TouchableOpacity>
            <Text style={styles.historyModalTitle}>Transaction History</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.filterBar}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowYearPicker(true)}
            >
              <Calendar size={18} color="#666" />
              <Text style={styles.filterButtonText}>
                {selectedAcademicYear
                  ? `${dayjs(selectedAcademicYear.start_date).year()}-${dayjs(
                      selectedAcademicYear.end_date,
                    ).year()}`
                  : 'Select Year'}
              </Text>
              <ChevronDown size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowMonthPicker(true)}
            >
              <CalendarDays size={18} color="#666" />
              <Text style={styles.filterButtonText}>
                {selectedMonth
                  ? dayjs(selectedMonth).format('MMM YYYY')
                  : 'Select Month'}
              </Text>
              <ChevronDown size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {historyLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#86b952" />
              <Text style={styles.loadingText}>Loading history...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.historyScrollView}
              showsVerticalScrollIndicator={false}
            >
              {historyData?.summary && (
                <View style={styles.historySummaryCard}>
                  <Text style={styles.historySummaryLabel}>Total Paid</Text>
                  <Text style={styles.historySummaryAmount}>
                    ₹{historyData.summary.total_paid.toLocaleString()}
                  </Text>
                </View>
              )}

              {historyData?.results && historyData.results.length > 0 ? (
                <FlatList
                  data={historyData.results}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderHistoryItem}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Receipt size={64} color="#ccc" />
                  <Text style={styles.emptyTitle}>No History Found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>

        <Modal
          visible={showYearPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowYearPicker(false)}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowYearPicker(false)}
          >
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Academic Year</Text>
                <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={academicYears}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => {
                      setSelectedAcademicYear(item);
                      setShowYearPicker(false);
                      fetchHistory();
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedAcademicYear?.id === item.id &&
                          styles.pickerItemTextActive,
                      ]}
                    >
                      {dayjs(item.start_date).format('YYYY')} -{' '}
                      {dayjs(item.end_date).format('YYYY')}
                      {item.is_active && ' (Current)'}
                    </Text>
                    {selectedAcademicYear?.id === item.id && (
                      <Check size={20} color="#86b952" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={showMonthPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowMonthPicker(false)}
          >
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Month</Text>
                <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={getMonthList()}
                keyExtractor={item => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => {
                      setSelectedMonth(item.value);
                      setShowMonthPicker(false);
                      fetchHistory();
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedMonth === item.value &&
                          styles.pickerItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {selectedMonth === item.value && (
                      <Check size={20} color="#86b952" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </Modal>
    </View>
  );
};

export default FeeScreen;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
    backgroundColor: 'white',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#86b952',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
  },
  summaryCardPaid: { borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
  summaryCardPending: { borderLeftWidth: 5, borderLeftColor: '#ff9800' },
  summaryText: { flex: 1, marginLeft: 16 },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  summaryAmounts: { flexDirection: 'column', gap: 4 },
  summaryAmount: { fontSize: 16, color: '#555', fontWeight: '600' },
  summaryPendingAmount: { fontSize: 18, color: '#ff9800', fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  installmentContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  installmentScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  installmentTab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  installmentTabActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#86b952',
  },
  installmentTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  installmentTabTextActive: {
    color: '#86b952',
  },
  installmentDueDate: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  feeCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  feeCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  feeTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 2 },
  classroomText: { fontSize: 14, color: '#666', fontWeight: '500' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  paidBadge: { backgroundColor: '#d4edda' },
  unpaidBadge: { backgroundColor: '#fff3cd' },
  statusText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  paidText: { color: '#155724' },
  unpaidText: { color: '#856404' },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  balanceRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 12,
  },
  label: { fontSize: 15, color: '#666' },
  amount: { fontSize: 16, fontWeight: '700', color: '#333' },
  balanceAmount: { fontSize: 20, fontWeight: '800' },
  paidBalance: { color: '#4CAF50' },
  pendingBalance: { color: '#ff5722' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dueContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dueDate: { fontSize: 14, color: '#666', fontWeight: '600' },
  overdueDate: { color: '#dc3545', fontWeight: '700' },
  payButtonCustom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#86b952',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    elevation: 4,
    width: 150,
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#86b952',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 20,
    elevation: 4,
    width: 150,
  },
  payButtonOverdue: {
    backgroundColor: '#dc3545',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 16 },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#86b952',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  historyModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  historyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  historyModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  historyScrollView: {
    flex: 1,
    padding: 16,
  },
  historySummaryCard: {
    backgroundColor: '#86b952',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
  },
  historySummaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 8,
  },
  historySummaryAmount: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '800',
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 0,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#86b952',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  historyText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerItemTextActive: {
    color: '#86b952',
    fontWeight: '700',
  },
});
