import React, { useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/Ionicons";
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

const SearchHeader = ({ searchQuery, setSearchQuery, focus, index }) => {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const inputRef = useRef(null);

    useEffect(() => {
        let timeoutId;
        if (inputRef.current && focus === 'yes') {
            timeoutId = setTimeout(() => {
                inputRef.current.focus();
                // Keyboard.show();
            }, 100);
        }
        return () => clearTimeout(timeoutId);
    }, [focus]);

    return (
        <View className="flex-row items-center bg-white dark:bg-black px-4 py-2 border-b border-gray-300">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
                <Ionicons name="arrow-back" size={24} color={colorScheme === 'light' ? "black" : "white"} />
            </TouchableOpacity>
            <TextInput
                ref={inputRef}
                className="flex-1 bg-slate-200 dark:bg-black-100 dark:text-white px-4 h-10 rounded-xl"
                placeholder={index === 0 ? "Search Colleagues" : "Search Departments"}
                placeholderTextColor={colorScheme === 'light' ? "black" : "#CDCDE0"}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} className="px-2">
                    <Icon name="close-circle" size={28} color="gray" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SearchHeader;
