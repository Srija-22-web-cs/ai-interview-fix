import React, { useState } from 'react'; 
import { Card, Result, Button, Typography, Space, Modal } from 'antd'; 
import { useSelector, useDispatch } from 'react-redux';
import ResumeFlow from './ResumeFlow';
import ChatWindow from './ChatWindow';
import { pauseSession, clearActiveSession } from '../../redux/candidatesSlice';
import { ROLE_TITLE } from '../../utils/constants';

const { Title, Text } = Typography;

const IntervieweeTab = () => {
  const dispatch = useDispatch();
  const activeCandidateId = useSelector(state => state.candidates.activeCandidateId);
  const candidate = useSelector(state => activeCandidateId ? state.candidates.candidates[activeCandidateId] : null);

  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false); // State for Completion Modal

  const isInterviewComplete = candidate && candidate.status === 'completed';
  const isInterviewActive = candidate && (candidate.status === 'in-progress' || candidate.status === 'paused');

  const handlePause = () => {
    dispatch(pauseSession());
  };
  
  const handleStartNew = () => {
      // Use Modal instead of window.confirm for better UI/UX
      Modal.confirm({
        title: 'Start New Interview?',
        content: 'Your current progress will be permanently deleted.',
        okText: 'Start New',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        onOk: () => {
            dispatch(clearActiveSession());
            setIsCompleteModalVisible(false); // Ensure modal is closed
        },
      });
  };

  // State 1: No session started
  if (!isInterviewActive && !isInterviewComplete) {
    return <ResumeFlow />;
  }

  // State 2: Interview Complete (Primary Display)
  if (isInterviewComplete) {
    return (
      <Card title="Interview Complete" style={{ maxWidth: 800, margin: '50px auto' }}>
        <Result
          status="success"
          title={`Congratulations, ${candidate.profile.name}!`}
          subTitle="Your interview has been completed. Check the Interviewer tab for your final score and summary."
          extra={[
            <Title level={1} key="score" style={{ color: '#52c41a' }}>{candidate.finalScore}%</Title>,
            <Text key="summary" strong>{candidate.summary}</Text>,
            <Button type="primary" key="new-interview" onClick={handleStartNew} style={{ marginTop: 20 }}>
              Start New Interview
            </Button>,
          ]}
        />
        
        {/* Completion Modal - Displays when interview is complete */}
        <Modal
            title="Thank You!"
            open={isCompleteModalVisible}
            onCancel={() => setIsCompleteModalVisible(false)}
            footer={[
                <Button key="dashboard" type="primary" onClick={() => setIsCompleteModalVisible(false)}>
                    View Dashboard
                </Button>
            ]}
        >
            <p>Your interview is complete. Thank you for your time!</p>
            <p>You can view your final score and detailed performance summary on the **Interviewer (Dashboard)** tab.</p>
        </Modal>
      </Card>
    );
  }

  // State 3: Interview in progress or paused
  return (
    <Card 
        title={`Interview Session: ${ROLE_TITLE}`} 
        extra={
            <Space>
                <Button onClick={handlePause} disabled={candidate?.status === 'paused'}>Pause Session</Button>
                <Button danger onClick={handleStartNew}>Cancel Session</Button>
            </Space>
        }
    >
      <ChatWindow 
        candidate={candidate} 
        onComplete={() => setIsCompleteModalVisible(true)} // Passed the modal trigger
      />
    </Card>
  );
};

export default IntervieweeTab;
