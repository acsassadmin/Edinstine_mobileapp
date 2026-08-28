import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import TopBar from "../../components/ParentTobBar";
import Header from "../../components/Header";
import { useUser } from "../../context/UserContext";
import { BASEURL } from "../../appurls";

const ViewInventoryHistory = () => {
  const { token } = useUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInventoryHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASEURL}/api/finance/inventory-items/?page=1&branch_id=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      // console.log("log data",data)

      setHistory(data.results);
    } catch (error) {
      // console.log("Error fetching inventory history:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInventoryHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInventoryHistory();
  }, []);

  const renderItem = ({ item }) => {
    const typeColors = {
      add: {
        background: "#e6f4ea",
        text: "#28a745",
        label: "Stock Added",
        sign: "+",
      },
      use: {
        background: "#fde2e1",
        text: "#e74c3c",
        label: "Stock Used",
        sign: "-",
      },
    };

    const colors = typeColors[item.transaction_type] || typeColors["add"];

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.category}>{item.category_name}</Text>
          <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {colors.label}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text
            style={[styles.value, { color: colors.text, fontWeight: "700" }]}
          >
            {`${colors.sign} ${item.quantity}`}
          </Text>
        </View>

        {/* Created By row: shows user name and role */}
        <View style={styles.row}>
          <Text style={styles.label}>Created By</Text>
          <Text style={styles.value}>
            {item.created_by_name || "System"} ({item.created_role || "user"})
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Description</Text>
          <Text
            style={[styles.value, { flex: 1 }]} // make it take available space
            numberOfLines={1} // limit to 1 line
            ellipsizeMode="tail" // add "..." if text overflows
          >
            {item.remarks || "-"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Updated</Text>
          <Text style={styles.timestamp}>
            {new Date(item.last_updated).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <TopBar />
      <View style={styles.container}>
        <Header title="Inventory History" />
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#86b952"
            style={{ marginTop: 20 }}
          />
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No inventory history found.</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingBottom: 30,
              paddingTop: 10,
              paddingHorizontal: 10,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </>
  );
};

export default ViewInventoryHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: "#f6f7fb",
  },

  itemContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  category: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  badgeText: {
    fontWeight: "600",
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: {
    fontWeight: "600",
    color: "#555",
  },

  value: {
    fontWeight: "500",
    color: "#333",
  },

  timestamp: {
    fontWeight: "400",
    color: "#888",
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },

  emptyText: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
});
