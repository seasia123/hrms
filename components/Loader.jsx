import { useColorScheme } from "nativewind";
import { View, ActivityIndicator, Dimensions, Platform } from "react-native";

const Loader = ({ isLoading, display = "transparent" }) => {
  const { colorScheme } = useColorScheme();
  const osName = Platform.OS;
  const screenHeight = Dimensions.get("screen").height;

  if (!isLoading) return null;

  return (
    <View
      className={`absolute flex justify-center items-center w-full ${display === 'hide' ? "bg-primary dark:bg-black" : "bg-primary/60 dark:bg-black/60"} z-10`}
      style={{
        height: screenHeight,
      }}
    >
      <ActivityIndicator
        animating={isLoading}
        color={colorScheme === 'light' ? "#0038C0" : "#fff"}
        size={osName === "ios" ? "large" : 50}
      />
    </View>
  );
};

export default Loader;
