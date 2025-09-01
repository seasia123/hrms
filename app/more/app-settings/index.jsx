import { View, Text, Switch, ScrollView, Image } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';

const AppSettings = () => {
    const { colorScheme, toggleColorScheme } = useColorScheme();

    const handleToggleColorScheme = async () => {
        toggleColorScheme();
        await SecureStore.setItemAsync("COLOR_SCHEME_KEY", colorScheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ScrollView className="dark:bg-black p-4">
            <View className="flex-row items-center justify-between p-4 bg-white dark:bg-black-100 rounded-xl">
                <View className="flex-row items-center">
                    <Image source={require("../../../assets/icons/dark-mode.png")} resizeMode='contain' className="w-[40px] h-[40px] mr-4" />
                    <Text className="text-lg font-psemibold dark:text-gray-100">Dark Mode</Text>
                    {/* <Image source={require("../../../assets/icons/beta.png")} resizeMode='contain' className="w-[40px] h-[40px] ml-1" /> */}
                </View>
                <View className="flex-row items-center">
                    <Icon
                        name="sun"
                        color={colorScheme === "dark" ? '#ccc' : '#FFD700'}
                        size={24}
                        style={{ marginRight: 6 }}
                    />
                    <Switch
                        value={colorScheme === "dark"}
                        onValueChange={handleToggleColorScheme}
                        trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        thumbColor={colorScheme === "dark" ? '#FFD700' : '#f4f3f4'}
                    />
                    <Icon
                        name="moon"
                        color={colorScheme === "dark" ? '#FFD700' : '#ccc'}
                        size={24}
                        style={{ marginLeft: 6 }}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

export default AppSettings;
