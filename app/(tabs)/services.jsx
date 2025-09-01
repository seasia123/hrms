import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import NotFound from "../../components/NotFound";
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from "nativewind";

const services = [
  {
    title: "Leave Tracker",
    icon: require("../../assets/icons/schedule.png"),
    href: "/leave-tracker",
    search: ["compensatory request", "holidays", "Leave", "Tracker"],
    disabled: false
  },
  {
    title: "Attendance",
    icon: require("../../assets/icons/attendence.png"),
    href: "/attendance",
    search: ["attendance", "regularization"],
    disabled: false
  },
  {
    title: "Files",
    icon: require("../../assets/icons/folder.png"),
    href: "/files/files",
    search: ["files"],
    disabled: false
  },
  {
    title: "Organization",
    icon: require("../../assets/icons/corporation.png"),
    href: "/organization",
    search: ["Organization", "colleagues", "departments", "employee"],
    disabled: false
  },
  {
    title: "Time Tracker",
    icon: require("../../assets/icons/on-time.png"),
    href: "/time-tracker",
    search: ["time logs", "timesheets", "jobs", "projects", "time", "tracker"],
    disabled: true
  },
  {
    title: "Travel",
    icon: require("../../assets/icons/plane.png"),
    href: "/travel",
    search: ["travel request", "travel exprence", "reimbursement form"],
    disabled: true
  },
  {
    title: "Compensation",
    icon: require("../../assets/icons/dollar.png"),
    href: "/compensation",
    search: ["compensation", "asset", "benefit"],
    disabled: true
  },
  {
    title: "Office Readiness",
    icon: require("../../assets/icons/working-man.png"),
    href: "/office-readiness",
    search: ["visit", "office readiness"],
    disabled: true
  },
  {
    title: "Announcements",
    icon: require("../../assets/icons/megaphone.png"),
    href: "/announcements",
    search: ["announcements"],
    disabled: true
  },
  {
    title: "Tasks",
    icon: require("../../assets/icons/task.png"),
    href: "/tasks",
    search: ["task"],
    disabled: true
  },
];

const ServiceItem = ({ title, icon, href, isGrid, disabled }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      className={`w-full p-2 ${isGrid ? "w-1/2" : ""} ${disabled ? "opacity-40" : ""}`}
      onPress={() => router.push(href)}
      disabled={disabled}
    >
      {isGrid ? (
        <View className="bg-white dark:bg-black-100 py-6 rounded-xl items-center">
          <Image source={icon} className='w-12 h-12 shadow-lg ' />
          <Text className='mt-2  font-semibold dark:text-gray-100'>{title}</Text>
        </View>
      ) : (
        <View className="bg-white p-6 dark:bg-black-100  rounded-xl items-center flex flex-row  ">
          <Image source={icon} className='w-12 h-12 shadow-lg' />
          <Text className='text-md font-semibold ml-5 dark:text-gray-100'>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function Services() {
  const [isListView, setIsListView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    (async () => {
      const storedViewMode = await SecureStore.getItemAsync('isListView');
      if (storedViewMode !== null) {
        setIsListView(storedViewMode === 'true');
      }
      setIsLoading(false);
    })();
  }, []);

  const toggleViewMode = async () => {
    const newViewMode = !isListView;
    setIsListView(newViewMode);
    await SecureStore.setItemAsync('isListView', newViewMode.toString());
  };

  const filteredServices = services.filter(service =>
    service.search.some(term => term.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'light' ? "white" : "#000000" }}>
        <ActivityIndicator size="large" color={colorScheme === 'light' ? "#0000ff" : "white"} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 dark:bg-black">
        <View className="px-2 m-4 mb-1 flex-row">
          <View style={{ flex: 4 }} className="flex-row items-center bg-white dark:bg-black-100 rounded-xl px-4">
            <TextInput
              placeholder="Search Services"
              className="flex-1 dark:text-white"
              placeholderTextColor={colorScheme === 'light' ? "black" : "#CDCDE0"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon name="close-circle" size={28} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={{ marginLeft: 4, flex: 1 }}
            onPress={toggleViewMode}
          >
            <View className='p-4 ml-2 items-center bg-white dark:bg-black-100 rounded-lg'>
              <Icon name={!isListView ? "list" : 'grid'} size={20} color={colorScheme === 'light' ? "black" : "#CDCDE0"} />
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View className={`flex-row flex-wrap ${isListView ? "" : "justify-between"}`}>
            {filteredServices.map(service => (
              <ServiceItem
                key={service.title}
                title={service.title}
                icon={service.icon}
                href={service.href}
                isGrid={!isListView}
                disabled={service.disabled}
              />
            ))}
          </View>
          {filteredServices.length === 0 && <NotFound />}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}