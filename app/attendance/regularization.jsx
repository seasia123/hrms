import * as React from 'react';
import { Dimensions, View, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { styled, useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons if you're using Expo
import { useRouter } from 'expo-router';
import moment from 'moment';
import MyRegularisationRequests from '../../components/RegularizationComponents/MyReqularizationRequests';
import MyApprovalsRequest from '../../components/RegularizationComponents/MyApprovalsRequest';

const FirstRoute = () => (
  <View className="flex-1 h-full dark:bg-black">
    <MyRegularisationRequests />
  </View>
);

const SecondRoute = () => (
  <View className="flex-1  dark:bg-black">
    <MyApprovalsRequest/>
  </View>
);

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

const StyledTabBar = styled(TabBar);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AttendanceView() {
  const router = useRouter();
  const today = moment().format('DD-MM-YYYY');
  const [index, setIndex] = React.useState(0);
  const { colorScheme } = useColorScheme();
  const [routes] = React.useState([
    { key: 'first', title: 'My Requests' },
    { key: 'second', title: 'My Approvals' },
  ]);

  const renderTabBar = props => (
    <StyledTabBar
      {...props}
      indicatorStyle={{ backgroundColor: colorScheme === 'light' ? '#0038C0' : 'white' }}
      className={colorScheme === 'light' ? "bg-white" : "bg-black"}
      labelStyle={{ color: colorScheme === 'light' ? 'black' : "white" }}
    />
  );

  return (
    <View className="flex-1">
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
      />
      {index === 0 && (
        <StyledTouchableOpacity
          className="absolute bottom-14 right-6 bg-blue-500 rounded-full p-4 shadow-lg"
          onPress={() => router.push(`/raise-regularize-request/${today}`)}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </StyledTouchableOpacity>
      )}
    </View>
  );
}
