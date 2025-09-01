import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'

const NotFound = ({ text = "No Records Found!", backButtonVisible = false }) => {
    const router = useRouter();
    const { colorScheme } = useColorScheme();

    return (
        <View className="flex-1 flex-col items-center justify-center h-full w-full my-10">
            {backButtonVisible &&
                <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4">
                    <AntDesign name="close" size={24} color={colorScheme === 'light' ? "black" : "white"} padding={10} />
                </TouchableOpacity>
            }
            <Image className="h-[200px] w-[200px]" source={require('../assets/images/not-found.png')} resizeMode='contain' />
            <Text className="my-2 font-semibold dark:text-gray-100">{text}</Text>
        </View>
    )
}

export default NotFound