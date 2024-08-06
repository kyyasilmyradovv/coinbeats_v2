// src/components/superadmin/SubscriptionManagement.tsx

import React, { useState, useEffect } from 'react';
import { Block, Button, Toggle, ListInput } from 'konsta/react';
import axios from '../../api/axiosInstance';

const SubscriptionManagement: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState(0.0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/subscriptions/settings');
        setEnabled(response.data.enabled);
        setMonthlyFee(response.data.monthlyFee);
      } catch (error) {
        console.error('Error fetching subscription settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async () => {
    try {
      await axios.post('/api/subscriptions/toggle', { enabled: !enabled });
      setEnabled(!enabled);
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const handleFeeChange = async (fee) => {
    try {
      await axios.post('/api/subscriptions/fee', { monthlyFee: parseFloat(fee) });
      setMonthlyFee(parseFloat(fee));
    } catch (error) {
      console.error('Error updating monthly fee:', error);
    }
  };

  return (
    <Block className="subscription-management">
      <h3 className="text-lg font-bold">Subscription Management</h3>
      <Toggle
        checked={enabled}
        onChange={handleToggle}
        className="subscription-toggle"
      >
        Enable Subscriptions
      </Toggle>
      <ListInput
        label="Monthly Subscription Fee"
        type="number"
        value={monthlyFee}
        onChange={(e) => handleFeeChange(e.target.value)}
        className="subscription-fee-input"
      />
    </Block>
  );
};

export default SubscriptionManagement;
