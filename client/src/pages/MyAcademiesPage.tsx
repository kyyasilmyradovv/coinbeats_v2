import React, { useEffect, useState } from 'react';
import {
  Page, Block, Button, Popover, List, ListButton, ListItem, Notification, BlockTitle
} from 'konsta/react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axiosInstance';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';
import bunnyLogo from '../images/bunny-mascot.png'; // Import your mascot image

interface Academy {
  id: number;
  name: string;
  createdAt: string;
  status: string;
}

const MyAcademiesPage: React.FC = () => {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [selectedAcademyId, setSelectedAcademyId] = useState<number | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch academies data on component mount
    const fetchAcademies = async () => {
      try {
        const response = await axios.get('/api/academies/my');
        setAcademies(response.data);
      } catch (error) {
        console.error('Error fetching academies:', error);
      }
    };

    fetchAcademies();
  }, []);

  useEffect(() => {
    // Check if there's a notification type passed via location state
    if (location.state?.notificationType) {
      if (location.state.notificationType === 'basic') {
        setNotificationText('Academy created successfully. Your academy is under review.');
      } else if (location.state.notificationType === 'complete') {
        setNotificationText('Your academy is under review. You will get a notification soon.');
      }
      setNotificationOpen(true);
      // Clear the state to prevent showing the notification again if the user navigates back
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleSidebar = () => {
    setRightPanelOpened(!rightPanelOpened);
  };

  const handleEditAcademy = (id: number) => {
    navigate(`/edit-academy/${id}`);
  };

  const handleAddVideoLessons = (id: number) => {
    navigate(`/add-video-lessons/${id}`);
  };

  const handleAddRaffles = (id: number) => {
    navigate(`/add-raffles/${id}`);
  };

  const handleAddTasks = (id: number) => {
    navigate(`/add-tasks/${id}`);
  };

  const handleAllocateXp = (id: number) => {
    navigate(`/allocate-xp/${id}`);
  };

  const handleDeleteAcademy = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedAcademyId(id);
    setPopoverTarget(event.currentTarget);
    setPopoverOpen(true);
  };

  const confirmDeleteAcademy = async () => {
    if (selectedAcademyId !== null) {
      try {
        await axios.delete(`/api/academies/${selectedAcademyId}`);
        setAcademies(academies.filter((academy) => academy.id !== selectedAcademyId));
        setNotificationText('Academy deleted successfully.');
        setNotificationOpen(true);
      } catch (error) {
        console.error('Error deleting academy:', error);
        setNotificationText('Failed to delete academy.');
        setNotificationOpen(true);
      } finally {
        setPopoverOpen(false);
        setSelectedAcademyId(null);
      }
    }
  };

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar opened={rightPanelOpened} onClose={() => setRightPanelOpened(false)} />

      <div className="text-center flex w-full items-center justify-center absolute top-8 !mb-18">
        <BlockTitle large>My Academies</BlockTitle>
      </div>
      <div className='mt-18'>
        {academies.length > 0 ? (
          academies.map((academy) => (
            <Block key={academy.id} strongIos className="mb-4 p-4 bg-white rounded-2xl shadow-lg mx-4">
              <div className="flex flex-col justify-between items-center w-full p-4">
                <div className='w-full p-4'>
                  <h3 className="font-bold text-xl mb-2">{academy.name}</h3>
                  <p className="text-sm text-gray-600">
                    Created on: {new Date(academy.createdAt).toLocaleDateString()}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      academy.status === 'approved'
                        ? 'text-green-600'
                        : academy.status === 'rejected'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    Status: {academy.status.charAt(0).toUpperCase() + academy.status.slice(1)}
                  </p>
                </div>
                <div className="flex flex-col space-y-4 w-full">
                  <Button
                    onClick={() => handleEditAcademy(academy.id)}
                    raised
                    className="bg-brand-primary text-white rounded-full"
                  >
                    Edit Academy
                  </Button>
                  <Button
                    onClick={() => handleAddVideoLessons(academy.id)}
                    raised
                    className="bg-brand-primary text-white rounded-full"
                  >
                    Add Video Lessons
                  </Button>
                  <Button
                    onClick={() => handleAddRaffles(academy.id)}
                    raised
                    className="bg-brand-primary text-white rounded-full"
                  >
                    Add Raffles
                  </Button>
                  <Button
                    onClick={() => handleAddTasks(academy.id)}
                    raised
                    className="bg-brand-primary text-white rounded-full"
                  >
                    Add Tasks
                  </Button>
                  <Button
                    onClick={() => handleAllocateXp(academy.id)}
                    raised
                    className="bg-brand-primary text-white rounded-full"
                  >
                    Allocate XP
                  </Button>
                  <Button
                    onClick={(e) => handleDeleteAcademy(academy.id, e)}
                    raised
                    className="bg-red-600 text-white rounded-full"
                  >
                    Delete Academy
                  </Button>
                </div>
              </div>
            </Block>
          ))
        ) : (
          <p>No academies found. Start by creating an academy.</p>
        )}
        </div>

      {/* Notification */}
      <Notification
        opened={notificationOpen}
        icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
        title="Message from Coinbeats Bunny"
        text={notificationText}
        button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Popover for delete confirmation */}
      <Popover
        opened={popoverOpen}
        target={popoverTarget}
        onBackdropClick={() => setPopoverOpen(false)}
        onClose={() => setPopoverOpen(false)}
        angle
      >
        <Block className="text-center">
          <h3 className="text-lg font-bold mb-4">Delete Academy</h3>
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete your academy? This action is irreversible!
          </p>
          <div className="flex">
              <Button
                onClick={confirmDeleteAcademy}
                className="bg-red-600 rounded-full mr-2"
              >
                Yes, I'm sure
              </Button>
              <Button
                onClick={() => setPopoverOpen(false)}
                className="bg-gray-400 rounded-full"
              >
                No, cancel
              </Button>
              </div>
        </Block>
      </Popover>
    </Page>
  );
};

export default MyAcademiesPage;
