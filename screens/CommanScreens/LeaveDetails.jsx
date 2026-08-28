import { View, StyleSheet, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import dayjs from 'dayjs';

const LeaveDetails = () => {
  const route = useRoute();

  const { item } = route.params || {};
  console.log('data', item);

  return (
    <View style={styles.container}>
      <TopBar />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 15,
          paddingVertical: 15,
          paddingHorizontal: 10,
          backgroundColor: '#ffffff',
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#86b952' }}>
          Leave Details
        </Text>
      </View>
      <View style={styles.cardContent}>
        {/* 1. Leave Type */}
        <View style={styles.verticalGroup}>
          <Text style={styles.label}>Leave Type</Text>
          <Text style={styles.value}>{item.leave_type_name || 'N/A'}</Text>
        </View>

        {/* 2. Reason */}
        <View style={styles.verticalGroup}>
          <Text style={styles.label}>Reason</Text>
          <Text style={styles.value} numberOfLines={3}>
            {item.reason || 'No reason provided'}
          </Text>
        </View>

        {/* 3. Start Date */}
        <View style={styles.verticalGroup}>
          <Text style={styles.label}>Start Date</Text>
          <Text style={styles.value}>
            {dayjs(item.start_date).format('DD MMM') || 'N/A'}
          </Text>
        </View>

        {/* 4. End Date */}
        <View style={styles.verticalGroup}>
          <Text style={styles.label}>End Date</Text>
          <Text style={styles.value}>
            {dayjs(item.end_date).format('DD MMM') || 'N/A'}
          </Text>
        </View>

        {/* 5. Applied Date */}
        <View style={styles.verticalGroup}>
          <Text style={styles.label}>Applied Date</Text>
          <Text style={styles.value}>
            {item.created_at
              ? (() => {
                  const [datePart, timePart] = item.created_at.split(' ');
                  const [day, month, year] = datePart.split('-');
                  const validIsoString = `${year}-${month}-${day}T${timePart}`;
                  return dayjs(validIsoString).format('DD MM YYYY HH:mm');
                })()
              : 'N/A'}
          </Text>
        </View>

        {/* 5. Applied Date */}
        <View style={styles.verticalGroup}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{item.status}</Text>
        </View>

        {/* 6. From / Applicant */}
        {item.student_name && (
          <View style={styles.verticalGroup}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{item.student_name || 'N/A'}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default LeaveDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  cardContent: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  verticalGroup: {
    marginBottom: 14, // Creates breathing room between different fields
    flexDirection: 'column', // Enforces label on top, value on bottom
    alignItems: 'flex-start',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d', // Subtle grey for the muted label
    textTransform: 'uppercase', // Optional: makes labels look uniform
    marginBottom: 3, // Tiny gap before the text value appears
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50', // Darker text color for maximum readability
  },
});
