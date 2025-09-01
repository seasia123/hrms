import { View, Text, Pressable, Image, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { useGlobalContext } from '../context/GlobalProvider';

export default function CustomDrawerContent(props) {
    const router = useRouter();
    const { logout } = useGlobalContext();
    const { bottom } = useSafeAreaInsets();
    const navigation = useNavigation();

    const logoutSession = async () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        await logout();
        router.replace('/sign-in')
        // Alert.alert("Success", "User signed out successfully");
    };

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} scrollEnabled={false}>
                <View style={{ padding: 20 }}>
                    <Image
                        style={{ height: 35 }}
                        resizeMode='contain'
                        source={require('../assets/images/DarkLogo.png')}
                    />
                </View>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            <Pressable onPress={logoutSession} style={{ padding: 20, paddingBottom: bottom + 10 }}>
                <View className="flex items-center w-full justify-center">
                    <SimpleLineIcons name="logout" size={24} color="red" />
                    <Text className="font-psemibold">Logout</Text>
                </View>
            </Pressable>
        </View>
    );
}
