import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useRouter } from 'expo-router';

const MenuItem = ({ item }) => {
    const { href, id, icon = "star", color = "#EF4444", label } = item;
    const router = useRouter();

    return (
        <TouchableOpacity
            key={id}
            className="flex-row items-center p-4 m-1 w-full"
            onPress={() => router.push(href)}
        >
            <View className="w-8 h-8 rounded-xl mr-4 justify-center items-center" style={{ backgroundColor: color }}>
                <Icon name={icon} size={20} color="white" />
            </View>
            <Text className="text-sm font-semibold dark:text-gray-100">{label}</Text>
        </TouchableOpacity>
    )
}

export default MenuItem
