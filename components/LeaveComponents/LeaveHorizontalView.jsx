import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native'
import React, { useState } from 'react'
import { LeavesMockData } from '../../data/LeavesMockData'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const LeaveHorizontalView = ({ data }) => {
    const [open, setOpen] = useState(false);
    const [leaveDialogData, setLeaveDialogData] = useState(null);

    const openDialog = (item) => {
        setLeaveDialogData(item);
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setLeaveDialogData(null);
    };

    return (
        <>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    gap: 10,
                    paddingVertical: 10,
                    marginBottom: 10,
                }}
                style={{ maxHeight: 135 }}
                className="p-2"
            >
                {data.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => openDialog(item)} className="w-[135px] h-[100px] rounded-md p-2 bg-white dark:bg-black-100">
                        <View className="flex-row items-center p-1 gap-1 mb-2">
                            <MaterialCommunityIcons name={item.icon} size={22} color={item.color} className="flex-shrink" />
                            <Text ellipsizeMode="tail" numberOfLines={1} className="text-[12px] font-semibold dark:text-gray-100 flex-1">
                                {item.title}
                            </Text>
                        </View>
                        <View className="flex-row gap-1 p-1 justify-between">
                            {item.balance !== null && (
                                <View>
                                    <Text className="text-green-600 font-bold text-[16px]">{item.balance}</Text>
                                    <Text className="text-[12px] dark:text-gray-100">Balance</Text>
                                </View>
                            )}
                            <View>
                                <Text className="text-red-600 font-bold text-[16px]">{item.taken}</Text>
                                <Text className="text-[12px] dark:text-gray-100">Booked</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Modal
                transparent={true}
                visible={open}
                animationType="slide"
                onRequestClose={onClose}
            >
                {leaveDialogData && (
                    <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
                        <View className="bg-white dark:bg-black-100 p-4 rounded-t-lg w-full">
                            <Text className="text-center font-semibold text-lg dark:text-gray-100 mb-6">
                                {leaveDialogData.title}
                            </Text>
                            {leaveDialogData.balance !== null && (
                                <View className="flex-row w-full justify-between mb-4">
                                    <Text className="dark:text-gray-100">Balance</Text>
                                    <Text className="font-semibold dark:text-gray-100">{leaveDialogData.balance}</Text>
                                </View>
                            )}
                            <View className="flex-row w-full justify-between mb-2">
                                <Text className="dark:text-gray-100">Booked</Text>
                                <Text className="font-semibold dark:text-gray-100">{leaveDialogData.taken}</Text>
                            </View>
                        </View>
                    </Pressable>
                )}
            </Modal>
        </>
    )
}

export default LeaveHorizontalView