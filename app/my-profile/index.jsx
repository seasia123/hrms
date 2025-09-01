import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ImageBackground, Alert, Linking, Image } from 'react-native';
import { TabbedHeaderPager } from 'react-native-sticky-parallax-header';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useSharedValue } from 'react-native-reanimated';
import _Profile from './_Profile';
import Team from './Team';
import LeaveTracker from './LeaveTracker';
import TimeTracker from './TimeTracker';
import AttendanceWeekView from '../../components/ServicesComponents/AttendanceWeekView';
import Files from './Files';
import Assets from './Assets';
import Benefit from './Benefit';
import TravelRequest from './TravelRequest';
import TravelExpense from './TravelExpense.jsx';
import * as SecureStore from 'expo-secure-store';
import Loader from '../../components/Loader.jsx';
import Http from '../../services/httpService';
import LeaveView from '../../components/LeaveComponents/LeaveView.jsx';
import { useColorScheme } from 'nativewind';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NotFound from '../../components/NotFound.jsx';


const TABS = ({ data }) => [
  {
    title: 'Profile',
    component: () => <_Profile data={data} />,
    view: "common"
  },
  {
    title: 'Team',
    component: Team,
    view: "common"
  },
  {
    title: 'Leave Tracker',
    component: () => <LeaveView enableScroll={false} />,
    view: "self"
  },
  // {
  //   title: 'Time Tracker',
  //   component: TimeTracker,
  //   view: "self"
  // },
  {
    title: 'Attendance',
    component: () => <AttendanceWeekView enableScroll={false} />,
    view: "self"
  },
  {
    title: 'Files',
    component: Files,
  },
  // {
  //   title: 'Asset',
  //   component: Assets,
  //   view: "self"
  // },
  // {
  //   title: 'Benefit',
  //   component: Benefit,
  //   view: "self"
  // },
  // {
  //   title: 'Travel Expense',
  //   component: TravelExpense,
  //   view: "self"
  // },
  // {
  //   title: 'Travel Request',
  //   component: TravelRequest,
  //   view: "self"
  // },
];


