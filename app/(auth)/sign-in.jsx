import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useAuthContext } from "../../context/AuthProvider";
import { useColorScheme } from "nativewind";
import { usePushNotifications } from "../../hooks/usePushNotifications";

const SignIn = () => {
  const { login } = useAuthContext();
  const { expoPushToken } = usePushNotifications();
  const { colorScheme } = useColorScheme();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      await login(form.email, form.password, expoPushToken);
      // Alert.alert("Success", "Sign-in success");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="bg-primary dark:bg-black h-full">
      <View
        className="w-full flex justify-center h-full px-4"
        style={{
          minHeight: Dimensions.get("window").height - 200,
        }}
      >
        {/* <Image
            source={images.Darklogo}
            resizeMode="contain"
            className="w-[150px] h-[100px]"
          /> */}

        <View className="relative mt-5">
          <View className="items-center mb-2">
            <Image source={colorScheme === 'light' ? images.logoSmall : images.logoSmallDark} className="w-[50px] h-[50px]" resizeMode='contain' />
          </View>
          <Text className="text-3xl text-center text-secondary-100">
            Login to{' '}
          </Text>
          <Text className="text-3xl text-secondary dark:text-white font-bold text-center">HeliosConnect</Text>
          {/* <Image source={images.path} className="w-[70px] h-[10px] absolute -bottom-1 right-28" /> */}
        </View>
        <FormField
          title="Email ID"
          value={form.email}
          handleChangeText={(e) => setForm({ ...form, email: e })}
          otherStyles="mt-7"
          keyboardType="email"
        />

        <FormField
          title="Password"
          value={form.password}
          handleChangeText={(e) => setForm({ ...form, password: e })}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Sign In"
          handlePress={submit}
          containerStyles="mt-7 bg-secondary"
          isLoading={isSubmitting}
          textStyles="text-lg"
        />

        {/* <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Signup
            </Link>
          </View> */}
      </View>
    </ScrollView>
  );
};

export default SignIn;
