import * as React from 'react';
import { Dimensions, View } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { styled, useColorScheme } from 'nativewind';
import SearchHeader from './SearchHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import ColleaguesList from '../../components/OrganizationComponents/ColleaguesList';


const StyledTabBar = styled(TabBar);

const FirstRoute = ({ searchQuery, index }) => (
    <View className="flex-1 dark:bg-black">
        <ColleaguesList searchQuery={searchQuery} index={index} url="/organization_colleagues" />
    </View>
);

const SecondRoute = ({ searchQuery, index }) => (
    <View className="flex-1 dark:bg-black">
        <ColleaguesList searchQuery={searchQuery} index={index} url="/organization_department" />
    </View>
);

export default function OrganizationView() {
    const params = useLocalSearchParams();
    const { focus = 'no' } = params;
    const [index, setIndex] = React.useState(0);
    const { colorScheme } = useColorScheme();
    const [searchQuery, setSearchQuery] = React.useState("");

    const clearSearchQuery = () => {
        setSearchQuery("");
    };

    const renderTabBar = props => (
        <StyledTabBar
            {...props}
            indicatorStyle={{ backgroundColor: colorScheme === 'light' ? '#0038C0' : 'white' }}
            className={colorScheme === 'light' ? "bg-white" : "bg-black"}
            labelStyle={{ color: colorScheme === 'light' ? 'black' : "white" }}
        />
    );

    const [routes] = React.useState([
        { key: 'first', title: 'Colleagues' },
        { key: 'second', title: 'Departments' },
    ]);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'first':
                return <FirstRoute searchQuery={searchQuery} index={index} />;
            case 'second':
                return <SecondRoute searchQuery={searchQuery} index={index} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'light' ? "white" : "black" }}>
            {/* <Stack.Screen options={{
                headerTitle: index === 0 ? "Colleagues" : "Departments",
                headerStyle: { backgroundColor: headerBackgroundColor },
                headerTintColor: headerTextColor,
                headerSearchBarOptions: {
                    placeholder: index === 0 ? "Search Colleagues" : "Search Departments",
                    onChangeText: (e) => setSearchQuery(e.nativeEvent.text),
                    // onSearchButtonPress: (e) => console.log(searchQuery),
                    autoFocus: focus === 'yes',
                    headerIconColor: colorScheme === 'light' ? "black" : "white",
                    textColor: colorScheme === 'light' ? "black" : "white",
                    placement: "inline"
                }
            }} /> */}
            <SearchHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} focus={focus} index={index} />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={(newIndex) => {
                    clearSearchQuery();
                    setIndex(newIndex);
                }}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={renderTabBar}
            />
        </SafeAreaView>
    );
}
