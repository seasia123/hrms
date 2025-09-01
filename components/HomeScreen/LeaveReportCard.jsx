import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, Pressable } from 'react-native'
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LeavesMockData } from '../../data/LeavesMockData';
import * as SecureStore from 'expo-secure-store';
import Http from '../../services/httpService';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import moment from 'moment';

const LeaveReportCard = forwardRef((props, ref) => {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const { colorScheme } = useColorScheme();
    const today = moment().format('YYYY-MM-DD');

    useImperativeHandle(ref, () => ({
        getData,
    }));

    const getData = async () => {
        setLoading(true);
        const currentYear = new Date().getFullYear();
        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);
        payload.append("startDate", `${currentYear}-01-01`);
        payload.append("endDate", `${currentYear}-12-31`);

        try {
            const response = await Http.post("/leave_balance", payload);
            if (response.ok) {
                const data = await response.json();
                setData(data?.data);
            } else {
                throw new Error('Failed to get data. Please try again.');
            }
        } catch (error) {
            console.error("Error in leave_balance API", error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData();
    }, [])

    const handleToggle = () => {
        setExpanded(!expanded);
    };
    const displayedItems = expanded ? data : data.slice(0, 3);

    return (
        <View className="mb-6 bg-white dark:bg-black-100 p-4 rounded-xl shadow-md w-full max-w-sm mx-auto">
            <View className="m-4 flex flex-row">
                {/* <MaterialCommunityIcons name="bag-suitcase" size={30} color="black" /> */}
                <Image source={require('../../assets/icons/suitcase.png')} className='w-12 h-12 shadow-lg ' />
                <Text className="ml-8 mt-4 text-xl font-bold dark:text-gray-100">Leave Report</Text>
            </View>
            <View>
                {loading ? (
                    <ActivityIndicator size="large" color={colorScheme === 'light' ? "#1B1656" : "white"} className="m-4" />
                ) : (
                    <>
                        {data?.length === 0 && <Text className="text-center text-gray-400 font-psemibold p-6 dark:text-gray-100">No Leaves Found!</Text>}
                        {displayedItems?.map((item, index) => (
                            <Pressable key={index} className="flex-row items-center p-2 mb-2" onPress={() => router.push(`/raise-leave-request/${today}?leaveSelected=${item.leave_id}`)}>
                                <View style={{ backgroundColor: item.color }} className="w-[50px] h-[50px] items-center justify-center rounded-full mr-4">
                                    <MaterialCommunityIcons name={item.icon} size={30} color="white" />
                                </View>
                                <View className="flex-col">
                                    <Text className="text-base mb-1 dark:text-gray-100">{item.title}</Text>
                                    <Text className="text-gray-500 dark:text-gray-100">Taken: {item.taken} Day(s){item.balance !== null && <Text> | Balance: {item.balance} Day(s) </Text>}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </>
                )}
            </View>
            {data.length > 3 && (
                <TouchableOpacity onPress={handleToggle} className="p-2 px-4 bg-blue-100 rounded-full" style={{ alignSelf: 'center' }}>
                    <Text className="text-center font-psemibold">
                        {expanded ? 'Collapse' : `View ${LeavesMockData.length - 3} More`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

export default LeaveReportCard;