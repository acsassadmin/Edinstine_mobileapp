import * as React from 'react';
import { useEffect, useState, useCallback, memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Text } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import ParentLayout from './screens/ParentScreens/ParentLayout';
import StaffLayout from './screens/StaffScreens/StaffLayout';
import { UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import { StorageContextProvider } from './context/StorageContext';
import ChatScreen from './screens/ChatScreen';
import MedicalInstruction from './screens/ParentScreens/MedicalInstruction';
import CheckInCheckOut from './screens/StaffScreens/CheckInCheckOut';
import UploadPortfolio from './screens/UploadPortfolio';
import ViewMedicalInstruction from './screens/StaffScreens/ViewMedicalInstruction';
import Homework from './screens/StaffScreens/Homework';
import ViewHomework from './screens/ParentScreens/ViewHomework';
import StudentCheckinCheckout from './screens/ParentScreens/StudentCheckinCheckout';
import FeeScreen from './screens/ParentScreens/FeeScreen';
import Notification from './screens/Notification';
import GroupChatScreen from './screens/GroupChatScreen';
import BroadcastScreen from './screens/BroadcastScreen';
import ProfileDetails from './screens/ParentScreens/ProfileDetails';
import StaffProfileDetails from './screens/StaffScreens/StaffProfileDetails';
import Achievement from './screens/ParentScreens/Achievement';
import ReportCard from './screens/ParentScreens/ReportCard';
import TrackBus from './screens/ParentScreens/TrackBus';
import StaffUpcomingBirthday from './screens/StaffScreens/StaffUpcomingBirthday';
import StudentUpcomingBirthday from './screens/ParentScreens/StudentUpcomingBirthday';
import ViewHealthUpdate from './screens/ParentScreens/ViewHealthUpdate';
import UpdateHealth from './screens/StaffScreens/UpdateHealth';
import UpdateReportCard from './screens/StaffScreens/UpdateReportCard';
import SubjectRemards from './screens/StaffScreens/SubjectRemards';
import DriverLayout from './screens/Driver/DriverLayout';
import DriverLoactionTracker from './screens/Driver/DriverLoactionTacker';
import DriverProfileScreen from './screens/Driver/DriverProfileScreen';
import LocationTrackingProvider from './context/LocationTrackingContext';
import DriverProfileDetail from './screens/Driver/DriverProfileDetail';
import SelectedChatUser from './screens/SelectedChatUser';
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig';
import { Platform } from 'react-native';
import InventoryManagement from './screens/InventoryManagement/InventoryManagement';
import AddInventoryCategory from './screens/InventoryManagement/AddInventoryCategory';
import AddInventoryEntry from './screens/InventoryManagement/AddInventoryEntry';
import ViewInventoryHistory from './screens/InventoryManagement/ViewInventoryHistory';
import FinanceManagement from './screens/FinanceManagement/AddFinanceTransaction';
import AddFinanceTransaction from './screens/FinanceManagement/AddFinanceTransaction';
import MonthlyWorkPlan from './screens/StaffScreens/MonthlyWorkPlan';
import AllocatePlan from './screens/StaffScreens/AllocatePlan';
import StaffBasedStudentsList from './screens/StaffScreens/StudentList';
import DailyLogsList from './screens/ParentScreens/DailyLogsList';
import LibraryBooks from './screens/ParentScreens/LibraryBooks';
import BookHistory from './screens/ParentScreens/BookHistory';
import OtherPayments from './screens/ParentScreens/OtherPayments';
import RecordOfWork from './screens/StaffScreens/RecordOfWork';
import RecordOfWorkForm from './screens/StaffScreens/RecordOfWorkForm';
import ResetPassword from './screens/ResetPassword';
import SplashScreen from './screens/SplashScreen';
import GetStartMenu from './screens/GetStartMenu';
import NoticeBoardScreen from './screens/NoticeBoardScreen';
import EventBoardScreen from './screens/EventBoardScreen';
import MedicalHealthScreen from './components/MedicalHealthScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import DisplayEvents from './components/DisplayEvents';
import LeaveDetails from './screens/CommanScreens/LeaveDetails';
import DisplayNotice from './components/DisplayNotice';
import RaiseConcern from './screens/ParentScreens/RaiseConcern';
import AttendanceList from './screens/CommanScreens/Attendance';
import SchoolPolicies from './screens/CommanScreens/SchoolPolicies';
import ConcernScreen from './screens/CommanScreens/ConcernScreen';
import SelectRoleScreen from './screens/SelectRoleScreen';
import StudentLogsList from './screens/StaffScreens/StudentLogsList';

const Stack = createNativeStackNavigator();
initializeApp(
  Platform.OS === 'ios' ? firebaseConfig.ios : firebaseConfig.android,
);

const AppNavigator = memo(({ route }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="GetStart"
      component={GetStartMenu}
      initialParams={{ nextRoute: route }}
    />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Parent" component={ParentLayout} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
    <Stack.Screen name="MedicalInstruction" component={MedicalInstruction} />
    <Stack.Screen name="CheckInCheckOut" component={CheckInCheckOut} />
    <Stack.Screen name="FeeScreen" component={FeeScreen} />
    <Stack.Screen name="Notification" component={Notification} />
    <Stack.Screen name="Staff" component={StaffLayout} />
    <Stack.Screen name="UploadPortfolio" component={UploadPortfolio} />
    <Stack.Screen
      name="ViewMedicalInstruction"
      component={ViewMedicalInstruction}
    />
    <Stack.Screen name="Homework" component={Homework} />
    <Stack.Screen name="ViewHomework" component={ViewHomework} />
    <Stack.Screen
      name="StudentCheckinCheckout"
      component={StudentCheckinCheckout}
    />
    <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
    <Stack.Screen name="BroadcastScreen" component={BroadcastScreen} />
    <Stack.Screen name="ProfileDetailsScreen" component={ProfileDetails} />
    <Stack.Screen
      name="StaffProfileDetailsScreen"
      component={StaffProfileDetails}
    />
    <Stack.Screen name="Achievements" component={Achievement} />
    <Stack.Screen name="ReportCard" component={ReportCard} />
    <Stack.Screen name="TrackBus" component={TrackBus} />
    <Stack.Screen
      name="StaffUpcomingBirthday"
      component={StaffUpcomingBirthday}
    />
    <Stack.Screen
      name="StudentUpcomingBirthday"
      component={StudentUpcomingBirthday}
    />
    <Stack.Screen name="ViewHealthUpdate" component={ViewHealthUpdate} />
    <Stack.Screen name="UpdateHealth" component={UpdateHealth} />
    <Stack.Screen name="UpdateReportCard" component={UpdateReportCard} />
    <Stack.Screen name="SubjectRemards" component={SubjectRemards} />
    <Stack.Screen name="Driver" component={DriverLayout} />
    <Stack.Screen
      name="DriverLoactionTracker"
      component={DriverLoactionTracker}
    />
    <Stack.Screen name="DriverProfileDetail" component={DriverProfileDetail} />
    <Stack.Screen name="SelectedChatUser" component={SelectedChatUser} />
    <Stack.Screen name="InventoryManagement" component={InventoryManagement} />
    <Stack.Screen name="FinanceManagement" component={FinanceManagement} />
    <Stack.Screen
      name="AddInventoryCategory"
      component={AddInventoryCategory}
    />
    <Stack.Screen name="AddInventoryEntry" component={AddInventoryEntry} />
    <Stack.Screen name="InventoryHistory" component={ViewInventoryHistory} />
    <Stack.Screen
      name="AddFinanceTransaction"
      component={AddFinanceTransaction}
    />
    <Stack.Screen name="MonthlyWorkPlan" component={MonthlyWorkPlan} />
    <Stack.Screen name="LeaveDetailsScreen" component={LeaveDetails} />
    <Stack.Screen name="AllocatePlan" component={AllocatePlan} />
    <Stack.Screen
      name="StaffBasedStudentsList"
      component={StaffBasedStudentsList}
    />
    <Stack.Screen name="DailyLogsList" component={DailyLogsList} />
    <Stack.Screen name="LibraryBooks" component={LibraryBooks} />
    <Stack.Screen name="BookHistory" component={BookHistory} />
    <Stack.Screen name="StudentLogsList" component={StudentLogsList} />
    <Stack.Screen name="OtherPaymentsForms" component={OtherPayments} />
    <Stack.Screen name="RecordOfWork" component={RecordOfWork} />
    <Stack.Screen name="RecordOfWorkForm" component={RecordOfWorkForm} />
    <Stack.Screen name="ResetPassword" component={ResetPassword} />
    <Stack.Screen name="NoticeBoard" component={NoticeBoardScreen} />
    <Stack.Screen name="EventBoard" component={EventBoardScreen} />
    <Stack.Screen name="MedicalHealthScreen" component={MedicalHealthScreen} />
    <Stack.Screen name="EventScreen" component={DisplayEvents} />
    <Stack.Screen name="NoticeScreen" component={DisplayNotice} />
    <Stack.Screen name="ConcernScreen" component={ConcernScreen} />
    <Stack.Screen name="RaiseConcernScreen" component={RaiseConcern} />
    <Stack.Screen name="AttandanceList" component={AttendanceList} />
    <Stack.Screen name="SchoolPolicies" component={SchoolPolicies} />
    <Stack.Screen name="SelectRoleScreen" component={SelectRoleScreen} />
  </Stack.Navigator>
));

export default function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [route, setRoute] = useState('Login');

  const [isSplashReady, setItSplashReady] = useState(false);

  const bootstrap = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const user = await AsyncStorage.getItem('user');
      if (token && user) {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        if (decoded.role === 'student') {
          setRoute('Parent');
        } else if (decoded.role === 'staff') {
          setRoute('Staff');
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (role === 'student') {
      setRoute('Parent');
    } else if (role === 'staff') {
      setRoute('Staff');
    }
  }, [role]);

  if (loading) {
    return null;
  }

  if (!isSplashReady) {
    return <SplashScreen onAnimationFinish={() => setItSplashReady(true)} />;
  }

  return (
    <NavigationContainer>
      <UserProvider>
        <SocketProvider>
          <StorageContextProvider>
            <LocationTrackingProvider>
              <SafeAreaView
                style={{ borderWidth: 0, flex: 1, backgroundColor: 'white' }}
              >
                <AppNavigator route={route} />
                {/* <Text>Test</Text> */}
              </SafeAreaView>
            </LocationTrackingProvider>
          </StorageContextProvider>
        </SocketProvider>
      </UserProvider>
    </NavigationContainer>
  );
}
