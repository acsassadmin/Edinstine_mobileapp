import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';

const RenderStatus = memo(({ status }) => {
  if (status === 'approved')
    return (
      <View style={[styles.statusContainer, styles.approved]}>
        <Clock size={15} color="white" />
        <Text style={styles.status}>Approved</Text>
      </View>
    );
  else if (status === 'pending') {
    return (
      <View style={[styles.statusContainer, styles.pending]}>
        <Clock size={15} color="white" />
        <Text style={styles.status}>Pending</Text>
      </View>
    );
  } else if (status === 'rejected') {
    return (
      <View style={[styles.statusContainer, styles.rejected]}>
        <Clock size={15} color="white" />
        <Text style={styles.status}>Rejected</Text>
      </View>
    );
  }
  return null;
});

const LeaveHistoryCard = ({
  leaveType = 'Family Gathering',
  reason = 'Our Family is leaving',
  start_date = '2026-01-21',
  end_date = '2026-01-27',
  status = 'pending',
  applyed_date = '19-01-2026',
}) => {
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    navigation.navigate('LeaveDetailsScreen', {
      item: {
        leave_type_name: leaveType,
        reason: reason,
        start_date: start_date,
        end_date: end_date,
        status: status,
        created_at: applyed_date,
      },
    });
  }, [
    navigation,
    leaveType,
    reason,
    start_date,
    end_date,
    status,
    applyed_date,
  ]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardContainer}
      onPress={handlePress}
    >
      <Text style={styles.leaveType}>{leaveType}</Text>
      <Text style={styles.reason} numberOfLines={2}>
        {reason}
      </Text>

      <RenderStatus status={status} />
      <View style={styles.cardBottom}>
        <Text style={styles.date}>
          {dayjs(start_date).format('DD MMM')} -{' '}
          {dayjs(end_date).format('DD MMM')}
        </Text>
      </View>
      <Text style={styles.applyed_date}> Applied Date:{applyed_date}</Text>
    </TouchableOpacity>
  );
};

export default memo(LeaveHistoryCard);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
    position: 'relative',
  },
  leaveType: {
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 5,
  },
  statusContainer: {
    position: 'absolute',
    right: '0',
    padding: 3,
    paddingHorizontal: 15,
    marginTop: 15,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  approved: {
    backgroundColor: 'green',
  },
  pending: {
    backgroundColor: 'orange',
  },
  rejected: {
    backgroundColor: 'red',
  },
  status: {
    color: 'white',
    fontWeight: 600,
  },
  cardBottom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reason: {
    height: 20,
    overflow: 'hidden',
    marginBottom: 10,
    color: 'gray',
    fontWeight: '400',
    width: '70%',
  },
  date: {
    backgroundColor: 'lightgreen',
    padding: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    fontWeight: 300,
    color: 'darkgreen',
    fontSize: 13,
  },
  applyed_date: {
    fontSize: 12,
    marginTop: 12,
    color: 'black',
    fontWeight: '700',
  },
});
