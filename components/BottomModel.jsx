import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

const BottomModal = ({ visible, closeModal, option, screen, setScreen }) => {

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={closeModal}
        >
            <TouchableOpacity
                activeOpacity={1}
                style={{ flex: 6, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                onPress={closeModal}
            />
            <Pressable className="flex-1 justify-end" onPress={() => null}>
                <ScrollView className="bg-white dark:bg-black-100 rounded-t-lg p-4">
                    {option.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => { setScreen(item.screen); closeModal() }} className=" pl-5 flex-row  relative items-center" >
                            {item.screen === screen &&
                                <View className="absolute">
                                    <Feather name="check" size={20} color="green" />
                                </View>
                            }

                            <Text className="font-bold p-3 w-fit dark:text-gray-100">{item.title}</Text>
                        </TouchableOpacity>))}
                </ScrollView>
            </Pressable>
        </Modal>
    );
};

export default BottomModal;
