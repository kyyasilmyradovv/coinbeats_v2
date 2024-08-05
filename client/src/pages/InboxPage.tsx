// src/pages/InboxPage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Page, Block, List, ListItem, Button, ListInput, BlockTitle } from 'konsta/react';

const InboxPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState<string>('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:7000/inbox');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await axios.post(`http://localhost:7000/inbox/${id}/approve`);
      setMessages(messages.filter((message) => message.id !== id));
    } catch (error) {
      console.error('Error approving message:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.post(`http://localhost:7000/inbox/${id}/reject`, { reason: rejectReason });
      setMessages(messages.filter((message) => message.id !== id));
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting message:', error);
    }
  };

  return (
    <Page>
      <BlockTitle>Inbox</BlockTitle>
      <Block strong>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              title={message.content}
              after={
                <div>
                  <Button outline small onClick={() => handleApprove(message.id)}>Approve</Button>
                  <Button outline small onClick={() => handleReject(message.id)}>Reject</Button>
                  <ListInput
                    label="Rejection Reason"
                    type="text"
                    placeholder="Reason for rejection"
                    clearButton
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              }
            />
          ))}
        </List>
      </Block>
    </Page>
  );
};

export default InboxPage;
