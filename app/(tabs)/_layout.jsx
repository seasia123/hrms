import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather, FontAwesome, AntDesign } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View, Modal, Button, Pressable, FlatList, Animated, Easing, SafeAreaView } from "react-native";
import { useAuthContext } from "../../context/AuthProvider";
import { Dropdown } from 'react-native-element-dropdown';
import { useColorScheme } from "nativewind";
import * as SecureStore from 'expo-secure-store';
import { Tabs } from 'expo-router';
import Home from "./home";
import Approvals from './approvals';
import Services from './services';
import More from './more';
import { useState, useEffect, useRef } from "react";
import useNetworkStatus from "../../hooks/useNetworkStatus";
import Spinner from "../../components/OverlaySpinner";
import moment from "moment";

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const [modalVisible, setModalVisible] = useState(false);
    const today = moment().format('YYYY-MM-DD');
    const regtoday = moment().format('DD-MM-YYYY');

    const quickOption = [
        {
            id: 1,
            title: "Leave",
            icon: "umbrella",
            color: "#6d28d9",
            href: `/raise-leave-request/${today}`,
            disable: false
        },
        {
            id: 2,
            title: "Regularisation",
            icon: "edit",
            color: "#be123c",
            href: `/raise-regularize-request/${regtoday}`,
            disable: false
        },
        {
            id: 3,
            title: "Comp Off",
            icon: "repeat",
            color: "#b45309",
            href: "",
            disable: true
        }
    ]

    const rotateValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (modalVisible) {
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start();
        } else {
            rotateValue.setValue(0);
        }
    }, [modalVisible]);

    const rotation = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['-45deg', '45deg'],
    });

    return (
        <SafeAreaView className={`flex-row h-22 py-1 ${colorScheme === "light" ? "bg-white border-t border-gray-200" : "bg-black border-t border-gray-800"}`}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                const textColor = isFocused
                    ? colorScheme === "light"
                        ? "text-blue-700"
                        : "text-white"
                    : colorScheme === "light"
                        ? "text-neutral-500"
                        : "text-neutral-500";

                if (route.name === "Plus") {
                    return (
                        <TouchableOpacity
                            key={route.key}
                            className="flex-1 justify-center items-center"
                            onPress={() => setModalVisible(true)}
                        >
                            <AntDesign name="pluscircle" size={42} color={colorScheme === "light" ? "#0038C0" : "white"} />
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        className="flex-1 justify-center items-center pt-2"
                    >
                        {options.tabBarIcon && options.tabBarIcon({ color: isFocused ? (colorScheme === "light" ? "#0038C0" : "white") : "#737373", size: 24 })}
                        <Text className={`text-xs ${textColor}`}>
                            {options.title}
                        </Text>
                    </TouchableOpacity>
                );
            })}



            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable className="flex-1 justify-end  bg-black/50" onPress={() => setModalVisible(false)}>
                    <Pressable className="bg-white rounded-t-lg p-5 px-2 dark:bg-black-100" onPress={() => null}>
                        <FlatList
                            data={quickOption}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={3}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`flex-1 justify-center items-center m-2 py-2 rounded-lg ${item.disable ? "opacity-50" : ""}`}
                                    onPress={() => {
                                        if (!item.disable) {
                                            setModalVisible(false);
                                            router.push(item.href);
                                        }
                                    }}
                                    disabled={item.disable}
                                >
                                    <View className={`w-12 h-12 justify-center items-center rounded-full`} style={{ backgroundColor: item.color }}>
                                        <Feather name={item.icon} size={24} color="white" />
                                    </View>
                                    <Text className="mt-2 text-center dark:text-white">{item.title}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <View className="mt-4 flex-row justify-center items-center">
                            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                                <Pressable onPress={() => setModalVisible(false)}>
                                    <AntDesign name="pluscircle" size={42} color={colorScheme === "light" ? "#0038C0" : "white"} />
                                </Pressable>
                            </Animated.View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const Plus = () => null;