const ProfileView = () => {
  const params = useLocalSearchParams();
  const { id = null, profile = 'self' } = params;
  const [loading, setLoading] = useState(true);
  const [designation, setdesignation] = useState('')
  const [PhotoUrl, setPhotoUrl] = useState('')
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [Name, setName] = useState('')
  const [Mobile, setmobile] = useState('')
  const [mail, setmail] = useState('')
  const [empuserId, setempuserId] = useState('')

  const scrollValue = useSharedValue(0);
  const [data, setdata] = useState([]);

  const onScroll = (event) => {
    'worklet';
    scrollValue.value = event.contentOffset.y;
  };

  const handleSmsPress = (phoneNumber) => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleMailPress = (gmail) => {
    Linking.openURL(`mailto:${gmail}`);
  };

  const handleDialPress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsapp = (phoneNumber) => {
    Linking.openURL(`http://api.whatsapp.com/send?phone=+91${phoneNumber}`)
  }


  const getData = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const payload = new FormData();
      payload.append("id", id ? id : userId);
      const response = await Http.post("/profileData", payload);
      if (response.ok) {
        const responseData = await response.json();
        // console.log(JSON.stringify(responseData));
        const formattedData = responseData.data.map(section => ({
          title: section.title,
          data: Object.keys(section.data).map(key => ({
            key: key,
            value: section.data[key]
          }))
        }));
        setdata(formattedData);
        // console.log("formated data" + formattedData.value)

        for (const section of formattedData) {
          if (section.data) {
            for (const item of section.data) {
              if (item.key === 'photo_url') {
                setPhotoUrl(item.value);
                // console.log("my photo" + PhotoUrl)
              }
              if (item.key === 'name') {
                setName(item.value);
              }
              if (item.key === 'designation') {
                setdesignation(item.value)
              }
              if (item.key === '') {
                setempuserId(item.value)
              }
              if (item.key === 'mobile') {
                setmobile(item.value)
              }
              if (item.key === 'email_id') {
                setmail(item.value)
              }
            }
          }
        }

      } else {
        throw new Error('Failed to get data. Please try again.');
      }
    } catch (error) {
      // Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <>
      {/* <StatusBar translucent backgroundColor="transparent" /> */}
      <ImageBackground
        source={require('../../assets/images/profilecover.png')}
        style={{ height: 150, justifyContent: 'flex-start', alignItems: 'flex-start' }}
      >

        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="close" size={24} color="white" padding={10} />
        </TouchableOpacity>
        {PhotoUrl && <Image
          source={{ uri: PhotoUrl }}
          style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'white', marginTop: 50, marginLeft: 40 }}
        />}
      </ImageBackground>

      <View style={{ flexDirection: 'row', marginTop: 50, marginLeft: 30 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20 }} className="dark:text-gray-100">{Name}</Text>
        {/* <View style={{ marginTop: 5, marginLeft: 20, borderRadius: 10, borderWidth: 2, borderColor: 'green' }}>
          <Text className="dark:text-gray-100" style={{ fontWeight: 'bold', fontSize: 12, paddingHorizontal: 10, color: 'green' }}>in</Text>
        </View> */}
      </View>

      <View style={{ marginLeft: 30, marginTop: 10 }} className={`${profile === 'self' ? "mb-4" : ""}`}>
        <Text style={{ fontWeight: 'bold' }} className="dark:text-gray-100">
          <Text style={{ fontWeight: 'normal' }} className="dark:text-gray-100">Designation:</Text> {designation}
        </Text>
      </View>

      {profile === 'other' &&
        <View className="mx-8 my-6">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => handleMailPress(mail)}>
              <Feather name="mail" size={24} color="red" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSmsPress(Mobile)}>
              <MaterialCommunityIcons name="message-text-outline" size={24} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDialPress(Mobile)}>
              <Ionicons name="call-outline" size={24} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleWhatsapp(Mobile)}>
              <FontAwesome6 name="whatsapp" size={24} color="green" />
            </TouchableOpacity>
          </View>
        </View>
      }
    </>
  );

  useEffect(() => {
    getData();
  }, []);

  const tabs = TABS({ data });
  const filteredTabs = tabs.filter(tab => tab.view === 'common' || profile === 'self');


  return (

    <View className='flex-1 dark:bg-black'>
      {data.length === 0 && <NotFound text='No Profile Record Found!' backButtonVisible={true} />}
      <Loader isLoading={loading} display="hide" />
      {data.length !== 0 &&
        <TabbedHeaderPager
          containerStyle={{ flex: 1 }}
          title="My Profile"
          titleStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'white', fontWeight: 'bold', fontSize: 30, padding: 10 }}
          tabsContainerBackgroundColor={colorScheme === 'light' ? "white" : "#1E1E2D"}
          tabTextContainerStyle={{ borderRadius: 18, backgroundColor: 'transparent' }}
          tabTextContainerActiveStyle={{ backgroundColor: colorScheme === 'light' ? "#1B1656" : "white", }}
          tabTextStyle={{ color: colorScheme === 'light' ? "black" : "white", fontWeight: 'bold', fontSize: 16, paddingHorizontal: 12, paddingVertical: 8 }}
          tabTextActiveStyle={{ color: colorScheme === 'dark' ? "black" : "white" }}
          tabWrapperStyle={{ paddingVertical: 10 }}
          tabsContainerStyle={{ paddingHorizontal: 10 }}
          onScroll={onScroll}
          tabs={filteredTabs}
          renderHeader={renderHeader}
          // renderHeaderBar={() => <HeaderBar scrollValue={scrollValue} />}
          showsVerticalScrollIndicator={false}
        >
          {filteredTabs.map((tab, i) => (
            <View key={i} className="flex-1">
              <tab.component data={data} />
            </View>
          ))}
        </TabbedHeaderPager>
      }
      {/* <StatusBar barStyle="light-content" backgroundColor="black" translucent /> */}
    </View>

  );
};

export default React.memo(ProfileView);
