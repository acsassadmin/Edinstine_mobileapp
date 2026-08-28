import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import { BASEURL } from '../../appurls';
import { useUser } from '../../context/UserContext';

const AddInventoryCategory = () => {
  const { token, appUser } = useUser();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalQty, setTotalQty] = useState('0');
  const [usedQty, setUsedQty] = useState('0');

  const availableQty =
    totalQty && usedQty ? Number(totalQty) - Number(usedQty) : 0;

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${BASEURL}/api/finance/inventory-categories/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            total_quantity: totalQty,
            used_quantity: usedQty,
            branch_id: appUser.branch_id,
          }),
        },
      );
      const data = await response.json();
      setName('');
      setDescription('');
      setTotalQty('');
      setUsedQty('');
      Alert.alert('Category added sucesfully');
    } catch (error) {
      Alert.alert('Add category error');
      // console.log("Add category error", error);
    }
  };

  return (
    <>
      <TopBar />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>Add Inventory Category</Text>
          </View>

          {/* Category Info Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Category Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              value={name}
              onChangeText={setName}
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

          {/* Stock Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Information</Text>
            <Text style={styles.helpText}>
              Set initial stock levels for this item.
            </Text>

            <Text style={styles.label}>Total Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter total quantity"
              keyboardType="numeric"
              value={totalQty}
              onChangeText={setTotalQty}
            />

            <Text style={styles.label}>Used Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter used quantity"
              keyboardType="numeric"
              value={usedQty}
              onChangeText={setUsedQty}
            />

            <View style={styles.availableBox}>
              <Text style={styles.availableLabel}>Available Quantity</Text>
              <Text style={styles.availableNumber}>{availableQty}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Category</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default AddInventoryCategory;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f6fa',
    flexGrow: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#86b952',
  },

  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    color: '#444',
  },

  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  helpText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    marginBottom: 8,
  },

  availableBox: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f7e8',
  },

  availableLabel: {
    fontSize: 13,
    color: '#666',
  },

  availableNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#86b952',
  },

  button: {
    marginTop: 10,
    backgroundColor: '#86b952',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
