import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Map, User } from 'lucide-react-native';
import TopBar from '../../components/ParentTobBar';
import DriverHomeScreen from './DriverHomeScreen';
import TripDetailsScreen from './TripDetailsScreen';
import DriverProfileScreen from './DriverProfileScreen';
import { LocationTrackingProvider } from '../../context/LocationTrackingContext';

const Tab = createBottomTabNavigator();

export default function DriverLayout() {
  return (
    <LocationTrackingProvider busId="1">
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <TopBar />

        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: 'gold',
            tabBarInactiveTintColor: '#86b952',
            tabBarLabelPosition: 'beside-icon',
            tabBarStyle: {
              height: 80,
              paddingHorizontal: 10,
              paddingBottom: 20,
              paddingTop: 10,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderColor: '#eee',
            },
            tabBarIcon: ({ focused, color, size }) => {
              let IconComponent;
              const iconSize = 22;

              switch (route.name) {
                case 'Home':
                  IconComponent = Home;
                  break;
                case 'Trips':
                  IconComponent = Map;
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
              width: 'auto',
              marginHorizontal: 4,
              borderRadius: 16,
              backgroundColor: 'transparent',
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={DriverHomeScreen}
            options={{
              tabBarLabel: ({ focused, color }) =>
                focused ? (
                  <Text style={{ color, fontWeight: '600', marginLeft: 2 }}>
                    Home
                  </Text>
                ) : null,
            }}
          />

          <Tab.Screen
            name="Trips"
            component={TripDetailsScreen}
            options={{
              tabBarLabel: ({ focused, color }) =>
                focused ? (
                  <Text style={{ color, fontWeight: '600', marginLeft: 2 }}>
                    Trips
                  </Text>
                ) : null,
            }}
          />

          <Tab.Screen
            name="Profile"
            component={DriverProfileScreen}
            options={{
              tabBarLabel: ({ focused, color }) =>
                focused ? (
                  <Text style={{ color, fontWeight: '600', marginLeft: 2 }}>
                    Profile
                  </Text>
                ) : null,
            }}
          />
        </Tab.Navigator>
      </View>
    </LocationTrackingProvider>
  );
}
