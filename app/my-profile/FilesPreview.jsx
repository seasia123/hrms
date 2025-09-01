
import { View, Text, Image } from 'react-native'
import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
 



const FilesPreview = () => {


  return (
    <View className="container">
      <View className="flex-row p-3 items-center space-x-2">

        <FontAwesome name="folder" size={24} color="black" />
        <Ionicons name="caret-forward-sharp" size={15} color="black" />
        <Text className="text-cyan-700 border-s-4">May 2024 Payslips</Text>

      </View>
      <View className='bg-gray-700  h-0.5 p-15'></View>

     

    </View> 
  )
}

export default FilesPreview