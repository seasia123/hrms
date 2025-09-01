import { View, Text, Image, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native'
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import Http from '../../services/httpService';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

const BirthdaysCard = forwardRef((props, ref) => {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const { colorScheme } = useColorScheme();
    const router = useRouter();

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
            const response = await Http.get(`/getBirthday`)
            const result = await response.json();
            setData(result?.data?.birthday);
        } catch (error) {
            // setError(error);
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
                <Image source={require('../../assets/icons/cake.png')} className='w-12 h-12 shadow-lg ' />
                <Text className="ml-8 mt-4 text-xl font-bold dark:text-gray-100">Birthday</Text>
            </View>
            <View>
                {loading ? (
                    <ActivityIndicator size="large" color={colorScheme === 'light' ? "#1B1656" : "white"} className="m-4" />
                ) : (
                    <>
                        {!data.length && (
                            <Text className="text-center text-gray-400 font-semibold p-6 dark:text-gray-100">No Birthdays today!</Text>
                        )}
                        {displayedItems.map((item, index) => (
                            <Pressable key={index} className="flex-row items-center p-2"
                                onPress={() => router.push(`/my-profile?profile=other&id=${item.user_id}`)}
                            >
                                <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full mr-4" />
                                <View className="flex-col">
                                    <Text className="font-semibold text-lg mr-2 dark:text-gray-100">{item.name}</Text>
                                    <Text className="text-gray-500 dark:text-gray-100">{item.deptName}</Text>
                                </View>
                            </Pressable>
                        ))}
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

export default BirthdaysCard