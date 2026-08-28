import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import TopBar from "../../components/ParentTobBar";
import Header from "../../components/Header";
import { useUser } from "../../context/UserContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { BASEURL } from "../../appurls";
import { useNavigation } from "@react-navigation/native";

const FinanceManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const { appUser, token } = useUser();
  const navigation = useNavigation();
  const fetchTransactions = async (url = null, append = false) => {
    try {
      const requestUrl =
        url ||
        `${BASEURL}/api/finance/categories/add-transaction/?branch_id=${appUser?.branch_id}&user_id=${appUser?.id}`;

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (append) {
        setTransactions((prev) => [...prev, ...(data.results || [])]);
      } else {
        setTransactions(data.results || []);
      }

      setNextUrl(data.links?.next || null);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNextUrl(null);
    fetchTransactions(null, false);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !nextUrl) return;

    setLoadingMore(true);
    fetchTransactions(nextUrl, true);
  }, [loadingMore, nextUrl]);

  const handleInvoicePress = async (invoiceUrl) => {
    const supported = await Linking.canOpenURL(invoiceUrl);
    if (supported) {
      await Linking.openURL(invoiceUrl);
    }
  };

  const handleAddTransaction = () => {
    // console.log('Add new transaction');
    navigation.navigate("AddFinanceTransaction");
  };

  const getTypeColor = (type) => {
    return type === "INCOME" ? "#86b952" : "#e74c3c";
  };

  const getTypeBgColor = (type) => {
    return type === "INCOME"
      ? "rgba(134, 185, 82, 0.1)"
      : "rgba(231, 76, 60, 0.1)";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderTransaction = ({ item }) => (
    <View
      style={[
        styles.transactionCard,
        { borderLeftColor: getTypeColor(item.transaction_type) },
      ]}
    >
      <View style={styles.cardLeft}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor:
                item.transaction_type === "EXPENSE" ? "#fee2e2" : "#e6f4ea",
            },
          ]}
        >
          {item.transaction_type === "EXPENSE" ? (
            <MaterialIcons name="bar-chart" size={24} color="#e74c3c" />
          ) : (
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color="#86b952"
            />
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.description}</Text>
          <Text
            style={[
              styles.transactionType,
              {
                color: getTypeColor(item.transaction_type),
                backgroundColor: getTypeBgColor(item.transaction_type),
              },
            ]}
          >
            {item.transaction_type === "EXPENSE" ? "Expense" : "Income"}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          <Text style={styles.cardUser}>
            {item.created_name || "System"} •{" "}
            {item.category_created_by_role || "user"}
          </Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <Text
          style={[
            styles.amount,
            { color: getTypeColor(item.transaction_type) },
          ]}
        >
          {item.transaction_type === "INCOME" ? "+" : "-"}Rs
          {parseFloat(item.amount).toLocaleString()}
        </Text>

        {item.invoice && (
          <TouchableOpacity
            style={styles.downloadIcon}
            onPress={() => handleInvoicePress(item.invoice)}
          >
            <Feather name="download" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#86b952" />
        <Text style={styles.footerText}>Loading more transactions...</Text>
      </View>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <>
        <TopBar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#86b952" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      {transactions.length === 0 && !loading ? (
        <>
          <TopBar />
          <View style={styles.mainContainer}>
            <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
              <Header title="Finance Management" />
            </View>

            {/* No Data Found Screen */}
            <View style={styles.noDataContainer}>
              <MaterialIcons
                name="account-balance-wallet"
                size={80}
                color="#95a5a6"
              />

              <Text style={styles.noDataTitle}>No Transactions Yet</Text>
              <Text style={styles.noDataSubtitle}>
                Your financial journey starts here. Add your first transaction
                to get started.
              </Text>

              {/* FAB stays visible for empty state */}
              <TouchableOpacity
                style={styles.fab}
                onPress={handleAddTransaction}
              >
                <Feather name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <>
          <TopBar />
          <View style={styles.mainContainer}>
            <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
              <Header title={`Finance Management`} />
            </View>

            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTransaction}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={null} // Disable default empty component
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={styles.fab} onPress={handleAddTransaction}>
              <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 120, // Extra space for FAB
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 4,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  cardUser: {
    fontSize: 12,
    color: "#95a5a6",
    fontWeight: "500",
    marginBottom: 4,
  },
  cardRight: {
    alignItems: "flex-end",
    paddingLeft: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  downloadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7f8c8d",
  },
  // Floating Action Button Styles
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#86b952",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  noDataSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 40,
  },
});

export default FinanceManagement;
