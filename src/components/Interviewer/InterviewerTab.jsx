import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Table, Input, Select, Space, Tag, Button, Card, Typography, Empty } from 'antd';
import { SearchOutlined, ArrowLeftOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import CandidateDetail from './CandidateDetail';

const { Title, Text } = Typography;
const { Option } = Select;

// --- Candidate List Component (Inlined for simplicity) ---

const CandidateList = ({ candidates, onSelectCandidate }) => {
    const [searchText, setSearchText] = useState('');
    const [sortKey, setSortKey] = useState('score');
    const [sortOrder, setSortOrder] = useState('desc');

    const filteredAndSortedCandidates = useMemo(() => {
        let list = [...candidates];
        
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            list = list.filter(candidate => {
                const profile = candidate.profile;
                return (
                    profile.name.toLowerCase().includes(searchLower) ||
                    profile.email.toLowerCase().includes(searchLower) ||
                    candidate.status.toLowerCase().includes(searchLower)
                );
            });
        }

        list.sort((a, b) => {
            let comparison = 0;
            
            // Prioritize completed scores
            const scoreA = a.finalScore !== null ? a.finalScore : -1; 
            const scoreB = b.finalScore !== null ? b.finalScore : -1;
            
            if (sortKey === 'score') {
                comparison = scoreA - scoreB;
            } else if (sortKey === 'name') {
                comparison = a.profile.name.localeCompare(b.profile.name);
            } else if (sortKey === 'lastActive') {
                comparison = a.lastActive - b.lastActive; 
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return list;
    }, [candidates, searchText, sortKey, sortOrder]);

    const columns = [
        { title: 'Name', dataIndex: ['profile', 'name'], key: 'name' },
        { title: 'Email', dataIndex: ['profile', 'email'], key: 'email' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = status === 'completed' ? 'green' : (status === 'in-progress' ? 'blue' : 'gold');
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Final Score',
            dataIndex: 'finalScore',
            key: 'finalScore',
            render: (score) => score !== null ? `${score}%` : 'N/A',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Button 
                    onClick={() => onSelectCandidate(record.id)} 
                    disabled={record.status !== 'completed'}
                    type="link"
                >
                    {record.status === 'completed' ? 'View Details' : 'Incomplete'}
                </Button>
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            {/* Search and Sort Functionality */}
            <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }}>
                <Input
                    placeholder="Search by Name, Email, or Status"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ flexGrow: 1, minWidth: 200 }}
                />
                <Select
                    value={sortKey}
                    onChange={setSortKey}
                    style={{ width: 150 }}
                    placeholder="Sort By"
                >
                    <Option value="score">Final Score</Option>
                    <Option value="name">Name</Option>
                    <Option value="lastActive">Last Active</Option>
                </Select>
                <Button 
                    icon={sortOrder === 'desc' ? <ArrowDownOutlined /> : <ArrowUpOutlined />} 
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                >
                    {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                </Button>
            </Space>

            <Table 
                dataSource={filteredAndSortedCandidates} 
                columns={columns} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                style={{ width: '100%' }}
            />
        </Space>
    );
};

// --- Main Interviewer Tab Component ---

const InterviewerTab = () => {
  const candidates = useSelector(state => state.candidates.candidates);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const selectedCandidate = candidates[selectedCandidateId];
  const allCandidates = Object.values(candidates);

  if (selectedCandidate) {
    // Show the detailed view
    return (
      <div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => setSelectedCandidateId(null)}
          style={{ marginBottom: 16 }}
        >
          Back to Dashboard
        </Button>
        <CandidateDetail candidate={selectedCandidate} />
      </div>
    );
  }

  // Show the list view
  return (
    <Card title={<Title level={3}>Interviewer Dashboard</Title>}>
      {allCandidates.length === 0 ? (
        <Empty description="No candidates have started or completed an interview yet." />
      ) : (
        <CandidateList 
          candidates={allCandidates} 
          onSelectCandidate={setSelectedCandidateId} 
        />
      )}
    </Card>
  );
};

export default InterviewerTab;
