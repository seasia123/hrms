import { View, Text, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Loader } from '../../components';
import moment from 'moment';
import NotFound from '../../components/NotFound';
import Http from '../../services/httpService';


const NotificationDetail = () => {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  const formatDate = (date) => {
    const notificationDate = moment(date);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');

    if (notificationDate.isSame(today, 'd')) {
      return `Today, ${notificationDate.format('h:mm A')}`;
    } else if (notificationDate.isSame(yesterday, 'd')) {
      return `Yesterday, ${notificationDate.format('h:mm A')}`;
    } else {
      return notificationDate.format('MMM D, h:mm A');
    }
  };

  const getData = async () => {
    try {
      const response = await Http.get(`/getNotiDet/${id}`);
      if (response.ok) {
        const data = await response.json();
        setData(data?.data?.[0]);
      } else {
        throw new Error('Failed to get data. Please try again.');
      }
    } catch (error) {
      // Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Loader isLoading={loading} display='hide' />
      <View className="dark:bg-black h-full">
        {(data && !loading) ?
          <View className="flex-row px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <Image source={require('../../assets/icons/bell.png')} resizeMode='contain' className="w-[40px] h-[40px] mr-4" />
            <View className="flex-1">
              <Text className="text-base dark:text-gray-100 mb-1">{data?.Title}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-100 mb-1">{data?.CreatedAt ? formatDate(data.CreatedAt) : "--"}</Text>
              <Text className="text-base dark:text-gray-100">
                {data?.Description}
              </Text>
            </View>
          </View>
          :
          <NotFound />
        }
      </View>
    </>
  )
}

export default NotificationDetail;