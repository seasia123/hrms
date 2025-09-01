
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import dayjs from 'dayjs';

const TimeTracker = () => {
  const [startDate, setStartDate] = useState(dayjs());

  const getWeekRange = (date) => {
    const start = date.startOf('week');
    const end = date.endOf('week');
    return `${start.format('DD-MMM-YYYY')} to ${end.format('DD-MMM-YYYY')}`;
  };

  const handleNextWeek = () => {
    setStartDate(startDate.add(1, 'week'));
  };

  const handlePreviousWeek = () => {
    setStartDate(startDate.subtract(1, 'week'));
  };

  return (
    <View className="flex-1">
    <View className="flex-row items-center justify-between bg-white rounded-full p-2 m-5 shadow">
      <TouchableOpacity onPress={handlePreviousWeek} className="w-7 h-7 rounded-full bg-black items-center justify-center">
        <FontAwesome name="chevron-left" size={20} color="white" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-center">{getWeekRange(startDate)}</Text>
      <TouchableOpacity onPress={handleNextWeek} className="w-7 h-7 rounded-full bg-black items-center justify-center">
        <FontAwesome name="chevron-right" size={20} color="white" />
      </TouchableOpacity>
    </View>
    </View>
  );
};

export default TimeTracker;
