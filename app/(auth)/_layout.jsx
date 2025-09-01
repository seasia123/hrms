import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Loader } from "../../components";
import { useAuthContext } from "../../context/AuthProvider";
import * as Application from 'expo-application';
import { Text, View } from "react-native";


const isDev = process.env.EXPO_PUBLIC_API_BASE_URL == "https://hrmdev.heliosadvisory.com/api"
const isUat = process.env.EXPO_PUBLIC_API_BASE_URL == "https://hrmuat.heliosadvisory.com/api"

const AuthLayout = () => {
  const { loading, isLogged } = useAuthContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <>
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <Loader isLoading={loading} />
      {/* <StatusBar backgroundColor="#161622" style="light" /> */}
      <View className="items-center p-2 w-full bg-primary dark:bg-black">
        <Text className="dark:text-gray-100 font-semibold text-center">
          Version:{" "}
          {isDev
            ? `${Application.nativeApplicationVersion}-DEV`
            : isUat
              ? `${Application.nativeApplicationVersion}-UAT`
              : Application.nativeApplicationVersion || "N/A"
          }
        </Text>
      </View>
    </>
  );
};

export default AuthLayout;
