import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';


const WeekSelector = ({ currentWeek, onPrevWeek, onNextWeek }) => {
  const { colorScheme } = useColorScheme();
  const formattedWeek = `${currentWeek.startOf('week').format('DD-MMM-YYYY')} to ${currentWeek.endOf('week').format('DD-MMM-YYYY')}`;
  return (
    <View className="flex-row items-center justify-between mb-4 bg-white dark:bg-black-100 rounded-full shadow-2xl">
      <TouchableOpacity onPress={onPrevWeek} className=" p-2 ">
        <FontAwesome5 name="chevron-circle-left" size={28} color={colorScheme === "light" ? "black" : "white"} />
      </TouchableOpacity>
      <Text className="text-sm font-semibold dark:text-gray-100">{formattedWeek}</Text>
      <TouchableOpacity onPress={onNextWeek} className=" p-2 ">
        <FontAwesome5 name="chevron-circle-right" size={28} color={colorScheme === "light" ? "black" : "white"} />
      </TouchableOpacity>
    </View>
  );
};

export default WeekSelector;
