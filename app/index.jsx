import React from 'react';
import { ActivityIndicator, Image, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from "expo-router";
import { images } from '../constants';
import { useAuthContext } from '../context/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function Welcome() {
  const { colorScheme } = useColorScheme();
  const { loading, isLogged } = useAuthContext();
  const { expoPushToken, notification } = usePushNotifications();
  const data = JSON.stringify(notification, undefined, 2);
  const osName = Platform.OS;

  if (loading) {
    // Display the loading screen while loading the session
    return (
      <SafeAreaView className="bg-primary dark:bg-black h-full">
        <View className="w-full justify-center items-center h-full">
          <Image source={colorScheme === 'light' ? images.full_icon : images.full_icon_dark} className="w-[240px]" resizeMode='contain' />
          {/* <View className="relative my-10">
            <Text className="text-3xl text-center dark:text-gray-100">
              Welcome to{' '}
            </Text>
            <Text className="text-3xl text-secondary font-bold text-center dark:text-white">HeliosConnect</Text>
          </View> */}
          <View className="absolute bottom-20">
            <ActivityIndicator
              animating={true}
              color={colorScheme === 'light' ? "#0038C0" : "white"}
              size={osName === "ios" ? "large" : 50}
            />
          </View>
        </View>
        {/* <StatusBar backgroundColor="#fff" /> */}
      </SafeAreaView>
    );
  }

  if (isLogged) {
    return <Redirect href="/home" />;
  } else {
    return <Redirect href="/sign-in" />;
  }
}
