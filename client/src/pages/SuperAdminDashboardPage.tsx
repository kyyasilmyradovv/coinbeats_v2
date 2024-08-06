// src/pages/SuperAdminDashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Page, Card, Block, BlockTitle, Button, ListInput } from 'konsta/react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { Person, School, Assessment, AttachMoney, Group } from '@mui/icons-material';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';

const SuperAdminDashboardPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  // Dashboard statistics state
  const [stats, setStats] = useState({
    sessions: 0,
    users: 0,
    academies: 0,
    subscriptions: 0,
    monthlyIncome: 0,
  });

  // Subscription management state
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false);
  const [subscriptionFee, setSubscriptionFee] = useState(0);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch statistics data
  const fetchData = async () => {
    try {
      // Replace with actual API call to fetch statistics
      const response = await fetch('/api/superadmin/stats'); // Adjust the endpoint as needed
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle the toggle change
  const handleToggleChange = () => {
    setSubscriptionEnabled(!subscriptionEnabled);
  };

  // Handle applying the subscription fee
  const applySubscriptionFee = () => {
    // Implement logic to apply the subscription fee to all academies
    console.log(`Applying subscription fee: ${subscriptionFee}`);
  };

  // Chart data configuration
  const chartData = {
    labels: ['Monthly Income'],
    datasets: [
      {
        label: 'Income',
        data: [stats.monthlyIncome],
        backgroundColor: ['rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const toggleSidebar = () => {
    setRightPanelOpened(!rightPanelOpened);
  };

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme}
      />

      <Block className="space-y-4">
        {/* First Card: General Stats */}
        <Card className="p-2 ">
          <BlockTitle className="text-center mb-4 !mt-0">Dashboard Statistics</BlockTitle>
          <Block className="flex justify-around items-center !my-0">
            <div className="flex flex-col items-center">
              <Assessment fontSize="large" style={{ color: 'blue' }} />
              <div className="text-xl font-bold">{stats.sessions}</div>
              <span className="text-sm text-center">Total Sessions</span>
            </div>
            <div className="flex flex-col items-center">
              <Person fontSize="large" style={{ color: 'green' }} />
              <div className="text-xl font-bold">{stats.users}</div>
              <span className="text-sm text-center">Total Users</span>
            </div>
            <div className="flex flex-col items-center">
              <School fontSize="large" style={{ color: 'red' }} />
              <div className="text-xl font-bold">{stats.academies}</div>
              <span className="text-sm text-center">Total Academies</span>
            </div>
          </Block>
        </Card>

        {/* Second Card: Subscription and Income Stats */}
        <Card className="p-2">
          <BlockTitle className="text-center mb-2 !mt-0">Financial Overview</BlockTitle>
          <Block className="flex justify-around items-center !my-0">
            <div className="flex flex-col items-center">
              <Group fontSize="large" style={{ color: 'purple' }} />
              <div className="text-xl font-bold">{stats.subscriptions}</div>
              <span className="text-sm text-center">Total Subscriptions</span>
            </div>
            <div className="flex flex-col items-center">
              <AttachMoney fontSize="large" style={{ color: 'goldenrod' }} />
              <div className="text-xl font-bold">${stats.monthlyIncome}</div>
              <span className="text-sm text-center">Monthly Income</span>
            </div>
          </Block>
          <Block className="mt-4 !mb-0">
            <Bar data={chartData} options={{ responsive: true }} />
          </Block>
        </Card>

        {/* Third Card: Subscription Management */}
        <Card className="p-2">
          <BlockTitle className="text-center mb-2 !mt-0">Subscription Management</BlockTitle>
          <Block className="flex flex-col md:flex-row justify-around items-center space-y-0 md:space-y-0 !mb-0">
            <div className="flex flex-col items-center">
              <span className="font-medium">Enable Subscriptions</span>
              <Button
                rounded
                active={subscriptionEnabled}
                onClick={handleToggleChange}
                className={`mt-2 ${subscriptionEnabled ? 'bg-green-500' : 'bg-gray-500'} text-white`}
              >
                {subscriptionEnabled ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <ListInput
                outline
                label="Global subscription fee"
                type="number"
                value={subscriptionFee}
                placeholder="Subscription Fee"
                onChange={(e) => setSubscriptionFee(parseFloat(e.target.value))}
                className="input input-outline mt-2 w-32"
                />
            </div>
            <Button
              outline
              rounded
              onClick={applySubscriptionFee}
            >
              Apply Fee
            </Button>
          </Block>
        </Card>
      </Block>
    </Page>
  );
};

export default SuperAdminDashboardPage;
