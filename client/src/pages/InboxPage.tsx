// src/pages/InboxPage.tsx

import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance'; // Use the configured axios instance
import { Page, Block, List, ListItem, Button, ListInput, BlockTitle, Card } from 'konsta/react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';

const InboxPage: React.FC<{
  theme: string;
  setTheme: (theme: string) => void;
  setColorTheme: (color: string) => void;
}> = ({ theme, setTheme, setColorTheme }) => {
  const [academies, setAcademies] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({});
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchPendingAcademies = async () => {
      try {
        const response = await axios.get('/api/inbox');
        const data = Array.isArray(response.data) ? response.data : []; // Ensure data is an array
        setAcademies(data);
      } catch (error) {
        console.error('Error fetching pending academies:', error);
      }
    };

    fetchPendingAcademies();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await axios.post(`/api/inbox/${id}/approve`);
      setAcademies((prev) => prev.filter((academy) => academy.id !== id));
    } catch (error) {
      console.error('Error approving academy:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.post(`/api/inbox/${id}/reject`, { reason: rejectReason[id] });
      setAcademies((prev) => prev.filter((academy) => academy.id !== id));
      setRejectReason((prev) => ({ ...prev, [id]: '' }));
    } catch (error) {
      console.error('Error rejecting academy:', error);
    }
  };

  const handleViewApplication = (id: number) => {
    // Implement logic to view the full application details, e.g., navigate to a detailed view page
    console.log(`Viewing application for academy ID: ${id}`);
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

      <div className="text-center flex w-full items-center justify-center top-8 mb-10">
        <BlockTitle className="text-2xl font-bold">Inbox</BlockTitle>
      </div>

      {academies.map((academy) => (
        <Card key={academy.id} className="m-4 shadow-lg rounded-3xl">
          <Block>
            <div className="flex flex-col items-center mb-4">
              <h3 className="text-lg font-semibold">{academy.name}</h3>
              <p className="text-sm text-gray-600">
                Creator: {academy.creator?.name} ({academy.creator?.email})
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <Button
                large
                onClick={() => handleViewApplication(academy.id)}
                className="bg-blue-500 text-white w-full"
              >
                View Application
              </Button>
              <Button
                large
                onClick={() => handleApprove(academy.id)}
                className="bg-green-500 text-white w-full"
              >
                Approve
              </Button>
              <Button
                large
                onClick={() => handleReject(academy.id)}
                className="bg-red-500 text-white w-full"
              >
                Reject
              </Button>
              <ListInput
                label="Rejection Reason"
                type="text"
                placeholder="Reason for rejection"
                outline
                clearButton
                value={rejectReason[academy.id] || ''}
                onChange={(e) =>
                  setRejectReason((prev) => ({
                    ...prev,
                    [academy.id]: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>
          </Block>
        </Card>
      ))}
    </Page>
  );
};

export default InboxPage;
