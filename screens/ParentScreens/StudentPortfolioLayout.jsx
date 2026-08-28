import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import CustomeTab from '../../components/CustomeTab';
import { useUser } from '../../context/UserContext';
import SchoolFeeds from '../SchoolFeeds';
import Portfolio from './Portfolio';

const StudentPortfolioLayout = () => {
  const { appUser } = useUser();
  const [active, setActive] = useState(0);

  const tabs = useMemo(() => {
    return [
      'School Feeds',
      `${appUser?.name ?? 'Student'}'s Portfolio`,
    ];
  }, [appUser?.name]);

  return (
   <>
    <View style={styles.container}>
      <CustomeTab tabs={tabs} onTabPress={setActive} />

    </View>
      {active === 0 ? <SchoolFeeds /> : <Portfolio />}

   </>
  );
};

export default StudentPortfolioLayout;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 10
  },
});