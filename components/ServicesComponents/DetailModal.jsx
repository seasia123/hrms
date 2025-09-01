import { View, Text, Modal, Pressable, Linking, Platform, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import moment from 'moment'
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { AntDesign, Feather } from '@expo/vector-icons';

const DetailModal = ({ open, onClose, data }) => {
    const [menuVisible, setMenuVisible] = React.useState(false);
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    
    const OnModalClose = () => {
        onClose();
        setMenuVisible(false);
    }

    if (!data) {
        return
    }

    const openMap = (latitude, longitude) => {
        if (latitude && longitude) {
            const url = Platform.select({
                ios: `maps://?q=${latitude},${longitude}`,
                android: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
            });
            Linking.openURL(url).catch(err => console.error('An error occurred', err));
        }
    };

    const formatTime = (time) => {
        if (time === '00:00:00') {
            return '--';
        }
        return moment(time, 'HH:mm:ss').format('hh:mm A');
    };

    return (
        <Modal
            transparent={true}
            visible={open}
            animationType="slide"
            onRequestClose={OnModalClose}
        >
            {data &&
                <Pressable className="flex-1 justify-end  bg-black/50" onPress={OnModalClose}>
                    <Pressable className="bg-white dark:bg-black-100 p-4 rounded-t-lg w-full" onPress={() => setMenuVisible(false)}>
                        <Text className="text-center font-semibold text-lg dark:text-gray-100">{moment(data?.date).format('ddd, DD MMM YYYY')}</Text>
                        <Text className="text-center text-lg dark:text-gray-100">{data?.statusText}</Text>
                        <Text className="text-center text-lg dark:text-gray-100 mb-1">Hours : <Text className="font-psemibold">{data?.timeWorked}</Text></Text>
                        {/* {(data.status.includes("attendence") || data.status.includes("absent")) && */}
                            <TouchableOpacity
                                className="absolute right-4 top-3"
                                onPress={() => setMenuVisible(!menuVisible)}
                            >
                                <AntDesign name="pluscircle" size={32} color={colorScheme === "light" ? "#0038C0" : "white"} />
                            </TouchableOpacity>
                        {/* } */}
                        {menuVisible && (
                            <View style={styles.shadowProp} className="absolute right-4 -top-[75px] bg-white dark:bg-gray-800 shadow-lg rounded-md w-40 z-10">
                                <Pressable className="flex-1 flex-row item-center p-3" onPress={() => { OnModalClose(); router.push(`/raise-regularize-request/${moment(data?.date).format('DD-MM-YYYY')}`) }}>
                                    <View className="mr-2">
                                        <Feather name="edit" size={20} color={colorScheme === "light" ? "black" : "white"} />
                                    </View>
                                    <Text className="text-black dark:text-white">Regularize</Text>
                                </Pressable>
                                <Pressable className="flex-1 flex-row item-center p-3 pt-1" onPress={() => { OnModalClose(); router.push(`/raise-leave-request/${data?.date}`) }}>
                                    <View className="mr-2">
                                        <Feather name="umbrella" size={20} color={colorScheme === "light" ? "black" : "white"} />
                                    </View>
                                    <Text className="text-black dark:text-white">Apply Leave</Text>
                                </Pressable>
                            </View>
                        )}
                    
                        {(data.status.includes("attendence") || data.status.includes("absent")) &&
                        
                            <View className="flex-row items-start bg-slate-200 dark:bg-black rounded-xl p-2 mb-2">
                                <Pressable className="flex-1" onPress={() => openMap(data?.signin_long_lat_address?.lat, data?.signin_long_lat_address?.long)}>
                                    <Text className="text-green-500 font-semibold mb-1">Check-in</Text>
                                    <Text className="font-semibold mb-1 dark:text-gray-100">{data?.inTime ? formatTime(data.inTime) : "--"}</Text>
                                    <Text className="dark:text-gray-100">{data?.signin_long_lat_address?.address || "--"}</Text>
                                </Pressable>
                                <Pressable className="flex-1 justify-center" onPress={() => openMap(data?.signout_long_lat_address?.lat, data?.signout_long_lat_address?.long)}>
                                    <Text className="text-red-500 font-semibold mb-1">Check-out</Text>
                                    <Text className="font-semibold mb-1 dark:text-gray-100">{data?.outTime ? formatTime(data.outTime) : "--"}</Text>
                                    <Text className="dark:text-gray-100">{data?.signout_long_lat_address?.address || "--"}</Text>
                                </Pressable>
                            </View>
                        }
                    </Pressable>
                </Pressable>}
        </Modal>
    )
}

export default DetailModal;


const styles = StyleSheet.create({
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});