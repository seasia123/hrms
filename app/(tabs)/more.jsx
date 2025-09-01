import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthContext } from '../../context/AuthProvider'
import * as Application from 'expo-application';
import Spinner from '../../components/OverlaySpinner';
import { useColorScheme } from 'nativewind';

const MenuItem = [
  { title: "App Settings", icon: require('../../assets/icons/cogwheel.png'), href: "/more/app-settings" },
  { title: "Log Out", icon: require('../../assets/icons/turn-off.png'), href: "logout" }
]

const isDev = process.env.EXPO_PUBLIC_API_BASE_URL == "https://hrmdev.heliosadvisory.com/api"
const isUat = process.env.EXPO_PUBLIC_API_BASE_URL == "https://hrmuat.heliosadvisory.com/api"

export default function More() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { logout } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const logoutSession = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
      router.replace('/sign-in')
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: logoutSession
        }
      ],
      { cancelable: false }
    );
  };

  const handlePress = (href) => {
    if (href === "logout") {
      confirmLogout();
    } else {
      router.push(href);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 dark:bg-black">
      <Spinner
        visible={loading}
        color={colorScheme === "light" ? "black" : "white"}
        textContent="Loading..."
      />
      {MenuItem.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handlePress(item.href)}
          className="bg-primary dark:bg-black-100 p-4 rounded-md mb-4"
        >
          <View className="flex-row items-center">
            <Image
              source={item.icon}
              resizeMode="contain"
              className="w-[30px] h-[30px] mr-4"
            />
            <Text className="font-semibold text-[16px] dark:text-gray-100">
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      <View className="w-full items-center p-2">
        <Text className="dark:text-gray-100 font-semibold">
          Version:{" "}
          {isDev
            ? `${Application.nativeApplicationVersion}-DEV`
            : isUat
              ? `${Application.nativeApplicationVersion}-UAT`
              : Application.nativeApplicationVersion || "N/A"
          }
        </Text>
      </View>
    </ScrollView>
  );
}