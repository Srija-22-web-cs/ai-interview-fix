import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Space, Tag, Button } from 'antd';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Option } = Select;

const CandidateList = ({ candidates, onSelectCandidate }) => {
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const filteredAndSortedCandidates = useMemo(() => {
    let list = [...candidates];
    
    // 1. Filtering
    if (searchText) {
        const searchLower = searchText.toLowerCase();
        list = list.filter(candidate => {
            return (
                candidate.profile.name.toLowerCase().includes(searchLower) ||
                candidate.profile.email.toLowerCase().includes(searchLower) ||
                candidate.status.toLowerCase().includes(searchLower)
            );
        });
    }

    // 2. Sorting
    list.sort((a, b) => {
      let comparison = 0;
      
      if (sortKey === 'score') {
        const scoreA = a.finalScore !== null ? a.finalScore : -1; 
        const scoreB = b.finalScore !== null ? b.finalScore : -1;
        comparison = scoreA - scoreB;
      } else if (sortKey === 'name') {
        comparison = (a.profile.name || '').localeCompare(b.profile.name || '');
      } else if (sortKey === 'lastActive') {
        comparison = a.lastActive - b.lastActive;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return list;
  }, [candidates, searchText, sortKey, sortOrder]);

  const columns = [
    {
      // FIX: Ensure this pulls the name property from the profile object
      title: 'Name',
      dataIndex: ['profile', 'name'], 
      key: 'name',
      render: (name) => name || 'N/A'
    },
    {
      // FIX: Ensure this pulls the email property from the profile object
      title: 'Email',
      dataIndex: ['profile', 'email'], 
      key: 'email',
    },
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
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by Name, Email, or Status"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
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

      {/* Candidates Table */}
      <Table 
        dataSource={filteredAndSortedCandidates} 
        columns={columns} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
      />
    </Space>
  );
};

export default CandidateList;
