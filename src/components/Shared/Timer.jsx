import React, { useState, useEffect } from 'react';
import { Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Timer = ({ duration, onTimeUp }) => {
  // Initialize state with the duration provided by the question config
  const [timeLeft, setTimeLeft] = useState(duration);

  // Effect to reset the timer state whenever a new question loads (i.e., 'duration' prop changes)
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    // Stop and call the submission function when time runs out
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    // Set up the countdown interval
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Cleanup: Clear the interval when the component unmounts or dependencies change
    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp, duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Change color when time is critical
  const color = timeLeft < 10 ? 'red' : 'blue';

  return (
    <Tag color={color} icon={<ClockCircleOutlined />}>
      <Text strong style={{ color: color === 'red' ? 'red' : 'white' }}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </Text>
    </Tag>
  );
};

export default Timer;
