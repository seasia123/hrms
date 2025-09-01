import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import NotFound from '../NotFound';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';
import { Entypo } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Http from '../../services/httpService';
import { useColorScheme } from 'nativewind';
import Loader from '../Loader';
import moment from 'moment';
import LeaveHorizontalView from './LeaveHorizontalView';


const LeaveView = ({ startDate, endDate, enableScroll = true }) => {
    const { user } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const [leaveData, setLeaveData] = useState([]);
    const [listData, setListData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const getLeaveData = async () => {
        setLoading(true);
        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);
        payload.append("start_date", startDate);
        payload.append("end_date", endDate);

        try {
            const response = await Http.post("/leave_balance", payload);
            if (response.ok) {
                const data = await response.json();
                setLeaveData(data?.data);
            } else {
                throw new Error('Failed to get data. Please try again.');
            }
        } catch (error) {
            // Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const getLeaveListData = async () => {
        setLoading(true);
        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);

        try {
            const response = await Http.post("/getMyLeaveRequestList", payload);
            if (response.ok) {
                const data = await response.json();
                setListData(data?.data);
            } else {
                throw new Error('Failed to get data. Please try again.');
            }
        } catch (error) {
            // Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }


    useEffect(() => {
        getLeaveData();
        getLeaveListData();
    }, [startDate]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getLeaveListData();
        getLeaveData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            getLeaveData();
            getLeaveListData();
        }, [])
    );


    const renderItem = ({ item }) => {

        const getStatus = (status) => {
            if (status === 'Pending') {
                return "Pending approval";
            } else if (status === "Approved") {
                return "Approved";
            } else if (status === "Rejected") {
                return "Rejected";
            } else {
                return "";
            }
        };

        const getStatusColor = (status) => {
            switch (status) {
                case "Pending approval":
                    return "text-yellow-500";
                case "Approved":
                    return "text-green-500";
                case "Rejected":
                    return "text-red-500";
                default:
                    return "text-gray-500";
            }
        };

        const getDotColor = (title) => {
            switch (title) {
                case "Sick Leave":
                    return "purple";
                case "Earned Leave":
                    return "green";
                case "Casual Leave":
                    return "blue";
                case "Compensatory Off":
                    return "orange";
                case "Leave Without Pay":
                    return "red";
                case "Absent":
                    return "red";
                default:
                    return "red";
            }
        }

        const status = getStatus(item.status);
        const statusColor = getStatusColor(status);
        const isUpcoming = moment(item.start_date).isAfter(moment());

        return (
            <TouchableOpacity className="flex-row items-center justify-between p-4 rounded-xl bg-white dark:bg-black-100 m-2 my-3" onPress={() => router.push(item.status === "not_applied" ? `/raise-leave-request/${item.startDate}` : `/leave-details/${item.id}?approval=false`)}>
                <View className="flex-row items-center">
                    {isUpcoming &&
                        <View className="absolute p-1 px-2 rounded-full bg-black left-1 -top-7 dark:bg-white">
                            <Text className="text-white text-[11px] dark:text-black">Upcoming</Text>
                        </View>
                    }
                    <View className="flex-1 px-2">
                        <View>
                            <View className="flex-row items-center">
                                <Text className="font-psemibold dark:text-gray-100">{`${item?.title} - ${item?.total_leave_days} Day(s)`}</Text>
                                <View className="w-[7px] h-[7px] rounded-full ml-1" style={{ backgroundColor: getDotColor(item?.title) }}></View>
                            </View>
                            {item.start_date === item.end_date ?
                                <Text className="dark:text-gray-100">{moment(item.start_date).format("DD-MMM-YYYY")}</Text>
                                :
                                <Text className="dark:text-gray-100">{`${moment(item.start_date).format("DD-MMM-YYYY")} to ${moment(item.end_date).format("DD-MMM-YYYY")}`}</Text>
                            }
                        </View>
                        {status && <Text className={`text-sm ${statusColor}`}>{status}</Text>}
                    </View>

                    {item.title === "Absent" &&
                        <TouchableOpacity className="rounded-full border p-1 border-blue-500" onPress={() => router.push(`/raise-leave-request/${item.startDate}?approval=false`)}>
                            <Text className="font-semibold text-[12px] dark:text-gray-100">Convert Leave</Text>
                        </TouchableOpacity>
                    }
                </View>
            </TouchableOpacity>
        )
    };

    return (
        <View className="flex-1">
            <FlatList
                scrollEnabled={enableScroll}
                ListHeaderComponent={<LeaveHorizontalView data={leaveData} />}
                data={listData}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !loading && <NotFound />
                }
            />
            <Loader isLoading={loading} />
        </View>
    )
}

export default LeaveView;