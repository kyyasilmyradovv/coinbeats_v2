import React, { useEffect, useState } from 'react';
import { Page, Block, Button } from 'konsta/react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';

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

  const navigate = useNavigate();

  useEffect(() => {
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

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
      />

      <Block strongIos className="m-4 p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-4">My Academies</h2>
        {academies.length > 0 ? (
          academies.map((academy) => (
            <Block key={academy.id} strongIos className="mb-4 p-4 bg-gray-100 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{academy.name}</h3>
                  <p className="text-sm text-gray-600">Created on: {new Date(academy.createdAt).toLocaleDateString()}</p>
                  <p className={`text-sm mt-1 ${academy.status === 'approved' ? 'text-green-600' : academy.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                    Status: {academy.status.charAt(0).toUpperCase() + academy.status.slice(1)}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button onClick={() => handleEditAcademy(academy.id)} large raised>
                    Edit Academy
                  </Button>
                  <Button onClick={() => handleAddVideoLessons(academy.id)} large raised>
                    Add Video Lessons
                  </Button>
                  <Button onClick={() => handleAddRaffles(academy.id)} large raised>
                    Add Raffles
                  </Button>
                  <Button onClick={() => handleAddTasks(academy.id)} large raised>
                    Add Tasks
                  </Button>
                </div>
              </div>
            </Block>
          ))
        ) : (
          <p>No academies found. Start by creating an academy.</p>
        )}
      </Block>
    </Page>
  );
};

export default MyAcademiesPage;
