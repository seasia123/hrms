import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, Modal, Pressable, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import moment from 'moment';
import { Dropdown } from 'react-native-element-dropdown';
import { useAuthContext } from '../../context/AuthProvider';
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import Http from '../../services/httpService';
import { CustomButton, Loader } from '../../components';

const RaiseLeaveRequest = React.memo((props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { colorScheme } = useColorScheme();
  const { date: initialDate, leaveSelected = null } = useLocalSearchParams();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(initialDate ? moment.utc(initialDate, 'YYYY-MM-DD').local().toDate() : new Date());
  const [endDate, setEndDate] = useState(initialDate ? moment.utc(initialDate, 'YYYY-MM-DD').local().toDate() : new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState();
  const [leavesDropDown, setLeavesDropDown] = useState([]);
  const [selectedDates, setSelectedDates] = useState({});
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  useEffect(() => {
    if (leaveSelected !== null && dropdownLoading === false) {
      const selectedLeave = leavesDropDown.find(leave => leave.leave_id == leaveSelected);
      setLeaveType(selectedLeave);
    }
  }, [leaveSelected, dropdownLoading]);

  const getLeaveType = async () => {
    const userId = await SecureStore.getItemAsync('user_id');
    const payload = new FormData();
    payload.append("user_id", userId);
    try {
      const response = await Http.post("/remaining_leave_balance", payload);
      if (response.ok) {
        const data = await response.json();
        setLeavesDropDown(data?.data);
        setDropdownLoading(false);
      } else {
        throw new Error('Failed to fetch leave balance. Please try again.');
      }
    } catch (error) {
      Alert.alert("Error", error.message);
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    getLeaveType();
  }, []);

  useEffect(() => {
    if (leaveType) {
      setLeaveBalance(leaveType?.balancecnt || 0);
    }
    updateSelectedDates(startDate, endDate);
  }, [startDate, endDate, leaveType]);

  // const handleConfirmStartDate = (selectedDate) => {
  //   if (selectedDate > endDate) {
  //     Alert.alert("Error", "Start date cannot be greater than end date.");
  //     return;
  //   }
  //   const currentDate = selectedDate || startDate;
  //   setShowStartDatePicker(Platform.OS === 'ios');
  //   setStartDate(currentDate);
  //   setShowStartDatePicker(false);
  //   updateSelectedDates(currentDate, endDate);
  // };

  const handleConfirmStartDate = (selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    setShowStartDatePicker(false);

    if (currentDate > endDate) {
      setEndDate(currentDate);
      updateSelectedDates(currentDate, currentDate);
    } else {
      updateSelectedDates(currentDate, endDate);
    }
  };



  // const handleConfirmEndDate = (selectedDate) => {
  //   if (selectedDate < startDate) {
  //     Alert.alert("Error", "End date cannot be less than start date.");
  //     return;
  //   }
  //   const currentDate = selectedDate || endDate;
  //   setShowEndDatePicker(Platform.OS === 'ios');
  //   setEndDate(currentDate);
  //   setShowEndDatePicker(false);
  //   updateSelectedDates(startDate, currentDate);
  // };

  const handleConfirmEndDate = (selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
    setShowEndDatePicker(false);

    if (currentDate < startDate) {
      setStartDate(currentDate);
      updateSelectedDates(currentDate, currentDate);
    } else {
      updateSelectedDates(startDate, currentDate);
    }
  };


  const updateSelectedDates = (start, end) => {
    // if (end < start) {
    //   Alert.alert("Error", "End date cannot be less than start date.");
    //   return;
    // }
    const dateArray = [];
    let currentDate = moment(start);
    while (currentDate <= moment(end)) {
      dateArray.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'days');
    }
    const dates = dateArray.reduce((acc, date) => {
      acc[date] = { type: 'full' };
      return acc;
    }, {});
    setSelectedDates(dates);
    calculateLeaveBalance(dates);
  };

  const handleDayTypeChange = (date, type) => {
    const updatedDates = {
      ...selectedDates,
      [date]: { type, halfType: type === 'half' ? 'first' : null },
    };
    setSelectedDates(updatedDates);
    calculateLeaveBalance(updatedDates);
  };

  const handleHalfTypeChange = (date, halfType) => {
    const updatedDates = {
      ...selectedDates,
      [date]: { ...selectedDates[date], halfType },
    };
    setSelectedDates(updatedDates);
    calculateLeaveBalance(updatedDates);
  };


  const calculateLeaveBalance = (dates) => {
    let balance = leaveType?.balancecnt || 0;
    Object.keys(dates).forEach((date) => {
      balance -= dates[date].type === 'half' ? 0.5 : 1;
    });
    setLeaveBalance(balance);
  };

  const transformSelectedDates = (dates) => {
    let totalLeaveDays = 0;
    const transformedDates = Object.entries(dates).map(([date, { type, halfType }]) => {
      totalLeaveDays += type === 'half' ? 0.5 : 1;
      return {
        date,
        type,
        half_type: halfType ? (halfType === 'first' ? '1' : '2') : 'null',
      };
    });

    return { transformedDates, totalLeaveDays };
  };

  const handleSubmit = async () => {
    if (!reason || !leaveType) {
      Alert.alert("Error", "Please fill all the fields marked with *");
      return;
    }
    const { transformedDates, totalLeaveDays } = transformSelectedDates(selectedDates);
    const userId = await SecureStore.getItemAsync('user_id');
    const payload = new FormData();
    payload.append("user_id", userId);
    payload.append("leave_allocation_id", leaveType.leave_allocation_id);
    payload.append("leave_perticulars", JSON.stringify(transformedDates));
    payload.append("leave_reason", reason);
    payload.append("remark", "");
    payload.append("start_date", moment(startDate).format('YYYY-MM-DD'));
    payload.append("end_date", moment(endDate).format('YYYY-MM-DD'));
    payload.append("total_leave_days", totalLeaveDays);
    // console.log(typeof JSON.stringify(transformedDates));
    setSubmitting(true);
    try {
      const response = await Http.post("/apply_leave", payload);
      if (response.ok) {
        Alert.alert("Success", "Request raised successfully.", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        throw new Error('Failed to submit request. Please try again.');
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };



  const renderItem = item => {
    return (
      <View className="flex-row items-center p-4 justify-between bg-white dark:bg-black-100">
        <Text className="ml-4 dark:text-gray-100 text-[14px]" style={{ fontWeight: item?.leave_allocation_id === leaveType?.leave_allocation_id ? "600" : "400" }}>{item.balance}</Text>
        {item?.leave_allocation_id === leaveType?.leave_allocation_id && (
          <AntDesign
            color={colorScheme === 'light' ? "blue" : "white"}
            name="check"
            size={20}
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Loader isLoading={loading} />
      <ScrollView className="flex-1 p-4 dark:bg-black">
        <View className="mb-4">
          <Text className="font-semibold dark:text-gray-100">Employee</Text>
          <Text className="text-black dark:text-gray-100">{user.name}</Text>
        </View>
        <View className="mb-4">
          <Text className="font-semibold dark:text-gray-100">Leave Type&nbsp;<Text className="text-red-500">*</Text></Text>
          {dropdownLoading ? (
            <ActivityIndicator size="small" color={colorScheme === 'light' ? "#0000ff" : "white"} />
          ) : (
            <Dropdown
              // mode="modal"
              className="h-10"
              placeholderStyle={{ color: colorScheme === 'light' ? "black" : "#cdcde0" }}
              selectedTextStyle={{ color: colorScheme === 'light' ? "black" : "#cdcde0" }}
              iconStyle="w-5 h-5"
              data={leavesDropDown}
              search
              // maxHeight={300}
              labelField="title"
              valueField="leave_allocation_id"
              placeholder="Select"
              searchPlaceholder="Search..."
              value={leaveType}
              onChange={(item) => {
                setLeaveType(item);
                setLeaveBalance(item.balancecnt);
                updateSelectedDates(startDate, endDate);
              }}
              renderLeftIcon={() => (
                <AntDesign style={{ marginRight: 6 }} color={colorScheme === 'light' ? "black" : "white"} name="Safety" size={20} />
              )}
              renderItem={renderItem}
            />
          )}
        </View>

        {leaveType && leaveType.id != 4 &&
          <TouchableOpacity className="bg-white dark:bg-black-100 p-4 rounded-full mb-4 flex-row items-center justify-between" onPress={() => setOpen(true)}>
            <Text className="font-semibold dark:text-gray-100">Balance/Preview:&nbsp;{`${leaveType.balancecnt} Day(s)`}</Text>
            <Feather name="info" size={20} color={colorScheme === 'light' ? "black" : "white"} />
          </TouchableOpacity>
        }
        <TouchableOpacity className="mb-9 flex-row items-center justify-between" onPress={() => setShowStartDatePicker(true)}>
          <View>
            <Text className="font-semibold dark:text-gray-100">From&nbsp;<Text className="text-red-500">*</Text></Text>
            <Text className="dark:text-gray-100">{moment(startDate).format('DD-MMM-YYYY')}</Text>
          </View>
          <Feather name="calendar" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity className="mb-9 flex-row items-center justify-between" onPress={() => setShowEndDatePicker(true)}>
          <View>
            <Text className="font-semibold dark:text-gray-100">To&nbsp;<Text className="text-red-500">*</Text></Text>
            <Text className="dark:text-gray-100">{moment(endDate).format('DD-MMM-YYYY')}</Text>
          </View>
          <Feather name="calendar" size={24} color="black" />
        </TouchableOpacity>
        <View>
          {leaveType && Object.keys(selectedDates).map((date) => (
            <View key={date} className="mb-4">
              <Text className="font-semibold dark:text-gray-100">{moment(date).format('DD MMM, ddd')}</Text>
              <View className="flex-row mt-2">
                <TouchableOpacity
                  className={`p-2 px-4 mr-4 rounded-md ${selectedDates[date].type === 'full' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  onPress={() => handleDayTypeChange(date, 'full')}
                >
                  <Text className="text-white font-semibold">Full Day</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-2 px-4 rounded-md ${selectedDates[date].type === 'half' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  onPress={() => handleDayTypeChange(date, 'half')}
                >
                  <Text className="text-white font-semibold">Half Day</Text>
                </TouchableOpacity>
              </View>
              {selectedDates[date].type === 'half' && (
                <View className="flex-row mt-2">
                  <TouchableOpacity
                    className={`p-2 px-4 mr-4 rounded-md ${selectedDates[date].halfType === 'first' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    onPress={() => handleHalfTypeChange(date, 'first')}
                  >
                    <Text className="text-white font-semibold">1st</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`p-2 px-4 rounded-md ${selectedDates[date].halfType === 'second' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    onPress={() => handleHalfTypeChange(date, 'second')}
                  >
                    <Text className="text-white font-semibold">2nd</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
        <View className="mb-4">
          <Text className="font-semibold dark:text-gray-100">Reason for leave&nbsp;<Text className="text-red-500">*</Text></Text>
          <TextInput
            className="h-10 dark:text-white"
            underlineColorAndroid="transparent"
            placeholder="Enter Value.."
            placeholderTextColor={colorScheme === 'light' ? "black" : "#CDCDE0"}
            numberOfLines={10}
            multiline={true}
            value={reason}
            onChangeText={(e) => setReason(e)}
          />
        </View>
      </ScrollView>
      <View className="flex-row justify-around bg-white dark:bg-black-100 p-6">
        <TouchableOpacity className="p-4 px-8 bg-red-500 rounded-full" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Cancel</Text>
        </TouchableOpacity>
        <CustomButton
          title="Submit"
          handlePress={handleSubmit}
          textStyles="text-white font-semibold text-sm"
          containerStyles="rounded-full bg-green-500 p-4 px-8"
          isLoading={submitting}
        />
      </View>
      <Modal
        transparent={true}
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable className="flex-1 justify-end  bg-black/50" onPress={() => setOpen(false)}>
          <View className="bg-white dark:bg-black-100 p-4 rounded-t-lg w-full">
            <View className="flex-row w-full justify-between mb-4">
              <Text className="font-semibold text-lg dark:text-gray-100">As of {moment(startDate).format("DD-MMM-YYYY")}</Text>
              <Text className="font-semibold text-lg dark:text-gray-100">Days</Text>
            </View>
            <View className="flex-row w-full justify-between mb-2">
              <Text className="dark:text-gray-100">Available Balance</Text>
              <Text className="font-semibold dark:text-gray-100">{leaveType?.balancecnt}</Text>
            </View>
            <View className="flex-row w-full justify-between mb-2">
              <Text className="dark:text-gray-100">Currently Booked</Text>
              <Text className="font-semibold dark:text-gray-100">{leaveType?.taken}</Text>
            </View>
            <View className="flex-row w-full justify-between mb-2">
              <Text className="dark:text-gray-100">Balance after booked leave</Text>
              <Text className="font-semibold dark:text-gray-100">{leaveBalance}</Text>
            </View>
          </View>
        </Pressable>
      </Modal>
      {Platform.OS === 'ios' ? (
        <>
          <DateTimePickerModal
            isVisible={showStartDatePicker}
            mode="date"
            onConfirm={handleConfirmStartDate}
            onCancel={() => setShowStartDatePicker(false)}

          />
          <DateTimePickerModal
            isVisible={showEndDatePicker}
            mode="date"
            onConfirm={handleConfirmEndDate}
            onCancel={() => setShowEndDatePicker(false)}

          />
        </>
      ) : (
        <>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                handleConfirmStartDate(selectedDate);
              }}
            />
          )}
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                handleConfirmEndDate(selectedDate);
              }}
            />
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
});

export default RaiseLeaveRequest;
