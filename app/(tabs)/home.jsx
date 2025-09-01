import { RefreshControl, ScrollView } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import CheckInOutCard from '../../components/HomeScreen/CheckinCheckoutCard'
import BirthdaysCard from '../../components/HomeScreen/BirthdaysCard'
import NewHiresCard from '../../components/HomeScreen/NewHires'
import LeaveReportCard from '../../components/HomeScreen/LeaveReportCard'
import UpcomingHolidaysCard from '../../components/HomeScreen/UpcomingHolidaysCard'

const Home = () => {
    const [refreshing, setRefreshing] = useState(false);
    const checkInOutCardRef = useRef(null);
    const birthdayCardRef = useRef(null);
    const newHireCardRef = useRef(null);
    const holidayCardRef = useRef(null);
    const leaveCardRef = useRef(null);

    const onRefresh = useCallback(() => {
        setRefreshing(true);

        if (checkInOutCardRef.current) {
            checkInOutCardRef.current.getCheckInData();
        }
        if (birthdayCardRef.current) {
            birthdayCardRef.current.getData();
        }
        if (newHireCardRef.current) {
            newHireCardRef.current.getData();
        }
        if (holidayCardRef.current) {
            holidayCardRef.current.getData();
        }
        if (leaveCardRef.current) {
            holidayCardRef.current.getData();
        }
    }, []);

    const onRefreshSuccess = useCallback(() => {
        setRefreshing(false);
    }, []);

    return (
        <ScrollView
            className="px-4 dark:bg-black"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <CheckInOutCard ref={checkInOutCardRef} onRefreshSuccess={onRefreshSuccess} />
            <BirthdaysCard ref={birthdayCardRef} />
            <NewHiresCard ref={newHireCardRef} />
            <LeaveReportCard ref={leaveCardRef} />
            <UpcomingHolidaysCard ref={holidayCardRef} />
        </ScrollView>
    )
}

export default Home