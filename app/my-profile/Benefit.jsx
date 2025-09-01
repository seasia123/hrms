import React, { useRef } from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

const Benefit = () => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [ 
        {
          translateY: interpolate(
            scrollY.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
          )
        },
        {
          scale: interpolate(scrollY.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1])
        }
      ]
    };
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.Image 
          source={{
            uri: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302'
          }}
          style={[styles.image, imageAnimatedStyle]}
        />
        <View style={{ height: 2000, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 20 }}>
            Parallax Scroll
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default Benefit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  image: {
    width: width,
    height: IMG_HEIGHT
  }
});