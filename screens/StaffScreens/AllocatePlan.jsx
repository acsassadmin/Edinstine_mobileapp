import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  ChevronUp,
  ChevronDown,
  Check,
  Plus,
  ArrowRight,
} from 'lucide-react-native';
import TopBar from '../../components/ParentTobBar';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { BASEURL } from '../../appurls';
import Header from '../../components/Header';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getStatusColor = status => {
  switch (status) {
    case 'planned':
      return '#86b952';
    case 'pending_approval':
      return '#f39c12';
    case 'in_progress':
      return '#3498db';
    case 'completed':
      return '#2ecc71';
    default:
      return '#999';
  }
};

const StatusBadge = memo(({ status, isCompleted, small }) => (
  <View
    style={[
      small ? styles.statusBadgeSmall : styles.statusBadge,
      {
        backgroundColor: isCompleted ? '#2ecc71' : getStatusColor(status),
      },
    ]}
  >
    <Text style={small ? styles.statusTextSmall : styles.statusText}>
      {isCompleted ? 'completed' : status.replace('_', ' ')}
    </Text>
  </View>
));

const SubActivityItem = memo(
  ({
    sub,
    scheduledSubActivities,
    checkCompleted,
    toggleSubActivitySchedule,
    activityId,
  }) => {
    const subPlan = scheduledSubActivities[sub.id];
    const subStatus = subPlan?.status;

    const isSubScheduled = !!subPlan;
    const isSubPlanned = subStatus === 'planned';
    const isSubCompleted = checkCompleted(sub, subStatus);
    //
    const handlePress = useCallback(() => {
      if (isSubCompleted) {
        Alert.alert('Completed', 'This sub activity is already completed');
        return;
      }
      if (isSubPlanned) {
        Alert.alert(
          'Carry Forward',
          'This sub activity can be carried forward',
        );
        return;
      }
      if (isSubScheduled) {
        Alert.alert('Already Scheduled');
        return;
      }
      toggleSubActivitySchedule(sub, activityId);
    }, [
      isSubCompleted,
      isSubPlanned,
      isSubScheduled,
      toggleSubActivitySchedule,
      sub,
      activityId,
    ]);

    return (
      <View key={sub.id} style={styles.subActivityRow}>
        <View style={styles.subRow}>
          <TouchableOpacity
            style={[
              styles.scheduleBtn,
              (isSubCompleted || isSubScheduled || isSubPlanned) &&
                styles.scheduled,
            ]}
            onPress={handlePress}
          >
            {isSubCompleted || isSubScheduled ? (
              <Check size={14} color="#fff" />
            ) : (
              <Plus size={14} color="#86b952" />
            )}
            <Text
              style={[
                styles.scheduleText,
                (isSubCompleted || isSubScheduled || isSubPlanned) && {
                  color: '#fff',
                },
              ]}
            >
              {isSubCompleted
                ? 'Completed'
                : isSubPlanned
                ? 'Carry Forward'
                : isSubScheduled
                ? 'Scheduled'
                : 'Schedule'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.subTitle}>{sub.name}</Text>

          {(subPlan?.status || isSubCompleted) && (
            <StatusBadge
              status={subPlan?.status}
              isCompleted={isSubCompleted}
              small
            />
          )}
        </View>
      </View>
    );
  },
);

