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

import TopBar from '../../components/ParentTobBar';
import StaffHomeScreen from './StaffHomeScreen';
import LeaveManagement from './LeaveManagement';
import StaffPortfolioLayout from './StaffPortfolioLayout';
import StaffProfile from './StaffProfile';
import ChatUserList from '../ParentScreens/ChatUserList';
import { initFeatures, getFeatures } from '../../features.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function StaffLayout() {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const loadFeatures = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setFeatures(null);
        return;
      }

      await initFeatures(token);

      const f = getFeatures();
      setFeatures(f);
    } catch (err) {
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
          tabBarStyle: {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            // paddingHorizontal: 10,
            paddingTop: 10,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor: '#eee',
            position: 'absolute',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            // borderWidth: 2,
          },
          tabBarActiveTintColor: 'gold',
          tabBarInactiveTintColor: '#86b952',
          tabBarLabelPosition: 'beside-icon',
          tabBarIcon: ({ focused, color }) => {
            let IconComponent;
            switch (route.name) {
              case 'Home':
                IconComponent = Home;
                break;
              case 'LeaveManagement':
                IconComponent = Calendar;
                break;
              case 'Chat':
                IconComponent = MessageCircle;
                break;
              case 'Portfolio':
                IconComponent = Briefcase;
                break;
              case 'Profile':
                IconComponent = User;
                break;
            }
            return (
              <IconComponent
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.5}
              />
            );
          },
          tabBarItemStyle: {
            borderRadius: 16,
            // borderWidth: 2,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={StaffHomeScreen}
          options={{
            tabBarItemStyle: {
              // borderWidth: 2,
              display: 'flex',
              flexDirection: 'column',
            },
            tabBarLabel: ({ focused, color }) =>
              focused ? (
                <Text style={{ color, fontWeight: '600', marginLeft: 0 }}>
                  Home
                </Text>
              ) : null,
          }}
        />

        {features.staff_leave_management && (
          <Tab.Screen
            name="LeaveManagement"
            component={LeaveManagement}
            options={{
              tabBarStyle: {
                display: 'flex',
                flexDirection: 'row',
              },
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
            name="Portfolio"
            component={StaffPortfolioLayout}
            options={{
              tabBarStyle: {
                display: 'flex',
                flexDirection: 'row',
              },
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
          component={StaffProfile}
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
