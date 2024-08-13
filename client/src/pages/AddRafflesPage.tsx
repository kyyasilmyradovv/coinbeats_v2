import React, { useState } from 'react';
import { Page, Block, List, ListInput, Button, Notification } from 'konsta/react';
import useAcademyStore from '../store/useAcademyStore';
import axios from 'axios';
import bunnyLogo from '../images/bunny-mascot.png'; // Replace with the actual path to your image

const AddRafflesPage: React.FC = () => {
  const { raffles, addRaffle, setField, removeRaffle } = useAcademyStore();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveRaffles = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/academies/:id/raffles', { raffles });
      if (response.status === 200) {
        setNotificationOpen(true);
      }
    } catch (error) {
      console.error('Error saving raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Block strongIos className="m-4 p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-4">Add Raffles</h2>
        <List>
          {raffles.map((raffle, index) => (
            <Block key={index} className="mb-4 p-4 border rounded-lg shadow-sm relative">
              <h4 className="font-medium mb-2">Raffle {index + 1}</h4>
              <ListInput
                label="Amount"
                type="number"
                placeholder="Enter the amount"
                value={raffle.amount}
                onChange={(e) => setField('raffles', [...raffles.slice(0, index), { ...raffle, amount: e.target.value }, ...raffles.slice(index + 1)])}
              />
              <ListInput
                label="Reward"
                type="textarea"
                placeholder="Enter the reward"
                value={raffle.reward}
                onChange={(e) => setField('raffles', [...raffles.slice(0, index), { ...raffle, reward: e.target.value }, ...raffles.slice(index + 1)])}
              />
              <ListInput
                label="Currency"
                type="textarea"
                placeholder="Enter the currency"
                value={raffle.currency}
                onChange={(e) => setField('raffles', [...raffles.slice(0, index), { ...raffle, currency: e.target.value }, ...raffles.slice(index + 1)])}
              />
              <ListInput
                label="Chain"
                type="textarea"
                placeholder="Enter the chain"
                value={raffle.chain}
                onChange={(e) => setField('raffles', [...raffles.slice(0, index), { ...raffle, chain: e.target.value }, ...raffles.slice(index + 1)])}
              />
              <ListInput
                label="Dates"
                type="textarea"
                placeholder="Enter the dates"
                value={raffle.dates}
                onChange={(e) => setField('raffles', [...raffles.slice(0, index), { ...raffle, dates: e.target.value }, ...raffles.slice(index + 1)])}
              />
              <ListInput
                label="Total Pool"
                type="number"
                placeholder="Enter the total pool"
                value={raffle.totalPool}
                onChange={(e) => setField('raffles', [...raffles.slice(0, index), { ...raffle, totalPool: e.target.value }, ...raffles.slice(index + 1)])}
              />
              <Button onClick={() => removeRaffle(index)} className="bg-red-500 text-white mt-4">Remove Raffle</Button>
            </Block>
          ))}
        </List>
        <Button onClick={addRaffle} className="rounded-full">Add Raffle</Button>
        <Button onClick={handleSaveRaffles} className="mt-4 bg-brand-primary text-white" disabled={loading}>
          {loading ? 'Saving...' : 'Save Raffles'}
        </Button>
      </Block>

      <Notification
        opened={notificationOpen}
        icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
        title="Success"
        text="You successfully added Raffles"
        button={<Button onClick={() => setNotificationOpen(false)}>OK</Button>}
        onClose={() => setNotificationOpen(false)}
      />
    </Page>
  );
};

export default AddRafflesPage;
