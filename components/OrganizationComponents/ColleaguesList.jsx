import { useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SectionGrid } from 'react-native-super-grid';
import NotFound from '../NotFound';
import { useAuthContext } from '../../context/AuthProvider';
import Loader from '../Loader';
import Http from '../../services/httpService';

const ColleaguesList = ({ searchQuery, index, url }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const { user } = useAuthContext();

    const filteredData = useMemo(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();

            if (index === 0) {
                return data.map(section => ({
                    ...section,
                    data: section.data.filter(item => item.name.toLowerCase().includes(query))
                })).filter(section => section.data.length > 0);
            }

            if (index === 1) {
                return data.filter(section => section.title.toLowerCase().includes(query));
            }
        }

        return data;
    }, [searchQuery, data, index]);


    const getData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await Http.get(url);
            const result = await response.json();
            setData(result?.data);
        } catch (error) {
            // console.error(error);
            // setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getData();
    }, []);

    const renderList = useCallback(({ item }) => {
        const avatarExists = item?.avatar && item?.avatar?.trim() !== '';
        const nameParts = item?.name?.trim().split(' ') || [];
        const firstInitial = nameParts[0] ? nameParts[0][0] : '';
        const secondInitial = nameParts[1] ? nameParts[1][0] : '';
        const initials = `${firstInitial}${secondInitial}`.toUpperCase();

        return (
            <TouchableOpacity className="h-40 relative" key={item.user_id} onPress={() => router.push(user.id === item.user_id ? `/my-profile?profile=self&id=${item.user_id}` : `/my-profile?profile=other&id=${item.user_id}`)}>
                {avatarExists ? (
                    <Image
                        source={{ uri: item?.avatar }}
                        className="h-40 object-cover"
                        resizeMode='cover'
                    />
                ) : (
                    <View className="w-full h-40 bg-secondary justify-center items-center">
                        <Text className="text-white text-lg font-bold">{initials.toUpperCase()}</Text>
                    </View>
                )}
                <View className="px-2 py-1 absolute bg-black-100/80 w-full bottom-0">
                    <Text className="text-white text-[13px] text-center font-bold" numberOfLines={1} ellipsizeMode="tail">{item?.name}</Text>
                    <Text className="text-gray-100 text-[13px] text-center" numberOfLines={1} ellipsizeMode="tail">{item?.designation}</Text>
                </View>
            </TouchableOpacity>
        );
    }, [router, user.user_id]);

    return (
        <View className="flex-1">
            <Loader isLoading={loading} display="hide" />
            <SectionGrid
                stickySectionHeadersEnabled
                itemDimension={120}
                showsVerticalScrollIndicator={false}
                // fixed
                spacing={2}
                sections={filteredData}
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={renderList}
                initialNumToRender={100}
                // removeClippedSubviews={false}
                renderSectionHeader={({ section: { title, total } }) => (
                    <View className="px-2 py-3 bg-gray-200 dark:bg-black-100 flex-row w-full justify-between">
                        <Text className="dark:text-white font-semibold">{title}</Text>
                        <Text className="mr-2 dark:bg-black-100 dark:text-white font-semibold">{total}</Text>
                    </View>
                )}
                style={{ flex: 1 }}
                ListEmptyComponent={
                    !loading && <NotFound text={index === 0 ? 'No Colleagues Found!' : 'No Department Found!'} />
                }
            />
        </View>
    );
};

export default ColleaguesList;