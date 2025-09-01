import * as React from 'react';
import { Dimensions, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { styled, useColorScheme } from 'nativewind';
import OrganizationFiles from '../../components/Files/OrganizattionFiles';
import EmployeeFiles from '../../components/Files/EmployeeFiles';

const FirstRoute = () => (
    <View className="flex-1 justify-center dark:bg-black">
        <OrganizationFiles />
    </View>
);

const SecondRoute = () => (
    <View className="flex-1 justify-center dark:bg-black">
        <EmployeeFiles />
    </View>
);

const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
});

const StyledTabBar = styled(TabBar);



export default function FIlesView() {
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
        { key: 'first', title: 'Organization Files' },
        { key: 'second', title: 'Employee Files' },
    ]);

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderTabBar={renderTabBar}
        />
    );
}
