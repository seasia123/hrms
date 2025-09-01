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

const MyApprovalsRequest = () => {
    const { user } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const [data, setData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const getData = async () => {
        setLoading(true);
        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);

        try {
            const response = await Http.post("/getMyRegApprovalList", payload);
            if (response.ok) {
                const data = await response.json();
                setData(data?.data);
            } else {
                throw new Error('Failed to get data. Please try again.');
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            getData();
        }, [])
    );


    const renderItem = ({ item }) => {
        const avatarExists = item?.employee_avatar && item?.employee_avatar?.trim() !== '';

        const getStatus = (hrStatus, rmStatus) => {
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

        const getStatusColor = (status) => {
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

        const status = getStatus(item.hr_status, item.rm_status);
        const statusColor = getStatusColor(status);

        return (
            <View className="flex-row items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
                <TouchableOpacity className="flex-row items-center" onPress={() => router.push(`/regularization-detail/${item.id}?approval=true`)}>
                    {avatarExists ? (
                        <Image
                            source={{ uri: item?.employee_avatar }}
                            className="w-10 h-10 rounded-full mr-2"

                        />
                    ) : (
                        <View className="w-10 h-10 rounded-full mr-2 bg-secondary justify-center items-center">
                            <Text className="text-white text-lg font-bold">{item?.employee_name?.charAt(0)?.toUpperCase()}</Text>
                        </View>
                    )}
                    <View className="flex-1 ml-4">
                        <Text className="font-semibold dark:text-gray-100" numberOfLines={1} ellipsizeMode="tail">{item.employee_id}&nbsp;-&nbsp;{item.employee_name}</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-100">{moment(item.attendance_date).format("DD-MMM-YYYY")}</Text>
                        {((user.id === item.rm_id && item.rm_status === "approved") ||
                            (user.id === item.hr_id && item.hr_status === "approved")) &&
                            <Text className="text-green-600 font-semibold">Approved By You</Text>
                        }

                        {((user.id === item.rm_id && item.rm_status === "rejected") ||
                            (user.id === item.hr_id && item.hr_status === "rejected")) &&
                            <Text className="text-red-600 font-semibold">Rejected By You</Text>
                        }
                        <Text className={`text-sm font-bold ${statusColor}`}>{status}</Text>
                    </View>

                    <View className="absolute right-2">
                        <Entypo name="chevron-small-right" size={24} color={colorScheme === "light" ? "black" : "white"} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    };

    return (
        <View className="h-full">
            <FlatList
                data={data}
                keyExtractor={(item, index) => index}
                renderItem={renderItem}
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

export default MyApprovalsRequest;