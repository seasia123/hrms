import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";
import { useColorScheme } from "nativewind";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colorScheme } = useColorScheme();

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base font-pmedium dark:text-gray-100">{title}</Text>

      <View className="w-full h-16 px-4 rounded-2xl border-2 border-black-200 dark:border-gray-100 dark:focus:border-white focus:border-secondary flex flex-row items-center">
        <TextInput
          className="flex-1 font-psemibold text-base dark:text-white"
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colorScheme === 'light' ? "#0038C0" : "#CDCDE0"}
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          {...props}
        />

        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
