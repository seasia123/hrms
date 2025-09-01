import { View, Text, Image, ScrollView, Alert, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ToastAndroid } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Entypo } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { CustomButton, Loader } from '../../components';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment';
import Http from '../../services/httpService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthProvider';

const LeaveDetail = () => {
    const params = useLocalSearchParams();
    const { id, approval } = params;
    const { user } = useAuthContext();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [status, setStatus] = useState("");
    const [color, setColor] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [remark, setRemark] = useState("");
    const [leaveMap, setLeaveMap] = useState([]);

    const getData = async () => {
        setLoading(true);

        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);
        payload.append("leaves_id", id);

        try {
            const response = await Http.post("/getLeaveDetails", payload);
            if (response.ok) {
                const data = await response.json();
                setData(data?.data);
                const leaveParticulars = data?.data?.leave_perticulars ? JSON.parse(data?.data?.leave_perticulars) : [];
                setLeaveMap(leaveParticulars)
            } else {
                throw new Error('Failed to get data. Please try again.');
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const getStatus = (status) => {
        if (status === "pending") {
            return "Pending approval";
        } else if (status === "approved") {
            return "Approved";
        } else if (status === "rejected") {
            return "Rejected";
        } else {
            return "";
        }
    };


    const getStatusColor = (status) => {
        switch (status) {
            case "Pending approval":
                return "yellow";
            case "Approved":
                return "green";
            case "Rejected":
                return "red";
            default:
                return "gray";
        }
    };

    useEffect(() => {
        if (data) {
            const statusTxt = getStatus(data.hr_status, data.rm_status);
            const statusColor = getStatusColor(statusTxt);
            setStatus(statusTxt)
            setColor(statusColor)
        }
    }, [data])


    const handleAvatarClick = (remark) => {
        setModalContent(remark || "No remark yet");
        setModalVisible(true);
    };

    const handleReasonClick = (reason) => {
        setModalContent(reason || "No reason provided");
        setModalVisible(true);
    };

    const handleDescriptionClick = (description) => {
        setModalContent(description || "No description provided");
        setModalVisible(true);
    };


    const handleRequest = async (action) => {
        if (!remark) {
            Alert.alert("Error", "Remark is required.");
            return;
        }

        setSubmitting(true);

        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);
        payload.append("leave_id", id);
        payload.append("action", action);
        payload.append("remark", remark);
        try {
            const response = await Http.post("/approve_reject_leave", payload);
            if (response.ok) {
                getData();
                const message = `Request ${action} successfully.`;
                if (Platform.OS === 'android') {
                    ToastAndroid.show(message, ToastAndroid.SHORT);
                } else {
                    Alert.alert("Success", message);
                }
                // Alert.alert("Success", `Request ${action} successfully.`, [
                //   { text: "OK", onPress: () => router.back() }
                // ]);
            } else {
                throw new Error('Failed to submit request. Please try again.');
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    }


    return (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Loader isLoading={loading} display="hide" />
            <ScrollView className="dark:bg-black p-4">
                <View className="mb-6">
                    <Text className="mb-1 dark:text-gray-100">Employee ID</Text>
                    <Text className="dark:text-gray-100 font-semibold">{data.name} - {data.employee_id}</Text>
                </View>
                <View className="mb-6">
                    <Text className="mb-1 dark:text-gray-100">Leave Type</Text>
                    <Text className="dark:text-gray-100 font-semibold">{data.title}</Text>
                </View>
                <View className="mb-6">
                    <Text className="mb-2 dark:text-gray-100">Date</Text>
                    {Array.isArray(leaveMap) && leaveMap?.map((item, index) => (
                        <View key={index} className="mb-4">
                            <Text className="dark:text-gray-100 font-semibold mb-1">{moment(item.date).format("DD-MMM-YYYY")}</Text>
                            <View className="flex-row w-full flex-1 items-center">
                                <View className="flex-1 relative">
                                    {item.type === "full" ? (
                                        <>
                                            <View className="bg-gray-100 rounded-full w-full">
                                                <View className="bg-emerald-500 w-full h-[2px]" />
                                            </View>
                                            <View className="absolute bg-emerald-500 rounded-full h-2 w-2 top-[-3px] left-0" />
                                            <View className="absolute bg-emerald-500 rounded-full h-2 w-2 top-[-3px] right-0" />
                                        </>
                                    ) : item.type === "half" && item.half_type === "1" ? (
                                        <>
                                            <View className="bg-gray-100 rounded-full w-full">
                                                <View className="bg-emerald-500 h-[2px]" style={{ width: "50%" }} />
                                            </View>
                                            <View className="absolute bg-emerald-500 rounded-full h-2 w-2 top-[-3px] left-0" />
                                            <View className="absolute bg-emerald-500 rounded-full h-2 w-2 top-[-3px]" style={{ left: "50%" }} />
                                        </>
                                    ) : (
                                        <>
                                            <View className="bg-gray-100 rounded-full w-full">
                                                <View className="bg-emerald-500 h-[2px]" style={{ width: "50%", left: "50%" }} />
                                            </View>
                                            <View className="absolute bg-emerald-500 rounded-full h-2 w-2 top-[-3px] left-[50%]" />
                                            <View className="absolute bg-emerald-500 rounded-full h-2 w-2 top-[-3px] right-0" />
                                        </>
                                    )}
                                </View>
                                <View className="ml-4 dark:text-gray-100 font-semibold">
                                    <Text className="dark:text-gray-100 font-semibold">{item.type === "full" ? "1.0" : "0.5"} Day(s)</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
                <View className="mb-6">
                    <Text className="mb-1 dark:text-gray-100">Total</Text>
                    <Text className="dark:text-gray-100 font-semibold">{data.total_leave_days} Day(s)</Text>
                </View>
                <View className="mb-6">
                    <Text className="mb-1 dark:text-gray-100">Date of request</Text>
                    <Text className="dark:text-gray-100 font-semibold">{moment(data.applied_on).format("DD-MMM-YYYY")}</Text>
                </View>
                <View className="mb-6">
                    <Text className="mb-1 dark:text-gray-100">Reason</Text>
                    <Text className="dark:text-gray-100 font-semibold">{data.leave_reason || "-"}</Text>
                </View>
            </ScrollView>
            <View className='p-5 bg-white dark:bg-black-100 items-center'
                style={{
                    // Shadow for iOS
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    // Shadow for Android
                    elevation: 8,
                }}>
                <View className="flex-row items-center">
                    <View className="items-center mr-4">
                        <TouchableOpacity onPress={() => handleAvatarClick(data?.remark)}>
                            <View className="absolute z-10 left-8 -bottom-1">
                                {data?.status === 'Approved' ? <AntDesign name="checkcircle" size={16} color="#16a34a" /> : data?.status === 'Rejected' ? <Entypo name="circle-with-cross" size={16} color="#dc2626" /> : <MaterialCommunityIcons name="clock" size={16} color="#eab308" />}
                            </View>
                            <View className={`rounded-full border-2 ${data?.status === 'Approved' ? "border-green-600" : data?.status === 'Rejected' ? "border-red-600" : "border-yellow-500"}`}>
                                {data?.rm_avatar ? (
                                    <Image
                                        source={{ uri: data?.rm_avatar }}
                                        className="w-[42px] h-[42px] rounded-full"
                                    />
                                ) : (
                                    <View className="w-[42px] h-[42px] rounded-full bg-secondary justify-center items-center">
                                        <Text className="text-white text-lg font-bold">{data?.rm_name?.charAt(0)?.toUpperCase() || "RM"}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                        <Text className='text-sm dark:text-gray-100 mt-1'>{data?.rm_name || "RM"}</Text>
                    </View>
                    {/* {data?.skip_hr_approval === "no" &&
                        <>
                            <View className="mb-4">
                                <Entypo name="chevron-small-right" size={24} color={colorScheme === "dark" ? "white" : "black"} />
                            </View>

                            <View className="items-center ml-4">
                                <TouchableOpacity onPress={() => handleAvatarClick(data?.hr_remark)}>
                                    <View className="absolute z-10 left-8 -bottom-1">
                                        {data?.hr_status === 'approved' ? <AntDesign name="checkcircle" size={16} color="#16a34a" /> : data?.hr_status === 'rejected' ? <Entypo name="circle-with-cross" size={16} color="#dc2626" /> : <MaterialCommunityIcons name="clock" size={16} color="#eab308" />}
                                    </View>
                                    <View className={`rounded-full border-2 ${data?.hr_status === 'approved' ? "border-green-600" : data?.hr_status === 'rejected' ? "border-red-600" : "border-yellow-500"}`}>
                                        {data?.hr_avatar ? (
                                            <Image
                                                source={{ uri: data?.hr_avatar }}
                                                className="w-[42px] h-[42px] rounded-full"
                                            />
                                        ) : (
                                            <View className="w-[42px] h-[42px] rounded-full bg-secondary justify-center items-center">
                                                <Text className="text-white text-lg font-bold">{data?.hr_name?.charAt(0)?.toUpperCase() || "HR"}</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <Text className='text-sm dark:text-gray-100 mt-1'>{data?.hr_name || "HR"}</Text>
                            </View>
                        </>
                    } */}
                </View>
                {approval === "true" &&
                    <>
                        {data?.status === "Pending" ?
                            <View className="w-full px-8 py-2">
                                <View className="my-4">
                                    <TextInput
                                        className="bg-blue-100 h-12 rounded-lg p-2"
                                        underlineColorAndroid="transparent"
                                        placeholder="Remark*"
                                        placeholderTextColor="black"
                                        value={remark}
                                        onChangeText={(e) => setRemark(e)}
                                    />
                                </View>
                                <View className="flex-row justify-between">
                                    <CustomButton
                                        title="Reject"
                                        handlePress={() => handleRequest("Rejected")}
                                        textStyles="text-white font-semibold text-sm"
                                        containerStyles="rounded-full bg-red-500 p-4 px-8"
                                        isLoading={submitting}
                                    />
                                    <CustomButton
                                        title="Approve"
                                        handlePress={() => handleRequest("Approved")}
                                        textStyles="text-white font-semibold text-sm"
                                        containerStyles="rounded-full bg-green-500 p-4 px-8"
                                        isLoading={submitting}
                                    />
                                </View>
                            </View>
                            :
                            <View className="py-8">
                                <Text className={`${data.status === "Approved" ? "text-green-500" : "text-red-500"} text-lg font-psemibold`}>{data.status}</Text>
                            </View>
                        }
                    </>
                }
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center align-center bg-black/60">
                    <View className="m-5 p-4 bg-white rounded-lg shadow-lg">
                        <Text className="text-lg font-bold mb-4">Message</Text>
                        <Text className="text-sm">{modalContent}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-5">
                            <Text className="text-center text-secondary font-bold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    )
}

export default LeaveDetail;
