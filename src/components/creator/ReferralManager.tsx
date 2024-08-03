// src/components/creator/ReferralManager.tsx

import React, { useState, useEffect } from 'react';
import { Block, List, ListItem, Button } from 'konsta/react';

interface Referral {
  id: number;
  email: string;
  status: string;
}

const ReferralManager: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    // Fetch referral data from API
    const fetchReferrals = async () => {
      try {
        // const response = await apiService.getReferrals();
        // setReferrals(response.data);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }
    };

    fetchReferrals();
  }, []);

  return (
    <Block strong className="rounded-2xl shadow-md mt-4 m-4">
      <h2 className="text-xl font-semibold mb-4">Referral Program</h2>
      <List>
        {referrals.map((referral) => (
          <ListItem
            key={referral.id}
            title={referral.email}
            after={referral.status}
            className="rounded-2xl"
          />
        ))}
      </List>
      <Button large raised strong className="mt-4 w-full rounded-2xl">
        Share Referral Link
      </Button>
    </Block>
  );
};

export default ReferralManager;
