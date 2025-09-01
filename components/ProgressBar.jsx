import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAuthContext } from '../context/AuthProvider';
import moment from 'moment';

const ProgressBar = ({ workTime, status }) => {
  const [data, setData] = useState({ color: "", progress: 0 });
  const [Progress, setProgress] = useState(0);
  const { user } = useAuthContext();
  const redCirclePosition = `${data.progress}%`;

  useEffect(() => {
    calculateProgress(workTime)
  }, [workTime]);

  const parseTimeToDecimal = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  const calculateProgress = (timeWorked) => {
    const shift = calculateTotalHrs();
    const actualWorkingTime = parseTimeToDecimal(timeWorked);
    const progress = (actualWorkingTime / shift) * 100;
    setProgress(progress > 100 ? 100 : progress)
  };

  const calculateTotalHrs = () => {
    if (!user?.shiftArray?.InTime || !user?.shiftArray?.OutTime) {
      return 8.5;
    }

    const inTime = moment(user?.shiftArray.InTime, "HH:mm");
    const outTime = moment(user?.shiftArray.OutTime, "HH:mm");

    // Calculate the difference in hours and minutes
    const duration = moment.duration(outTime.diff(inTime));
    const hours = duration.hours();
    const minutes = duration.minutes();

    // Convert total time difference to a decimal format
    const totalHoursDecimal = hours + minutes / 60;
    return totalHoursDecimal.toFixed(2);
  };

  useEffect(() => {
    if (status.includes("attendence")) {
      setData({ color: "#22c55e", progress: Progress });
    }
    if (status.includes("holiday") && !status.includes("attendence")) {
      setData({ color: "#0ea5e9", progress: 100 });
    }
    if (status.includes("weekend") && !status.includes("attendence") && !status.includes("holiday")) {
      setData({ color: "#fbbf24", progress: 100 });
    }
    if (status.includes("leave") && !status.includes("attendence")) {
      setData({ color: "#f97316", progress: 100 });
    }
    if (status.includes("absent") && !status.includes("attendence")) {
      setData({ color: "#ef4444", progress: 100 });
    }
  }, [Progress, status])


  return (
    <View style={{ width: "75%" }} className="bg-gray-100 justify-center rounded-full">
      <View
        className="h-[3px] opacity-80"
        style={{ width: `${data.progress}%`, backgroundColor: data.color }}
      >
      </View>
      {status.includes("attendence") &&
        <View style={{ position: 'absolute', left: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: 'green', zIndex: 2 }} />
      }
      {status.includes("attendence") &&
        <View style={{ position: 'absolute', left: redCirclePosition, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red', zIndex: 1 }} />
      }
    </View>
  );
};

export default ProgressBar;
