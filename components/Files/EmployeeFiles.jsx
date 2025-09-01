import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Linking, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import BottomModal from '../BottomModal';
import NotFound from '../NotFound';

const EmployeeFiles = ({ enableScroll = true }) => {
    const { colorScheme } = useColorScheme();
    const [refreshing, setRefreshing] = useState(false);
    const [modalData, setModalData] = useState();
    const [loading, setLoading] = useState(false);
    const bottomModalRef = useRef();

    const openBottomModal = (data) => {
        // console.log(data);
        if (bottomModalRef.current) {
            setModalData(data)
            bottomModalRef.current.openModal();
        }
    };

    const closeBottomModal = () => {
        if (bottomModalRef.current) {
            bottomModalRef.current.closeModal();
        }
    };

    const data = [
        // { id: '1', title: 'Outstation Travel Policy.pdf', file: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", author: 'Deepthi Komalangan', date: '17-Apr-2024' },
        // { id: '2', title: 'Company Local Conveyance Policy.pdf', file: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", author: 'Deepthi Komalangan', date: '06-Apr-2024' },
        // { id: '3', title: 'Company Local Travel Policy - Non.pdf', file: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", author: 'Deepthi Komalangan', date: '06-Apr-2024' },
        // { id: '4', title: 'Posh Policy.pdf', file: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", author: 'Deepthi Komalangan', date: '17-Jan-2024' },
        // { id: '5', title: 'Leave Policy_2024.pdf', file: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", author: 'Deepthi Komalangan', date: '10-Jan-2024' },
        // { id: '6', title: 'Local Conceyance Policy - Helios A.pdf', file: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", author: 'Piyush Chandrawanshi', date: '11-Apr-2023' },
        // { id: '7', title: '05 Reimbursement Policy - signed.pdf', file: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", author: 'Anshuma Mishra', date: '27-Apr-2022' },
    ];

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate a network request
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const openPdf = async (url) => {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            console.log(`Don't know how to open this URL: ${url}`);
        }
    };

    const renderItem = ({ item }) => (
        <View className="flex-row items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
            <View className="flex-row items-center">
                <Pressable onPress={() => openPdf(item.file)} className="flex-1 items-center flex-row">
                    <MaterialIcons name="picture-as-pdf" size={24} color="red" />
                    <View className="flex-shrink ml-3">
                        <Text className="font-semibold dark:text-gray-100" numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-100" numberOfLines={1} ellipsizeMode="tail">{item.author} - {item.date}</Text>
                    </View>
                </Pressable>
                <TouchableOpacity onPress={() => openBottomModal(item)}>
                    <MaterialIcons name="more-vert" size={24} color={colorScheme === "light" ? "black" : "white"} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <>
            <FlatList
                scrollEnabled={enableScroll}
                data={data}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !loading && <NotFound text='No Files Found!' />
                }
            />
            <BottomModal ref={bottomModalRef}>
                <ScrollView className="p-4 dark:bg-black-100">
                    <Text className="text-lg font-semibold mb-2 dark:text-gray-100">{modalData?.title}</Text>
                    <Text className="mb-1 dark:text-gray-100">Shared To</Text>
                    <Text className="text-md font-semibold mb-2 dark:text-gray-100">All</Text>
                    <Text className="dark:text-gray-100">Description</Text>
                    <Text className="text-md font-semibold dark:text-gray-100">{modalData?.description}</Text>
                </ScrollView>
            </BottomModal>
        </>
    );
};

export default EmployeeFiles;
