import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'nativewind';
import moment from 'moment';
import Http from '../../services/httpService';
import NotFound from '../NotFound';
import { useAuthContext } from '../../context/AuthProvider';
import Loader from '../Loader';

const ApprovalsList = ({ type = "pending", screen }) => {
    const { user } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const [listData, setListData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    // console.log(type, screen);

    const getLeaveListData = async () => {
        const api_url = screen === "My Requests" ? "/getMyBothLeaveRegRequestList" : "/getMyRegApprovalList";
        // console.log(api_url);
        setLoading(true);
        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);
        payload.append("action", type);
        try {
            const response = await Http.post(api_url, payload);
            if (response.ok) {
                const data = await response.json();
                setListData(data?.data);
            } else {
                throw new Error('Failed to get data. Please try again.');
            }
        } catch (error) {
            // console.log(error)
            // Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        getLeaveListData();
    }, [screen]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getLeaveListData();
    }, [screen]);

    useFocusEffect(
        useCallback(() => {
            getLeaveListData();
        }, [screen])
    );

    const getStatusHelpers = useMemo(() => {
        const getregStatus = (hrStatus, rmStatus) => {
            if ((hrStatus === "pending" || rmStatus === "pending") &&
                hrStatus !== "rejected" && rmStatus !== "rejected") {
                return "Waiting for approval";
            } else if (hrStatus === "approved" && rmStatus === "approved") {
                return "Approved";
            } else if (hrStatus === "rejected" || rmStatus === "rejected") {
                return "Rejected";
            } else {
                return "Unknown Status";
            }
        };

        const getregStatusColor = (status) => {
            switch (status) {
                case "Waiting for approval":
                    return "text-yellow-500";
                case "Approved":
                    return "text-green-500";
                case "Rejected":
                    return "text-red-500";
                default:
                    return "text-gray-500";
            }
        };

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
                default:
                    return "red";
            }
        };

        return { getregStatus, getregStatusColor, getStatus, getStatusColor, getDotColor };
    }, []);

    const renderItem = useCallback(({ item }) => {
        const { getregStatus, getregStatusColor, getStatus, getStatusColor, getDotColor } = getStatusHelpers;

        const reg_status = getregStatus(item.hr_status, item.rm_status);
        const reg_statusColor = getregStatusColor(reg_status);
        const status = getStatus(item.status);
        const statusColor = getStatusColor(status);
        const avatarExists = item?.employee_avatar && item?.employee_avatar?.trim() !== '';

        return (
            <>
                {item.type === "leave" ? (
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-3 rounded-xl bg-white dark:bg-black-100 m-2"
                        onPress={() => router.push(item.status === "not_applied" ? `/raise-leave-request/${item.startDate}` : `/leave-details/${item?.id}?approval=${screen === "My Approvals" ? true : false}`)}
                    >
                        <View className="flex-row items-center">
                            {screen === "My Approvals" && (
                                avatarExists ? (
                                    <Image
                                        source={{ uri: item?.employee_avatar }}
                                        className="w-10 h-10 rounded-full mr-2"
                                    />
                                ) : (
                                    <View className="w-10 h-10 rounded-full mr-2 bg-secondary justify-center items-center">
                                        <Text className="text-white text-lg font-bold">{item?.employee_name?.charAt(0)?.toUpperCase()}</Text>
                                    </View>
                                )
                            )}
                            <View className="flex-1 px-2">
                                <View>
                                    <Text className="font-psemibold dark:text-gray-100 mb-1">Leave</Text>
                                    {screen === "My Approvals" ?
                                        <Text className="text-[12px] font-semibold dark:text-gray-100 mb-1">{`${item?.employee_name} - ${moment(item.added_date).format("DD-MMM-YYYY")}`}</Text>
                                        :
                                        <Text className="text-[12px] font-semibold dark:text-gray-100 mb-1" numberOfLines={1} ellipsizeMode="tail">{moment(item.added_date).format("DD-MMM-YYYY")}</Text>
                                    }
                                </View>
                                {/* {status && <Text className={`text-sm ${statusColor}`}>{status}</Text>} */}
                            </View>
                            {item.status === "not_applied" && (
                                <TouchableOpacity
                                    className="rounded-full border p-1 border-blue-500"
                                    onPress={() => router.push(`/raise-leave-request/${item.startDate}?approval=false`)}
                                >
                                    <Text className="font-semibold text-[12px] dark:text-gray-100">Convert Leave</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-3 rounded-xl bg-white dark:bg-black-100 m-2"
                        onPress={() => router.push(`/regularization-detail/${item?.id}?approval=${screen === "My Approvals" ? true : false}`)}
                    >
                        {screen === "My Approvals" && (
                            avatarExists ? (
                                <Image
                                    source={{ uri: item?.employee_avatar }}
                                    className="w-10 h-10 rounded-full mr-2"
                                />
                            ) : (
                                <View className="w-10 h-10 rounded-full mr-2 bg-secondary justify-center items-center">
                                    <Text className="text-white text-lg font-bold">{item?.employee_name?.charAt(0)?.toUpperCase()}</Text>
                                </View>
                            )
                        )}
                        <View className="flex-1 px-2">
                            <Text className="font-psemibold dark:text-gray-100 mb-1">Attendance Regularization</Text>
                            {screen === "My Approvals" ?
                                <Text className="text-[12px] font-semibold dark:text-gray-100 mb-1" numberOfLines={1} ellipsizeMode="tail">{item.employee_name} - {moment(item.added_date).format("DD-MMM-YYYY")}</Text>
                                :
                                <Text className="text-[12px] font-semibold dark:text-gray-100 mb-1" numberOfLines={1} ellipsizeMode="tail">{moment(item.added_date).format("DD-MMM-YYYY")}</Text>
                            }
                            {/* {((user.id === item.rm_id && item.rm_status === "approved") ||
                (user.id === item.hr_id && item.hr_status === "approved")) && (
                <Text className="text-green-600">Approved By You</Text>
              )}
              {((user.id === item.rm_id && item.rm_status === "rejected") ||
                (user.id === item.hr_id && item.hr_status === "rejected")) && (
                <Text className="text-red-600">Rejected By You</Text>
              )} */}
                            {/* <Text className={`text-sm ${reg_statusColor}`}>{reg_status}</Text> */}
                        </View>
                    </TouchableOpacity>
                )}
            </>
        );
    }, [getStatusHelpers, router, screen, user?.id]);

    return (
        <View className="flex-1">
            <FlatList
                data={listData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !loading && <NotFound />
                }
            />
            <Loader isLoading={loading} display="hide" />
        </View>
    );
};

export default React.memo(ApprovalsList);
