import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import Http from '../../services/httpService';
import { colors } from '../../data/colors';
import moment from 'moment';
import { useColorScheme } from 'nativewind';
import NotFound from '../../components/NotFound';

const Holidays = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colorScheme } = useColorScheme();

  const getData = async () => {
    setLoading(true);
    try {
      const response = await Http.get('/getHoliday');
      const result = await response.json();
      setData(result?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData();
  }, []);

  const renderItem = ({ item, index }) => {
    const titleWords = item.occasion.replace(/[()]/g, '').split(' ');
    let initials = '';
    if (titleWords.length > 1) {
      initials = titleWords[0][0] + titleWords[1][0];
    } else {
      initials = titleWords[0].slice(0, 2);
    }

    return (
      <View>
       {index > 0 && moment(data[index - 1].start_date).isBefore(moment(), 'day') && moment(item.start_date).isSameOrAfter(moment(), 'day') && (
          <View className="flex-row items-center justify-center">
            <View className="flex-1 h-[1px] bg-gray-400" />
            <Text className="mx-4 text-lg font-bold text-gray-400">Upcoming</Text>
            <View className="flex-1 h-[1px] bg-gray-400" />
          </View>
        )}
        <View className="flex-row items-center p-2 mb-2">
          <View style={{ backgroundColor: colors[index % colors.length] }} className="w-[50px] h-[50px] items-center justify-center rounded-full mr-4">
            <Text className="text-white">
              {initials.toUpperCase()}
            </Text>
          </View>
          <View className="flex-col">
            <Text className="text-base mb-1 dark:text-gray-100 font-semibold" numberOfLines={1} ellipsizeMode="tail">{item.occasion}</Text>
            <Text className="text-gray-500 dark:text-gray-100">{moment(item.start_date).format('ddd, DD MMM YYYY')}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFF' : '#000000'} className="m-4" />
      </View>
    );
  }

  return (
    <View className="dark:bg-black h-full">
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0000ff']}
          />
        }
        contentContainerStyle={{
          padding: 16,
        }}
        ListEmptyComponent={
          !loading && <NotFound text='No Holiday Found!' />
        }
      />
    </View>
  );
};

export default Holidays;
