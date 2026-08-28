import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import TopBar from "../../components/ParentTobBar";
import BackButton from "../../components/BackButton";
import { Picker } from "@react-native-picker/picker";
import { useUser } from "../../context/UserContext";
import { BASEURL } from "../../appurls";

const AddInventoryEntry = () => {
  const { appUser, token } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionType, setActionType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BASEURL}/api/finance/inventory-categories/?branch_id=${appUser.branch_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await response.json();
      setCategories(json.results);
    } catch (error) {
      // console.log("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const selectedCategoryData = categories.find(
    (item) => item.id === selectedCategory,
  );

  const handleSubmit = async () => {
    try {
      const payload = {
        category: selectedCategory,
        quantity: Number(quantity),
        transaction_type: actionType,
        remarks: description,
      };

      const response = await fetch(`${BASEURL}/api/finance/inventory-items/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (response.ok) {
        // console.log("Inventory added:", json);
        alert("Inventory entry added successfully");

        // reset form
        setSelectedCategory(null);
        setQuantity("");
        setDescription("");
        setActionType("add");
      } else {
        // console.log("Error:", json);
        alert("Failed to add inventory");
      }
    } catch (error) {
      // console.log("Submit error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <TopBar />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>Add Inventory Entry</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#86b952" />
          ) : (
            <>
              {/* Category Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Inventory Category</Text>

                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Select Category</Text>

                  <View style={styles.dropdownBox}>
                    <Picker
                      selectedValue={selectedCategory}
                      onValueChange={(value) => setSelectedCategory(value)}
                      dropdownIconColor="#86b952"
                      style={styles.picker}
                      mode="dropdown"
                    >
                      <Picker.Item
                        label="Select Category"
                        value={null}
                        color="#999"
                      />

                      {categories.map((cat) => (
                        <Picker.Item
                          key={cat.id}
                          label={cat.name}
                          value={cat.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {selectedCategoryData && (
                  <View style={styles.availableBox}>
                    <Text style={styles.availableLabel}>
                      Available Quantity
                    </Text>
                    <Text style={styles.availableNumber}>
                      {selectedCategoryData.available_quantity}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stock Action Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stock Action</Text>

                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Action Type</Text>

                  <View style={styles.dropdownBox}>
                    <Picker
                      selectedValue={actionType}
                      onValueChange={(value) => setActionType(value)}
                      dropdownIconColor="#86b952"
                      style={styles.picker}
                    >
                      <Picker.Item label="Add Stock" value="add" />
                      <Picker.Item label="Use Stock" value="use" />
                    </Picker>
                  </View>
                </View>

                <Text style={styles.label}>Quantity</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />

                <Text style={styles.label}>Description</Text>

                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Enter description"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit Entry</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default AddInventoryEntry;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f6fa",
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#86b952",
  },

  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#444",
  },

  dropdownContainer: {
    marginTop: 10,
  },

  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#444",
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#fafafa",
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  picker: {
    height: 50,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
  },

  availableBox: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f0f7e8",
  },

  availableLabel: {
    fontSize: 13,
    color: "#666",
  },

  availableNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#86b952",
  },

  button: {
    marginTop: 10,
    backgroundColor: "#86b952",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
