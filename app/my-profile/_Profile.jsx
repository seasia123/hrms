import React, { useState } from 'react';
import { View, Text, Image, Alert, SafeAreaView, Dimensions, ScrollView, SectionList, FlatList, ImageBackground, TouchableOpacity, Linking } from 'react-native';


const Profile = ({ data }) => {
  const [loading, setLoading] = useState(false);

  const handleMailPress = (gmail) => {
    Linking.openURL(`mailto:${gmail}`);
  };

  const handleDialPress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };
  
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <SectionList
        nestedScrollEnabled
        scrollEnabled={false}
        style={{ flex: 1 }}
        sections={data}
        keyExtractor={(item, index) => item.key + index}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            {/avtar/i.test(item.key) ? (
              <Text></Text>
            ) : (
              <Text className="dark:text-gray-100">{item.key}</Text>)}

            {/photo_url/i.test(item.key) ? (
              <Image
                source={{ uri: item.value }}
                style={{ width: 50, height: 50 }}
              />
            ) : /.com/i.test(item.value) ? (
              <TouchableOpacity onPress={() => handleMailPress(item.value)}>
                <Text className="dark:text-gray-100" style={{ fontWeight: 'bold', color: 'skyblue' }}>{item.value}</Text>
              </TouchableOpacity>
            ) : /avtar/i.test(item.key) ? (
              <View></View>
            ) : /mobile/i.test(item.key) ? (
              <TouchableOpacity onPress={() => handleDialPress(item.value)}>
                <Text className="dark:text-gray-100" style={{ fontWeight: 'bold', color: 'skyblue' }}>{item.value}</Text>
              </TouchableOpacity>
            ) : (
              <Text className="dark:text-gray-100" style={{ fontWeight: 'bold' }}>{item.value}</Text>
            )}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="dark:text-gray-100" style={{ fontWeight: 'bold', marginTop: 10, fontSize: 16 }}>{title}</Text>
        )}
      />
    </View>
  );
};
export default Profile;
