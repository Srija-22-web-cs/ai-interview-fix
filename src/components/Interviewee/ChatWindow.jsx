import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Input, Button, message, List, Progress, Typography, Alert, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { recordAnswer, completeInterview } from '../../redux/candidatesSlice';
import { getNextQuestion, judgeAnswer, calculateFinalResult } from '../../utils/aiLogic';
import { TOTAL_QUESTIONS } from '../../utils/constants';
import Timer from '../Shared/Timer'; 

const { Text } = Typography;
const { TextArea } = Input;

// Helper function to format chat messages
const formatMessage = (sender, content) => ({ sender, content, timestamp: Date.now() });

const ChatWindow = ({ candidate, onComplete }) => { // <-- Added onComplete prop
  const dispatch = useDispatch();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Used while waiting for mock AI response
  
  const chatBottomRef = useRef(null);

  // Use useMemo to reconstruct the chat messages history cleanly from Redux state
  const chatMessages = useMemo(() => {
    // 1. Restore Chat History (Answers + Critiques)
    const historyMessages = candidate.history.flatMap((item, index) => [
        // Previous Question
        formatMessage('AI', `Q${index+1} (${item.level}, ${item.timeLimit}s): ${item.question}`),
        // Candidate Answer
        formatMessage('Candidate', item.answer),
        // AI Critique
        formatMessage('AI', `Critique: ${item.critique} (Score: ${item.score}/10)`),
    ]);

    // 2. Add the Current Question (if active and not yet answered)
    if (currentQuestion && candidate.progress < TOTAL_QUESTIONS) {
        // Only show the current question if it's new (progress matches history length)
        if (candidate.progress === candidate.history.length) {
            historyMessages.push(
                formatMessage(
                    'AI', 
                    `Q${candidate.progress + 1} (${currentQuestion.level}, ${currentQuestion.timeLimit}s): ${currentQuestion.text}`
                )
            );
        }
    }
    
    // 3. Add Finalization Message if complete
    if (candidate.status === 'completed') {
        historyMessages.push(
            formatMessage('System', `Interview complete! Final Score: ${candidate.finalScore}%. Summary available in Interviewer tab.`)
        );
    }

    return historyMessages;
  }, [candidate.history, candidate.progress, candidate.status, currentQuestion]);

  // Effect to sync state (load the current question) on mount/resume
  useEffect(() => {
    if (candidate.status === 'in-progress' || candidate.status === 'paused') {
        
        // 1. Load the next question based on current progress index
        const nextQ = getNextQuestion(candidate.progress);
        
        if (nextQ) {
            setCurrentQuestion(nextQ);
            // Only allow answering if status is 'in-progress'
            setIsAnswering(candidate.status === 'in-progress'); 
        } else if (candidate.progress === TOTAL_QUESTIONS && candidate.status !== 'completed') {
            // All questions answered, time to finalize
            finalizeInterview(candidate.history);
        }
    }
  }, [candidate.id, candidate.progress, candidate.status, candidate.history]);
  
  // Scroll to bottom whenever messages update
  useEffect(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handler for automatic submission when timer runs out
  const handleTimeUp = () => {
    if (isAnswering) {
      handleSubmitAnswer(true); // true means forced/auto-submit
    }
  };
  
  const handleSubmitAnswer = async (isTimeUp = false) => {
    // Prevent accidental double submission or submission during processing
    if (isProcessing) return; 

    const finalAnswer = isTimeUp ? (answer || 'No answer provided (Time Up)') : answer;
    
    if (finalAnswer.trim().length === 0 && !isTimeUp) {
      message.warning('Please provide an answer before submitting.');
      return;
    }

    setIsAnswering(false);
    setIsProcessing(true); // Start processing state
    
    // Announce submission in console
    console.log(isTimeUp ? 'Time ran out! Submitting answer...' : 'Submitting answer...');
    
    // 1. Mock AI Judgment (API call placeholder)
    const { score, critique } = await judgeAnswer(
      currentQuestion.text,
      finalAnswer,
      currentQuestion.level
    );

    const answerData = {
        qId: currentQuestion.id,
        level: currentQuestion.level,
        question: currentQuestion.text,
        answer: finalAnswer,
        score,
        critique,
        timeLimit: currentQuestion.timeLimit // Store the time limit used
    };
    
    // 2. Dispatch to Redux (Moves progress counter forward, triggers useEffect for next question)
    dispatch(recordAnswer({ id: candidate.id, answerData }));
    
    setAnswer(''); // Clear input for next question
    setIsProcessing(false); // End processing state

    // 3. Check if interview is finished
    const nextQIndex = candidate.progress + 1; 
    if (nextQIndex >= TOTAL_QUESTIONS) {
        // Finalize using the newly updated history state that will be available
        finalizeInterview([...candidate.history, answerData]);
    }
  };
  
  const finalizeInterview = async (currentHistory) => {
      setIsProcessing(true);
      
      const { finalScore, summary } = calculateFinalResult(currentHistory);

      dispatch(completeInterview({
          id: candidate.id,
          finalScore,
          summary,
      }));
      
      setIsProcessing(false);
      onComplete(); // <-- TRIGGER THE MODAL
  };
  
  if (candidate.status === 'completed') {
    return (
        <Alert 
            message="Interview Complete"
            description="The interview is finished. Check the Interviewer tab for your final summary."
            type="success"
            showIcon
        />
    );
  }

  // Display "paused" status
  if (candidate.status === 'paused') {
      return (
        <Alert 
            message="Interview Paused"
            description="Your session is currently paused. Please click 'Resume Session' on the main tab to continue."
            type="info"
            showIcon
        />
      );
  }

  // Handle case while waiting for next question to load
  if (!currentQuestion || isProcessing) {
       return (
        <Alert 
            message="Processing..."
            description="The AI is preparing the next question or calculating the final critique. Please wait."
            type="info"
            showIcon
        />
    );
  }
  
  const currentQNum = candidate.progress + 1;
  const progressPercent = (candidate.progress / TOTAL_QUESTIONS) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
      <Progress 
        percent={progressPercent} 
        steps={TOTAL_QUESTIONS} 
        size="small"
        style={{ marginBottom: 10 }}
        showInfo={true}
        format={() => `Q${currentQNum} of ${TOTAL_QUESTIONS}`}
      />
      
      {/* Chat Messages Area */}
      <List
        style={{ flex: 1, overflowY: 'auto', marginBottom: 10, paddingRight: 10, background: '#f5f5f5', borderRadius: 8 }}
        dataSource={chatMessages}
        renderItem={item => (
          <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
            <Text 
              strong={item.sender !== 'Candidate'} 
              type={item.sender === 'System' ? 'secondary' : (item.sender === 'AI' ? 'primary' : undefined)}
              style={{ marginRight: 8 }}
            >
              {item.sender}:
            </Text>
            {item.content}
          </List.Item>
        )}
      >
        {/* Add processing status indicator to chat area */}
        {isProcessing && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <Text type="secondary">AI is analyzing your response...</Text>
            </div>
        )}
        <div ref={chatBottomRef} />
      </List>

      {/* Input and Timer Area */}
      <Card 
        size="small" 
        style={{ border: '1px solid #d9d9d9' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Your Answer (Q{currentQNum})</Text>
            <Space>
                {isProcessing && <Text type="secondary">AI Processing...</Text>}
                {isAnswering && currentQuestion && (
                    <Timer 
                        key={currentQuestion.id} // Key forces reset when question changes
                        duration={currentQuestion.timeLimit}
                        onTimeUp={handleTimeUp}
                    />
                )}
            </Space>
          </div>
        }
      >
        <TextArea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          placeholder={"Type your answer here..."}
          disabled={!isAnswering || isProcessing}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => handleSubmitAnswer(false)}
          disabled={!isAnswering || isProcessing}
          style={{ marginTop: 8 }}
        >
          Submit Answer
        </Button>
      </Card>
    </div>
  );
};

export default ChatWindow;
