// src/components/superadmin/FastInfoBlock.tsx

import React, { useEffect, useState } from 'react';
import { Block, Icon } from 'konsta/react';
import axios from '../../api/axiosInstance';

const FastInfoBlock: React.FC = () => {
  const [sessionCount, setSessionCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [inboxMessages, setInboxMessages] = useState(0);
  const [academyCount, setAcademyCount] = useState(0);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sessions, users, messages, academies, subscriptions, income] = await Promise.all([
          axios.get('/api/sessions/count'),
          axios.get('/api/users/count'),
          axios.get('/api/inbox/unread-count'),
          axios.get('/api/academies/count'),
          axios.get('/api/subscriptions/count'),
          axios.get('/api/subscriptions/income'),
        ]);

        setSessionCount(sessions.data.count);
        setUserCount(users.data.count);
        setInboxMessages(messages.data.count);
        setAcademyCount(academies.data.count);
        setSubscriptionCount(subscriptions.data.count);
        setMonthlyIncome(income.data.monthly);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Block className="fast-info-block grid grid-cols-3 gap-4">
      <div className="info-item">
        <Icon ios="person_crop_circle" md="person" />
        <p>Total Users: {userCount}</p>
      </div>
      <div className="info-item">
        <Icon ios="envelope" md="mail" />
        <p>New Messages: {inboxMessages}</p>
      </div>
      <div className="info-item">
        <Icon ios="graduation_cap" md="school" />
        <p>Total Academies: {academyCount}</p>
      </div>
      <div className="info-item">
        <Icon ios="briefcase" md="business" />
        <p>Subscriptions: {subscriptionCount}</p>
      </div>
      <div className="info-item">
        <Icon ios="wallet" md="account_balance_wallet" />
        <p>Monthly Income: ${monthlyIncome.toFixed(2)}</p>
      </div>
      <div className="info-item">
        <Icon ios="calendar" md="date_range" />
        <p>Total Sessions: {sessionCount}</p>
      </div>
    </Block>
  );
};

export default FastInfoBlock;
