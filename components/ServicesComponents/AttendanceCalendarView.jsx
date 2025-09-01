import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import DetailModal from './DetailModal';
import { useColorScheme } from 'nativewind';
import Http from '../../services/httpService';
import * as SecureStore from 'expo-secure-store';

const AttendanceCalendarView = ({ userId }) => {
    const { colorScheme } = useColorScheme();
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [data, setData] = useState([]);
    const [totalHrs, setTotalHrs] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState();

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCalendarData(currentMonth);
    }, [currentMonth]);

    useEffect(() => {
        fetchCalendarData(currentMonth);
    }, [currentMonth]);

    const sumTimes = (times) => {
        let totalMinutes = 0;

        times.forEach((time) => {
            const [hours, minutes, seconds = 0] = time.split(':').map(parseFloat);
            totalMinutes += hours * 60 + minutes + (seconds / 60);
        });

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = Math.floor(totalMinutes % 60);

        return `${String(totalHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
    };

    const calculateTotalHours = (data) => {
        let totalMinutes = 0;

        data.forEach(item => {
            if (item.timeWorked !== "00:00") {
                const [hours, minutes] = item.timeWorked.split(':').map(parseFloat);
                totalMinutes += hours * 60 + minutes;
            }
        });

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = Math.floor(totalMinutes % 60);

        return `${String(totalHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
    };

    const transformData = (data) => {
        return Object.keys(data).map((date) => {
            const events = data[date];
            const statuses = events.map((event) => event.type);
            const title = events.map((event) => event.title);
            const statusText = title.join(", ");
            const attendanceTimes = events.filter((event) => event.type === 'attendence').map((event) => event.description);
            const signinLongLatAddress = events.find(event => event.signin_long_lat_addess)?.signin_long_lat_addess || null;
            const signoutLongLatAddress = events.find(event => event.signout_long_lat_addess)?.signout_long_lat_addess || null;
            const checkInTime = events.filter((event) => event.type === 'attendence').map((event) => event.checkInTime);
            const checkOutTime = events.filter((event) => event.type === 'attendence').map((event) => event.checkOutTime);

            return {
                date,
                status: statuses,
                statusText,
                timeWorked: sumTimes(attendanceTimes),
                inTime: checkInTime?.[0],
                outTime: checkOutTime?.[0],
                signin_long_lat_address: signinLongLatAddress,
                signout_long_lat_address: signoutLongLatAddress
            };
        });
    };

    const fetchCalendarData = async (month) => {
        setLoading(true);
        const startOfMonth = month.clone().startOf('month');
        const endOfMonth = month.clone().endOf('month');
        const user_Id = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId ? userId : user_Id);
        payload.append("start", moment(startOfMonth).format("YYYY-MM-DD"));
        payload.append("end", moment(endOfMonth).format("YYYY-MM-DD"));

        try {
            const response = await Http.post("/getCalenders", payload);
            if (response.ok) {
                const data = await response.json();
                // console.log(data);
                const transformedData = transformData(data);
                setData(transformedData);
                setTotalHrs(calculateTotalHours(transformedData));
                generateDaysInMonth(month);
            } else {
                throw new Error('Failed to get data. Please try again.');
            }
        } catch (error) {
            // Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const generateDaysInMonth = (month) => {
        const startOfMonth = month.clone().startOf('month');
        const endOfMonth = month.clone().endOf('month');

        const days = [];

        for (let i = 0; i < startOfMonth.day(); i++) {
            days.push(null);
        }

        for (let day = startOfMonth; day.isBefore(endOfMonth) || day.isSame(endOfMonth, 'day'); day.add(1, 'day')) {
            days.push(moment(day));
        }

        while (days.length % 7 !== 0) {
            days.push(null);
        }

        setDaysInMonth(days);
    };

    const handleMonthChange = (direction) => {
        setCurrentMonth((prevMonth) => prevMonth.clone().add(direction, 'month'));
    };

    const openDetailsModal = (data) => {
        setModalData(data);
        setModalVisible(true);
    };

    const getBarColor = (statuses) => {
        return statuses.map((status) => {
            switch (status) {
                case "weekend":
                    return "#fbbf24";
                case "attendence":
                    return "#22c55e";
                case "holiday":
                    return "#0ea5e9";
                case "absent":
                    return "#ef4444";
                case "leave":
                    return "#f97316";
                case "latemark":
                    return "latemark";
                // default:
                //     return "#000000"; // Default color for unknown statuses
            }
        });
    };

    const renderDay = (day, index) => {
        if (!day) {
            return <View key={index} className="w-[14.28%] h-20 p-2" />;
        }
        const dayData = data.find(item => moment(item.date).isSame(day, 'day'));
        const isToday = moment().isSame(day, 'day');
        return (
            <TouchableOpacity key={day.format('DD-MM-YYYY')} className="w-[14.28%] h-20 items-center justify-center p-2 border border-gray-200 dark:border-slate-800" onPress={() => openDetailsModal(dayData)}>
                {dayData?.status?.includes("latemark") && <View className="absolute top-0 right-0 w-0 h-0 border-r-[20px] border-b-[20px] border-transparent" style={{ borderRightColor: '#facc15' }} />}
                <Text className={`text-base font-semibold dark:text-gray-100 ${isToday ? "text-teal-400" : ""}`}>{day.date()}</Text>
                {dayData && (
                    <View className="flex-row items-center absolute bottom-2">
                        {getBarColor(dayData?.status).map((color, idx) => (
                            //Here We hide the latemark event Dot
                            color !== "latemark" &&
                            <View
                                key={idx}
                                className="w-2 h-2 rounded-full mt-1 mr-1 opacity-50 dark:opacity-100"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <Text className="text-[10px] mt-1 text-gray-600 dark:text-gray-100">{dayData.timeWorked === "00:00" ? "" : dayData.timeWorked}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <>
            <View className="m-4 flex-row items-center justify-between my-4 bg-white dark:bg-black-100 rounded-full shadow-2xl">
                <TouchableOpacity onPress={() => handleMonthChange(-1)} className="p-2">
                    <FontAwesome5 name="chevron-circle-left" size={28} color={colorScheme === "light" ? "black" : "white"} />
                </TouchableOpacity>
                <Text className="text-sm font-semibold dark:text-gray-100">{currentMonth.format('MMMM YYYY')}</Text>
                <TouchableOpacity onPress={() => handleMonthChange(1)} className="p-2">
                    <FontAwesome5 name="chevron-circle-right" size={28} color={colorScheme === "light" ? "black" : "white"} />
                </TouchableOpacity>
            </View>
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={colorScheme === 'light' ? "#0000ff" : "white"} />
                </View>
            ) : (
                <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    <View className="flex-row mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                            <Text key={index} className="flex-1 text-center dark:text-gray-100">{day}</Text>
                        ))}
                    </View>
                    <ScrollView>
                        <View className="flex-wrap flex-row">
                            {daysInMonth.map((day, index) => renderDay(day, index))}
                        </View>
                    </ScrollView>
                </ScrollView>
            )}
            <DetailModal onClose={() => setModalVisible(false)} open={modalVisible} data={modalData} />
            <View className="items-center py-5 bg-white dark:bg-black-100 flex-row justify-center">
                <FontAwesome5 name="clock" size={24} color="gray" />
                <Text className="text-gray-800 font-semibold ml-4 dark:text-gray-100">Total Hours: {totalHrs ? totalHrs : "00:00"} HRS</Text>
            </View>
        </>
    );
};

export default AttendanceCalendarView;
