import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import { router } from 'expo-router';
import LeaveView from '../../components/LeaveComponents/LeaveView';
import { useColorScheme } from 'nativewind';

const LeaveTrackerView = () => {
  const { colorScheme } = useColorScheme();

  const [currentYear, setCurrentYear] = useState(moment());
  const today = moment().format('YYYY-MM-DD');

  const handleYearChange = (direction) => {
    setCurrentYear((prevYear) => prevYear.clone().add(direction, 'year'));
  };

  return (
    <View className="dark:bg-black p-4 h-full">
      <View className=" flex-row items-center justify-between my-4 bg-white dark:bg-black-100 rounded-full shadow-2xl">
        <TouchableOpacity onPress={() => handleYearChange(-1)} className="p-2">
          <FontAwesome5 name="chevron-circle-left" size={28} color={colorScheme === "light" ? "black" : "white"} />
        </TouchableOpacity>
        <Text className="text-sm font-semibold dark:text-gray-100">
          {`01-Jan-${currentYear.format('YYYY')} to 31-Dec-${currentYear.format('YYYY')}`}
        </Text>
        <TouchableOpacity onPress={() => handleYearChange(1)} className="p-2">
          <FontAwesome5 name="chevron-circle-right" size={28} color={colorScheme === "light" ? "black" : "white"} />
        </TouchableOpacity>
      </View>
      <View className="flex-1">
        <LeaveView
          startDate={`${currentYear.format('YYYY')}-01-01`}
          endDate={`${currentYear.format('YYYY')}-12-31`}
        />
      </View>
      <TouchableOpacity
        className="absolute bottom-14 right-6 bg-blue-500 rounded-full p-4 shadow-lg"
        onPress={() => router.push(`/raise-leave-request/${today}`)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default LeaveTrackerView;
