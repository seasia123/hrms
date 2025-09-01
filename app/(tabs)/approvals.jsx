import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { styled, useColorScheme } from 'nativewind';
import ApprovalsList from '../../components/Approval/ApprovalsList';

const StyledTabBar = styled(TabBar);

const PendingRoutes = ({ title }) => (
  <View className="flex-1 dark:bg-black">
    <ApprovalsList type="pending" screen={title} />
  </View>
);

const ApprovedRoutes = ({ title }) => (
  <View className="flex-1 dark:bg-black">
    <ApprovalsList type="approved" screen={title} />
  </View>
);

const RejectedRoutes = ({ title }) => (
  <View className="flex-1 dark:bg-black">
    <ApprovalsList type="rejected" screen={title} />
  </View>
);

export default function Approvals({ route }) {
  const { title } = route.params;
  const [index, setIndex] = React.useState(0);
  const { colorScheme } = useColorScheme();


  const renderTabBar = props => (
    <StyledTabBar
      {...props}
      indicatorStyle={{ backgroundColor: colorScheme === 'light' ? '#0038C0' : 'white' }}
      className={colorScheme === 'light' ? "bg-white" : "bg-black"}
      labelStyle={{ color: colorScheme === 'light' ? 'black' : "white" }}
    />
  );

  const [routes] = React.useState([
    { key: 'pending', title: 'Pending' },
    { key: 'approved', title: 'Approved' },
    { key: 'rejected', title: 'Rejected' },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'pending':
        return <PendingRoutes type="pending" title={title} />;
      case 'approved':
        return <ApprovedRoutes type="approved" title={title} />;
      case 'rejected':
        return <RejectedRoutes type="rejected" title={title} />;
      default:
        return null;
    }
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get('window').width }}
      renderTabBar={renderTabBar}
      lazy={true}
      // lazyPreloadDistance={0}
    />
  );
}
