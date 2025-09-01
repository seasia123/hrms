import { Entypo } from '@expo/vector-icons';
import { Stack } from "expo-router"
import { useColorScheme } from 'nativewind';

const AttendanceLayout = () => {

    const { colorScheme } = useColorScheme();
    const headerBackgroundColor = colorScheme === 'light' ? '#fff' : '#000';
    const headerTextColor = colorScheme === 'light' ? '#000' : '#CDCDE0';

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Attendance", headerStyle: { backgroundColor: headerBackgroundColor }, headerTintColor: headerTextColor }} />
            <Stack.Screen name="view" options={{ title: "Attendance", headerStyle: { backgroundColor: headerBackgroundColor }, headerTintColor: headerTextColor }} />
            <Stack.Screen name="regularization" options={{ title: "Regularization", headerStyle: { backgroundColor: headerBackgroundColor }, headerTintColor: headerTextColor }} />
        </Stack>
    )
}

export default AttendanceLayout