const ActivityItem = memo(
  ({
    activity,
    scheduledActivities,
    expandedActivities,
    checkCompleted,
    toggleActivityDropdown,
    toggleActivitySchedule,
    scheduledSubActivities,
    toggleSubActivitySchedule,
  }) => {
    const activityPlan = scheduledActivities[activity.id];
    const status = activityPlan?.status;
    const isScheduled = !!activityPlan;
    const isPlanned = status === 'planned';
    const isCompleted = checkCompleted(activity, status);

    const handlePress = useCallback(() => {
      if (isCompleted) {
        Alert.alert('Completed', 'This activity is already completed');
        return;
      }
      if (isPlanned) {
        Alert.alert('Carry Forward', 'This activity can be carried forward');
        return;
      }
      if (isScheduled) {
        Alert.alert('Already Scheduled');
        return;
      }
      toggleActivitySchedule(activity);
    }, [isCompleted, isPlanned, isScheduled, toggleActivitySchedule, activity]);

    return (
      <View key={activity.id} style={styles.activityRow}>
        <View style={styles.activityHeader}>
          <TouchableOpacity
            style={[
              styles.scheduleBtn,
              (isCompleted || isScheduled || isPlanned) && styles.scheduled,
            ]}
            onPress={handlePress}
          >
            {isCompleted || isScheduled || isPlanned ? (
              <Check size={16} color="#fff" />
            ) : (
              <Plus size={16} color="#86b952" />
            )}
            <Text
              style={[
                styles.scheduleText,
                (isCompleted || isScheduled || isPlanned) && {
                  color: '#fff',
                },
              ]}
            >
              {isCompleted
                ? 'Completed'
                : isPlanned
                ? 'Carry Forward'
                : isScheduled
                ? 'Scheduled'
                : 'Schedule'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, marginLeft: 12 }}
            onPress={() => toggleActivityDropdown(activity.id)}
          >
            <Text style={styles.activityTitle}>{activity.name}</Text>
          </TouchableOpacity>

          {(isCompleted || activityPlan?.status) && (
            <StatusBadge
              status={activityPlan?.status}
              isCompleted={isCompleted}
            />
          )}

          {activity.is_have_sub_activity && (
            <TouchableOpacity
              onPress={() => toggleActivityDropdown(activity.id)}
            >
              {expandedActivities[activity.id] ? (
                <ChevronUp size={24} color="#666" />
              ) : (
                <ChevronDown size={24} color="#666" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {expandedActivities[activity.id] &&
          activity.sub_activities?.map(sub => (
            <SubActivityItem
              key={sub.id}
              sub={sub}
              scheduledSubActivities={scheduledSubActivities}
              checkCompleted={checkCompleted}
              toggleSubActivitySchedule={toggleSubActivitySchedule}
              activityId={activity.id}
            />
          ))}
      </View>
    );
  },
);

const CategorySection = memo(
  ({ category, expandedCategories, toggleCategory, ...rest }) => (
    <View key={category.id} style={styles.categorySection}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => toggleCategory(category.id)}
      >
        <Text style={styles.categoryTitle}>{category.name}</Text>
        {expandedCategories[category.id] ? (
          <ChevronUp size={28} color="#86b952" />
        ) : (
          <ChevronDown size={28} color="#86b952" />
        )}
      </TouchableOpacity>

      {expandedCategories[category.id] && (
        <View style={styles.categoryContent}>
          {category.activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} {...rest} />
          ))}
        </View>
      )}
    </View>
  ),
);

