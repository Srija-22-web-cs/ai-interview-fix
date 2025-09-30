import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Form, Input, Card, Typography, Space, Alert, Steps, Layout, Modal } from 'antd';
import { UploadOutlined, UserOutlined, MailOutlined, PhoneOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { startNewSession, updateProfile } from '../../redux/candidatesSlice';
import { loadFileContent, extractResumeData } from '../../utils/resumeParser';
import { ROLE_TITLE, REQUIRED_PROFILE_FIELDS } from '../../utils/constants';

const { Title, Text } = Typography;

const ProfileConfirmationModal = ({ isVisible, initialProfile, onConfirm, missingFields }) => {
    const [form] = Form.useForm();
    const missingLabel = missingFields.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');

    useEffect(() => {
        if (isVisible) {
            // Populate form with any data that was successfully extracted (or empty strings)
            form.setFieldsValue(initialProfile);
        }
    }, [isVisible, initialProfile, form]);

    const handleFinish = (values) => {
        onConfirm(values);
        // Modal will close via parent state update
    };

    const fieldMap = {
        name: { label: 'Name', icon: <UserOutlined /> },
        email: { label: 'Email', icon: <MailOutlined /> },
        phone: { label: 'Phone Number', icon: <PhoneOutlined /> }
    };

    return (
        <Modal
            title="Confirm Missing Details"
            open={isVisible}
            closable={false}
            maskClosable={false}
            footer={null} // Control buttons via the Form
        >
            <Alert
                message="Missing Information Detected"
                description={`The parser failed to confirm: ${missingLabel}. Please enter the missing details below to start the interview.`}
                type="warning"
                showIcon
                style={{ marginBottom: 20 }}
            />
            
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={initialProfile}
            >
                {REQUIRED_PROFILE_FIELDS.map(field => {
                    const data = fieldMap[field];
                    const isMissing = missingFields.includes(field);
                    return (
                        <Form.Item
                            key={field}
                            name={field}
                            label={data.label + (isMissing ? ' (MISSING)' : '')}
                            rules={[
                                { required: true, message: `Please input your ${data.label}!` },
                                field === 'email' ? { type: 'email', message: 'Input is not valid E-mail!' } : {}
                            ]}
                            validateStatus={isMissing ? 'error' : undefined}
                            help={isMissing ? 'This field was not extracted and is required.' : null}
                        >
                            <Input prefix={data.icon} placeholder={`Enter your ${data.label}`} />
                        </Form.Item>
                    );
                })}
                
                <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                    <Button type="primary" htmlType="submit">
                        Confirm and Start Interview
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};


const ResumeFlow = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  // State for the flow
  const [step, setStep] = useState(0); // 0: Upload, 1: Confirm/Chat Modal, 2: Ready
  const [fileList, setFileList] = useState([]);
  const [initialProfileData, setInitialProfileData] = useState({}); // Stores data for modal/redux init
  const [missingFields, setMissingFields] = useState([]);

  // The final, updated profile data is pulled directly from Redux for display consistency
  const activeCandidateId = useSelector(state => state.candidates.activeCandidateId);
  const activeCandidate = useSelector(state => activeCandidateId ? state.candidates.candidates[activeCandidateId] : null);
  const finalProfile = activeCandidate?.profile || {};

  const onFileChange = async (info) => {
    const newFileList = info.fileList.slice(-1);
    setFileList(newFileList);
    setStep(0); // Reset step while parsing

    if (newFileList.length === 1 && (info.file.status === 'done' || info.file.status === 'uploading')) {
      
      message.success(`${info.file.name} uploaded. Parsing data...`);
      
      try {
        const fileContent = await loadFileContent(info.file.originFileObj);
        const extractedProfile = extractResumeData(fileContent);
        
        // Determine which fields are missing (must be empty string to count as missing)
        const initialMissing = REQUIRED_PROFILE_FIELDS.filter(field => !extractedProfile[field]);
        
        // Set profile data for the Redux and Modal init
        const profileData = {
            name: extractedProfile.name || '', 
            email: extractedProfile.email || '',
            phone: extractedProfile.phone || ''
        };
        
        setInitialProfileData(profileData);
        setMissingFields(initialMissing);
        
        // 1. Initial Redux Session Start with extracted/partial data
        dispatch(startNewSession({ profile: profileData }));
        
        if (initialMissing.length === 0) {
            setStep(2); // Ready to start
            message.success('Profile extracted and confirmed automatically!');
        } else {
            setStep(1); // Show Modal/Confirmation Step
        }

      } catch (error) {
        message.error('Failed to process resume file. Forcing manual entry.');
        console.error(error);
        
        // Force fully manual entry
        const emptyProfile = {name: '', email: '', phone: ''};
        setInitialProfileData(emptyProfile);
        setMissingFields(REQUIRED_PROFILE_FIELDS);
        dispatch(startNewSession({ profile: emptyProfile })); 
        setStep(1); 
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed.`);
      setStep(0);
    }
  };

  const handleConfirmAndStart = (values) => {
    // 1. Update Redux with all final values (Name, Email, Phone) from the modal form
    // Since updateProfile only takes one field at a time, we dispatch for all three
    dispatch(updateProfile({ id: activeCandidateId, field: 'name', value: values.name }));
    dispatch(updateProfile({ id: activeCandidateId, field: 'email', value: values.email }));
    dispatch(updateProfile({ id: activeCandidateId, field: 'phone', value: values.phone }));
    
    // 2. Move to the Ready step
    setStep(2);
    message.success('Profile confirmed! Ready to start.');
  };

  const handleStartInterview = () => {
    // The IntervieweeTab component detects the active session and renders ChatWindow
    message.success('Starting Interview...');
  };
  
  // Custom upload logic to bypass actual server upload
  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };
  
  // --- UI RENDERING LOGIC ---

  const renderCurrentStepContent = () => {
    switch (step) {
      case 0: // Upload Step
        return (
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <Title level={4}>Upload Your Resume</Title>
            <Text type="secondary">Supported formats: PDF (required), DOCX (mocked).</Text>
            <Upload
              accept=".pdf,.docx"
              maxCount={1}
              onChange={onFileChange}
              customRequest={dummyRequest}
              fileList={fileList}
              beforeUpload={(file) => {
                const isAcceptable = file.type === 'application/pdf' || file.name.endsWith('.docx');
                if (!isAcceptable) {
                  message.error('You can only upload PDF or DOCX files!');
                }
                return isAcceptable || Upload.LIST_IGNORE;
              }}
            >
              <Button icon={<UploadOutlined />} size="large" style={{ marginTop: 24 }} disabled={fileList.length > 0}>
                Select File
              </Button>
            </Upload>
            <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>{fileList.length > 0 ? fileList[0].name : 'No file selected'}</Text>
          </Card>
        );

      case 1: // Chatbot/Confirm Details MODAL (new implementation)
        return (
            <ProfileConfirmationModal
                isVisible={step === 1}
                initialProfile={initialProfileData}
                onConfirm={handleConfirmAndStart}
                missingFields={missingFields}
            />
        );

      case 2: // Ready Step
        return (
          <Card style={{ textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            <Title level={3} style={{ marginTop: 16 }}>Profile Confirmed: Ready to Start!</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>We have successfully collected all required information.</Text>
            
            <div style={{ padding: 20, border: '1px solid #f0f0f0', display: 'inline-block', borderRadius: 8 }}>
                <Text strong>Name:</Text> {finalProfile.name} <br/>
                <Text strong>Email:</Text> {finalProfile.email} <br/>
                <Text strong>Phone:</Text> {finalProfile.phone}
            </div>

            <Button 
                type="primary" 
                size="large" 
                onClick={handleStartInterview} 
                style={{ marginTop: 30, display: 'block', margin: '30px auto 0' }}
            >
              Start Full Stack Interview
            </Button>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto' }}>
      <Steps
        current={step}
        style={{ marginBottom: 40 }}
        items={[
          { title: 'Upload Resume', description: 'Provide your document.' },
          { title: 'Confirm Details', description: 'Fill in missing contact info.' },
          { title: 'Ready', description: 'Start the interview.' },
        ]}
      />
      {renderCurrentStepContent()}
      
      {/* If step 1 is active, the modal will render here */}
      {step === 1 && renderCurrentStepContent()} 
    </div>
  );
};

export default ResumeFlow;
