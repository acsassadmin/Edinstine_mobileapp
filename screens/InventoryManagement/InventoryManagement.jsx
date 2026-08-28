import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import TopBar from '../../components/ParentTobBar';
import { BASEURL } from '../../appurls';
import { useUser } from '../../context/UserContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Package, Tag, History, X, Plus } from 'lucide-react-native';
import BackButton from '../../components/BackButton';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const { token, appUser } = useUser();
  const navigation = useNavigation();

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BASEURL}/api/finance/inventory-categories/?branch_id=${appUser?.branch_id}&page=1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      setInventory(data.results);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [appUser?.branch_id, token]);

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [fetchInventory]),
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Package size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.category}>{item.name}</Text>
            <Text style={styles.branch}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.statNumber}>{item.available_quantity}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.statNumber}>{item.used_quantity}</Text>
            <Text style={styles.statLabel}>Used</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.statNumber}>{item.total_quantity}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>
    ),
    [],
  );

  const toggleFab = useCallback(() => {
    setFabOpen(prev => !prev);
  }, []);

  return (
    <>
      <TopBar />

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <BackButton />
          <Text style={styles.title}>Inventory Items</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#86b952" />
        ) : (
          <FlatList
            data={inventory}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 5 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {fabOpen && (
          <View style={styles.fabOptions}>
            <TouchableOpacity
              style={styles.fabSmall}
              onPress={() => navigation.navigate('AddInventoryCategory')}
            >
              <Tag size={20} color="#86b952" />
              <Text style={styles.fabText}>Add Category</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fabSmall}
              onPress={() => navigation.navigate('AddInventoryEntry')}
            >
              <Package size={20} color="#86b952" />
              <Text style={styles.fabText}>Add Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fabSmall}
              onPress={() => navigation.navigate('InventoryHistory')}
            >
              <History size={20} color="#86b952" />
              <Text style={styles.fabText}>View History</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.fab} onPress={toggleFab}>
          {fabOpen ? (
            <X size={30} color="#fff" />
          ) : (
            <Plus size={30} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

export default InventoryManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#86b952',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  branch: {
    fontSize: 13,
    color: '#777',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 11,
    color: '#777',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  fabOptions: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'flex-end',
  },
  fabSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 25,
    marginBottom: 10,
    elevation: 6,
  },
  fabText: {
    color: '#86b952',
    fontWeight: '600',
    marginLeft: 6,
  },
});