const AllocatePlan = ({ route }) => {
  const { studentId, class_id } = route.params;
  const navigation = useNavigation();
  const { token, appUser } = useUser();

  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = String(currentDate.getFullYear());

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedActivities, setExpandedActivities] = useState({});

  const [scheduledActivities, setScheduledActivities] = useState({});
  const [scheduledSubActivities, setScheduledSubActivities] = useState({});

  const checkCompleted = useCallback((item, status) => {
    return item?.is_globally_completed === true || status === 'completed';
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch(
      `${BASEURL}/api/curriculum/activity-category/?school_id=${appUser?.school_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return await res.json();
  }, [appUser?.school_id, token]);

  const fetchStudentPlans = useCallback(async () => {
    const res = await fetch(
      `${BASEURL}/api/curriculum/work-plan/student/${studentId}/?month=04&year=${selectedYear}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return await res.json();
  }, [studentId, selectedYear, token]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryData, planData] = await Promise.all([
        fetchCategories(),
        fetchStudentPlans(),
      ]);

      const scheduledAct = {};
      const scheduledSub = {};

      planData.forEach(category => {
        category.activities.forEach(activity => {
          if (
            activity.plan_id ||
            activity.is_globally_completed ||
            activity.status === 'pending_approval'
          ) {
            scheduledAct[activity.id] = {
              plan_id: activity.plan_id,
              status: activity.status,
              is_carried_forward: activity.is_carried_forward,
            };
          }

          activity.sub_activities?.forEach(sub => {
            if (sub.plan_id) {
              scheduledSub[sub.id] = {
                plan_id: sub.plan_id,
                status: sub.status,
                is_carried_forward: sub.is_carried_forward,
              };
            }
          });
        });
      });

      setScheduledActivities(scheduledAct);
      setScheduledSubActivities(scheduledSub);
      setCategories(categoryData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchStudentPlans]);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, fetchData]);

  const handleFABPress = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASEURL}/api/curriculum/work-plan/student/${studentId}/carry-forward/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            year: selectedYear,
            month: selectedMonth,
          }),
        },
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Activities carried forward successfully!');
        fetchData();
      } else if (response.status === 200) {
        Alert.alert('Success', 'Activities already carried forward!');
        fetchData();
      } else {
        const contentType = response.headers.get('content-type');
        let errorMsg = 'Failed to carry forward';

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMsg = data.detail || errorMsg;
        } else {
          await response.text();
        }

        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  }, [studentId, token, selectedYear, selectedMonth, fetchData]);

  const toggleCategory = useCallback(id => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleActivityDropdown = useCallback(id => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedActivities(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const postWorkPlan = useCallback(
    async (activityId, subActivityId = null) => {
      try {
        const payload = {
          year: Number(selectedYear),
          month: Number(selectedMonth),
          activity: activityId,
          sub_activity: subActivityId,
          environment: class_id,
        };

        const response = await fetch(
          `${BASEURL}/api/curriculum/work-plan/student/${studentId}/`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        return response.status;
      } catch (error) {
        return null;
      }
    },
    [selectedYear, selectedMonth, class_id, studentId, token],
  );

  const toggleActivitySchedule = useCallback(
    async activity => {
      const activityPlan = scheduledActivities[activity.id];
      const status = activityPlan?.status;

      const isScheduled = !!activityPlan;
      const isPlanned = status === 'planned';

      if (isScheduled) {
        Alert.alert('Already Scheduled');
        return;
      }

      if (isPlanned) {
        Alert.alert('Carry Forward', 'This activity can be carried forward');
        return;
      }

      const statusCode = await postWorkPlan(activity.id);

      if (statusCode === 201) {
        setScheduledActivities(prev => ({
          ...prev,
          [activity.id]: { status: 'pending_approval' },
        }));
        Alert.alert('Success', 'Activity Scheduled');
      } else {
        Alert.alert('Error', 'Failed to schedule');
      }
    },
    [scheduledActivities, postWorkPlan],
  );

  const toggleSubActivitySchedule = useCallback(
    async (sub, activityId) => {
      const subPlan = scheduledSubActivities[sub.id];
      const subStatus = subPlan?.status;

      const isSubScheduled = !!subPlan;
      const isSubPlanned = subStatus === 'planned';

      if (isSubScheduled) {
        Alert.alert('Already Scheduled');
        return;
      }

      if (isSubPlanned) {
        Alert.alert(
          'Carry Forward',
          'This sub activity can be carried forward',
        );
        return;
      }

      const statusCode = await postWorkPlan(activityId, sub.id);

      if (statusCode === 201) {
        setScheduledSubActivities(prev => ({
          ...prev,
          [sub.id]: { status: 'pending_approval' },
        }));
        Alert.alert('Success', 'Sub Activity Scheduled');
      } else {
        Alert.alert('Error', 'Failed to schedule');
      }
    },
    [scheduledSubActivities, postWorkPlan],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#86b952" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />
      <View style={{ marginTop: 10 }}>
        <Header title="Back" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {categories.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            expandedActivities={expandedActivities}
            toggleActivityDropdown={toggleActivityDropdown}
            scheduledActivities={scheduledActivities}
            scheduledSubActivities={scheduledSubActivities}
            checkCompleted={checkCompleted}
            toggleActivitySchedule={toggleActivitySchedule}
            toggleSubActivitySchedule={toggleSubActivitySchedule}
          />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={handleFABPress}>
        <Text style={styles.fabText}>Carry Forward</Text>
        <ArrowRight size={20} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AllocatePlan;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FB' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  categorySection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoryTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  categoryContent: { paddingLeft: 10, marginTop: 8 },
  activityRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityHeader: { flexDirection: 'row', alignItems: 'center' },
  activityTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  subActivityRow: { marginTop: 8, paddingLeft: 20 },
  subRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  subTitle: { marginLeft: 10, fontWeight: '500', fontSize: 14, color: '#555' },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#86b952',
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  scheduled: {
    backgroundColor: '#86b952',
    borderColor: '#86b952',
  },
  scheduleText: {
    fontWeight: '600',
    color: '#86b952',
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  statusBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusTextSmall: { color: '#fff', fontSize: 9, fontWeight: '600' },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 1,
    bottom: 10,
    backgroundColor: '#86b952',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
  },
  fabText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
});
