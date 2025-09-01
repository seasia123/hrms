import { View, Text, SectionList, Image, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from 'nativewind';
import Wip from '../../components/Wip';






const DATA = [
  {
    title: 'Project Manager-Technology',
    data: [
      {
        'status': '1',
        'name': 'Rajesh Kumar',
        'employeeid': '1049',
        'mobileno': '9967844833'
      }
    ]
  }, {
    title: 'Deputy Manager-Android Devloper',
    data: [
      {
        'status': '1',
        'name': 'Pravin Diti',
        'employeeid': '1075',
        'mobileno': '9975173610'
      }
    ]
  },
  {
    title: 'Lead-PHP Devloper',
    data: [
      {
        'status': '1',
        'name': 'Adity Kokate',
        'employeeid': '1120',
        'mobileno': '8080192355'
      }, {
        'status': '1',
        'name': 'Prashant Patil',
        'employeeid': '1159',
        'mobileno': '8668742625'
      }
    ],

  }, {
    title: 'React JS Devloper',
    data: [
      {
        'status': '1',
        'name': 'Amrit Gupta',
        'employeeid': '1132',
        'mobileno': '7017114412'
      }, {
        'status': '1',
        'name': 'Kamendar Gangwar',
        'employeeid': '1160',
        'mobileno': '7017114412'
      }
    ]
  }, {
    title: 'IOS Devloper',
    data: [
      {
        'status': '1',
        'name': 'Navnath Memane',
        'employeeid': '1130',
        'mobileno': '9820116739'
      }
    ]
  }, {
    title: 'Android Devloper',
    data: [
      {
        'status': '1',
        'name': 'Vijay Bhagare',
        'employeeid': '1164',
        'mobileno': '8766598670'
      }
    ]
  }, {
    title: 'DevOps Engineer',
    data: [
      {
        'status': '2',
        'name': 'Shubham Singh',
        'employeeid': '1163',
        'mobileno': '8879385982'
      }
    ]
  }, {
    title: 'Advisor - Technology',
    data: [
      {
        'status': '3',
        'name': 'Uttam Mane',
        'employeeid': '1083',
        'mobileno': '0000000000'
      }
    ]
  }

];



const statusValue = (status) => {
  switch (status) {
    case '1':
      return 'In';
    case '2':
      return 'Out';
    case '3':
      return 'Present(by default)';
    default:
      return 'Unknown';
  }
};


const handleDialPress = (phoneNumber) => {
  Linking.openURL(`tel:${phoneNumber}`);
};



const Team = () => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1">
      <Wip containerStyles="h-64" />
      {/* <SectionList className="ml-5"
        scrollEnabled={false}
        sections={DATA}
        keyExtractor={(item, index) => item + index}

        renderItem={({ item }) => (
          <View className="flex-row container space-x-5">
            <Image
              source={require('../../assets/images/_profile.png')}
              className="w-[40px] h-[40px] rounded-full border-white"
            />
            <View className="flex-col">
              <Text className={`${item.status === "2" ? 'text-red-500' : 'text-green-500'}`}>{statusValue(item.status)}</Text>
              <Text className="font-semibold dark:text-gray-100">{item.name}</Text>
              <View className="flex-row space-x-5   border-gray-200 mb-5">
                <View className="flex-row items-center space-x-2">
                  <FontAwesome name="id-badge" size={15} color={colorScheme === 'light' ? "black" : "white"} />
                  <Text className="font-normal text-sm dark:text-gray-100">{item.employeeid}</Text>
                </View>

                <View className="flex-row items-center space-x-2">
                  <Entypo name="mobile" size={15} color={colorScheme === 'light' ? "black" : "white"} />
                  <TouchableOpacity onPress={() => handleDialPress(item.mobileno)}>
                    <Text className="font-normal text-sm text-blue-500">{item.mobileno}</Text></TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className="flex-row">
            <Text className="dark:text-gray-100 font-bold mt-10 mb-5 text-l">{title}</Text>
          </View>
        )}
      /> */}
    </View>
  )
}

export default Team