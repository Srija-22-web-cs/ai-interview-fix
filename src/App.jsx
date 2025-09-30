import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Typography, Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { pauseSession } from './redux/candidatesSlice';
import IntervieweeTab from './components/Interviewee/IntervieweeTab';
import InterviewerTab from './components/Interviewer/InterviewerTab';
import WelcomeBackModal from './components/Interviewee/WelcomeBackModal';

const { Content, Header } = Layout;
const { Title } = Typography;

const App = () => {
  const dispatch = useDispatch();
  const activeCandidateId = useSelector(state => state.candidates.activeCandidateId);
  const candidates = useSelector(state => state.candidates.candidates);
  
  const activeCandidate = candidates[activeCandidateId];
  
  const [activeKey, setActiveKey] = useState('interviewee');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Persistence/Welcome Back Logic
  useEffect(() => {
    // Check if there is an active/paused session to resume
    const hasPausedSession = activeCandidateId && activeCandidate && activeCandidate.status === 'paused';
    
    // Auto-pause when the component unmounts (e.g., page close/refresh)
    const handleBeforeUnload = () => {
      if (activeCandidateId && candidates[activeCandidateId]?.status === 'in-progress') {
        // Automatically pause the session right before the user leaves or refreshes
        dispatch(pauseSession());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Show modal on load if a session is paused
    if (hasPausedSession) {
      setIsModalOpen(true);
    }

    return () => {
      // Clean up the event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeCandidateId, activeCandidate?.status, dispatch, candidates]);

  const items = [
    {
      key: 'interviewee',
      label: 'Interviewee (Chat)',
      children: <IntervieweeTab />,
    },
    {
      key: 'interviewer',
      label: 'Interviewer (Dashboard)',
      children: <InterviewerTab />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#001529', padding: '0 50px' }}>
        <Title level={3} style={{ color: 'white', margin: 0, lineHeight: '64px' }}>
          🤖 Crisp AI Interview Assistant
        </Title>
      </Header>
      <Content style={{ padding: '50px', background: '#f0f2f5' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 600 }}>
          <Tabs 
            defaultActiveKey="interviewee" 
            activeKey={activeKey}
            onChange={setActiveKey}
            items={items} 
          />
        </div>
      </Content>
      
      {/* Welcome Back Modal - Only rendered if a session is active and paused */}
      {activeCandidate && (activeCandidate.status === 'paused' || isModalOpen) && (
        <WelcomeBackModal
          isVisible={isModalOpen && activeCandidate.status === 'paused'}
          onClose={() => setIsModalOpen(false)}
          candidateId={activeCandidateId}
          candidateName={activeCandidate.profile.name}
          progress={activeCandidate.progress}
        />
      )}
    </Layout>
  );
};

export default App;
