import { Stack } from "expo-router"
import { useColorScheme } from "nativewind";

const LeaveTrackerLayout = () => {


    const { colorScheme } = useColorScheme();
    const headerBackgroundColor = colorScheme === 'light' ? '#fff' : '#000';
    const headerTextColor = colorScheme === 'light' ? '#000' : '#CDCDE0';


    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Leave Tracker", headerStyle: { backgroundColor: headerBackgroundColor }, headerTintColor: headerTextColor }} />
            <Stack.Screen name="compensatoryRequest" options={{ title: "Compensatory Request", headerStyle: { backgroundColor: headerBackgroundColor }, headerTintColor: headerTextColor }} />
            <Stack.Screen name="holidays" options={{ title: "Holidays", headerStyle: { backgroundColor: headerBackgroundColor }, headerTintColor: headerTextColor }} />
            <Stack.Screen name="view" options={{ title: "Leave Tracker", headerStyle: { backgroundColor: headerBackgroundColor }, headerTintColor: headerTextColor }} />
        </Stack>
    )
}

export default LeaveTrackerLayout
