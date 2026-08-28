import { View, Text, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Calendar,
  MessageCircle,
  Briefcase,
  User,
} from 'lucide-react-native';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TopBar from '../../components/ParentTobBar';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import ChatUserList from './ChatUserList';
import StudentLeaveHistory from './StudentLeaveHistory';
import StudentPortfolioLayout from './StudentPortfolioLayout';
import { initFeatures, getFeatures } from '../../features.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function ParentLayout() {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const loadFeatures = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.warn('No user token found');
        setFeatures(null);
        return;
      }

      await initFeatures(token);
      const f = getFeatures();
      setFeatures(f);
    } catch (err) {
      console.error('Failed to load features:', err);
      setFeatures(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#86b952" />
      </View>
    );
  }

  if (!features) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Failed to load app features.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <TopBar />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: 'gold',
          tabBarInactiveTintColor: '#86b952',
          tabBarLabelPosition: 'beside-icon',
          tabBarStyle: {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            // paddingHorizontal: 10,
            paddingTop: 10,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor: '#eee',
          },
          tabBarIcon: ({ focused, color }) => {
            let IconComponent;
            const iconSize = 20;
            switch (route.name) {
              case 'Home':
                IconComponent = Home;
                break;
              case 'StudentLeaveHistory':
                IconComponent = Calendar;
                break;
              case 'Chat':
                IconComponent = MessageCircle;
                break;
              case 'StudentPortfolio':
                IconComponent = Briefcase;
                break;
              case 'Profile':
                IconComponent = User;
                break;
            }
            return IconComponent ? (
              <IconComponent size={iconSize} color={color} />
            ) : null;
          },
          tabBarItemStyle: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            // width: 'auto',
            // marginHorizontal: 4,
            borderRadius: 16,
            backgroundColor: 'transparent',
            // borderWidth: 1,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: ({ focused, color }) =>
              focused ? (
                <Text style={{ color, fontWeight: '600', marginLeft: 0 }}>
                  Home
                </Text>
              ) : null,
          }}
        />

        {features.student_leave_management && (
          <Tab.Screen
            name="StudentLeaveHistory"
            component={StudentLeaveHistory}
            options={{
              tabBarLabel: ({ focused, color }) =>
                focused ? (
                  <Text style={{ color, fontWeight: '600', marginLeft: 0 }}>
                    Leaves
                  </Text>
                ) : null,
            }}
          />
        )}

        {(features.chat.inbox ||
          features.chat.group ||
          features.chat.broadcast) && (
          <Tab.Screen
            name="Chat"
            component={ChatUserList}
            options={{
              tabBarLabel: ({ focused, color }) =>
                focused ? (
                  <Text style={{ color, fontWeight: '600', marginLeft: 0 }}>
                    Chat
                  </Text>
                ) : null,
            }}
          />
        )}

        {features.portfolio && (
          <Tab.Screen
            name="StudentPortfolio"
            component={StudentPortfolioLayout}
            options={{
              tabBarLabel: ({ focused, color }) =>
                focused ? (
                  <Text style={{ color, fontWeight: '600', marginLeft: 0 }}>
                    Portfolio
                  </Text>
                ) : null,
            }}
          />
        )}

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: ({ focused, color }) =>
              focused ? (
                <Text style={{ color, fontWeight: '600', marginLeft: 0 }}>
                  Profile
                </Text>
              ) : null,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
