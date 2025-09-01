import React, { useEffect, useState } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import AuthProvider from '../context/AuthProvider';
import { StatusBar } from 'react-native';
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import { useNotificationObserver } from '../hooks/useNotificationObserver';
import { useFrameworkReady } from '../hooks/useFrameworkReady';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    useFrameworkReady();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);
    useNotificationObserver();

    const [fontsLoaded, error] = useFonts({
        "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
        "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
        "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
        "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
        "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    });

    useEffect(() => {
        (async () => {
            try {
                const savedScheme = await SecureStore.getItemAsync("COLOR_SCHEME_KEY");
                if (savedScheme && savedScheme !== colorScheme) {
                    toggleColorScheme();
                }
                setPreferencesLoaded(true);
            } catch (e) {
                console.error(e);
                setPreferencesLoaded(true);
            }
        })();
    }, []);


    useEffect(() => {
        if (error) throw error;

        if (fontsLoaded && preferencesLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, preferencesLoaded, error]);

    if (!fontsLoaded || !preferencesLoaded) {
        return null;
    }

    const headerBackgroundColor = colorScheme === 'light' ? '#fff' : '#000';
    const headerTextColor = colorScheme === 'light' ? '#000' : '#CDCDE0';//#00000000


    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen
                    name='index'
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="my-profile/index"
                    mo
                    options={{
                        headerTitle: "My Profile",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerShown: false,
                        headerBackTitleVisible: false
                    }}
                />
                <Stack.Screen
                    name="notifications/index"
                    options={{
                        headerTitle: "Notification",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerBackTitleVisible: false
                    }}
                />
                <Stack.Screen
                    name="notification-details/[id]"
                    options={{
                        headerTitle: "",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerBackTitleVisible: false
                    }}
                />
                <Stack.Screen
                    name="leave-tracker"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="attendance"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="files/files"
                    options={{
                        headerTitle: "Files",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerBackTitleVisible: false
                    }}
                />
                <Stack.Screen
                    name="organization/index"
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="more/app-settings/index"
                    options={{
                        headerTitle: "App Settings",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerBackTitleVisible: false
                    }}
                />
                <Stack.Screen name="raise-regularize-request/[date]"
                    options={{
                        headerTitle: "Add request",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerBackTitleVisible: false
                    }}
                />
                <Stack.Screen name="regularization-detail/[id]"
                    options={{
                        headerTitle: "Regularization Details",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerBackTitleVisible: false
                    }}
                />
                <Stack.Screen name="raise-leave-request/[date]"
                    options={{
                        headerTitle: "Apply Leave",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerBackTitleVisible: false
                    }}
                />
                <Stack.Screen name="leave-details/[id]"
                    options={{
                        headerTitle: "Leave Details",
                        headerStyle: { backgroundColor: headerBackgroundColor },
                        headerTintColor: headerTextColor,
                        headerBackTitleVisible: false
                    }}
                />
            </Stack>
            <StatusBar
                backgroundColor={headerBackgroundColor}
                barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'}
            />
        </AuthProvider>
    );
}

export default RootLayout;
