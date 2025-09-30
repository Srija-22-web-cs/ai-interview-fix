import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import { resumeSession, clearActiveSession } from '../../redux/candidatesSlice';
import { TOTAL_QUESTIONS } from '../../utils/constants';

const { Title, Text } = Typography;

const WelcomeBackModal = ({ isVisible, onClose, candidateId, candidateName, progress }) => {
  const dispatch = useDispatch();
  
  const handleResume = () => {
    // Dispatch action to set the session status back to 'in-progress'
    dispatch(resumeSession({ id: candidateId }));
    onClose();
  };
  
  const handleStartNew = () => {
    // Show a confirmation modal (Ant Design's Modal.confirm is used instead of window.confirm)
    Modal.confirm({
      title: 'Delete Current Progress?',
      content: 'Starting a new interview will permanently delete your current session progress.',
      okText: 'Start New',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        dispatch(clearActiveSession()); // Clear the active session and start fresh
        onClose();
      },
    });
  };

  return (
    <Modal
      open={isVisible}
      title={<Title level={4}>Welcome Back, {candidateName}!</Title>}
      // Prevent closing by clicking outside, forcing the user to choose an action
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="new" onClick={handleStartNew} danger>
          Start New Interview (Delete Progress)
        </Button>,
        <Button key="resume" type="primary" onClick={handleResume}>
          Resume Session
        </Button>,
      ]}
    >
      <Text>
        We found an unfinished interview session for you. You were about to start question **{progress + 1} of {TOTAL_QUESTIONS}**.
      </Text>
      <p style={{ marginTop: 10 }}>
        Would you like to resume your session and continue your progress?
      </p>
    </Modal>
  );
};

export default WelcomeBackModal;