const TabLayout = () => {
    const router = useRouter();
    const isConnected = useNetworkStatus();
    const { user } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const [approvalTitle, setApprovalTitle] = useState("My Approvals");
    const [unreadCount, setUnreadCount] = useState(0);

    const approvalOptions = [
        { label: 'My Approvals', value: 'My Approvals' },
        { label: 'My Requests', value: 'My Requests' }
    ];

    const handleApprovalChange = async (value) => {
        setApprovalTitle(value);
        await SecureStore.setItemAsync("SELECTED_APPROVAL_DD", value);
    };

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const savedOption = await SecureStore.getItemAsync("SELECTED_APPROVAL_DD");
    //             if (savedOption) {
    //                 setApprovalTitle(savedOption);
    //             }
    //         } catch (e) {
    //             setApprovalTitle("My Requests");
    //         }
    //     })();
    // }, []);

    useEffect(() => {
        router.setParams({ title: approvalTitle });
    }, [approvalTitle]);

    const HeaderTitle = ({ title }) => {
        const avatarExists = user?.avatar && user?.avatar?.trim() !== '';

        return (
            <View className="flex-row items-center ml-4">
                <TouchableOpacity onPress={() => router.push('/my-profile')}>
                    {avatarExists ? (
                        <Image
                            source={{ uri: user?.avatar }}
                            className="w-10 h-10 rounded-full mr-2"

                        />
                    ) : (
                        <View className="w-10 h-10 rounded-full mr-2 bg-secondary justify-center items-center">
                            <Text className="text-white text-lg font-bold">{user?.name?.charAt(0)?.toUpperCase()}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                {title === "Approvals" ? (
                    <View className="font-bold ml-2 w-[180px]" >
                        <Dropdown
                            data={approvalOptions}
                            labelField="label"
                            valueField="value"
                            placeholder="Select"
                            value={approvalTitle}
                            onChange={item => handleApprovalChange(item.value)}
                            selectedTextStyle={{ fontSize: 21, fontWeight: 600, color: colorScheme === "light" ? "black" : "#CDCDE0" }}
                            renderRightIcon={() => (
                                <FontAwesome name="chevron-down" size={18} color={colorScheme === "light" ? "black" : "#CDCDE0"} />
                            )}
                        />
                    </View>
                ) : (
                    <Text className="text-xl font-bold ml-2 dark:text-gray-100">{title}</Text>
                )}
            </View>
        );
    }

    const HeaderRight = () => {
        return (
            <View className="flex-row ml-auto mr-2">
                <TouchableOpacity className="mr-4" onPress={() => router.push("/organization?focus=yes")}>
                    <MaterialIcons name="search" size={24} color={colorScheme === "light" ? "black" : "white"} />
                </TouchableOpacity>
                <TouchableOpacity className="mr-2" onPress={() => router.push("/notifications")}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color={colorScheme === "light" ? "black" : "white"} />
                    {unreadCount > 0 && (
                        <View className="absolute right-0 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                            <Text className="text-white text-[10px] font-bold">{unreadCount > 9 ? "9+" : unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <Spinner visible={!isConnected} color={colorScheme === 'light' ? "black" : "white"} textContent="No active internet connection. Please connect to the internet." />
            <Tabs
                initialRouteName="home"
                tabBar={props => <CustomTabBar {...props} />}
                screenOptions={({ route }) => ({
                    tabBarActiveTintColor: colorScheme === "light" ? "#0038C0" : "white",
                    tabBarStyle: {
                        backgroundColor: colorScheme === "light" ? "#fff" : "#000000"
                    },
                    headerLeft: () => <HeaderTitle title={route.name.charAt(0).toUpperCase() + route.name.slice(1)} />,
                    headerRight: () => <HeaderRight />,
                    headerTitle: "",
                    headerStyle: {
                        backgroundColor: colorScheme === "light" ? "#fff" : "#000000"
                    }
                })}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ size, color }) => (
                            <Ionicons name="home" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="services"
                    options={{
                        title: "Services",
                        tabBarIcon: ({ size, color }) => (
                            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="Plus"
                    options={{
                        tabBarIcon: () => null,
                        tabBarLabel: () => null,
                    }}
                />
                <Tabs.Screen
                    name="approvals"
                    initialParams={{ title: approvalTitle }}
                    options={{
                        title: "Approvals",
                        tabBarIcon: ({ size, color }) => (
                            <Feather name="check-square" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="more"
                    options={{
                        title: "More",
                        tabBarIcon: ({ size, color }) => (
                            <MaterialCommunityIcons name="dots-vertical-circle-outline" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
};

export default TabLayout;


// import { StatusBar } from "expo-status-bar";
// import { useRouter } from "expo-router";
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { Feather } from '@expo/vector-icons';
// import { FontAwesome } from '@expo/vector-icons';
// import { AntDesign } from '@expo/vector-icons';
// import { Image, Text, TouchableOpacity, View } from "react-native";
// import { useAuthContext } from "../../context/AuthProvider";
// import { Dropdown } from 'react-native-element-dropdown';
// import { useColorScheme } from "nativewind";
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import * as SecureStore from 'expo-secure-store';
// import Home from "./home";
// import Approvals from './approvals';
// import Services from './services';
// import More from './more';
// import { useState, useEffect } from "react";
// import useNetworkStatus from "../../hooks/useNetworkStatus";
// import Spinner from "../../components/OverlaySpinner";

// const Tabs = createBottomTabNavigator();


// const TabLayout = () => {
//     const router = useRouter();
//     const isConnected = useNetworkStatus();
//     const { user } = useAuthContext();
//     const { colorScheme } = useColorScheme();
//     const [approvalTitle, setApprovalTitle] = useState("My Requests");
//     const [unreadCount, setUnreadCount] = useState(0);

//     const approvalOptions = [
//         { label: 'My Requests', value: 'My Requests' },
//         { label: 'My Approvals', value: 'My Approvals' }
//     ];

//     const handleApprovalChange = async (value) => {
//         setApprovalTitle(value);
//         await SecureStore.setItemAsync("SELECTED_APPROVAL_DD", value);
//     };

//     // useEffect(() => {
//     //     (async () => {
//     //         try {
//     //             const savedOption = await SecureStore.getItemAsync("SELECTED_APPROVAL_DD");
//     //             if (savedOption) {
//     //                 setApprovalTitle(savedOption);
//     //             }
//     //         } catch (e) {
//     //             setApprovalTitle("My Requests");
//     //         }
//     //     })();
//     // }, []);

//     useEffect(() => {
//         router.setParams({ title: approvalTitle });
//     }, [approvalTitle]);


//     const HeaderTitle = ({ title }) => {
//         const avatarExists = user?.avatar && user?.avatar?.trim() !== '';

//         return (
//             <View className="flex-row items-center ml-4">
//                 <TouchableOpacity onPress={() => router.push('/my-profile')}>
//                     {avatarExists ? (
//                         <Image
//                             source={{ uri: user?.avatar }}
//                             className="w-10 h-10 rounded-full mr-2"

//                         />
//                     ) : (
//                         <View className="w-10 h-10 rounded-full mr-2 bg-secondary justify-center items-center">
//                             <Text className="text-white text-lg font-bold">{user?.name?.charAt(0)?.toUpperCase()}</Text>
//                         </View>
//                     )}
//                 </TouchableOpacity>
//                 {title === "Approvals" ? (
//                     <View className="font-bold ml-2 w-[180px]" >
//                         <Dropdown
//                             data={approvalOptions}
//                             labelField="label"
//                             valueField="value"
//                             placeholder="Select"
//                             value={approvalTitle}
//                             onChange={item => handleApprovalChange(item.value)}
//                             selectedTextStyle={{ fontSize: 23, fontWeight: 600, color: colorScheme === "light" ? "black" : "#CDCDE0" }}
//                             renderRightIcon={() => (
//                                 <FontAwesome name="chevron-down" size={18} color={colorScheme === "light" ? "black" : "#CDCDE0"} />
//                             )}
//                         />
//                     </View>
//                 ) : (
//                     <Text className="text-xl font-bold ml-2 dark:text-gray-100">{title}</Text>
//                 )}
//                 {/* <Text className="text-xl font-bold ml-2 dark:text-gray-100">{title}</Text> */}
//             </View>
//         );
//     }

//     const HeaderRight = () => {

//         return (
//             <View className="flex-row ml-auto mr-2">
//                 <TouchableOpacity className="mr-4" onPress={() => router.push("/organization?focus=yes")}>
//                     <MaterialIcons name="search" size={24} color={colorScheme === "light" ? "black" : "white"} />
//                 </TouchableOpacity>
//                 <TouchableOpacity className="mr-2" onPress={() => router.push("/notifications")}>
//                     <MaterialCommunityIcons name="bell-outline" size={24} color={colorScheme === "light" ? "black" : "white"} />
//                     {unreadCount > 0 && (
//                         <View className="absolute right-0 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
//                             <Text className="text-white text-[10px] font-bold">{unreadCount > 9 ? "9+" : unreadCount}</Text>
//                         </View>
//                     )}
//                 </TouchableOpacity>
//             </View>
//         );
//     }

//     return (
//         <>
//             <Spinner visible={!isConnected} color={colorScheme === 'light' ? "black" : "white"} textContent="No active internet connection. Please connect to the internet." />
//             <Tabs.Navigator
//                 initialRouteName="home"
//                 screenOptions={({ route }) => ({
//                     tabBarActiveTintColor: colorScheme === "light" ? "#0038C0" : "white",
//                     tabBarStyle: {
//                         // height: 54,
//                         backgroundColor: colorScheme === "light" ? "#fff" : "#000000"
//                     },
//                     headerLeft: () => <HeaderTitle title={route.name.charAt(0).toUpperCase() + route.name.slice(1)} />,
//                     headerRight: () => <HeaderRight />,
//                     headerTitle: "",
//                     headerStyle: {
//                         backgroundColor: colorScheme === "light" ? "#fff" : "#000000"
//                     }
//                 })}
//             >
//                 <Tabs.Screen
//                     name="home"
//                     component={Home}
//                     options={{
//                         title: "Home",
//                         tabBarIcon: ({ size, color }) => (
//                             <Ionicons name="home" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Tabs.Screen
//                     name="services"
//                     component={Services}
//                     options={{
//                         title: "Services",
//                         tabBarIcon: ({ size, color }) => (
//                             <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Tabs.Screen
//                     name="approvals"
//                     component={Approvals}
//                     initialParams={{ title: approvalTitle }}
//                     options={{
//                         title: "Approvals",
//                         tabBarIcon: ({ size, color }) => (
//                             <Feather name="check-square" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Tabs.Screen
//                     name="more"
//                     component={More}
//                     options={{
//                         title: "More",
//                         tabBarIcon: ({ size, color }) => (
//                             <MaterialCommunityIcons name="dots-vertical-circle-outline" size={size} color={color} />
//                         ),
//                     }}
//                 />
//             </Tabs.Navigator>

//             {/* <StatusBar backgroundColor="#1B1656" style="light" /> */}

//         </>
//     );
// };

// export default TabLayout;