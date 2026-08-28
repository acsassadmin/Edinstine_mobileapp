import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useUser } from "../context/UserContext";
import TopBar from "../components/ParentTobBar";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BASEURL } from "../appurls";

const SelectedChatUser = ({ route }) => {
  const { selectedMessageIds = [], selectedMessages = [] } = route.params || {};
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { appUser, token } = useUser();
  const navigation = useNavigation();
  useEffect(() => {
    fetchUsers();
  }, []);

  // console.log(selectedUsers)

  useEffect(() => {
    if (searchQuery === "") {
      setUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        (user) =>
          (user.name &&
            user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.helper &&
            user.helper.toLowerCase().includes(searchQuery.toLowerCase())),
      );
      setUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const fetchUsers = async (url = null) => {
    try {
      if (url) setLoadingMore(true);
      else setLoading(true);

      const apiUrl =
        url ||
        `${BASEURL}/api/common/chatuserlist/?page=1&user_id=${appUser.id}${appUser.role === "student" ? `&class_id=${appUser.class_id}` : ""}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const newUsers = response.data.results || [];
      setNextPageUrl(response.data.links?.next);

      if (url) {
        setAllUsers((prev) => [...prev, ...newUsers]);
      } else {
        setAllUsers(newUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreUsers = useCallback(() => {
    if (nextPageUrl && !loadingMore) {
      fetchUsers(nextPageUrl);
    }
  }, [nextPageUrl, loadingMore]);

  const toggleUserSelection = (user) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleForward = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("Please select at least one user");
      return;
    }

    try {
      // console.log("selected userssss", selectedUsers.map(user => user.id));
      const messagess = Object.values(selectedMessageIds);
      // console.log("selected messages", messagess);

      const messages = messagess.map((messageId) => ({
        file: messageId.file,
        text: messageId.text,
      }));

      const payload = {
        recipient_ids: selectedUsers.map((user) => user.id),
        messages: messages,
      };

      // console.log("Forwarding payload:", payload);

      const response = await axios.post(BASEURL + "/forward/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // console.log('Forward success:', response.data);

      Alert.alert("Success", "Messages forwarded successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      // console.error("Forward error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to forward messages",
      );
    }
  };

  const renderSelectedUserItem = ({ item }) => (
    <View style={styles.selectedUserPreview}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.selectedAvatar} />
      ) : (
        <View style={[styles.selectedAvatar, styles.avatarPlaceholder]} />
      )}
      <View style={styles.selectedUserInfo}>
        <Text style={styles.selectedUserName} numberOfLines={1}>
          {item.name || `User ${item.id}`}
        </Text>
        <Text style={styles.selectedUserRole}>{item.role}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeSelectedUser(item.id)}
        activeOpacity={0.7}
      >
        <Icon name="close" size={18} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        selectedUsers.some((u) => u.id === item.id) && styles.selectedUserItem,
      ]}
      onPress={() => toggleUserSelection(item)}
      activeOpacity={0.7}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]} />
      )}

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || `User ${item.id}`}</Text>
        <Text style={styles.role}>{item.role}</Text>
        {item.helper && (
          <Text style={styles.helper} numberOfLines={1}>
            {item.helper}
          </Text>
        )}
      </View>

      {selectedUsers.some((u) => u.id === item.id) && (
        <View style={styles.selectionIndicator} />
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#86b952" />
        <Text style={styles.loadingText}>Loading more users...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or role..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedTitle}>
              Selected Users ({selectedUsers.length})
            </Text>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={() => setSelectedUsers([])}
              activeOpacity={0.7}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedUsers}
            renderItem={renderSelectedUserItem}
            keyExtractor={(item) => `selected-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedListContent}
          />
        </View>
      )}

      {loading && users.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreUsers}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? "No users found" : "No users available"}
              </Text>
            </View>
          }
        />
      )}

      {selectedUsers.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleForward}
          activeOpacity={0.7}
        >
          <View style={styles.floatingButtonContent}>
            <Icon name="send" size={24} color="#fff" />
            {selectedUsers.length > 1 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{selectedUsers.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    height: 44,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  selectedUsersContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  clearAllText: {
    fontSize: 14,
    color: "#86b952",
    fontWeight: "500",
  },
  selectedListContent: {
    paddingRight: 16,
  },
  selectedUserPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 200,
  },
  selectedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedUserInfo: {
    flex: 1,
    flexShrink: 1,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  selectedUserRole: {
    fontSize: 12,
    color: "#666",
  },
  removeButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 1,
    borderRadius: 8,
  },
  selectedUserItem: {
    backgroundColor: "#E8F5E8",
    borderLeftWidth: 4,
    borderLeftColor: "#86b952",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#ddd",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: "#666",
    marginBottom: 1,
  },
  helper: {
    fontSize: 12,
    color: "#999",
  },
  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#86b952",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#86b952",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default SelectedChatUser;
