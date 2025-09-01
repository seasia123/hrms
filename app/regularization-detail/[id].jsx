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

const RegularizationDetails = () => {
  const params = useLocalSearchParams();
  const { id, approval } = params;
  const { user } = useAuthContext();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [status, setStatus] = useState("");
  const [color, setColor] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [remark, setRemark] = useState("");

  const getData = async () => {
    setLoading(true);

    const userId = await SecureStore.getItemAsync('user_id');
    const payload = new FormData();
    payload.append("user_id", userId);
    payload.append("regularize_id", id);

    try {
      const response = await Http.post("/getRegularizationDetails", payload);
      if (response.ok) {
        const data = await response.json();
        setData(data?.data?.[0]);
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

  const formatDate = (dateString) => {
    const date = moment(dateString, "YYYY-MM-DD");
    return {
      day: date.format('DD'),
      month: date.format('MMM'),
      year: date.format('YYYY')
    };
  };

  const calculateHours = (clockIn, clockOut) => {
    if (clockIn === '00:00:00' || clockOut === '00:00:00') {
      return "--:--";
    }

    const start = moment(clockIn, "HH:mm:ss");
    const end = moment(clockOut, "HH:mm:ss");
    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    return `${hours < 10 ? '0' : ''}${hours} : ${minutes < 10 ? '0' : ''}${minutes}`;
  };

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

  const formattedDate = data ? formatDate(data.attendance_date) : { day: '', month: '', year: '' };

  const handleRequest = async (action) => {
    if (!remark) {
      Alert.alert("Error", "Remark is required.");
      return;
    }

    setSubmitting(true);

    const userId = await SecureStore.getItemAsync('user_id');
    const payload = new FormData();
    payload.append("user_id", userId);
    payload.append("regularize_id", id);
    payload.append("action", action);
    payload.append("remark", remark);
    try {
      const response = await Http.post("/getApprovRejectRegRequest", payload);
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
      <ScrollView className="dark:bg-black">
        <View className="m-5 bg-white dark:bg-black-100 rounded-lg shadow-md">
          <View className="flex-row flex items-center justify-between border-b border-slate-400">
            <View className={`p-6 py-2 bg-orange-500 rounded-tl-lg flex-col item-center`}>
              <Text className='text-xl text-white'>{formattedDate.day}</Text>
              <Text className='text-sm text-white'>{formattedDate.month}</Text>
              <Text className='text-sm text-white'>{formattedDate.year}</Text>
            </View>
            <Text className={`mr-4 font-semibold text-${color}-500`}>{status}</Text>
          </View>
          <View className='flex flex-row justify-between py-8 mx-4'>
            <View className='flex-col px-4 flex-1'>
              <Text className='mb-4 text-sm font-bold dark:text-gray-100'>OLD</Text>
              <Text className='text-sm dark:text-gray-100'>First Check-In</Text>
              <Text className='mb-4 text-sm font-bold text-green-500 '>{data?.old_clock_in === '00:00:00' ? "--/--" : moment(data?.old_clock_in, "HH:mm:ss").format("hh:mm A") || "--/--"}</Text>

              <Text className='text-sm dark:text-gray-100'>Last Check-Out</Text>
              <Text className='mb-4 text-sm font-bold text-red-500 '>{data?.old_clock_out === '00:00:00' ? "--/--" : moment(data?.old_clock_out, "HH:mm:ss").format("hh:mm A") || "--/--"}</Text>

              <Text className='text-sm dark:text-gray-100'>Hours</Text>
              <Text className='mb-4 text-sm font-bold dark:text-gray-100'>{calculateHours(data?.old_clock_in, data?.old_clock_out)}</Text>
              <Text className='text-sm dark:text-gray-100'>Status</Text>
              <Text className='mb-4 text-sm font-bold dark:text-gray-100'>{data?.old_status ? data?.old_status:"--"}</Text>
             
              <TouchableOpacity onPress={() => handleReasonClick(data?.reason)}>
                <Text className='text-sm dark:text-gray-100'>Reason</Text>
                <Text className='mb-4 text-sm font-bold dark:text-gray-100' ellipsizeMode='tail' numberOfLines={2}>{data?.reason || "--"}</Text>
              </TouchableOpacity>
            </View>

            <View className='flex-col px-4 flex-1'>
              <Text className='mb-4 text-sm font-bold dark:text-gray-100'>NEW</Text>
              <Text className='text-sm dark:text-gray-100'>First Check-In</Text>
              <Text className='mb-4 text-sm font-bold text-green-500'>{data?.new_clock_in === '00:00:00' ? "--/--" : moment(data?.new_clock_in, "HH:mm:ss").format("hh:mm A") || "--/--"}</Text>
              <Text className='text-sm dark:text-gray-100'>Last Check-Out</Text>
              <Text className='mb-4 text-sm font-bold text-red-500'>{data?.new_clock_out === '00:00:00' ? "--/--" : moment(data?.new_clock_out, "HH:mm:ss").format("hh:mm A") || "--/--"}</Text>
              <Text className='text-sm dark:text-gray-100'>Hours</Text>
              <Text className='mb-4 font-bold text-sm dark:text-gray-100'>{calculateHours(data?.new_clock_in, data?.new_clock_out)}</Text>
              <Text className='text-sm dark:text-gray-100'>Status</Text>
              <Text className='mb-4 text-sm font-bold dark:text-gray-100'>{data?.new_status ? data?.new_status:"--"}</Text>
              <TouchableOpacity onPress={() => handleDescriptionClick(data?.description)}>
                <Text className='text-sm dark:text-gray-100'>Description</Text>
                <Text className='mb-4 text-sm font-bold dark:text-gray-100' ellipsizeMode='tail' numberOfLines={2}>{data?.description || "--"}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
            <TouchableOpacity onPress={() => handleAvatarClick(data?.rm_remark)}>
              <View className="absolute z-10 left-8 -bottom-1">
                {data?.rm_status === 'approved' ? <AntDesign name="checkcircle" size={16} color="#16a34a" /> : data?.rm_status === 'rejected' ? <Entypo name="circle-with-cross" size={16} color="#dc2626" /> : <MaterialCommunityIcons name="clock" size={16} color="#eab308" />}
              </View>
              <View className={`rounded-full border-2 ${data?.rm_status === 'approved' ? "border-green-600" : data?.rm_status === 'rejected' ? "border-red-600" : "border-yellow-500"}`}>
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
          {data?.skip_hr_approval === "no" &&
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
          }
        </View>
        {approval === "true" &&
          <>
            {((user?.id === data?.rm_id && data?.rm_status === "approved") ||
              (user?.id === data?.hr_id && data?.hr_status === "approved")) ?
              <View className="py-8">
                <Text className="text-green-500 text-lg font-psemibold">Approved By You</Text>
              </View>
              : (user?.id === data?.rm_id && data?.rm_status === "rejected") ||
                (user?.id === data?.hr_id && data?.hr_status === "rejected") ?
                <View className="py-8">
                  <Text className="text-red-500 text-lg font-psemibold">Rejected By You</Text>
                </View>
                :
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
                      handlePress={() => handleRequest("rejected")}
                      textStyles="text-white font-semibold text-sm"
                      containerStyles="rounded-full bg-red-500 p-4 px-8"
                      isLoading={submitting}
                    />
                    <CustomButton
                      title="Approve"
                      handlePress={() => handleRequest("approved")}
                      textStyles="text-white font-semibold text-sm"
                      containerStyles="rounded-full bg-green-500 p-4 px-8"
                      isLoading={submitting}
                    />
                  </View>
                </View>}

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

export default RegularizationDetails;
