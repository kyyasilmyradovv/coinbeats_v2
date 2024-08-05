// src/pages/MyAcademiesPage.tsx

import React, { useState, useEffect } from 'react';
import { Page, Block, List, ListItem, Button } from 'konsta/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyAcademiesPage: React.FC = () => {
  const [academies, setAcademies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch academies created by the current user
    const fetchAcademies = async () => {
      try {
        const response = await axios.get('/api/my-academies');
        setAcademies(response.data);
      } catch (error) {
        console.error('Error fetching academies:', error);
      }
    };

    fetchAcademies();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/edit-academy/${id}`);
  };

  return (
    <Page>
      <Block strongIos className="m-4 p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-4">My Academies</h2>
        <List>
          {academies.map((academy: any) => (
            <ListItem
              key={academy.id}
              title={academy.name}
              after={<Button onClick={() => handleEdit(academy.id)}>Edit</Button>}
              text={`Status: ${academy.status}`}
            />
          ))}
        </List>
      </Block>
    </Page>
  );
};

export default MyAcademiesPage;
