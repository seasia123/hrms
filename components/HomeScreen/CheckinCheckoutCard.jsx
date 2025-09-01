import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Alert, Animated, ToastAndroid, Platform, ActivityIndicator, AppState } from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as Device from "expo-device";
import { AntDesign } from '@expo/vector-icons';
import moment from 'moment';
import CustomButton from '../CustomButton';
import Http from '../../services/httpService';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import Spinner from '../OverlaySpinner';


const TimeLoading = () => (
    <ActivityIndicator
        color="#ffce7b"
        size="small"
        className=""
    />
)

const SpinnerComponent = React.memo(({ visible, color, textContent }) => (
    <Spinner visible={visible} color={color} textContent={textContent} />
));

const CheckInOutCard = forwardRef((props, ref) => {
    const { onRefreshSuccess } = props;
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isCheckedIn, setIsCheckedIn] = useState(data?.isCheckedIn);
    const [totalHrs, setTotalHrs] = useState(8.5);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [appState, setAppState] = useState(AppState.currentState);
    const [loadingState, setLoadingState] = useState(false);
    const [loadingTxt, setLoadingTxt] = useState(false);
    // const [dotColor, setDotColor] = useState("red")
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    const handleAppStateChange = (nextAppState) => {
        if (appState === 'active' && nextAppState === 'active') {
            getCheckInData();
        }
        setAppState(nextAppState);
    };

    const getCheckInData = async (post = false) => {
        const userId = await SecureStore.getItemAsync('user_id');
        setLoading(true);
        try {
            const response = await Http.get(`/getdata/${userId}`)
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            // Alert.alert("Error", error.message)
            setError(error);
        } finally {
            if (!post) {
                setLoading(false);
            }
            onRefreshSuccess();
        }
    };

    useImperativeHandle(ref, () => ({
        getCheckInData,
    }));

    useEffect(() => {
        getCheckInData();
    }, []);


    const convertToDecimalHours = (totalHrs) => {
        const [hours, minutes] = totalHrs.split(':').map(Number);
        return hours + minutes / 60;
    };

    const calculateTotalHrs = () => {
        if (!data?.shiftData?.InTime || !data?.shiftData?.OutTime) {
            setTotalHrs(8.5);
            return;
        }

        const inTime = moment(data.shiftData.InTime, "HH:mm");
        const outTime = moment(data.shiftData.OutTime, "HH:mm");

        // Calculate the difference in hours and minutes
        const duration = moment.duration(outTime.diff(inTime));
        const hours = duration.hours();
        const minutes = duration.minutes();

        // Convert total time difference to a decimal format
        const totalHoursDecimal = hours + minutes / 60;
        setTotalHrs(totalHoursDecimal.toFixed(2))
    };

    /* Old Logic to take first check-in and last check-out */
    // useEffect(() => {
    //     if (data) {
    //         // If user already checked in and not yet checked out (set clock to how much worked yet -- running)
    //         if (data.isCheckedIn && !data.isCheckedOut) {
    //             setIsCheckedIn(true);

    //             const totalHrs = data.totalHour;
    //             let initialSeconds = Math.floor(totalHrs * 3600);

    //             const interval = setInterval(() => {
    //                 initialSeconds++;

    //                 const hours = Math.floor(initialSeconds / 3600);
    //                 const minutes = Math.floor((initialSeconds % 3600) / 60);
    //                 const seconds = Math.floor(initialSeconds % 60);

    //                 setTime({ hours, minutes, seconds });
    //             }, 1000);

    //             return () => clearInterval(interval);
    //         }

    //         // If user checked in and checked out (set clock to work time - not running)
    //         if (data.isCheckedOut && data.isCheckedIn) {
    //             setIsCheckedIn(false);
    //             const totalHrs = data.totalHour;
    //             const hours = Math.floor(totalHrs);
    //             const minutes = Math.floor((totalHrs - hours) * 60);
    //             const seconds = Math.floor(((totalHrs - hours) * 60 - minutes) * 60);
    //             setTime({ hours, minutes, seconds });
    //         }

    //         // If user not checked in and not checked out (starting fresh day set clock to zero - not running)
    //         if (!data.isCheckedIn && !data.isCheckedOut) {
    //             setIsCheckedIn(false);
    //             setTime({ hours: 0, minutes: 0, seconds: 0 });
    //         }
    //     }
    // }, [data]);

    useEffect(() => {
        if (data) {
            calculateTotalHrs();
            // If user already checked in and not yet checked out (set clock to how much worked yet -- running)
            if (data.isCheckedIn && !data.isCheckedOut) {
                setIsCheckedIn(true);
                const totalHrs = data.totalHour;
                const [hours, minutes] = totalHrs.split(':').map(parseFloat);
                let initialSeconds = Math.floor(hours * 3600 + minutes * 60);

                const interval = setInterval(() => {
                    initialSeconds++;

                    const hours = Math.floor(initialSeconds / 3600);
                    const minutes = Math.floor((initialSeconds % 3600) / 60);
                    const seconds = Math.floor(initialSeconds % 60);

                    setTime({ hours, minutes, seconds });
                }, 1000);

                return () => clearInterval(interval);
            }

            // If user checked in and checked out (set clock to worked time - not running)
            if (data.isCheckedOut && data.isCheckedIn) {
                setIsCheckedIn(false);
                const totalHrs = data.totalHour;
                const [hours, minutes] = totalHrs.split(':').map(parseFloat);
                const totalMinutes = hours * 60 + minutes;
                const hoursFinal = Math.floor(totalMinutes / 60);
                const minutesFinal = Math.floor(totalMinutes % 60);
                const secondsFinal = Math.floor((totalMinutes % 1) * 60);
                setTime({ hours: hoursFinal, minutes: minutesFinal, seconds: secondsFinal });
            }

            // If user not checked in and not checked out (starting fresh day set clock to zero - not running)
            if (!data.isCheckedIn && !data.isCheckedOut) {
                setIsCheckedIn(false);
                setTime({ hours: 0, minutes: 0, seconds: 0 });
            }
        }
    }, [data]);

    useEffect(() => {
        const floatHours = time.hours + time.minutes / 60 + time.seconds / 3600;
        const progressWidth = Math.min((floatHours / totalHrs) * 100, 100);
        Animated.timing(progress, {
            toValue: progressWidth,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [time, progress]);

    // useEffect(() => {
    //     const breather = setInterval(() => {
    //         setDotColor((prevState) => prevState === "red" ? "#ff6364" : "red")
    //     }, 600);

    //     return () => clearInterval(breather);
    // }, []);


    const handleCheckInOut = async () => {
        setLoading(true);
        const getLocationAndCheckInOut = async () => {
            setLoadingState(true);
            setLoadingTxt("Fetching Current Location...");
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert("Permission Needed", 'Permission to access location was denied');
                    setLoading(false);
                    return;
                }
                // await Location.enableNetworkProviderAsync();

                // try {
                //     await Location.enableNetworkProviderAsync();
                //     console.log('Network provider enabled');
                // } catch (error) {
                //     console.error('Error enabling network provider:', error);
                // }

                let location = await Location.getCurrentPositionAsync({});

                // console.log(location);

                const userId = await SecureStore.getItemAsync('user_id');

                if (!userId) {
                    Alert.alert("Error", "User ID not found.");
                    setLoading(false);
                    setLoadingState(false);
                    router.replace('/sign-in');
                    return;
                }

                //Comment below check for testing on emulator or on expo
                // if (Device.isDevice) {
                //     Alert.alert("Error", "Must be using a physical device to use this service.");
                //     setLoading(false);
                //     setLoadingState(false);
                //     return;
                // }

                if (Platform.OS === 'android' && location.mocked) {
                    Alert.alert("Error", "Please turn off mock location/unroot your device to continue.");
                    setLoading(false);
                    setLoadingState(false);
                    return;
                }

                let addressResponse = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                let address = addressResponse[0].formattedAddress;
                if (!address) {
                    address = `${addressResponse[0].name ? addressResponse[0].name + ', ' : ''}${addressResponse[0].district ? addressResponse[0].district + ', ' : ''}${addressResponse[0].city ? addressResponse[0].city + ', ' : ''}${addressResponse[0].region ? addressResponse[0].region + ', ' : ''}${addressResponse[0].country ? addressResponse[0].country : ''}${addressResponse[0].postalCode ? ' ' + addressResponse[0].postalCode : ''}`;
                }

                const payload = new FormData();
                payload.append("user_id", userId);
                payload.append("long", location.coords.longitude);
                payload.append("lat", location.coords.latitude);
                payload.append("address", address);

                await postCheckInOut(payload);
            } catch (error) {
                console.error("Error during check-in/out:", error);
                Alert.alert(
                    `${isCheckedIn ? "Check-Out Failed" : "Check-In Failed"}`,
                    "Please check your internet connection and ensure that your location services are turned on, then try again."
                );
            }
            finally {
                setLoading(false);
                setLoadingState(false);
            }
        };

        const confirmCheckout = (callback) => {
            Alert.alert(
                "Checkout Confirmation",
                "Are you sure you want to checkout?",
                [
                    {
                        text: "Cancel",
                        onPress: () => setLoading(false),
                        style: "cancel"
                    },
                    {
                        text: "Yes",
                        onPress: callback
                    }
                ],
                { cancelable: false }
            );
        };

        try {
            if (isCheckedIn) {
                confirmCheckout(getLocationAndCheckInOut);
            } else {
                await getLocationAndCheckInOut();
            }
        } catch (error) {
            console.error("Error during check-in/out:", error);
            Alert.alert(
                `${isCheckedIn ? "Check-Out Failed" : "Check-In Failed"}`,
                "Please check your internet connection and ensure that your location services are turned on, then try again."
            );
            setLoading(false);
        }
    };

    const postCheckInOut = async (payload) => {
        const checkinUrl = isCheckedIn ? "/checkout" : "/checkin";
        // setLoading(true);
        setLoadingTxt("Loading...");
        try {
            const response = await Http.post(checkinUrl, payload);
            if (response.ok) {
                await getCheckInData(post = true);
                const message = isCheckedIn ? 'Check-out successfull!' : 'Check-in successfull!';
                if (Platform.OS === 'android') {
                    ToastAndroid.show(message, ToastAndroid.SHORT);
                } else {
                    Alert.alert("Success", message);
                }
            } else {
                throw new Error('Failed to check in/out. Please try again.');
            }
        } catch (error) {
            Alert.alert("Alert", error.message);
            setError(error);
        } finally {
            // setLoading(false);
        }
    };

    return (
        <>
            <SpinnerComponent visible={loadingState} color={colorScheme === 'light' ? "black" : "white"} textContent={loadingTxt} />
            <View className="my-6 bg-white dark:bg-black-100 p-4 rounded-xl shadow-md w-full max-w-sm mx-auto">
                <View className="flex-row justify-center items-center mb-8 mt-8">
                    <View className="flex justify-center items-center p-2 bg-[#fef3f1] dark:bg-[#434343] rounded w-[60px] h-[50px]">
                        <Text className="text-2xl font-bold dark:text-gray-100">{String(time.hours).padStart(2, '0')}</Text>
                    </View>
                    <Text className="text-2xl font-bold mx-1 dark:text-gray-100">:</Text>
                    <View className="flex justify-center items-center p-2 bg-[#fef3f1] dark:bg-[#434343] rounded w-[60px] h-[50px]">
                        <Text className="text-2xl font-bold dark:text-gray-100">{String(time.minutes).padStart(2, '0')}</Text>
                    </View>
                    <Text className="text-2xl font-bold mx-1 dark:text-gray-100">:</Text>
                    <View className="flex justify-center items-center p-2 bg-[#fef3f1] dark:bg-[#434343] rounded w-[60px] h-[50px]">
                        <Text className="text-2xl font-bold dark:text-gray-100">{String(time.seconds).padStart(2, '0')}</Text>
                    </View>
                </View>
                <View className="px-2">
                    <View className="w-full bg-slate-200 dark:bg-[#8c8c8c] rounded p-[3px] mb-3 mt-1">
                        {data?.checkinTime && (
                            <View className="absolute bottom-3 -left-3">
                                <Text className="text-[9px] dark:text-gray-100">{moment(data.checkinTime).format('h:mm a')}</Text>
                                <View className="ml-3">
                                    <AntDesign name="caretdown" size={9} color={colorScheme === 'light' ? "#4CAF50" : "#37ff14e0"} />
                                </View>
                            </View>
                        )}

                        <Animated.View
                            className="h-1 rounded bg-[#4CAF50] dark:bg-[#37ff14e0]"
                            style={{
                                width: progress.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%']
                                }),
                            }}
                        />

                        {data?.checkoutTime && (
                            <Animated.View
                                className="absolute -bottom-6"
                                style={{
                                    left: progress.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%']
                                    })
                                }}
                            >
                                <View className="absolute bottom-0 -left-3">
                                    <View className="ml-3">
                                        <AntDesign name="caretup" size={9} color="#ff6364" />
                                    </View>
                                    <Text className="text-[9px] dark:text-gray-100">{moment(data.checkoutTime).format('h:mm a')}</Text>
                                </View>
                            </Animated.View>
                        )}
                        {!data?.checkoutTime && <Animated.View
                            className="absolute"
                            style={{
                                left: progress.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%']
                                }),
                                width: 10,
                                height: 10,
                                borderRadius: 10,
                                backgroundColor: '#ff6364',
                            }}
                        />}
                    </View>
                </View>
                <Text className="text-center mt-4 text-xs font-psemibold dark:text-gray-100">{data?.shiftData?.name}</Text>
                {data?.shiftData?.InTime && data?.shiftData?.OutTime &&
                    <Text className="text-center mt-1 text-xs font-psemibold dark:text-gray-100">{moment(data?.shiftData?.InTime, "HH:mm").format("hh:mm A")} to {moment(data?.shiftData?.OutTime, "HH:mm").format("hh:mm A")}</Text>
                }
                <View className="flex justify-center items-center mb-4">
                    <CustomButton
                        title={isCheckedIn ? 'Check-out' : 'Check-in'}
                        handlePress={handleCheckInOut}
                        containerStyles={`w-[160px] mt-7 rounded-full bg-secondary ${isCheckedIn ? 'bg-[#ff6364]' : 'bg-[#00bda9]'}`}
                        isLoading={loading}
                    />
                </View>
            </View>
        </>
    );
});

export default CheckInOutCard;
