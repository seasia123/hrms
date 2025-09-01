import { View, Text, Image } from 'react-native'
import React from 'react'

const Wip = ({ containerStyles }) => {
    return (
        <View className={`flex-col items-center justify-center h-full w-full ${containerStyles}`}>
            <Image className="h-[200px] w-[200px]" source={require('../assets/icons/process.png')} resizeMode='contain' />
            <Text className="my-2 font-semibold text-gray-100">WIP</Text>
        </View>
    )
}

export default Wip