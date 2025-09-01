import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import WeekSelector from '../WeekSelector';
import ProgressBar from '../ProgressBar';
import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import DetailModal from './DetailModal';
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import Http from '../../services/httpService';

const AttendanceWeekView = ({ enableScroll = true, userId }) => {
    const { colorScheme } = useColorScheme();
    const [totalHrs, setTotalHrs] = useState("");
    const [data, setData] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(moment());
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState();

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchWeekData();
    }, [currentWeek]);


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

    const transformData = (data, weekStart) => {
        const weekData = [];
        for (let i = 0; i < 7; i++) {
            const date = moment(weekStart).add(i, 'days').format('YYYY-MM-DD');
            weekData.push({
                date,
                status: "",
                statusText: '',
                timeWorked: '00:00',
                signin_long_lat_address: null,
                signout_long_lat_address: null,
                inTime: null,
                outTime: null
            });
        }

        Object.keys(data).forEach(date => {
            const events = data[date];
            const statuses = events.map(event => event.type);
            const title = events.map(event => event.title);
            const statusText = title.join(", ");
            const attendanceTimes = events.filter(event => event.type === 'attendence').map(event => event.description);
            const signinLongLatAddress = events.find(event => event.signin_long_lat_addess)?.signin_long_lat_addess || null;
            const signoutLongLatAddress = events.find(event => event.signout_long_lat_addess)?.signout_long_lat_addess || null;
            const checkInTime = events.filter((event) => event.type === 'attendence' || event.type === 'absent').map((event) => event.checkInTime);
            const checkOutTime = events.filter((event) => event.type === 'attendence').map((event) => event.checkOutTime);
            const dayData = weekData.find(d => d.date === date);

            if (dayData) {
                dayData.status = statuses.join(",");
                dayData.statusText = statusText;
                dayData.timeWorked = sumTimes(attendanceTimes);
                dayData.inTime = checkInTime?.[0];
                dayData.outTime = checkOutTime?.[0];
                dayData.signin_long_lat_address = signinLongLatAddress;
                dayData.signout_long_lat_address = signoutLongLatAddress;
            }
        });

        return weekData;
    };

    const fetchWeekData = async () => {
        setLoading(true);
        const formattedStart = currentWeek.startOf('week').format('YYYY-MM-DD');
        const formattedEnd = currentWeek.endOf('week').format('YYYY-MM-DD');

        const user_Id = await SecureStore.getItemAsync('user_id');
        const payload = new FormData();
        payload.append("user_id", userId ? userId : user_Id);
        payload.append("start", formattedStart);
        payload.append("end", formattedEnd);

        try {
            const response = await Http.post("/getCalenders", payload);
            if (response.ok) {
                const data = await response.json();
                const transformedData = transformData(data, formattedStart);
                setData(transformedData);
                setTotalHrs(calculateTotalHours(transformedData));
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

    useEffect(() => {
        fetchWeekData();
    }, [currentWeek]);

    const handlePrevWeek = () => {
        setCurrentWeek(prevWeek => moment(prevWeek).subtract(1, 'weeks').startOf('week'));
    };

    const handleNextWeek = () => {
        setCurrentWeek(prevWeek => moment(prevWeek).add(1, 'weeks').startOf('week'));
    };

    const renderItem = ({ item, index }) => {
        const isToday = moment().isSame(item.date, 'day');

        return (
            <TouchableOpacity onPress={() => openDetailsModal(item)} className="p-2">
                {index === 0 && <Text style={{ right: 20 }} className="absolute text-xs text-gray-500 dark:text-gray-100">Hrs</Text>}
                <View className="absolute top-1 w-full flex justify-center items-center">
                    <View style={{ width: "75%" }} className="flex-1 justify-center item-center">
                        <Text className="text-xs text-center text-gray-500 dark:text-gray-100" numberOfLines={1} ellipsizeMode="tail">{item.statusText}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between items-center py-1">
                    <View className="flex-col items-center justify-center">
                        <Text className={`text-xs dark:text-gray-100 ${isToday ? "text-teal-400" : ""}`}>{moment(item.date).format('ddd')}</Text>
                        <Text className={`text-base font-semibold dark:text-gray-100 ${isToday ? "text-teal-400" : ""}`}>{moment(item.date).format('DD')}</Text>
                    </View>
                    <ProgressBar workTime={item.timeWorked} status={item.status} />
                    <Text className="text-base dark:text-gray-100">{item.timeWorked}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    const openDetailsModal = (data) => {
        setModalData(data);
       
        setModalVisible(true);
    };

    return (
        <>
            <View className="flex-1 p-4 pb-0">
                <WeekSelector
                    currentWeek={currentWeek}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                />
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={colorScheme === 'light' ? "#0000ff" : "white"} />
                    </View>
                ) : (
                    <FlatList
                        scrollEnabled={enableScroll}
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={item => item.date}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    />
                )}
            </View>
            <DetailModal onClose={() => setModalVisible(false)} open={modalVisible} data={modalData} />
            
            <View className="items-center py-5 bg-white dark:bg-black-100 flex-row justify-center">
                <FontAwesome5 name="clock" size={24} color="gray" />
                <Text className="text-gray-800 font-semibold ml-4 dark:text-gray-100">Total Hours: {totalHrs ? totalHrs : "00:00"} HRS</Text>
            </View>
        </>
    );
};

export default AttendanceWeekView;
