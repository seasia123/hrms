import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import moment from 'moment';
import Http from '../../services/httpService';
import { colors } from '../../data/colors';
import { useColorScheme } from 'nativewind';

const UpcomingHolidaysCard = forwardRef((props, ref) => {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const { colorScheme } = useColorScheme();

    useImperativeHandle(ref, () => ({
        getData,
    }));

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    const displayedItems = expanded ? data : data.slice(0, 3);

    const getData = async () => {
        setLoading(true);
        try {
            const response = await Http.get('/getHoliday');
            const result = await response.json();
            const today = moment().startOf('day');
            const filteredData = result?.data.filter(item => moment(item.start_date, 'YYYY-M-D').isSameOrAfter(today));
            setData(filteredData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, [])


    return (
        <View className="mb-6 bg-white dark:bg-black-100 p-4 rounded-xl shadow-md w-full max-w-sm mx-auto">
            <View className="m-4 flex flex-row">
                <Image source={require('../../assets/icons/parasol.png')} className='w-12 h-12 shadow-lg ' />
                <Text className="ml-8 mt-4 text-xl font-bold dark:text-gray-100">Upcoming Holidays</Text>
            </View>
            <View>
                {loading ? (
                    <ActivityIndicator size="large" color={colorScheme === 'light' ? "#1B1656" : "white"} className="m-4" />
                ) : (
                    <>
                        {data?.length === 0 && <Text className="text-center dark:text-gray-100 text-gray-400 font-psemibold p-6">No Holiday Found!</Text>}
                        {displayedItems.map((item, index) => {
                            const titleWords = item.occasion.replace(/[()]/g, '').split(' ');
                            let initials = '';
                            if (titleWords.length > 1) {
                                initials = titleWords[0][0] + titleWords[1][0];
                            } else {
                                initials = titleWords[0].slice(0, 2);
                            }

                            return (
                                <View key={index} className="flex-row items-center p-2 mb-2">
                                    <View style={{ backgroundColor: colors[index] }} className="w-[50px] h-[50px] items-center justify-center rounded-full mr-4">
                                        <Text className="text-white">
                                            {initials.toUpperCase()}
                                        </Text>
                                    </View>
                                    <View className="flex-col">
                                        <Text className="text-base mb-1 dark:text-gray-100">{item.occasion}</Text>
                                        <Text className="text-gray-500 dark:text-gray-100">{moment(item.start_date).format('ddd, DD MMM YYYY')}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}
            </View>
            {data.length > 3 && (
                <TouchableOpacity onPress={handleToggle} className="p-2 px-4 bg-blue-100 rounded-full" style={{ alignSelf: 'center' }}>
                    <Text className="text-center font-psemibold">
                        {expanded ? 'Collapse' : `View ${data.length - 3} More`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
})

export default UpcomingHolidaysCard;

