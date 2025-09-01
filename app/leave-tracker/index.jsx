import React from 'react'
import { SafeAreaView, View } from 'react-native';
import MenuItem from '../../components/MenuItem';


const LeaveTrackerIndex = () => {
  const items = [
    { id: 1, label: 'View', href: '/leave-tracker/view', icon: "star", color: "#EF4444" },
    { id: 2, label: 'Compensatory Request', href: '/leave-tracker/compensatoryRequest', icon: "star", color: "#EF4444" },
    { id: 3, label: 'Holidays', href: '/leave-tracker/holidays', icon: "star", color: "#EF4444" }
  ];
  return (
    <SafeAreaView className="flex-1 dark:bg-black">
      <View className="flex-1">
        {items.map((item) => (
          <View key={item.id}>
            <MenuItem item={item} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  )
}

export default LeaveTrackerIndex
