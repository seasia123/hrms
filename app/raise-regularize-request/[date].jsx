import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import moment from 'moment';
import { Dropdown } from 'react-native-element-dropdown';
import { useAuthContext } from '../../context/AuthProvider';
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import Http from '../../services/httpService';
import { CustomButton, Loader } from '../../components';

const RaiseRegRequest = React.memo((props) => {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const { date: initialDate } = useLocalSearchParams();
    const { user } = useAuthContext();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [date, setDate] = useState(initialDate ? moment(initialDate, 'DD-MM-YYYY').toDate() : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCheckInTimePicker, setShowCheckInTimePicker] = useState(false);
    const [showCheckOutTimePicker, setShowCheckOutTimePicker] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [totalHours, setTotalHours] = useState(null);
    const [reason, setReason] = useState('');
    const [desc, setDesc] = useState("");
    const [data, setData] = useState();
    const [reasons, setReasons] = useState([]);
    const [dropdownLoading, setDropdownLoading] = useState(true);

    const getReasons = async () => {
        try {
            const response = await Http.get("/getRegulariseReason");
            if (response.ok) {
                const data = await response.json();
                setReasons(data.data.map(item => ({ label: item, value: item })));
                setDropdownLoading(false);
            } else {
                throw new Error('Failed to fetch reasons. Please try again.');
            }
        } catch (error) {
            conseole.error("Error", error.message);
            setDropdownLoading(false);
        }
    };


    const getDateData = async () => {
        setLoading(true);
        const parsedDate = moment(date, 'DD-MM-YYYY');
        const formattedDate = parsedDate.format('YYYY-MM-DD');

        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);
        payload.append("checkin_date", formattedDate);

        try {
            const response = await Http.post("/getRegulariseDate", payload);
            if (response.ok) {
                const data = await response.json();
                setCheckInTime(data?.data?.[0]?.clock_in ? data?.data?.[0]?.clock_in === "00:00:00" ? null : moment(data?.data?.[0]?.clock_in, "HH:mm:ss").format("hh:mm A") : null);
                setCheckOutTime(data?.data?.[0]?.clock_out ? data?.data?.[0]?.clock_out === "00:00:00" ? null : moment(data?.data?.[0]?.clock_out, "HH:mm:ss").format("hh:mm A") : null);
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
        if (date) {
            getDateData();
        }
    }, [date]);

    useEffect(() => {
        getReasons();
    }, []);

    const handleConfirmDate = (selectedDate) => {
        const currentDate = selectedDate || date;
        if (moment(currentDate).isAfter(moment())) {
            Alert.alert("Error", "Selected date cannot be in the future.");
            setShowDatePicker(false);
            return;
        }
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setShowDatePicker(false);
    };

    const handleConfirmIntime = (selectedTime) => {
        const selectedCheckInTime = moment(selectedTime).format('hh:mm A');
        if (checkOutTime && moment(selectedCheckInTime, 'hh:mm A').isAfter(moment(checkOutTime, 'hh:mm A'))) {
            Alert.alert("Error", "Check-in time cannot be after check-out time.");
            setShowCheckInTimePicker(Platform.OS === 'ios');
            setShowCheckInTimePicker(false);
            return;
        }
        setCheckInTime(selectedCheckInTime);
        setShowCheckInTimePicker(Platform.OS === 'ios');
        setShowCheckInTimePicker(false);
    };

    const handleConfirmOuttime = (selectedTime) => {
        const selectedCheckOutTime = moment(selectedTime).format('hh:mm A');
        if (moment(selectedCheckOutTime, 'hh:mm A').isBefore(moment(checkInTime, 'hh:mm A'))) {
            Alert.alert("Error", "Check-out time cannot be before check-in time.");
            setShowCheckOutTimePicker(Platform.OS === 'ios');
            setShowCheckOutTimePicker(false);
            return;
        }
        setCheckOutTime(selectedCheckOutTime);
        setShowCheckOutTimePicker(Platform.OS === 'ios');
        setShowCheckOutTimePicker(false);
    };

    const calculateTotalHours = (checkIn, checkOut) => {
        if (checkIn && checkOut) {
            const diffMilliseconds = moment(checkOut, 'hh:mm A').diff(moment(checkIn, 'hh:mm A'));
            const diffDuration = moment.duration(diffMilliseconds);
            const hours = Math.floor(diffDuration.asHours());
            const minutes = diffDuration.minutes();
            const formattedHours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            setTotalHours(formattedHours);
        } else {
            setTotalHours(null);
        }
    };

    useEffect(() => {
        calculateTotalHours(checkInTime, checkOutTime);
    }, [checkInTime, checkOutTime]);

    const handleSubmit = async () => {
        if (!checkInTime || !checkOutTime || !reason) {
            Alert.alert("Error", "Please fill all the fields.");
            return;
        }

        setSubmitting(true);
        const userId = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId);
        payload.append("attendence_id", data?.attendence_id ? data?.attendence_id : 0);
        payload.append("checkin_date", moment(date).format('YYYY-MM-DD'));
        payload.append("checkin_new", moment(checkInTime, "hh:mm A").format("HH:mm:ss"));
        payload.append("checkout_new", moment(checkOutTime, "hh:mm A").format("HH:mm:ss"));
        payload.append("reason", reason);
        payload.append("description", desc);
        try {
            const response = await Http.post("/addRegulariseRequest", payload);
            if (response.ok) {
                Alert.alert("Success", "Request raised successfully.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                throw new Error('Failed to submit request. Please try again.');
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = item => {
        return (
            <View className="flex-row items-center p-4 justify-between bg-white dark:bg-black-100">
                <Text className="ml-4 dark:text-gray-100 text-[14px]" style={{ fontWeight: item.value === reason ? "600" : "400" }}>{item.label}</Text>
                {item.value === reason && (
                    <AntDesign
                        color={colorScheme === 'light' ? "blue" : "white"}
                        name="check"
                        size={20}
                    />
                )}
            </View>
        );
    };

    return (
        <>
            <Loader isLoading={loading} />
            <ScrollView className="flex-1 p-4 dark:bg-black">
                <View className="mb-8">
                    <Text className="font-semibold dark:text-gray-100">Employee</Text>
                    <Text className="text-black dark:text-gray-100">{user.name}</Text>
                </View>
                <TouchableOpacity className="mb-9 flex-row items-center justify-between" onPress={() => setShowDatePicker(true)}>
                    <View>
                        <Text className="font-semibold dark:text-gray-100">Date</Text>
                        <Text className="dark:text-gray-100">{moment(date).format('DD-MM-YYYY')}</Text>
                    </View>
                    <Entypo name="chevron-small-right" size={24} color="black" />
                </TouchableOpacity>
                <View className="p-4 bg-white dark:bg-black-100 rounded-xl">
                    <View className="flex-row justify-between">
                        <View className="mb-4">
                            <TouchableOpacity onPress={() => setShowCheckInTimePicker(true)}>
                                <Text className="font-semibold text-green-400">Clock In</Text>
                                <Text className="dark:text-gray-100">{checkInTime ? checkInTime : '--/--'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="mb-4">
                            <TouchableOpacity onPress={() => setShowCheckOutTimePicker(true)}>
                                <Text className="font-semibold text-red-400">Clock Out</Text>
                                <Text className="dark:text-gray-100">{checkOutTime ? checkOutTime : '--/--'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="mb-4">
                            <View className="items-center">
                                <Text className="font-semibold dark:text-gray-100">{totalHours ? totalHours : '00:00'}</Text>
                                <Text className="dark:text-gray-100">Hrs</Text>
                            </View>
                        </View>
                    </View>
                    <View>
                        {dropdownLoading ? (
                            <View className="h-10 border rounded-full p-2 mb-4 border-gray-50 bg-blue-100">
                                <ActivityIndicator size="small" color={colorScheme === 'light' ? "#0000ff" : "white"} />
                            </View>
                        ) : (
                            <Dropdown
                                mode="modal"
                                className="h-10 border rounded-full p-2 mb-4 border-gray-50 bg-blue-100"
                                placeholderStyle="text-base text-gray-100"
                                selectedTextStyle="text-base"
                                inputSearchStyle="h-10 rounded-full text-base"
                                iconStyle="w-5 h-5"
                                data={reasons}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder="Select reason*"
                                searchPlaceholder="Search..."
                                value={reason}
                                onChange={(item) => {
                                    setReason(item.value);
                                }}
                                renderLeftIcon={() => (
                                    <AntDesign style={{ marginRight: 6 }} color="black" name="Safety" size={20} />
                                )}
                                renderItem={renderItem}
                            />
                        )}
                        <TextInput
                            className="bg-blue-100 h-16 rounded-lg p-2"
                            underlineColorAndroid="transparent"
                            placeholder="Description"
                            placeholderTextColor="black"
                            numberOfLines={10}
                            multiline={true}
                            value={desc}
                            onChangeText={(e) => setDesc(e)}
                        />
                    </View>
                </View>
            </ScrollView>

            <View>
                <View className="flex-row justify-around bg-white dark:bg-black-100 p-8">
                    <TouchableOpacity className="p-4 px-8 bg-red-500 rounded-full" onPress={() => router.back()}>
                        <Text className="text-white font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <CustomButton
                        title="Submit"
                        handlePress={handleSubmit}
                        textStyles="text-white font-semibold text-sm"
                        containerStyles="rounded-full bg-green-500 p-4 px-8"
                        isLoading={submitting}
                    />
                </View>
            </View>
            {Platform.OS === 'ios' ? (
                <>
                    <DateTimePickerModal
                        isVisible={showDatePicker}
                        mode="date"
                        onConfirm={handleConfirmDate}
                        onCancel={() => setShowDatePicker(false)}

                    />
                    <DateTimePickerModal
                        isVisible={showCheckInTimePicker}
                        mode="time"
                        date={checkInTime ? moment(checkInTime, 'hh:mm A').toDate() : new Date()}
                        onConfirm={handleConfirmIntime}
                        onCancel={() => setShowCheckInTimePicker(false)}
                    />
                    <DateTimePickerModal
                        isVisible={showCheckOutTimePicker}
                        mode="time"
                        date={checkOutTime ? moment(checkOutTime, 'hh:mm A').toDate() : new Date()}
                        onConfirm={handleConfirmOuttime}
                        onCancel={() => setShowCheckOutTimePicker(false)}
                    />
                </>
            ) : (
                <>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                handleConfirmDate(selectedDate);
                            }}
                        />
                    )}
                    {showCheckInTimePicker && (
                        <DateTimePicker
                            //value={date}
                            value={checkInTime ? moment(checkInTime, 'hh:mm A').toDate() : new Date()}
                            mode="time"
                            display="default"

                            onChange={(event, selectedTime) => {
                                if (event.type === 'set') {
                                    handleConfirmIntime(selectedTime);
                                }
                                setShowCheckInTimePicker(false);
                            }}
                        />
                    )}
                    {showCheckOutTimePicker && (
                        <DateTimePicker

                            value={checkOutTime ? moment(checkOutTime, 'hh:mm A').toDate() : new Date()}
                            mode="time"
                            display="default"

                            onChange={(event, selectedTime) => {
                                if (event.type === 'set') {

                                    handleConfirmOuttime(selectedTime);
                                }
                                setShowCheckOutTimePicker(false);
                            }}
                        />
                    )}
                </>
            )}
        </>
    );
});

export default RaiseRegRequest;
