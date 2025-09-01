import { View, Text, TouchableOpacity } from 'react-native'
import { React, useEffect, useState } from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import BottomModal from '../../components/BottomModel';
import EmployeeFiles from '../../components/Files/EmployeeFiles'
import OrganizationFiles from '../../components/Files/OrganizattionFiles';
import { useColorScheme } from 'nativewind';




const Options = [
  {
    title: 'Shared With Me',
    screen: 1
  }, {
    title: 'Personal uploads',
    screen: 2
  }
];




const Fiels = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [screen, setScreen] = useState(1);
  const currentOption = Options.find((item) => item.screen === screen);
  const { colorScheme } = useColorScheme();

  const openBottomModel = () => {
    setModalVisible(true);
  };

  return (
    <View className="flex-1 container dark:bg-black">
      <TouchableOpacity onPress={openBottomModel}>
        <View className=" bg-white dark:bg-black-200  rounded-full p-1  m-5 items-center justify-center w-[130] flex-row space-x-3">
          <Text className="font-semibold text-xs  dark:text-gray-100">{currentOption.title}</Text>
          <FontAwesome name="caret-down" size={20} color={colorScheme === 'light' ? "black" : "white"} />
        </View>
      </TouchableOpacity>

      <BottomModal visible={modalVisible} closeModal={() => setModalVisible(false)} option={Options} screen={screen} setScreen={setScreen}
      />
      {screen === 1 ? <OrganizationFiles enableScroll={false} /> : <EmployeeFiles enableScroll={false} />}
    </View>
  );
}

export default Fiels